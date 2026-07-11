'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { MessageCircle, Send, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppContactButtonProps {
  phoneNumber: string;
  contactId?: string;
  contactName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'icon';
}

const QUICK_TEMPLATES = [
  '¡Hola! Gracias por tu interés en nuestros planes de salud. ¿Te puedo llamar para contarte más?',
  'Te paso la info de Vita Más / Aqua Más. ¿Tenés alguna duda?',
  '¿Te parece bien si coordinamos una reunión esta semana?',
  'Quería saber si tuviste chance de revisar la cotización que te envié.',
];

export function WhatsAppContactButton({
  phoneNumber,
  contactId,
  contactName,
  variant = 'outline',
  size = 'sm',
}: WhatsAppContactButtonProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: phoneNumber, body: message, contactId }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('Mensaje enviado por WhatsApp');
        setOpen(false);
        setMessage('');
      } else if (data.fallbackUrl) {
        // API not configured → open wa.me link
        window.open(data.fallbackUrl, '_blank');
        toast.info('Abriendo WhatsApp web...');
        setOpen(false);
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const phone = phoneNumber.replace(/[^\d]/g, '');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-1.5 text-green-600 hover:text-green-700">
          <MessageCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Enviar WhatsApp
          </DialogTitle>
        </DialogHeader>
        {contactName && <p className="text-sm text-muted-foreground -mt-2">Para: <strong>{contactName}</strong></p>}

        {/* Quick templates */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_TEMPLATES.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setMessage(t)}
              className="text-xs px-2 py-1 rounded-full border hover:bg-accent transition-colors text-muted-foreground"
            >
              {t.substring(0, 30)}...
            </button>
          ))}
        </div>

        <Textarea
          rows={3}
          placeholder="Escribí tu mensaje..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="flex gap-2 justify-end">
          <a
            href={`https://wa.me/${phone}?text=${encodeURIComponent(message || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Abrir en WhatsApp
          </a>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button type="button" onClick={send} disabled={sending || !message.trim()} className="gap-1.5 bg-green-600 hover:bg-green-700 text-white">
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
