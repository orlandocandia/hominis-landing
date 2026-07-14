'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const faqs = [
  {
    question: '¿Cómo puedo ver los mensajes de los clientes?',
    answer: 'Los mensajes aparecen en la sección "Mensajes" del panel de administración (/admin/leads). Podés filtrarlos por estado, segmento o fecha, y usar la paginación para navegar.',
  },
  {
    question: '¿Cómo asigno una tarea a un vendedor?',
    answer: 'En la sección "Tareas", hacé clic en "Nueva Tarea", completá los datos (título, tipo, prioridad, fecha límite) y seleccioná el vendedor en el campo "Asignar a". El vendedor recibirá una notificación automática.',
  },
  {
    question: '¿Cómo contacto a un lead por WhatsApp?',
    answer: 'En la lista de mensajes o leads, hacé clic en el botón WhatsApp (verde) que aparece junto a cada registro. Se abrirá WhatsApp Web con el número del cliente ya cargado.',
  },
  {
    question: '¿Cómo cambio el estado de un lead?',
    answer: 'Como admin: seleccioná los leads con los checkboxes y usá las acciones masivas (Leído, Atendido, Eliminar). Como vendedor: usá el dropdown de estado en cada lead.',
  },
  {
    question: '¿Cómo exporto los leads?',
    answer: 'En la sección "Mensajes", usá los botones 📊 Excel o 📄 PDF en el header. Se descargará un archivo con los leads filtrados actualmente.',
  },
  {
    question: '¿Cómo creo un nuevo vendedor?',
    answer: 'Andá a "Vendedores" → "Nuevo Vendedor". Completá: nombre, email, contraseña, teléfono y empresa asignada. El vendedor podrá iniciar sesión inmediatamente.',
  },
  {
    question: '¿Cómo activo o desactivo un vendedor?',
    answer: 'En la lista de vendedores, cada tarjeta tiene un botón "Activar/Desactivar". Los vendedores inactivos no pueden iniciar sesión pero sus datos se conservan.',
  },
  {
    question: '¿Cómo cambio de empresa en el dashboard?',
    answer: 'Como admin, usá el selector de empresa en el header superior. Podés elegir una empresa específica o "Todas las empresas" para ver datos globales. Los vendedores no pueden cambiar de empresa.',
  },
  {
    question: '¿Cómo cambio mi contraseña?',
    answer: 'Andá a "Mi Perfil" (/vendedor/perfil). En la sección "Cambiar contraseña", ingresá la nueva contraseña dos veces y guardá. Dejá vacío para mantener la actual.',
  },
  {
    question: '¿Dónde veo mis notificaciones?',
    answer: 'Hacé clic en la campanita arriba a la derecha del header. Verás todas tus notificaciones (nuevas tareas, nuevos leads, etc.). Podés marcarlas como leídas individualmente o todas juntas.',
  },
  {
    question: '¿Qué significan los estados de los leads?',
    answer: 'NUEVO: recién llegado. LEÍDO: lo viste pero no contactaste. EN CONTACTO: iniciaste comunicación. REUNION: agendaste una reunión. PRESUPUESTO: enviaste un presupuesto. ATENDIDO: cerrado exitosamente. RECHAZADO: no interesado.',
  },
  {
    question: '¿Cómo veo el historial de actividad?',
    answer: 'Como admin, andá a "Actividad" (/admin/actividad). Verás todas las acciones del equipo filtrables por tipo, vendedor y fecha. Podés exportar a CSV.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">❓ Preguntas Frecuentes</h1>
          <p className="text-sm text-muted-foreground">Guía rápida del sistema Hominis CRM</p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <Card key={i} className="overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between p-4 text-left transition hover:bg-muted/30"
            >
              <span className="font-medium text-foreground">{faq.question}</span>
              {openIndex === i ? (
                <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 text-muted-foreground">
                {faq.answer}
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">
          💡 ¿No encontrás tu respuesta? Usá el botón de ayuda flotante (❓) en el dashboard para chatear con el asistente.
        </p>
      </div>
    </div>
  );
}
