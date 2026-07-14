// POST /api/help/chat — Chat de ayuda con respuestas predefinidas (sin IA externa)
import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const knowledgeBase = {
  admin: {
    leads: 'Los mensajes de la landing se gestionan en la sección Mensajes. Podés filtrarlos, cambiar su estado, exportarlos a Excel/PDF y contactar al cliente por WhatsApp.',
    vendedores: 'Los vendedores se crean desde la sección Vendedores. Cada vendedor tiene su propio usuario y contraseña para acceder a su panel.',
    tareas: 'Las tareas se crean desde la sección Tareas. Se asignan a vendedores específicos y pueden tener prioridad y fecha límite.',
    empresas: 'Las empresas se gestionan desde la sección Empresas. Cada empresa agrupa vendedores y leads.',
    actividad: 'El historial de actividad registra todas las acciones del equipo. Podés filtrarlo y exportarlo a CSV.',
  },
  vendedor: {
    tareas: 'En Mis Tareas podés ver todas las tareas asignadas y marcarlas como completadas.',
    leads: 'En Mis Leads podés ver los leads asignados y contactarlos directamente por WhatsApp.',
    perfil: 'En Mi Perfil podés actualizar tus datos personales y cambiar tu contraseña.',
  },
};

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { message, role, context } = body;

    if (!message) {
      return new Response('Mensaje requerido', { status: 400 });
    }

    const userRole = role || session.user.role;
    const response = generateResponse(message, userRole, context?.page);

    return NextResponse.json({ response });
  } catch {
    return new Response('Error interno', { status: 500 });
  }
}

function generateResponse(message: string, role: string, page?: string): string {
  const msg = message.toLowerCase();

  // Respuestas basadas en palabras clave
  if (msg.includes('mensaje') || msg.includes('lead') || msg.includes('cliente')) {
    return role === 'ADMIN'
      ? `📋 Los mensajes de clientes se gestionan en la sección "Mensajes" (/admin/leads). ${knowledgeBase.admin.leads}`
      : `👥 Tus leads asignados están en "Mis Leads" (/vendedor/leads). ${knowledgeBase.vendedor.leads}`;
  }

  if (msg.includes('tarea') || msg.includes('asignar')) {
    return role === 'ADMIN'
      ? `📋 ${knowledgeBase.admin.tareas} Para crear una tarea, andá a /admin/tareas/nueva.`
      : `📋 ${knowledgeBase.vendedor.tareas} Para ver tus tareas, andá a /vendedor/tareas.`;
  }

  if (msg.includes('vendedor') || msg.includes('equipo')) {
    return role === 'ADMIN'
      ? `👥 ${knowledgeBase.admin.vendedores} Para crear un vendedor, andá a /admin/vendedores/nuevo.`
      : `Los vendedores son gestionados por el administrador. Si necesitás algo, contactá a tu admin.`;
  }

  if (msg.includes('empresa')) {
    return role === 'ADMIN'
      ? `🏢 ${knowledgeBase.admin.empresas}`
      : `Tu empresa está asignada por el administrador y no podés cambiarla.`;
  }

  if (msg.includes('whatsapp') || msg.includes('contactar')) {
    return `💬 Para contactar un lead por WhatsApp, buscá el botón verde 💬 junto al lead en la lista. Se abrirá WhatsApp Web con el número del cliente.`;
  }

  if (msg.includes('exportar') || msg.includes('excel') || msg.includes('pdf') || msg.includes('csv')) {
    return role === 'ADMIN'
      ? `📊 En la sección Mensajes, usá los botones 📊 Excel o 📄 PDF para exportar. En Actividad, usá "Exportar CSV".`
      : `Las exportaciones están disponibles solo para el administrador.`;
  }

  if (msg.includes('notificaci') || msg.includes('campana') || msg.includes('campanita')) {
    return `🔔 Las notificaciones aparecen en la campanita arriba a la derecha. Hacé clic para verlas y marcarlas como leídas.`;
  }

  if (msg.includes('contraseña') || msg.includes('password') || msg.includes('perfil')) {
    return role === 'VENDEDOR'
      ? `👤 En "Mi Perfil" (/vendedor/perfil) podés cambiar tu contraseña. Dejá el campo vacío para mantener la actual.`
      : `Los vendedores pueden cambiar su contraseña desde su perfil. El admin puede resetearla desde la edición del vendedor.`;
  }

  if (msg.includes('empresa') && msg.includes('cambiar')) {
    return role === 'ADMIN'
      ? `Usá el selector de empresa en el header superior para cambiar entre empresas. Seleccioná "Todas" para ver datos globales.`
      : `Tu empresa es fija y no podés cambiarla.`;
  }

  if (msg.includes('estado') || msg.includes('cambiar estado')) {
    return role === 'ADMIN'
      ? `En Mensajes, seleccioná los leads con checkboxes y usá las acciones masivas (Leído, Atendido, Eliminar).`
      : `En Mis Leads, usá el dropdown de estado en cada lead para actualizar su progreso.`;
  }

  if (msg.includes('hola') || msg.includes('buenas') || msg.includes('hey')) {
    return `👋 ¡Hola! Soy el asistente de Hominis CRM. Puedo ayudarte con: mensajes, tareas, vendedores, empresas, exportaciones y más. ¿Qué necesitás?`;
  }

  if (msg.includes('gracias')) {
    return `¡De nada! 😊 Si tenés otra pregunta, no dudes en consultarme.`;
  }

  // Respuesta genérica
  const sections = role === 'ADMIN'
    ? 'Mensajes, Vendedores, Tareas, Empresas, Equipo, Actividad'
    : 'Mis Tareas, Mis Leads, Mi Perfil';

  return `📚 Entiendo que estás preguntando sobre "${message}".

Como ${role === 'ADMIN' ? 'administrador' : 'vendedor'}, tenés acceso a: ${sections}.

💡 También podés consultar la guía rápida en la pestaña "Guía" de esta ayuda, o visitar la sección de FAQ en /faq.`;
}
