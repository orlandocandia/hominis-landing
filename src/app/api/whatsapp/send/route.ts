// POST /api/whatsapp/send — send a WhatsApp message
// Body: { to, body, contactId?, type? }
// Returns: { ok, messageId?, error?, fallbackUrl? }
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { WhatsAppService } from '@/lib/services/whatsapp.service';

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const body = await request.json();
    const { to, body: messageBody, contactId, type, templateName, variables, buttons } = body;

    if (!to || (!messageBody && !templateName)) {
      return NextResponse.json({ error: 'to y body (o templateName) son obligatorios' }, { status: 400 });
    }

    let result;
    if (type === 'template' && templateName) {
      result = await WhatsAppService.sendTemplate(to, templateName, variables, contactId);
    } else if (type === 'interactive' && buttons) {
      result = await WhatsAppService.sendQuickReply(to, messageBody, buttons, contactId);
    } else {
      result = await WhatsAppService.sendMessage(to, messageBody, contactId);
    }

    if (!result.ok && result.fallbackUrl) {
      return NextResponse.json({
        ok: false,
        fallbackUrl: result.fallbackUrl,
        error: result.error,
        message: 'WhatsApp Business API no configurado. Abrí este link para enviar por WhatsApp.',
      });
    }

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ ok: true, messageId: result.messageId });
  } catch (e: any) {
    console.error('[whatsapp/send] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
