// WhatsApp Webhook
// ================
// GET  — Meta webhook verification (returns hub.challenge)
// POST — Receives inbound messages + status updates from Meta

// GET — Webhook verification
export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!verifyToken) {
    return new Response('WHATSAPP_VERIFY_TOKEN not configured', { status: 500 });
  }

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[whatsapp] Webhook verified successfully');
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

// POST — Inbound messages + status updates
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Meta sends status updates and messages in the same webhook
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    if (!value) return new Response('OK', { status: 200 });

    // ─── Inbound message ───
    if (value.messages && value.messages.length > 0) {
      const msg = value.messages[0];
      const from = msg.from; // phone number
      const msgType = msg.type; // 'text', 'button', etc.

      // Only handle text messages for now
      if (msgType === 'text' && msg.text?.body) {
        const text = msg.text.body;
        const messageId = msg.id;

        // Find contact by phone
        const { getTursoClient } = await import('@/lib/turso-config');
        const libsql = getTursoClient();

        // Try ContactPhone table first, then Contact.primaryPhone
        const phoneRes = await libsql.execute({
          sql: `SELECT c.id, c.ownerId FROM Contact c
            LEFT JOIN ContactPhone cp ON cp.contactId = c.id
            WHERE c.primaryPhone LIKE '%' || ? OR cp.phoneNumber LIKE '%' || ?
            LIMIT 1`,
          args: [from, from],
        });

        if (phoneRes.rows.length > 0) {
          const contact = phoneRes.rows[0] as any;
          // Save inbound message
          const { WhatsAppService } = await import('@/lib/services/whatsapp.service');
          await WhatsAppService.saveInboundMessage(contact.id, text, messageId);

          // Log activity
          const actId = 'act_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          await libsql.execute({
            sql: `INSERT INTO ContactActivity (id, contactId, userId, action, note, createdAt)
              VALUES (?, ?, ?, 'WHATSAPP', ?, CURRENT_TIMESTAMP)`,
            args: [actId, contact.id, contact.ownerId, `Mensaje recibido: ${text.substring(0, 200)}`],
          });

          // Create notification for the owner
          const notifId = 'notif_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
          await libsql.execute({
            sql: `INSERT INTO Notification (id, userId, type, title, message, link, createdAt)
              VALUES (?, ?, 'CONTACT', ?, ?, ?, CURRENT_TIMESTAMP)`,
            args: [
              notifId, contact.ownerId,
              'WhatsApp entrante',
              `Nuevo mensaje de WhatsApp: ${text.substring(0, 80)}`,
              `/vendedor/contactos/${contact.id}`,
            ],
          });
        } else {
          console.log('[whatsapp] Message from unknown number:', from);
        }
      }
    }

    // ─── Status update (delivered, read, etc.) ───
    if (value.statuses && value.statuses.length > 0) {
      for (const s of value.statuses) {
        const { getTursoClient } = await import('@/lib/turso-config');
        const libsql = getTursoClient();
        await libsql.execute({
          sql: `UPDATE "WhatsAppMessage" SET status = ? WHERE messageId = ?`,
          args: [s.status?.toUpperCase() || 'UNKNOWN', s.id],
        });
      }
    }

    return new Response('OK', { status: 200 });
  } catch (e: any) {
    console.error('[whatsapp POST] error:', e);
    return new Response('OK', { status: 200 }); // Always 200 so Meta doesn't retry
  }
}
