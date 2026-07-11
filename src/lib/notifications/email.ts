// Email notification service using Resend
// Sends email to Agustina when a new contact/lead arrives
import { Resend } from 'resend';

interface ContactNotification {
  nombre: string;
  email: string;
  telefono: string;
  segmento: string;
  cobertura?: string | null;
  edad?: number | null;
  mensaje?: string | null;
}

// Hardcoded fallback for Vercel (env vars sometimes don't load there)
const HARDCODED_RESEND_API_KEY = 're_6X6QSSxh_5nm4YVZUw21fJqPvjQ1vdpoG';

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY || HARDCODED_RESEND_API_KEY;
  if (!apiKey || !apiKey.startsWith('re_')) {
    console.log('[Email] Resend API key no configurada - saltando envío de email');
    return null;
  }
  return new Resend(apiKey);
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
  const resend = getResendClient();
  if (!resend) return false;

  try {
    const recipientEmail = process.env.EMAIL_TO || 'asesoradesaludagustinacandia@gmail.com';
    const segmentoText = formatSegmento(contact.segmento);
    const coberturaText = contact.cobertura || 'No especificada';
    const edadText = contact.edad ? `${contact.edad} años` : 'No especificada';
    const mensajeText = contact.mensaje || 'Sin mensaje';

    const { error } = await resend.emails.send({
      from: 'Hominis - Contactos <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: `🆕 Nueva solicitud: ${contact.nombre} - ${segmentoText}`,
      html: `
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
      `,
    });

    if (error) {
      console.error('[Email] Resend error:', error);
      return false;
    }

    console.log('[Email] Notificación enviada exitosamente a', recipientEmail);
    return true;
  } catch (error) {
    console.error('[Email] Error enviando notificación:', error);
    return false;
  }
}

/**
 * Send an invitation email to a new vendor/productor.
 * The email contains a link with the invitation token to complete registration.
 */
export async function sendInvitationEmail(params: {
  to: string;
  inviteeName: string;
  inviterName: string;
  role: 'VENDEDOR' | 'PRODUCTOR';
  token: string;
  baseUrl: string;
}): Promise<boolean> {
  const resend = getResendClient();
  if (!resend) {
    console.warn('[Email] Resend no configurado — invitación no enviada por email (el token sigue siendo válido)');
    return false;
  }

  const { to, inviteeName, inviterName, role, token, baseUrl } = params;
  const registerUrl = `${baseUrl}/register?token=${token}`;
  const roleLabel = role === 'PRODUCTOR' ? 'Productor (vendedor extendido)' : 'Vendedor';
  const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  try {
    const { error } = await resend.emails.send({
      from: 'Hominis CRM <onboarding@resend.dev>',
      to: [to],
      subject: `Invitación a Hominis CRM — ${roleLabel}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">¡Bienvenido/a a Hominis CRM!</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Fuiste invitado/a como <strong>${roleLabel}</strong></p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hola <strong>${inviteeName}</strong>,</p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              <strong>${inviterName}</strong> te invitó a unirte al equipo de Hominis como <strong>${roleLabel}</strong>.
              Para completar tu registro y crear tu contraseña, hacé clic en el siguiente botón:
            </p>
            <div style="text-align: center; margin: 32px 0;">
              <a href="${registerUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Completar mi registro
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
              <a href="${registerUrl}" style="color: #6366f1; word-break: break-all;">${registerUrl}</a>
            </p>
            <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin-top: 24px;">
              <p style="color: #92400e; font-size: 13px; margin: 0;">
                ⏰ <strong>Esta invitación expira el ${expiryDate}.</strong> Si no la usás a tiempo, pedile a ${inviterName} que te reenvíe.
              </p>
            </div>
            <p style="color: #9ca3af; font-size: 13px; margin-top: 24px;">
              Si no esperabas esta invitación, podés ignorar este email.
            </p>
          </div>
          <div style="background: #f3f4f6; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
            Hominis CRM — Sistema de gestión • ${new Date().toLocaleDateString('es-AR')}
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[Email] Invitation send error:', error);
      return false;
    }
    console.log('[Email] Invitación enviada a', to);
    return true;
  } catch (error) {
    console.error('[Email] Error enviando invitación:', error);
    return false;
  }
}
