// WhatsApp Business API Service
// =============================
// Sends messages via WhatsApp Business API (Meta Graph API).
// If credentials aren't configured → falls back to wa.me deep links (no API needed).
//
// Required env vars for Business API:
//   WHATSAPP_ACCESS_TOKEN — Meta access token
//   WHATSAPP_PHONE_ID     — Phone Number ID from Meta Business
//   WHATSAPP_VERIFY_TOKEN — Token you set for webhook verification
//
// Usage:
//   WhatsAppService.sendMessage(phone, body, contactId)
//   WhatsAppService.sendTemplate(phone, templateName, components)
//   WhatsAppService.sendQuickReply(phone, text, buttons)
import { getTursoClient } from '@/lib/turso-config';

export function isWhatsAppConfigured(): boolean {
  return !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_ID);
}

function getApiUrl(): string {
  return `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
}

export interface SendResult {
  ok: boolean;
  messageId?: string;
  error?: string;
  fallbackUrl?: string; // wa.me link when API not configured
}

export class WhatsAppService {
  /**
   * Send a text message. Falls back to wa.me link if API not configured.
   */
  static async sendMessage(to: string, body: string, contactId?: string): Promise<SendResult> {
    // Normalize phone (remove +, spaces, dashes)
    const phone = to.replace(/[^\d]/g, '');

    if (!isWhatsAppConfigured()) {
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(body)}`;
      return { ok: false, fallbackUrl: url, error: 'WhatsApp Business API no configurado' };
    }

    try {
      const res = await fetch(getApiUrl(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: { body },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error?.message || `HTTP ${res.status}` };
      }

      const messageId = data.messages?.[0]?.id;

      // Persist to DB
      if (contactId) {
        const libsql = getTursoClient();
        const id = 'wa_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        await libsql.execute({
          sql: `INSERT INTO "WhatsAppMessage" (id, contactId, direction, messageId, content, type, status, sentAt)
            VALUES (?, ?, 'OUTBOUND', ?, ?, 'TEXT', 'SENT', CURRENT_TIMESTAMP)`,
          args: [id, contactId, messageId || null, body],
        });
      }

      return { ok: true, messageId };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }

  /**
   * Send a template message (pre-approved by Meta).
   * If templateName matches a WhatsAppTemplate in DB, uses its language + variables.
   */
  static async sendTemplate(to: string, templateName: string, variables?: Record<string, string>, contactId?: string): Promise<SendResult> {
    if (!isWhatsAppConfigured()) {
      return { ok: false, error: 'WhatsApp Business API no configurado' };
    }
    const phone = to.replace(/[^\d]/g, '');

    // Load template from DB (for language + variable mapping)
    const libsql = getTursoClient();
    let language = 'es';
    let templateBody = `Template: ${templateName}`;
    try {
      const tplRes = await libsql.execute({
        sql: 'SELECT language, body, variables FROM "WhatsAppTemplate" WHERE name = ? AND isActive = 1',
        args: [templateName],
      });
      if (tplRes.rows.length > 0) {
        const tpl = tplRes.rows[0] as any;
        language = tpl.language || 'es';
        templateBody = tpl.body;
        // Build components with variables
        if (variables && tpl.variables) {
          const varNames = JSON.parse(tpl.variables) as string[];
          // Substitute {{1}}, {{2}}, etc. in body for display
          varNames.forEach((name, i) => {
            templateBody = templateBody.replace(new RegExp(`\\{\\{${i + 1}\\}\\}`, 'g'), variables[name] || '');
          });
        }
      }
    } catch {}

    // Build components for Meta API
    const components: any[] = [];
    if (variables) {
      const libsql2 = getTursoClient();
      try {
        const tplRes = await libsql2.execute({ sql: 'SELECT variables FROM "WhatsAppTemplate" WHERE name = ?', args: [templateName] });
        if (tplRes.rows.length > 0) {
          const varNames = JSON.parse((tplRes.rows[0] as any).variables || '[]') as string[];
          const params = varNames.map((name) => ({ type: 'text', text: variables[name] || '' }));
          if (params.length > 0) components.push({ type: 'body', parameters: params });
        }
      } catch {}
    }

    try {
      const res = await fetch(getApiUrl(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: { name: templateName, language: { code: language }, components },
        }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error?.message || `HTTP ${res.status}` };

      const messageId = data.messages?.[0]?.id;
      if (contactId) {
        const id = 'wa_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        await libsql.execute({
          sql: `INSERT INTO "WhatsAppMessage" (id, contactId, direction, messageId, content, type, status, sentAt)
            VALUES (?, ?, 'OUTBOUND', ?, ?, 'TEMPLATE', 'SENT', CURRENT_TIMESTAMP)`,
          args: [id, contactId, messageId || null, templateBody],
        });
      }
      return { ok: true, messageId };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }

  /**
   * Send an interactive message with quick reply buttons.
   */
  static async sendQuickReply(to: string, text: string, buttons: string[], contactId?: string): Promise<SendResult> {
    if (!isWhatsAppConfigured()) {
      const phone = to.replace(/[^\d]/g, '');
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
      return { ok: false, fallbackUrl: url, error: 'WhatsApp Business API no configurado' };
    }
    const phone = to.replace(/[^\d]/g, '');
    const buttonsObj = buttons.slice(0, 3).map((btn, i) => ({
      type: 'reply',
      reply: { id: `btn_${i}`, title: btn },
    }));
    try {
      const res = await fetch(getApiUrl(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'interactive',
          interactive: { type: 'button', body: { text }, action: { buttons: buttonsObj } },
        }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error?.message || `HTTP ${res.status}` };

      const messageId = data.messages?.[0]?.id;
      if (contactId) {
        const libsql = getTursoClient();
        const id = 'wa_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
        await libsql.execute({
          sql: `INSERT INTO "WhatsAppMessage" (id, contactId, direction, messageId, content, type, status, sentAt)
            VALUES (?, ?, 'OUTBOUND', ?, ?, 'INTERACTIVE', 'SENT', CURRENT_TIMESTAMP)`,
          args: [id, contactId, messageId || null, text],
        });
      }
      return { ok: true, messageId };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  }

  /**
   * Save an inbound message (called by the webhook).
   */
  static async saveInboundMessage(contactId: string, content: string, messageId?: string): Promise<void> {
    const libsql = getTursoClient();
    const id = 'wa_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await libsql.execute({
      sql: `INSERT INTO "WhatsAppMessage" (id, contactId, direction, messageId, content, type, status, sentAt)
        VALUES (?, ?, 'INBOUND', ?, ?, 'TEXT', 'DELIVERED', CURRENT_TIMESTAMP)`,
      args: [id, contactId, messageId || null, content],
    });
  }

  /**
   * Get conversation history for a contact.
   */
  static async getConversation(contactId: string, limit = 50): Promise<any[]> {
    const libsql = getTursoClient();
    const res = await libsql.execute({
      sql: `SELECT * FROM "WhatsAppMessage" WHERE contactId = ? ORDER BY sentAt DESC LIMIT ?`,
      args: [contactId, limit],
    });
    return res.rows;
  }
}
