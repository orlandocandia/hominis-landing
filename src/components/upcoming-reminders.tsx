'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Check, Phone, Mail, MessageCircle, MapPin, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Followup {
  id: string;
  scheduledDate: string;
  status: string;
  type: string;
  content: string | null;
  contactName: string;
  contactId: string;
}

interface Reminder {
  id: string;
  reminderDate: string;
  title: string;
  description: string | null;
  type: string;
  isCompleted: boolean | number;
  contactName: string | null;
  contactId: string;
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  WHATSAPP: <MessageCircle className="w-3.5 h-3.5 text-green-600" />,
  EMAIL: <Mail className="w-3.5 h-3.5 text-blue-600" />,
  CALL: <Phone className="w-3.5 h-3.5 text-purple-600" />,
  LLAMADA: <Phone className="w-3.5 h-3.5 text-purple-600" />,
  MEETING: <Calendar className="w-3.5 h-3.5 text-orange-600" />,
  VISITA: <MapPin className="w-3.5 h-3.5 text-red-600" />,
  TAREA: <FileText className="w-3.5 h-3.5 text-gray-600" />,
  OTHER: <Clock className="w-3.5 h-3.5 text-gray-400" />,
};

export function UpcomingReminders() {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [fuRes, remRes] = await Promise.all([
        fetch('/api/followups'),
        fetch('/api/reminders'),
      ]);
      const fuData = await fuRes.json();
      const remData = await remRes.json();
      setFollowups(fuData.followups || []);
      setReminders(remData.reminders || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, [load]);

  const completeReminder = async (id: string) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, isCompleted: 1 } : r)));
    try {
      await fetch(`/api/reminders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true }),
      });
      toast.success('Recordatorio completado');
    } catch {
      toast.error('Error al completar');
      load(); // Revert
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = d.getTime() - now.getTime();
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (days > 0) return `en ${days}d`;
    if (hours > 0) return `en ${hours}h`;
    if (diff > 0) return 'pronto';
    return 'vencido';
  };

  const isOverdue = (iso: string) => new Date(iso) < new Date();

  if (loading) return null;

  const totalPending = followups.filter((f) => f.status === 'PENDING').length + reminders.filter((r) => !r.isCompleted).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Próximos recordatorios
          {totalPending > 0 && <Badge variant="default" className="text-[10px] py-0">{totalPending}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {totalPending === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">🎉 Sin recordatorios pendientes. ¡Todo al día!</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {/* Follow-ups */}
            {followups.filter((f) => f.status === 'PENDING').slice(0, 5).map((f) => (
              <Link key={f.id} href={`/vendedor/contactos/${f.contactId}`} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                {TYPE_ICONS[f.type] || TYPE_ICONS.OTHER}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{f.contactName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{f.content?.substring(0, 50) || f.type}</p>
                </div>
                <Badge variant={isOverdue(f.scheduledDate) ? 'destructive' : 'outline'} className="text-[9px] py-0 flex-shrink-0">
                  {formatDate(f.scheduledDate)}
                </Badge>
              </Link>
            ))}
            {/* Reminders */}
            {reminders.filter((r) => !r.isCompleted).slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center gap-2 p-2 rounded-lg border hover:bg-accent/50 transition-colors">
                {TYPE_ICONS[r.type] || TYPE_ICONS.OTHER}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{r.title}</p>
                  {r.contactName && <p className="text-[10px] text-muted-foreground truncate">👤 {r.contactName}</p>}
                </div>
                <Badge variant={isOverdue(r.reminderDate) ? 'destructive' : 'outline'} className="text-[9px] py-0 flex-shrink-0">
                  {formatDate(r.reminderDate)}
                </Badge>
                <Button size="icon" variant="ghost" className="h-6 w-6 flex-shrink-0 text-green-600 hover:text-green-700" onClick={() => completeReminder(r.id)}>
                  <Check className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
