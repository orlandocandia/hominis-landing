// Email notification service using nodemailer
// Sends email to Agustina when a new contact/lead arrives
import nodemailer from 'nodemailer';

interface ContactNotification {
  nombre: string;
  email: string;
  telefono: string;
  segmento: string;
  cobertura?: string | null;
  edad?: number | null;
  mensaje?: string | null;
}

function getEmailConfig() {
  return {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
    },
  };
}

function isEmailConfigured(): boolean {
  const config = getEmailConfig();
  return !!(config.auth.user && config.auth.pass);
}

function createTransporter() {
  return nodemailer.createTransport(getEmailConfig());
}

function formatSegmento(segmento: string): string {
  const map: Record<string, string> = {
    'RECIBO_DE_SUELDO': 'Recibo de Sueldo',
    'MONOTRIBUTO': 'Monotributo',
    'PARTICULAR': 'Particular',
  };
  return map[segmento] || segmento;
}

export async function sendNewContactEmail(contact: ContactNotification): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.log('[Email] No configurado - saltando envío de email');
    return false;
  }

  try {
    const transporter = createTransporter();
    const recipientEmail = process.env.EMAIL_TO || 'acandia@mphominis.com.ar';

    const segmentoText = formatSegmento(contact.segmento);
    const coberturaText = contact.cobertura || 'No especificada';
    const edadText = contact.edad ? `${contact.edad} años` : 'No especificada';
    const mensajeText = contact.mensaje || 'Sin mensaje';

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🆕 Nueva Solicitud de Asesoramiento</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Un nuevo contacto completó el formulario</p>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Nombre</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${contact.nombre}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Email</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><a href="mailto:${contact.email}" style="color: #6366f1;">${contact.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Teléfono</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;"><a href="https://wa.me/54${contact.telefono.replace(/[^0-9]/g, '')}" style="color: #6366f1;">${contact.telefono}</a></td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Segmento</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${segmentoText}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Cobertura</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${coberturaText}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Edad</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${edadText}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #374151;">Mensaje</td>
              <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${mensajeText}</td>
            </tr>
          </table>
          <div style="margin-top: 24px; text-align: center;">
            <a href="https://wa.me/5491165555534?text=Hola%20${encodeURIComponent(contact.nombre)}%2C%20soy%20Agustina%20de%20Hominis.%20Recibí%20tu%20solicitud%20de%20asesoramiento.%20¿Podemos%20conversar?" 
               style="display: inline-block; background: #25d366; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 8px;">
              💬 Contactar por WhatsApp
            </a>
          </div>
        </div>
        <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
          Hominis — Panel de Gestión • ${new Date().toLocaleDateString('es-AR')}
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Hominis - Nuevos Contactos" <${getEmailConfig().auth.user}>`,
      to: recipientEmail,
      subject: `🆕 Nueva solicitud: ${contact.nombre} - ${segmentoText}`,
      html: htmlBody,
    });

    console.log('[Email] Notificación enviada exitosamente a', recipientEmail);
    return true;
  } catch (error) {
    console.error('[Email] Error enviando notificación:', error);
    return false;
  }
}
