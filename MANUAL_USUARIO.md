# Manual de Usuario — Hominis CRM

**Versión:** 1.0  
**Fecha:** Julio 2026  
**Autor:** Orlando Candia  
**Cliente:** Agustina C. Candia  

---

## 1. Introducción

### 1.1 ¿Qué es Hominis CRM?

Hominis CRM es un sistema integral de gestión de clientes y ventas diseñado específicamente para asesores de salud. El sistema permite captar clientes potenciales a través de un formulario en la landing pública, gestionar los leads de manera profesional con un panel de administración completo, asignar tareas a vendedores, supervisar el equipo de ventas en tiempo real, y visualizar estadísticas y reportes actualizados al instante.

### 1.2 ¿Para quién está pensado?

El sistema está diseñado para dos tipos de usuarios. Los administradores (como Agustina) tienen acceso completo a todas las funcionalidades del sistema, incluyendo la gestión de empresas, vendedores, leads, tareas y reportes. Los vendedores tienen acceso a un panel personalizado donde pueden gestionar sus tareas asignadas, contactar leads por WhatsApp, y actualizar su perfil y contraseña.

### 1.3 Requisitos técnicos

| Requisito | Descripción |
|-----------|-------------|
| Navegador | Chrome, Firefox, Safari o Edge (última versión) |
| Conexión | Internet permanente |
| Dispositivo | Computadora, tablet o celular |
| Resolución | Mínimo 320px de ancho (totalmente responsive) |

### 1.4 Acceso al sistema

**URL de acceso:** https://www.asesoradesalud.com.ar/login

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | acandia@mphominis.com.ar | Hominis2025! |
| Vendedor | (creado por el administrador) | (asignada al crear) |

---

## 2. Landing Pública

### 2.1 Estructura de la landing

La landing pública es la página principal que ven los clientes potenciales cuando visitan el sitio web. Está compuesta por nueve secciones principales que guían al visitante desde la presentación inicial hasta el formulario de contacto.

### 2.2 Secciones de la landing

**2.2.1 Header y navegación**

El header superior contiene el logo de Hominis, links de navegación rápida (Inicio, Sobre Mí, Planes, Promos, Servicios, Sucursal, Contacto) y botones de selector de idioma y tema (claro/oscuro).

**2.2.2 Sección Inicio (Hero)**

Esta es la primera impresión que tiene el visitante. Incluye una foto de la asesora, un título destacado ("Tu bienestar, mi compromiso"), una descripción de los servicios, y un botón de call-to-action para solicitar asesoramiento. También muestra estadísticas clave como clientes asesorados, años de experiencia y porcentaje de satisfacción.

**2.2.3 Sección Sobre Mí**

Presenta a Agustina C. Candia con una descripción profesional, sus características principales (atención personalizada, respuesta inmediata, asesoramiento gratuito) y una foto.

**2.2.4 Sección Planes**

Muestra una comparativa visual entre los dos planes disponibles: Vita Más (Premium, sin copagos, urgencias 24/7, odontología sin cargo, experiencia concierge) y Aqua Más (Ahorro, copagos flexibles, urgencias 24/7 sin copagos, farmacia con descuento). Cada plan tiene un botón de contratación.

**2.2.5 Sección Promociones**

Presenta los descuentos escalonados para nuevos socios que adhieran al débito automático, divididos en tres períodos (meses 1-3, 4-6, 7-12) con porcentajes diferenciados para Aqua Más y Vita Más.

**2.2.6 Sección Servicios Digitales**

Describe los beneficios adicionales como médico virtual (consultas por videollamada), asistencia al viajero, y farmacia digital.

**2.2.7 Sección Sucursal**

Muestra la ubicación física con un mapa interactivo, horarios de atención y datos de contacto (teléfono, email, dirección).

**2.2.8 Formulario de Contacto**

El formulario de contacto es la herramienta principal de captación de leads. Cuando un cliente potencial completa y envía el formulario, sus datos se guardan automáticamente en la base de datos del CRM, se envía una notificación por email a la asesora, y el lead aparece inmediatamente en el panel de administración.

Los campos del formulario son:

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Nombre completo | Sí | Nombre y apellido del cliente |
| Email | Sí | Correo electrónico de contacto |
| Teléfono/WhatsApp | Sí | Número de teléfono |
| Situación laboral | Sí | Recibo de sueldo, Monotributo o Particular |
| Edad | No | Edad del cliente |
| Cobertura de interés | No | CABA o GBA |
| Mensaje | No | Consulta adicional del cliente |

**2.2.9 Footer**

El footer contiene información legal, enlaces a redes sociales, y el copyright del sitio.

### 2.3 Cómo funciona el formulario de contacto

Cuando un cliente completa el formulario, el sistema ejecuta automáticamente los siguientes pasos: primero, valida todos los campos obligatorios y sanitiza los datos para prevenir inyecciones. Luego, guarda la información en la base de datos con estado "NUEVO" y asigna el lead a la empresa Hominis. Inmediatamente después, envía un email de notificación a la asesora con todos los datos del cliente. También crea una notificación en el panel de administración para que el lead sea visible en la campanita de notificaciones. Finalmente, el cliente ve un mensaje de confirmación en pantalla.

### 2.4 Notificaciones por email

Cada vez que se recibe un nuevo lead desde el formulario, el sistema envía automáticamente un email a asesoradesalud.info@gmail.com con el nombre, email, teléfono y mensaje del cliente. Este email incluye un enlace directo al panel de administración para gestionar el lead.

---

## 3. Panel de Administración

### 3.1 Acceso al panel

Para acceder al panel de administración, abrí tu navegador y navegá a https://www.asesoradesalud.com.ar/login. Ingresá tu email y contraseña en los campos correspondientes. Hacé clic en el botón "Ingresar". El sistema validará tus credenciales y te redirigirá automáticamente al panel de administración.

Si olvidaste tu contraseña, hacé clic en el enlace "¿Olvidaste tu contraseña?" debajo del formulario de login. Se abrirá una página donde podrás ingresar tu email para recibir un link de recuperación. El link será válido por una hora y te permitirá establecer una nueva contraseña.

### 3.2 Estructura del panel

El panel de administración tiene una estructura clara con tres zonas principales. El menú lateral izquierdo permite navegar entre las diferentes secciones del sistema. El header superior contiene información del usuario, notificaciones, selector de idioma, selector de tema y botón de cerrar sesión. El área principal muestra el contenido de la sección seleccionada.

**Menú lateral:**

| Opción | Descripción |
|--------|-------------|
| Mensajes | Gestión de leads recibidos desde la landing |
| Dashboard | Estadísticas generales del sistema |
| Empresas | Gestión de empresas del sistema |
| Vendedores | Gestión de vendedores |
| Equipo | Panel de control del equipo de ventas |
| Tareas | Gestión de tareas asignadas a vendedores |
| Actividad | Historial completo de actividad |
| Ayuda | Preguntas frecuentes y guía |

### 3.3 Sección: Dashboard

El Dashboard es la primera pantalla que ve el administrador al iniciar sesión. Muestra cinco tarjetas de estadísticas con los principales indicadores del sistema. Total Leads muestra la cantidad total de mensajes recibidos desde la landing. Nuevos indica cuántos leads están en estado "Nuevo" sin atender. Atendidos muestra los leads que fueron marcados como atendidos. Conversión calcula el porcentaje de leads atendidos sobre el total. Vendedores muestra la cantidad de vendedores activos en el sistema.

### 3.4 Sección: Mensajes (Leads)

#### 3.4.1 Lista de mensajes

La lista de mensajes muestra todos los leads recibidos desde el formulario de contacto de la landing. Cada lead se muestra en una tabla con las siguientes columnas: un checkbox para selección, nombre del cliente con su segmento, email y teléfono, mensaje truncado, estado (Nuevo, Leído, Atendido, Rechazado) y fecha de recepción.

#### 3.4.2 Filtros y búsqueda

El sistema permite filtrar los mensajes por estado (Nuevo, Leído, Atendido, Rechazado), por fecha (desde/hasta), y buscar por nombre, email o teléfono. Para aplicar filtros, hacé clic en el botón "Filtros" para expandir el panel de filtros, seleccioná los criterios deseados, y hacé clic en "Aplicar". Para limpiar los filtros, hacé clic en el botón con la X.

#### 3.4.3 Acciones individuales

Cada lead tiene un conjunto de acciones disponibles en la columna derecha de la tabla. El botón WhatsApp (verde) abre WhatsApp Web con el número del cliente ya cargado. El botón de marcar como leído (check) cambia el estado del lead a "Leído". El botón de eliminar (rojo) elimina permanentemente el lead. El botón de exportar (descargar) descarga los datos del lead en formato JSON. El botón de imprimir (impresora) abre una ventana de impresión con los datos del lead. El botón de expandir (flecha) muestra el mensaje completo del cliente sin salir de la lista.

#### 3.4.4 Acciones masivas

Seleccionando múltiples leads con los checkboxes, aparece una barra de acciones masivas en la parte superior. Las acciones disponibles son: marcar como leídos (cambia el estado de todos los seleccionados a "Leído"), marcar como atendidos (cambia el estado a "Atendido"), y eliminar (elimina todos los seleccionados).

#### 3.4.5 Paginación

La lista muestra 15 leads por página. Si hay más de 15 leads, aparecen controles de paginación en la parte inferior con botones de "Anterior" y "Siguiente", y un indicador de página actual sobre el total de páginas.

#### 3.4.6 Exportar a Excel/PDF

El sistema permite exportar los leads filtrados a dos formatos. El botón "Excel" genera un archivo .xlsx con todas las columnas de los leads, incluyendo nombre, email, teléfono, mensaje, estado, segmento y fecha. El botón "PDF" genera un documento PDF con una tabla formateada de los leads, que se abre en una ventana de impresión del navegador.

### 3.5 Sección: Empresas

#### 3.5.1 Lista de empresas

La sección de empresas muestra todas las empresas registradas en el sistema en formato de tarjetas. Cada tarjeta muestra el nombre de la empresa, badge de estado (Activa/Inactiva), email, teléfono y dirección.

#### 3.5.2 Crear nueva empresa

Para crear una nueva empresa, hacé clic en el botón "Nueva Empresa". Se abrirá un formulario donde deberás completar: nombre de la empresa, email, teléfono, dirección y un checkbox para marcarla como activa. Hacé clic en "Crear" para guardar.

#### 3.5.3 Editar empresa

Para editar una empresa existente, hacé clic en el botón de editar (lápiz) en la tarjeta de la empresa. Se abrirá el formulario con los datos actuales. Modificá los campos necesarios y hacé clic en "Actualizar".

#### 3.5.4 Eliminar empresa

Para eliminar una empresa, hacé clic en el botón de eliminar (papelera). El sistema verificará si la empresa tiene vendedores asignados. Si los tiene, no permitirá la eliminación y mostrará un mensaje indicando que se reasignen los vendedores primero. Si no tiene vendedores, la empresa será desactivada (soft-delete).

### 3.6 Sección: Vendedores

#### 3.6.1 Lista de vendedores

La lista de vendedores muestra todos los vendedores registrados en tarjetas individuales. Cada tarjeta contiene: avatar con iniciales del vendedor, nombre completo, badge de estado (Activo/Inactivo), email, teléfono, empresa asignada, y tres métricas (leads asignados, tareas pendientes, tareas completadas).

#### 3.6.2 Crear nuevo vendedor

Para crear un nuevo vendedor, hacé clic en "Nuevo Vendedor". Completá los campos: nombre completo, email (que será su usuario de acceso), contraseña (mínimo 6 caracteres), teléfono, y empresa asignada. Al crear el vendedor, recibirá acceso inmediato al sistema con sus credenciales.

#### 3.6.3 Activar/Desactivar vendedor

Cada tarjeta de vendedor tiene un botón para activar o desactivar. Un vendedor activo puede iniciar sesión normalmente. Un vendedor inactivo no puede iniciar sesión pero sus datos se conservan en el sistema.

#### 3.6.4 Eliminar vendedor

Para eliminar un vendedor, hacé clic en el botón de eliminar. El sistema verificará si el vendedor tiene leads o tareas asignadas. Si los tiene, no permitirá la eliminación. Si no tiene dependencias, el vendedor será eliminado permanentemente.

#### 3.6.5 Detalle del vendedor

Al hacer clic en "Ver" en la tarjeta de un vendedor, se abre la página de detalle que muestra: avatar grande, nombre, estado, rol, datos de contacto completos (email, teléfono, empresa, fecha de alta), cuatro métricas (leads asignados, leads atendidos, tareas pendientes, tareas completadas) y botones de acciones rápidas para ver sus tareas y leads filtrados.

### 3.7 Sección: Equipo

El panel de equipo muestra una vista general del equipo de ventas con tres tarjetas de estadísticas en la parte superior: cantidad de vendedores activos, total de leads en el sistema, y tareas pendientes. Debajo, se muestra el mismo grid de vendedores con sus métricas, pero con botones de acción rápida para ver tareas y leads de cada vendedor.

### 3.8 Sección: Tareas

#### 3.8.1 Lista de tareas

La lista de tareas muestra todas las tareas del sistema ordenadas por prioridad (Alta primero) y fecha límite. Cada tarea muestra: ícono según el tipo (visita, llamada, WhatsApp, email, reunión, tarea), título, badges de estado y prioridad, descripción, vendedor asignado, fecha límite, y lead relacionado si existe.

#### 3.8.2 Filtros y búsqueda

Los filtros disponibles son: por estado (Pendiente, En progreso, Completada, Cancelada), por tipo, por prioridad (Alta, Media, Baja), por vendedor, y búsqueda por título.

#### 3.8.3 Crear nueva tarea

Para crear una tarea, hacé clic en "Nueva Tarea". Completá: título descriptivo, descripción con detalles, tipo de tarea, prioridad, fecha límite obligatoria, vendedor al que se asigna, y lead relacionado (opcional). Al crear la tarea, el vendedor recibe automáticamente una notificación en la campanita del sistema y un email de aviso.

#### 3.8.4 Completar tarea

Para marcar una tarea como completada, hacé clic en el botón "Completar" en la tarjeta de la tarea. El sistema cambia el estado a "Completada", registra la fecha de completado, y crea un registro en el historial de actividad.

### 3.9 Sección: Actividad

El historial de actividad muestra todas las acciones realizadas en el sistema en orden cronológico. Cada actividad muestra: ícono según el tipo de acción, nombre del usuario que realizó la acción, descripción de la acción, lead relacionado si aplica, nota si existe, tiempo relativo ("hace 2 horas") y fecha absoluta.

Los tipos de acciones registradas incluyen: creación de leads, cambios de estado, tareas completadas, envíos de WhatsApp, llamadas realizadas, emails enviados, visitas registradas, notas agregadas y reasignaciones de leads.

Los filtros permiten buscar por tipo de acción, vendedor, texto libre y rango de fechas. El botón "Exportar CSV" descarga un archivo con todos los registros filtrados.

### 3.10 Configuración

#### 3.10.1 Cambiar idioma

El sistema soporta tres idiomas: Español (por defecto), Inglés y Portugués. Para cambiar el idioma, hacé clic en el selector de idioma (icono de globo) en el header y seleccioná el idioma deseado. El cambio es instantáneo.

#### 3.10.2 Cambiar tema

Para alternar entre modo claro y oscuro, hacé clic en el botón de luna/sol en el header. El cambio es instantáneo y se mantiene en futuras visitas.

#### 3.10.3 Cerrar sesión

Para cerrar sesión, hacé clic en el botón "Cerrar Sesión" en el header. Serás redirigido a la página de login.

### 3.11 Ayuda

El sistema incluye un botón de ayuda flotante (signo de pregunta) en la esquina inferior derecha de todas las páginas del dashboard. Al hacer clic, se abre un panel con dos pestañas.

La pestaña "Guía" muestra ayuda contextual según la sección donde te encuentres. Por ejemplo, si estás en Mensajes, mostrará cómo ver, filtrar y responder mensajes. Si estás en Tareas, mostrará cómo crear y gestionar tareas.

La pestaña "Chat IA" permite hacer preguntas en lenguaje natural. El asistente responde con información específica sobre el sistema según el rol del usuario (admin o vendedor).

---

## 4. Panel del Vendedor

### 4.1 Acceso al panel

El vendedor accede al sistema desde la misma URL que el administrador: https://www.asesoradesalud.com.ar/login. Ingresa sus credenciales y el sistema detecta automáticamente su rol, redirigiéndolo al panel del vendedor.

### 4.2 Estructura del panel

El panel del vendedor tiene la misma estructura que el del administrador pero con menos opciones. El menú lateral incluye: Dashboard, Mis Tareas, Mis Leads, Mi Perfil y Ayuda.

### 4.3 Sección: Dashboard

El dashboard del vendedor muestra cuatro estadísticas personales: tareas pendientes, tareas completadas, leads asignados y leads atendidos. Debajo, muestra las últimas 5 tareas pendientes con título y fecha límite, y los últimos 5 leads asignados con nombre, teléfono y botón de WhatsApp directo.

### 4.4 Sección: Mis Tareas

La lista de tareas del vendedor muestra solo las tareas asignadas a él. Cada tarea muestra título, estado, prioridad, fecha límite y lead relacionado. Los filtros permiten buscar por estado, prioridad y texto. El botón "Completar" permite marcar una tarea como finalizada.

### 4.5 Sección: Mis Leads

La lista de leads muestra solo los leads asignados al vendedor. Cada lead muestra nombre, estado, teléfono, email y mensaje si existe. Los filtros permiten buscar por estado y texto libre. El botón WhatsApp abre una conversación directa con el cliente. El dropdown de estado permite cambiar el progreso del lead (Nuevo, Leído, En contacto, Reunión, Presupuesto, Atendido, Rechazado).

### 4.6 Sección: Mi Perfil

La página de perfil permite al vendedor ver y editar sus datos personales. Los campos editables son: nombre completo y teléfono. El email y la empresa no se pueden modificar. En la sección de cambio de contraseña, el vendedor puede ingresar una nueva contraseña (mínimo 6 caracteres), confirmarla, y guardar los cambios.

### 4.7 Configuración

El vendedor tiene acceso a las mismas opciones de configuración que el administrador: cambio de idioma, cambio de tema (claro/oscuro), y cierre de sesión.

---

## 5. Preguntas Frecuentes (FAQ)

### 5.1 Para administradores

**¿Cómo puedo ver los mensajes de los clientes?** Los mensajes aparecen en la sección "Mensajes" del panel de administración. Podés filtrarlos por estado, segmento o fecha.

**¿Cómo asigno una tarea a un vendedor?** En la sección "Tareas", hacé clic en "Nueva Tarea", completá los datos y seleccioná el vendedor en el campo "Asignar a". El vendedor recibirá una notificación automática.

**¿Cómo contacto a un lead por WhatsApp?** En la lista de mensajes o leads, hacé clic en el botón verde de WhatsApp que aparece junto a cada registro. Se abrirá WhatsApp Web con el número del cliente ya cargado.

**¿Cómo creo un nuevo vendedor?** En la sección "Vendedores", hacé clic en "Nuevo Vendedor", completá sus datos y seleccioná la empresa a la que pertenece. El vendedor podrá iniciar sesión inmediatamente.

**¿Cómo exporto los leads a Excel?** En la sección "Mensajes", hacé clic en el botón verde "Excel". Se descargará un archivo Excel con todos los leads filtrados actualmente.

**¿Cómo cambio el idioma del sistema?** Hacé clic en el selector de idioma (icono de globo) en el header y seleccioná el idioma deseado: Español, Inglés o Portugués.

### 5.2 Para vendedores

**¿Cómo veo mis tareas?** En el panel del vendedor, andá a la sección "Mis Tareas". Allí verás todas las tareas asignadas ordenadas por prioridad.

**¿Cómo completo una tarea?** En "Mis Tareas", hacé clic en el botón "Completar" en la tarea correspondiente. La tarea cambiará a estado "Completada" automáticamente.

**¿Cómo contacto a un lead?** En "Mis Leads", hacé clic en el botón "WhatsApp" junto al lead que querés contactar. Se abrirá WhatsApp Web con el número del cliente.

**¿Cómo cambio el estado de un lead?** En "Mis Leads", usá el dropdown de estado que aparece junto a cada lead para actualizar su progreso (Nuevo, Leído, En contacto, etc.).

**¿Cómo edito mi perfil?** En "Mi Perfil", modificá los campos que quieras actualizar y hacé clic en "Guardar cambios".

**¿Cómo cambio mi contraseña?** En "Mi Perfil", ingresá la nueva contraseña en el campo correspondiente, confirmala y hacé clic en "Guardar cambios".

---

## 6. Soporte Técnico

### 6.1 Contacto de soporte

Si tenés algún problema con el sistema, podés contactar a:

| Contacto | Detalle |
|----------|---------|
| Email | asesoradesalud.info@gmail.com |
| Teléfono | +54 11 7619-9167 |
| WhatsApp | wa.me/541176199167 |

### 6.2 Reportar problemas

Al reportar un problema, por favor incluí la siguiente información para que podamos ayudarte más rápido: una descripción clara del problema (qué está pasando), los pasos exactos para reproducirlo (cómo se puede repetir), una captura de pantalla si es posible, el navegador que estás usando (Chrome, Firefox, etc.) y el tipo de dispositivo (computadora, celular o tablet).

---

## Resumen de Funcionalidades

### Administrador

| Sección | Funcionalidades |
|---------|-----------------|
| Mensajes | Ver, filtrar, buscar, WhatsApp, marcar leído/atendido, eliminar, exportar Excel/PDF, imprimir, acciones masivas, paginación |
| Dashboard | 5 estadísticas en tiempo real |
| Empresas | Crear, editar, desactivar, ver estado |
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

*Este manual fue generado para Hominis CRM — Sistema de gestión de salud. Versión 1.0 — Julio 2026.*
