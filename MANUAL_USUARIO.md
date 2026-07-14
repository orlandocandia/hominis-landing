# Manual de Usuario — Hominis CRM

**Versión:** 1.0  
**Fecha:** Julio 2026  
**Autor:** Orlando Candia  
**Cliente:** Agustina C. Candia  

---

## 1. Introducción

### 1.1 ¿Qué es Hominis CRM?

Hominis CRM es un sistema integral de gestión de clientes y ventas diseñado específicamente para asesores de salud. Permite captar clientes potenciales a través de un formulario en la landing pública, gestionar los leads de manera profesional, asignar tareas a vendedores, supervisar el equipo de ventas en tiempo real, y visualizar estadísticas y reportes actualizados al instante.

### 1.2 ¿Para quién está pensado?

El sistema está diseñado para dos tipos de usuarios:

- **Administradores** (Agustina): Gestión completa del negocio — empresas, vendedores, leads, tareas, actividad y reportes.
- **Vendedores**: Gestión de su trabajo diario — tareas asignadas, leads a contactar y perfil personal.

### 1.3 Requisitos técnicos

| Requisito | Descripción |
|-----------|-------------|
| Navegador | Chrome, Firefox, Safari o Edge (última versión) |
| Conexión | Internet permanente |
| Dispositivo | Computadora, tablet o celular |
| Resolución | Mínimo 320px de ancho (totalmente responsive) |

### 1.4 Acceso al sistema

**URL de acceso:** `https://www.asesoradesalud.com.ar/login`

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `acandia@mphominis.com.ar` | `Hominis2025!` |
| Vendedor | (creado por el administrador) | (asignada al crear) |

---

## 2. Landing Pública

### 2.1 Estructura de la landing

La landing pública es la página principal que ven los clientes potenciales. Está compuesta por nueve secciones que guían al visitante desde la presentación hasta el formulario de contacto.

![Landing Pública — Página principal](/images/docs/landing/hero.png)

*Imagen: Página principal de Hominis CRM con todas las secciones*

### 2.2 Sección Inicio (Hero)

Esta es la primera impresión del visitante. Incluye una foto de la asesora, el título "Tu bienestar, mi compromiso", una descripción de los servicios, un botón para solicitar asesoramiento, y estadísticas clave (clientes asesorados, años de experiencia, satisfacción).

### 2.3 Sección Sobre Mí

Presenta a Agustina C. Candia con una descripción profesional, sus características principales (atención personalizada, respuesta inmediata, asesoramiento gratuito) y una foto.

### 2.4 Sección Planes

Muestra una comparativa visual entre Vita Más (Premium: sin copagos, urgencias 24/7, odontología sin cargo, experiencia concierge) y Aqua Más (Ahorro: copagos flexibles, farmacia con descuento). Cada plan tiene un botón de contratación.

### 2.5 Sección Promociones

Descuentos escalonados para nuevos socios con débito automático, divididos en tres períodos (meses 1-3, 4-6, 7-12).

### 2.6 Sección Servicios Digitales

Describe beneficios adicionales: médico virtual por videollamada, asistencia al viajero y farmacia digital.

### 2.7 Sección Sucursal

Ubicación física con mapa interactivo, horarios de atención y datos de contacto.

### 2.8 Formulario de Contacto

El formulario de contacto es la herramienta principal de captación de leads. Los campos son:

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Nombre completo | Sí | Nombre y apellido del cliente |
| Email | Sí | Correo electrónico |
| Teléfono/WhatsApp | Sí | Número de teléfono |
| Situación laboral | Sí | Recibo de sueldo, Monotributo o Particular |
| Edad | No | Edad del cliente |
| Cobertura | No | CABA o GBA |
| Mensaje | No | Consulta adicional |

**¿Qué pasa después de enviar el formulario?**

1. Los datos se guardan en la base de datos con estado "NUEVO"
2. Se envía un email de notificación a la asesora
3. El lead aparece en el panel de administración
4. El cliente ve un mensaje de confirmación

### 2.9 Footer

Información legal, enlaces a redes sociales y copyright.

---

## 3. Panel de Administración

### 3.1 Acceso al panel (login)

Para acceder al panel, navegá a `https://www.asesoradesalud.com.ar/login`, ingresá tu email y contraseña, y hacé clic en "Ingresar".

![Página de Login](/images/docs/admin/login.png)

*Imagen: Página de inicio de sesión del sistema*

Si olvidaste tu contraseña, hacé clic en "¿Olvidaste tu contraseña?" para recibir un link de recuperación por email (válido por 1 hora).

### 3.2 Estructura del panel

El panel tiene tres zonas: menú lateral izquierdo, header superior y área de contenido principal.

**Menú lateral:**

| Opción | Descripción |
|--------|-------------|
| Mensajes | Gestión de leads recibidos |
| Dashboard | Estadísticas generales |
| Empresas | Gestión de empresas |
| Vendedores | Gestión de vendedores |
| Equipo | Panel de control del equipo |
| Tareas | Gestión de tareas |
| Actividad | Historial de actividad |
| Ayuda | Preguntas frecuentes |

### 3.3 Dashboard

El Dashboard muestra cinco estadísticas principales del sistema.

![Dashboard del Administrador](/images/docs/admin/dashboard.png)

*Imagen: Dashboard con estadísticas de Total Leads, Nuevos, Atendidos, Conversión y Vendedores*

| Métrica | Descripción |
|---------|-------------|
| Total Leads | Cantidad total de mensajes recibidos |
| Nuevos | Leads en estado "Nuevo" |
| Atendidos | Leads marcados como atendidos |
| Conversión | Porcentaje de conversión |
| Vendedores | Cantidad de vendedores activos |

### 3.4 Mensajes (Leads)

#### 3.4.1 Lista de mensajes

La lista muestra todos los leads recibidos desde el formulario de contacto.

![Lista de Mensajes](/images/docs/admin/leads-list.png)

*Imagen: Tabla de mensajes con cliente, contacto, mensaje, estado y fecha*

#### 3.4.2 Filtros y búsqueda

Hacé clic en "Filtros" para expandir el panel. Podés filtrar por estado, fecha (desde/hasta) y buscar por nombre, email o teléfono.

#### 3.4.3 Acciones individuales

| Acción | Ícono | Descripción |
|--------|-------|-------------|
| WhatsApp | 💬 | Abre WhatsApp Web con el número del cliente |
| Marcar como leído | ✓ | Cambia el estado a "Leído" |
| Eliminar | 🗑️ | Elimina el lead permanentemente |
| Exportar | 📥 | Descarga los datos en formato JSON |
| Imprimir | 🖨️ | Abre la ventana de impresión |
| Expandir | 🔽 | Muestra el mensaje completo en la lista |

#### 3.4.4 Acciones masivas

Seleccioná múltiples leads con los checkboxes y aparecerá una barra con: Marcar como leídos, Marcar como atendidos, Eliminar.

#### 3.4.5 Exportar a Excel/PDF

- **📊 Excel**: Genera un archivo .xlsx con todos los leads filtrados
- **📄 PDF**: Genera un documento PDF con tabla formateada

#### 3.4.6 Paginación

La lista muestra 15 leads por página con controles de Anterior/Siguiente.

### 3.5 Empresas

#### 3.5.1 Lista de empresas

![Lista de Empresas](/images/docs/admin/companies-list.png)

*Imagen: Tarjetas de empresas con nombre, estado, email, teléfono y dirección*

#### 3.5.2 Crear nueva empresa

Hacé clic en "Nueva Empresa" y completá: nombre, email, teléfono, dirección y checkbox de activa.

#### 3.5.3 Editar empresa

Hacé clic en el botón ✏️, modificá los campos y hacé clic en "Actualizar".

#### 3.5.4 Eliminar empresa

Hacé clic en 🗑️. El sistema verificará si tiene vendedores asignados antes de desactivarla.

### 3.6 Vendedores

#### 3.6.1 Lista de vendedores

![Lista de Vendedores](/images/docs/admin/vendors-list.png)

*Imagen: Tarjetas de vendedores con avatar, métricas y acciones*

Cada tarjeta muestra: avatar, nombre, estado (Activo/Inactivo), email, teléfono, empresa, y tres métricas (Leads, Pendientes, Completadas).

#### 3.6.2 Crear nuevo vendedor

Hacé clic en "Nuevo Vendedor" y completá: nombre completo, email (usuario), contraseña (mín. 6 caracteres), teléfono y empresa asignada.

#### 3.6.3 Activar/Desactivar vendedor

Usá el botón Activar/Desactivar en cada tarjeta. Los inactivos no pueden iniciar sesión.

#### 3.6.4 Eliminar vendedor

Hacé clic en 🗑️. El sistema verifica si tiene leads o tareas asignadas antes de eliminar.

#### 3.6.5 Detalle del vendedor

![Detalle de Vendedor](/images/docs/admin/vendors-detail.png)

*Imagen: Página de detalle con datos de contacto, 4 métricas y acciones rápidas*

### 3.7 Equipo

![Panel de Equipo](/images/docs/admin/team-dashboard.png)

*Imagen: Panel de control del equipo con estadísticas agregadas y grid de vendedores*

Muestra tres estadísticas (Vendedores activos, Leads totales, Tareas pendientes) y el grid de vendedores con métricas y botones de acción rápida.

### 3.8 Tareas

#### 3.8.1 Lista de tareas

![Lista de Tareas](/images/docs/admin/tasks-list.png)

*Imagen: Tareas ordenadas por prioridad con badges de estado, tipo y vendedor asignado*

#### 3.8.2 Filtros y búsqueda

Filtros disponibles: estado, tipo, prioridad, vendedor y búsqueda por título.

#### 3.8.3 Crear nueva tarea

![Crear Nueva Tarea](/images/docs/admin/tasks-create.png)

*Imagen: Formulario para crear tarea con título, descripción, tipo, prioridad, fecha y vendedor*

Completá: título, descripción, tipo (Visita, Llamada, WhatsApp, Email, Reunión, Tarea), prioridad (Alta, Media, Baja), fecha límite obligatoria, vendedor asignado y lead relacionado (opcional). Al crear la tarea, el vendedor recibe una notificación automática.

#### 3.8.4 Completar tarea

Hacé clic en "Completar" en la tarjeta. El sistema cambia el estado, registra la fecha y crea un registro en el historial de actividad.

### 3.9 Actividad

![Historial de Actividad](/images/docs/admin/activity-list.png)

*Imagen: Timeline de acciones con íconos, usuarios, descripciones y tiempo relativo*

Muestra todas las acciones del sistema: leads creados, estados cambiados, tareas completadas, WhatsApp enviados, etc. Filtros por acción, vendedor, búsqueda y fechas. Botón "Exportar CSV" para descargar el historial.

### 3.10 Configuración

#### 3.10.1 Cambiar idioma

Hacé clic en el selector de idioma (🌐) y seleccioná: Español, Inglés o Portugués. El cambio es instantáneo.

#### 3.10.2 Cambiar tema

![Modo Oscuro](/images/docs/admin/theme-dark.png)

*Imagen: Dashboard en modo oscuro*

Hacé clic en el botón luna/sol (🌙/☀️) para alternar entre modo claro y oscuro.

#### 3.10.3 Cerrar sesión

Hacé clic en "Cerrar Sesión" en el header.

### 3.11 Ayuda

#### 3.11.1 Guía contextual

![Ayuda — Guía](/images/docs/admin/help-guide.png)

*Imagen: Panel de ayuda con guía contextual según la sección actual*

Hacé clic en el botón flotante ❓ abajo a la derecha. La pestaña "Guía" muestra ayuda específica de la sección donde te encontrás.

#### 3.11.2 Chat con IA

Cambiá a la pestaña "Chat IA" para hacer preguntas en lenguaje natural. El asistente responde con información del sistema según tu rol.

### 3.12 Notificaciones

![Notificaciones](/images/docs/admin/notifications.png)

*Imagen: Campanita de notificaciones con lista de avisos*

Hacé clic en la campanita del header para ver tus notificaciones (nuevas tareas, nuevos leads, etc.). Podés marcarlas como leídas individualmente o todas juntas.

---

## 4. Panel del Vendedor

### 4.1 Acceso al panel

El vendedor accede desde la misma URL (`https://www.asesoradesalud.com.ar/login`) con sus credenciales. El sistema detecta el rol automáticamente y redirige al panel del vendedor.

### 4.2 Estructura del panel

Menú lateral: Dashboard, Mis Tareas, Mis Leads, Mi Perfil, Ayuda.

### 4.3 Dashboard

![Dashboard del Vendedor](/images/docs/vendor/dashboard.png)

*Imagen: Dashboard con 4 estadísticas personales, últimas tareas y leads*

Muestra cuatro métricas: tareas pendientes, tareas completadas, leads asignados, leads atendidos. Debajo, las últimas 5 tareas pendientes y los últimos 5 leads con botón de WhatsApp directo.

### 4.4 Mis Tareas

![Mis Tareas](/images/docs/vendor/tasks-list.png)

*Imagen: Lista de tareas asignadas al vendedor con filtros y botón Completar*

Muestra solo las tareas del vendedor, ordenadas por prioridad y fecha límite. Filtros por estado, prioridad y búsqueda. Botón "Completar" para marcar tareas como finalizadas.

### 4.5 Mis Leads

![Mis Leads](/images/docs/vendor/leads-list.png)

*Imagen: Lista de leads con estado, contacto, mensaje y acciones de WhatsApp y cambio de estado*

Muestra los leads asignados al vendedor. Cada lead tiene: nombre, estado, teléfono, email, mensaje y dos acciones: botón WhatsApp (abre conversación directa) y dropdown de estado (Nuevo, Leído, En contacto, Reunión, Presupuesto, Atendido, Rechazado).

### 4.6 Mi Perfil

![Mi Perfil](/images/docs/vendor/profile.png)

*Imagen: Página de perfil con datos editables y cambio de contraseña*

Permite editar nombre y teléfono (email y empresa no se pueden modificar). En la sección "Cambiar contraseña", ingresá la nueva contraseña dos veces y guardá. Dejá vacío para mantener la actual.

### 4.7 Configuración

Mismas opciones que el admin: cambio de idioma, tema claro/oscuro y cierre de sesión.

### 4.8 Ayuda

![Ayuda del Vendedor](/images/docs/vendor/help-guide.png)

*Imagen: Panel de ayuda con guía contextual para el vendedor*

Botón flotante ❓ con guía contextual y chat con IA, igual que en el panel admin pero con información específica para vendedores.

### 4.9 Notificaciones

![Notificaciones del Vendedor](/images/docs/vendor/notifications.png)

*Imagen: Campanita de notificaciones del vendedor*

El vendedor recibe notificaciones cuando se le asigna una nueva tarea o un nuevo lead. Hacé clic en la campanita para verlas y marcarlas como leídas.

---

## 5. Preguntas Frecuentes (FAQ)

### 5.1 Para administradores

**¿Cómo puedo ver los mensajes de los clientes?**
Los mensajes aparecen en la sección "Mensajes" del panel. Podés filtrarlos por estado, fecha y buscar por nombre o email.

**¿Cómo asigno una tarea a un vendedor?**
En "Tareas", hacé clic en "Nueva Tarea", completá los datos y seleccioná el vendedor. Recibirá una notificación automática.

**¿Cómo contacto a un lead por WhatsApp?**
Hacé clic en el botón verde de WhatsApp junto al lead. Se abrirá WhatsApp Web con el número del cliente.

**¿Cómo creo un nuevo vendedor?**
En "Vendedores", hacé clic en "Nuevo Vendedor", completá sus datos y seleccioná la empresa.

**¿Cómo exporto los leads a Excel?**
En "Mensajes", hacé clic en el botón "Excel". Se descargará un archivo con los leads filtrados.

**¿Cómo cambio el idioma?**
Hacé clic en el selector de idioma (🌐) en el header y seleccioná el idioma.

### 5.2 Para vendedores

**¿Cómo veo mis tareas?**
Andá a "Mis Tareas" en el menú lateral. Verás todas tus tareas ordenadas por prioridad.

**¿Cómo completo una tarea?**
Hacé clic en "Completar" en la tarea correspondiente.

**¿Cómo contacto a un lead?**
En "Mis Leads", hacé clic en el botón "WhatsApp" junto al lead.

**¿Cómo cambio el estado de un lead?**
Usá el dropdown de estado junto a cada lead para actualizar su progreso.

**¿Cómo edito mi perfil?**
En "Mi Perfil", modificá los datos y hacé clic en "Guardar cambios".

**¿Cómo cambio mi contraseña?**
En "Mi Perfil", ingresá la nueva contraseña, confirmala y guardá.

---

## 6. Soporte Técnico

### 6.1 Contacto de soporte

| Contacto | Detalle |
|----------|---------|
| Email | asesoradesaludagustinacandia@gmail.com |
| Teléfono | 11-6555-5534 |
| WhatsApp | wa.me/5491165555534 |

### 6.2 Reportar problemas

Al reportar un problema, incluí: descripción del problema, pasos para reproducirlo, captura de pantalla, navegador y dispositivo.

---

## Resumen de Funcionalidades

### Administrador

| Sección | Funcionalidades |
|---------|-----------------|
| Mensajes | Ver, filtrar, buscar, WhatsApp, acciones masivas, exportar Excel/PDF, imprimir |
| Dashboard | 5 estadísticas en tiempo real |
| Empresas | Crear, editar, desactivar |
| Vendedores | Crear, editar, activar/desactivar, eliminar, ver detalle con métricas |
| Equipo | Panel de control con métricas agregadas |
| Tareas | Crear, filtrar, completar, eliminar, notificar al vendedor |
| Actividad | Historial completo, filtrar, exportar CSV |
| Configuración | Idioma (es/en/pt), tema (claro/oscuro), cerrar sesión |
| Ayuda | Guía contextual, chat con IA, FAQ |

### Vendedor

| Sección | Funcionalidades |
|---------|-----------------|
| Dashboard | 4 estadísticas personales, últimas tareas y leads |
| Mis Tareas | Ver, filtrar, completar |
| Mis Leads | Ver, filtrar, WhatsApp, cambiar estado |
| Mi Perfil | Editar datos, cambiar contraseña |
| Configuración | Idioma, tema, cerrar sesión |
| Ayuda | Guía contextual, chat con IA |

---

*Manual de Usuario — Hominis CRM v1.0 — Julio 2026*
