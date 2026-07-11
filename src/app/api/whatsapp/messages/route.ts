// GET /api/whatsapp/messages?contactId=... — get conversation history
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { WhatsAppService } from '@/lib/services/whatsapp.service';

export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get('contactId');
    if (!contactId) return NextResponse.json({ error: 'contactId es obligatorio' }, { status: 400 });

    const messages = await WhatsAppService.getConversation(contactId);
    return NextResponse.json({ messages });
  } catch (e: any) {
    console.error('[whatsapp/messages GET] error:', e);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
