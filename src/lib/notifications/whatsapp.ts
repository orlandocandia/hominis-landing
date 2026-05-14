// WhatsApp notification service
// Sends a WhatsApp message to Agustina when a new contact/lead arrives
// Uses CallMeBot API (free) or fallback to WhatsApp deep link

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

// Hardcoded fallback for Vercel (env vars sometimes don't load there)
const HARDCODED_CALLMEBOT_PHONE = '';
const HARDCODED_CALLMEBOT_APIKEY = '';

function formatSegmento(segmento: string): string {
  const map: Record<string, string> = {
    'RECIBO_DE_SUELDO': 'Recibo de Sueldo',
    'MONOTRIBUTO': 'Monotributo',
    'PARTICULAR': 'Particular',
  };
  return map[segmento] || segmento;
}

/**
 * Send WhatsApp notification via CallMeBot API (free)
 * Setup: Send "AllowMe" to +34644452906 on WhatsApp to get your API key
 * Alternative: Use Twilio WhatsApp API for production
 */
export async function sendWhatsAppNotification(contact: ContactNotification): Promise<boolean> {
  try {
    const callmebotPhone = process.env.CALLMEBOT_PHONE || HARDCODED_CALLMEBOT_PHONE;
    const callmebotApikey = process.env.CALLMEBOT_APIKEY || HARDCODED_CALLMEBOT_APIKEY;

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

    // Try CallMeBot API first (free WhatsApp notifications)
    if (callmebotPhone && callmebotApikey) {
      const encodedText = encodeURIComponent(text);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${callmebotPhone}&text=${encodedText}&apikey=${callmebotApikey}`;

      const response = await fetch(url, { method: 'GET' });

      if (response.ok) {
        console.log('[WhatsApp] Notificación enviada via CallMeBot');
        return true;
      } else {
        console.warn('[WhatsApp] CallMeBot falló, intentando fallback');
      }
    }

    // Fallback: Log the WhatsApp deep link (can be used for manual notification)
    const waLink = `https://wa.me/${AGUSTINA_PHONE}?text=${encodeURIComponent(text)}`;
    console.log('[WhatsApp] Link de notificación:', waLink);
    console.log('[WhatsApp] No se envió automáticamente - configurar CallMeBot o Twilio');

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
