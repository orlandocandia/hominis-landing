// src/lib/email.ts — Notificaciones por email usando Resend
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  // Si no hay API key, skip silenciosamente
  if (!process.env.RESEND_API_KEY) {
    console.log('[email] RESEND_API_KEY no configurada, skip:', subject);
    return { success: false, error: 'RESEND_API_KEY not set' };
  }

  try {
    await resend.emails.send({
      from: 'Hominis CRM <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    return { success: true };
  } catch (error) {
    console.error('[email] Error enviando:', error);
    return { success: false, error };
  }
}
