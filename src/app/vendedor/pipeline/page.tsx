'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import Link from 'next/link';
import { Loader2, MapPin, Phone, GripVertical } from 'lucide-react';
import { LeadScoreBadge } from '@/components/lead-score-badge';
import { toast } from 'sonner';
import { VALID_TRANSITIONS } from '@/lib/constants';

interface Contact {
  id: string;
  name: string;
  primaryEmail: string | null;
  primaryPhone: string | null;
  address: string;
  city: string | null;
  status: string;
  segment: string | null;
  leadScore: number | null;
  leadPriority: string | null;
  ownerNombre: string | null;
  ownerApellido: string | null;
}

const STATUSES = [
  { id: 'NUEVO', label: '🆕 Nuevos', color: 'bg-red-50 border-red-200', headerColor: 'text-red-700', badge: 'bg-red-100 text-red-700' },
  { id: 'LEIDO', label: '📖 Leídos', color: 'bg-yellow-50 border-yellow-200', headerColor: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700' },
  { id: 'EN_CONTACTO', label: '💬 En Contacto', color: 'bg-blue-50 border-blue-200', headerColor: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  { id: 'REUNION', label: '🤝 Reunión', color: 'bg-purple-50 border-purple-200', headerColor: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
  { id: 'PRESUPUESTO', label: '💰 Presupuesto', color: 'bg-orange-50 border-orange-200', headerColor: 'text-orange-700', badge: 'bg-orange-100 text-orange-700' },
  { id: 'ATENDIDO', label: '✅ Cerrado', color: 'bg-green-50 border-green-200', headerColor: 'text-green-700', badge: 'bg-green-100 text-green-700' },
  { id: 'RECHAZADO', label: '❌ Rechazado', color: 'bg-gray-50 border-gray-200', headerColor: 'text-gray-600', badge: 'bg-gray-100 text-gray-600' },
];

export default function PipelinePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/crm/contacts?limit=200');
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch {
      toast.error('Error al cargar contactos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s.id] = contacts.filter((c) => c.status === s.id);
    return acc;
  }, {} as Record<string, Contact[]>);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const contactId = active.id as string;
    const newStatus = over.id as string;
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact || contact.status === newStatus) return;

    // Validate transition (client-side — API also validates server-side)
    const allowed = VALID_TRANSITIONS[contact.status] || [];
    if (!allowed.includes(newStatus)) {
      toast.error(`No podés mover de "${contact.status}" a "${newStatus}" directamente.`);
      return;
    }

    // Optimistic update
    setContacts((prev) => prev.map((c) => (c.id === contactId ? { ...c, status: newStatus } : c)));

    // Update API
    try {
      const res = await fetch(`/api/crm/contacts/${contactId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al actualizar');
      }
      toast.success(`${contact.name} → ${STATUSES.find((s) => s.id === newStatus)?.label}`);
    } catch (e: any) {
      // Revert on error
      setContacts((prev) => prev.map((c) => (c.id === contactId ? { ...c, status: contact.status } : c)));
      toast.error(e.message);
    }
  };

  const activeContact = activeId ? contacts.find((c) => c.id === activeId) : null;

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">📊 Pipeline de Ventas</h1>
        <p className="text-sm text-muted-foreground">
          Arrastrá las tarjetas entre columnas para cambiar el estado. {contacts.length} contactos en total.
        </p>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {STATUSES.map((status) => (
            <Column key={status.id} status={status} contacts={grouped[status.id] || []} />
          ))}
        </div>

        <DragOverlay>
          {activeContact ? <ContactCard contact={activeContact} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function Column({ status, contacts }: { status: typeof STATUSES[0]; contacts: Contact[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status.id });

  return (
    <div
      ref={setNodeRef}
      className={`${status.color} border rounded-lg p-3 transition-all ${isOver ? 'ring-2 ring-primary ring-offset-1' : ''} flex flex-col`}
      style={{ minHeight: '200px' }}
    >
      <div className="flex justify-between items-center mb-3 flex-shrink-0">
        <h3 className={`font-semibold text-sm ${status.headerColor}`}>{status.label}</h3>
        <span className={`${status.badge} px-2 py-0.5 rounded-full text-xs font-bold`}>{contacts.length}</span>
      </div>
      <div className="space-y-2 overflow-y-auto flex-1 max-h-[calc(100vh-280px)]">
        {contacts.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
        {contacts.length === 0 && (
          <p className="text-xs text-muted-foreground/50 text-center py-4 italic">Sin contactos</p>
        )}
      </div>
    </div>
  );
}

function ContactCard({ contact, dragging }: { contact: Contact; dragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: contact.id,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 100 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30' : ''} ${dragging ? 'shadow-lg rotate-2' : ''}`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <Link
          href={`/vendedor/contactos/${contact.id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-medium text-sm hover:text-primary truncate flex-1"
        >
          {contact.name}
        </Link>
        <GripVertical className="w-3 h-3 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
      </div>
      <div className="mb-2">
        <LeadScoreBadge score={contact.leadScore} priority={contact.leadPriority} size="sm" />
      </div>
      <div className="space-y-0.5 text-xs text-muted-foreground">
        <p className="flex items-center gap-1 truncate">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{contact.city || contact.address}</span>
        </p>
        {contact.primaryPhone && (
          <p className="flex items-center gap-1 truncate">
            <Phone className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{contact.primaryPhone}</span>
          </p>
        )}
      </div>
      {contact.ownerNombre && (
        <p className="text-[10px] text-muted-foreground/60 mt-1 truncate">
          {contact.ownerNombre} {contact.ownerApellido || ''}
        </p>
      )}
    </div>
  );
}
