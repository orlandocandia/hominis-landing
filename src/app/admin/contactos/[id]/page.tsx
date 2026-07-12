'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Phone, MessageSquare, Trash2, Printer, Download, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { isValidTransition } from '@/lib/constants';

const STATUS_LABELS: Record<string, string> = {
  NUEVO: '🆕 Nuevo',
  LEIDO: '📖 Leído',
  EN_CONTACTO: '💬 En Contacto',
  REUNION: '🤝 Reunión',
  PRESUPUESTO: '💰 Presupuesto',
  ATENDIDO: '✅ Cerrado',
  RECHAZADO: '❌ Rechazado',
};

const STATUS_COLORS: Record<string, string> = {
  NUEVO: 'bg-red-100 text-red-700 border-red-200',
  LEIDO: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  EN_CONTACTO: 'bg-blue-100 text-blue-700 border-blue-200',
  REUNION: 'bg-purple-100 text-purple-700 border-purple-200',
  PRESUPUESTO: 'bg-orange-100 text-orange-700 border-orange-200',
  ATENDIDO: 'bg-green-100 text-green-700 border-green-200',
  RECHAZADO: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function ContactDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [contact, setContact] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [contactRes, activitiesRes] = await Promise.all([
          fetch(`/api/crm/contacts/${id}`),
          fetch(`/api/crm/contacts/${id}/activities`),
        ]);
        const contactData = await contactRes.json();
        const activitiesData = await activitiesRes.json();
        setContact(contactData.contact || contactData);
        setActivities(activitiesData.activities || []);
      } catch (e: any) {
        toast.error('Error al cargar el contacto');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    if (!contact || newStatus === contact.status) return;
    if (!isValidTransition(contact.status, newStatus, 'ADMIN')) {
      toast.error(`No podés pasar de ${contact.status} a ${newStatus} directamente`);
      return;
    }
    setUpdating(true);
    try {
      const res = await fetch(`/api/crm/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar');
      }
      toast.success(`Estado cambiado a ${newStatus}`);
      setContact({ ...contact, status: newStatus });
      // Refresh activities
      const actRes = await fetch(`/api/crm/contacts/${id}/activities`);
      const actData = await actRes.json();
      setActivities(actData.activities || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUpdating(false);
    }
  };

  const deleteContact = async () => {
    if (!confirm('¿Eliminar este contacto permanentemente?')) return;
    try {
      const res = await fetch(`/api/crm/contacts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      toast.success('Contacto eliminado');
      router.push('/admin/contactos');
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const exportContact = () => {
    if (!contact) return;
    const data = {
      nombre: contact.name,
      email: contact.primaryEmail,
      telefono: contact.primaryPhone,
      mensaje: contact.message,
      estado: contact.status,
      segmento: contact.segment,
      edad: contact.age,
      cobertura: contact.coverage,
      score: contact.leadScore,
      prioridad: contact.leadPriority,
      fecha: new Date(contact.createdAt).toLocaleString('es-AR'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacto_${contact.name.replace(/\s/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Contacto exportado');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Contacto no encontrado</p>
        <Link href="/admin/contactos" className="text-primary hover:underline mt-2 inline-block">← Volver</Link>
      </div>
    );
  }

  const phone = contact.primaryPhone?.replace(/[^\d]/g, '') || '';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link href="/admin/contactos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver a contactos
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{contact.name}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            {contact.primaryPhone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{contact.primaryPhone}</span>}
            {contact.primaryEmail && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{contact.primaryEmail}</span>}
          </div>
        </div>
        <Badge className={`text-sm px-3 py-1 ${STATUS_COLORS[contact.status] || STATUS_COLORS.NUEVO}`}>
          {STATUS_LABELS[contact.status] || contact.status}
        </Badge>
      </div>

      {/* Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Mensaje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg border">
            <p className="whitespace-pre-wrap text-sm">{contact.message || 'Sin mensaje'}</p>
          </div>
          <p className="text-xs text-muted-foreground/70 mt-2">
            Recibido: {new Date(contact.createdAt).toLocaleString('es-AR')}
          </p>
        </CardContent>
      </Card>

      {/* Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Datos personales</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Segmento:</span><span className="font-medium">{contact.segment?.replace(/_/g, ' ') || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Edad:</span><span className="font-medium">{contact.age || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Cobertura:</span><span className="font-medium">{contact.coverage || '—'}</span></div>
            {contact.address && <div className="flex justify-between"><span className="text-muted-foreground">Dirección:</span><span className="font-medium">{contact.address}</span></div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Asignación</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Asignado a:</span><span className="font-medium">{contact.ownerNombre || contact.owner?.name || 'Admin'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Score:</span><span className="font-medium">{contact.leadScore || 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Prioridad:</span><span className="font-medium">{contact.leadPriority || 'MEDIA'}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader><CardTitle className="text-base">⚡ Acciones</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Status buttons */}
          <div>
            <p className="text-sm font-medium mb-2">Cambiar estado:</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={updating || status === contact.status}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    status === contact.status
                      ? 'bg-primary text-primary-foreground cursor-default'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70'
                  } ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {phone && (
              <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5 text-green-600 hover:text-green-700">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </Button>
              </a>
            )}
            {contact.primaryEmail && (
              <a href={`mailto:${contact.primaryEmail}`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Mail className="w-4 h-4" /> Email
                </Button>
              </a>
            )}
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5">
              <Printer className="w-4 h-4" /> Imprimir
            </Button>
            <Button variant="outline" size="sm" onClick={exportContact} className="gap-1.5">
              <Download className="w-4 h-4" /> Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={deleteContact} className="gap-1.5 text-red-600 hover:text-red-700">
              <Trash2 className="w-4 h-4" /> Eliminar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activities */}
      {activities.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">📋 Historial de actividad</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activities.map((act: any) => (
                <div key={act.id} className="flex items-center gap-3 p-2 rounded-lg border text-sm">
                  <Badge variant="outline" className="text-[10px] py-0">{act.action}</Badge>
                  <span className="text-muted-foreground flex-1">{act.note}</span>
                  <span className="text-[10px] text-muted-foreground/70">{new Date(act.createdAt).toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
