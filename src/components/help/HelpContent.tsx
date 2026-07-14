'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface HelpSection {
  title: string;
  content: string;
}

interface HelpData {
  title: string;
  sections: HelpSection[];
}

export function HelpContent() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const getHelpContent = (): HelpData => {
    if (pathname.includes('/admin/leads')) {
      return {
        title: '📋 Gestión de Mensajes',
        sections: [
          { title: '¿Cómo ver los mensajes?', content: 'Los mensajes de clientes aparecen en esta tabla. Podés filtrarlos por estado, segmento o fecha.' },
          { title: '¿Cómo responder?', content: 'Hacé clic en el botón WhatsApp para contactar al cliente directamente desde el sistema.' },
          { title: '¿Cómo cambiar el estado?', content: 'Seleccioná los leads con los checkboxes y usá las acciones masivas para cambiar su estado.' },
          { title: '¿Cómo exportar?', content: 'Usá los botones 📊 Excel o 📄 PDF para exportar los leads filtrados.' },
        ],
      };
    }

    if (pathname.includes('/admin/vendedores')) {
      return {
        title: '👥 Gestión de Vendedores',
        sections: [
          { title: '¿Cómo crear un vendedor?', content: 'Hacé clic en "Nuevo Vendedor" y completá: nombre, email, contraseña y empresa asignada.' },
          { title: '¿Cómo ver métricas?', content: 'Cada tarjeta de vendedor muestra sus leads, tareas pendientes y completadas.' },
          { title: '¿Cómo activar/desactivar?', content: 'Usá el botón Activar/Desactivar en cada tarjeta. Los vendedores inactivos no pueden iniciar sesión.' },
        ],
      };
    }

    if (pathname.includes('/admin/tareas')) {
      return {
        title: '📋 Gestión de Tareas',
        sections: [
          { title: '¿Cómo crear una tarea?', content: 'Hacé clic en "Nueva Tarea", completá los datos y asignála a un vendedor. El vendedor recibirá una notificación.' },
          { title: '¿Cómo ver el progreso?', content: 'Los vendedores marcan las tareas como completadas. Podés ver el estado en esta lista con filtros.' },
          { title: '¿Qué son los tipos?', content: 'Visita, Llamada, WhatsApp, Email, Reunión o Tarea general. Cada tipo tiene un ícono diferente.' },
        ],
      };
    }

    if (pathname.includes('/admin/empresas')) {
      return {
        title: '🏢 Gestión de Empresas',
        sections: [
          { title: '¿Cómo crear una empresa?', content: 'Hacé clic en "Nueva Empresa" y completá nombre, email, teléfono y dirección.' },
          { title: '¿Para qué sirve?', content: 'Cada empresa agrupa vendedores y leads. El admin puede cambiar entre empresas con el selector del header.' },
        ],
      };
    }

    if (pathname.includes('/admin/actividad')) {
      return {
        title: '📊 Historial de Actividad',
        sections: [
          { title: '¿Qué muestra?', content: 'Todas las acciones de vendedores: leads creados, estados cambiados, tareas completadas, etc.' },
          { title: '¿Cómo exportar?', content: 'Usá el botón "Exportar CSV" para descargar el historial filtrado.' },
        ],
      };
    }

    if (pathname.includes('/vendedor/tareas')) {
      return {
        title: '📋 Mis Tareas',
        sections: [
          { title: '¿Cómo ver mis tareas?', content: 'Todas tus tareas asignadas aparecen aquí ordenadas por prioridad y fecha límite.' },
          { title: '¿Cómo completar?', content: 'Hacé clic en "Completar" en la tarea. Se registrará automáticamente en el historial de actividad.' },
        ],
      };
    }

    if (pathname.includes('/vendedor/leads')) {
      return {
        title: '👥 Mis Leads',
        sections: [
          { title: '¿Cómo contactar?', content: 'Hacé clic en el botón WhatsApp para abrir una conversación directa con el cliente.' },
          { title: '¿Cómo cambiar estado?', content: 'Usá el dropdown de estado en cada lead para actualizar su progreso (Nuevo, Leído, Atendido, etc.).' },
        ],
      };
    }

    if (pathname.includes('/vendedor/perfil')) {
      return {
        title: '👤 Mi Perfil',
        sections: [
          { title: '¿Qué puedo cambiar?', content: 'Podés actualizar tu nombre, teléfono y contraseña. El email y la empresa no se pueden modificar.' },
        ],
      };
    }

    return {
      title: '💡 Ayuda General',
      sections: [
        { title: '¿Cómo navegar?', content: 'Usá el menú lateral para acceder a las diferentes secciones del panel.' },
        { title: '¿Dónde ver notificaciones?', content: 'Hacé clic en la campanita arriba a la derecha para ver tus notificaciones.' },
        { title: '¿Cómo cambiar tema?', content: 'Usá el botón de luna/sol en el header para alternar entre modo claro y oscuro.' },
      ],
    };
  };

  const content = getHelpContent();

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-foreground">{content.title}</h4>
      <div className="space-y-3">
        {content.sections.map((section, i) => (
          <div key={i} className="rounded-lg bg-muted/30 p-3">
            <h5 className="text-sm font-medium text-foreground">{section.title}</h5>
            <p className="mt-1 text-sm text-muted-foreground">{section.content}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-border pt-3">
        <p className="text-xs text-muted-foreground">
          💡 ¿No encontrás lo que buscás? Usá el chat con IA para más ayuda.
        </p>
      </div>
    </div>
  );
}
