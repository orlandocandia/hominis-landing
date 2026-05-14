// WhatsApp notification service
// Sends a WhatsApp message to Agustina when a new contact/lead arrives
// Uses Fonnte API (free) - https://fonnte.com
// Setup: Scan QR code on fonnte.com with Agustina's WhatsApp to get API key

interface ContactNotification {
  nombre: string;
  email: string;
  telefono: string;
  segmento: string;
  cobertura?: string | null;
  edad?: number | null;
  mensaje?: string | null;
}

// Agustina's phone - hardcoded fallback for Vercel
const AGUSTINA_PHONE = '5491165555534';

// Fonnte API key - hardcoded fallback for Vercel
// Get yours at: https://fonnte.com → scan QR → copy API key
const HARDCODED_FONNTE_APIKEY = '';

function formatSegmento(segmento: string): string {
  const map: Record<string, string> = {
    'RECIBO_DE_SUELDO': 'Recibo de Sueldo',
    'MONOTRIBUTO': 'Monotributo',
    'PARTICULAR': 'Particular',
  };
  return map[segmento] || segmento;
}

/**
 * Send WhatsApp notification via Fonnte API (free)
 *
 * SETUP (one-time, 5 minutes):
 * 1. Go to https://fonnte.com on your computer
 * 2. Scan the QR code with Agustina's WhatsApp (like WhatsApp Web)
 * 3. Copy the API key that appears
 * 4. Paste it in HARDCODED_FONNTE_APIKEY below
 *
 * How it works:
 * - Fonnte uses Agustina's own WhatsApp to send messages TO HERSELF
 * - This is like WhatsApp Web but automated via API
 * - The WhatsApp must stay connected (visit fonnte.com periodically to re-scan if disconnected)
 * - Free tier: ~500 messages/month
 */
export async function sendWhatsAppNotification(contact: ContactNotification): Promise<boolean> {
  try {
    const fonnteApikey = process.env.FONNTE_APIKEY || HARDCODED_FONNTE_APIKEY;

    const segmentoText = formatSegmento(contact.segmento);
    const coberturaText = contact.cobertura || 'No especificada';
    const edadText = contact.edad ? `${contact.edad} años` : 'N/A';
    const mensajeText = contact.mensaje || 'Sin mensaje';

    const text = `🆕 *NUEVA SOLICITUD DE ASESORAMIENTO*\n\n` +
      `👤 *Nombre:* ${contact.nombre}\n` +
      `📧 *Email:* ${contact.email}\n` +
      `📱 *Teléfono:* ${contact.telefono}\n` +
      `🏷️ *Segmento:* ${segmentoText}\n` +
      `📍 *Cobertura:* ${coberturaText}\n` +
      `🎂 *Edad:* ${edadText}\n` +
      `💬 *Mensaje:* ${mensajeText}\n\n` +
      `👉 Contactar: https://wa.me/54${contact.telefono.replace(/[^0-9]/g, '')}`;

    // Try Fonnte API (free WhatsApp notifications)
    if (fonnteApikey) {
      const response = await fetch('https://api.fonnte.com/send', {
        method: 'POST',
        headers: {
          'Authorization': fonnteApikey,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          target: AGUSTINA_PHONE,
          message: text,
        }),
      });

      const result = await response.json();

      if (response.ok && result.status === true) {
        console.log('[WhatsApp] Notificación enviada via Fonnte');
        return true;
      } else {
        console.warn('[WhatsApp] Fonnte falló:', JSON.stringify(result));
        // Continue to fallback
      }
    }

    // Fallback: Log the WhatsApp deep link
    const waLink = `https://wa.me/${AGUSTINA_PHONE}?text=${encodeURIComponent(text)}`;
    console.log('[WhatsApp] Link de notificación:', waLink);
    console.log('[WhatsApp] No se envió automáticamente - configurar Fonnte en https://fonnte.com');

    return false;
  } catch (error) {
    console.error('[WhatsApp] Error:', error);
    return false;
  }
}

/**
 * Generate a WhatsApp deep link for Agustina to contact the lead
 */
export function generateWhatsAppLink(contact: ContactNotification): string {
  const message = `Hola ${contact.nombre}, soy Agustina de Hominis. Recibí tu solicitud de asesoramiento. ¿Podemos conversar?`;
  const cleanPhone = contact.telefono.replace(/[^0-9]/g, '');
  return `https://wa.me/54${cleanPhone}?text=${encodeURIComponent(message)}`;
}
