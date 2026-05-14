# 📋 DOCUMENTACIÓN DEL SISTEMA — Agustina C. Candia / Hominis

---

## 1) ESTRUCTURA DEL SISTEMA

### Tecnologías

| Componente | Tecnología | Detalle |
|-----------|-----------|---------|
| Framework | Next.js 16 (App Router) | TypeScript |
| Estilos | Tailwind CSS 4 + shadcn/ui | Componentes New York style |
| Animaciones | Framer Motion | Transiciones y efectos |
| Base de datos | Turso (libSQL) | Cloud, raw SQL, sin Prisma en API routes |
| Autenticación | NextAuth.js v4 | JWT, Credentials provider |
| Email | Resend API | Notificaciones automáticas |
| Mapa | Leaflet + React-Leaflet | Oficina en Lomas de Zamora |
| Hosting | Vercel | Deploy automático desde GitHub |
| DNS | Cloudflare (Free) | Intermediario DNS entre NIC y Vercel |
| Dominio | asesoradesalud.com.ar | NIC Argentina |

### Archivos clave del proyecto

```
src/
├── app/
│   ├── page.tsx                          ← Landing page completa
│   ├── layout.tsx                        ← Layout raíz
│   ├── login/page.tsx                    ← Pantalla de login
│   ├── dashboard/page.tsx                ← Panel de gestión de contactos
│   ├── download/page.tsx                 ← Descarga de contactos
│   └── api/
│       ├── leads/route.ts               ← POST: recibe formulario, guarda en DB, envía email
│       ├── contacts/route.ts            ← GET: lista contactos con paginación/filtros
│       ├── contacts/[id]/route.ts       ← PATCH: actualizar estado / DELETE: eliminar
│       ├── setup/route.ts               ← GET: crea tablas y usuario admin
│       ├── csrf/route.ts                ← GET: token CSRF para formularios
│       ├── debug/route.ts               ← GET: diagnóstico del sistema
│       └── auth/[...nextauth]/route.ts  ← NextAuth handler
├── components/
│   ├── MapWithAgustina.tsx              ← Mapa Leaflet con ubicación
│   ├── whatsapp-button.tsx              ← Botón flotante WhatsApp
│   └── auth-provider.tsx                ← Provider de sesión NextAuth
├── lib/
│   ├── turso-config.ts                  ← ⭐ Centraliza credenciales Turso
│   ├── auth/config.ts                   ← Configuración NextAuth (raw SQL)
│   ├── notifications/
│   │   ├── email.ts                     ← Resend API (email automático)
│   │   └── whatsapp.ts                  ← CallMeBot (no activo, sin API key)
│   ├── csrf.ts                          ← Generación/verificación CSRF
│   ├── rate-limit.ts                    ← Rate limiting por IP
│   ├── sanitize.ts                      ← Sanitización de inputs
│   ├── db.ts                            ← Prisma client (solo para compatibilidad)
│   └── utils.ts                         ← Utilidades generales
├── middleware.ts                         ← Middleware NextAuth
public/
├── agustina_c_candia.png                ← Foto de perfil
├── hero-bg.png                          ← Imagen sección "Sobre mí"
├── logo_hominis.png                     ← Logo Hominis
└── logo.svg                             ← Logo SVG
```

### Base de datos (Turso — tablas creadas por /api/setup)

**Tabla Contacto:**
| Campo | Tipo | Detalle |
|-------|------|---------|
| id | TEXT | ID único (lead_timestamp_random) |
| nombre | TEXT | Nombre completo |
| email | TEXT | Email |
| telefono | TEXT | Teléfono/WhatsApp |
| segmento | TEXT | RECIBO_DE_SUELDO, MONOTRIBUTO, PARTICULAR |
| mensaje | TEXT | Mensaje opcional |
| cobertura | TEXT | CABA_GBA o null |
| edad | INTEGER | Edad o null |
| origen | TEXT | 'landing' por defecto |
| ip | TEXT | IP del cliente |
| estado | TEXT | NUEVO, LEIDO, ATENDIDO |
| createdAt | DATETIME | Fecha de creación |
| updatedAt | DATETIME | Última actualización |

**Tabla User:**
| Campo | Tipo | Detalle |
|-------|------|---------|
| id | TEXT | ID único |
| email | TEXT | Email de login (único) |
| password | TEXT | Hash bcrypt |
| nombre | TEXT | Nombre para mostrar |
| rol | TEXT | ADMIN, SUPERVISOR |
| activo | INTEGER | 1=activo, 0=desactivado |
| ultimoLogin | DATETIME | Último inicio de sesión |
| intentosLogin | INTEGER | Intentos fallidos consecutivos |
| bloqueadoHasta | DATETIME | Bloqueo por intentos (15 min después de 5) |

---

## 2) ¿CÓMO FUNCIONA?

### Flujo principal: Un contacto envía el formulario

```
1. Usuario completa formulario en landing page
2. Frontend envía POST a /api/leads con token CSRF
3. API valida: CSRF → Rate limit → Sanitización de inputs
4. Guarda contacto en Turso (tabla Contacto, estado: NUEVO)
5. Envía email a asesoradesaludagustinacandia@gmail.com vía Resend
   (con todos los datos + botón "Contactar por WhatsApp")
6. Intenta WhatsApp automático (no activo, sin API key)
7. Retorna confirmación al usuario
```

### Flujo de login y dashboard

```
1. Agustina entra a /login
2. Ingresa email (acandia@mphominis.com.ar) + contraseña (Hominis2025!)
3. NextAuth verifica contra Turso (raw SQL + bcrypt)
4. Si hay 5 intentos fallidos → bloqueo 15 minutos
5. JWT generado (8 horas de validez)
6. Redirige a /dashboard
7. Dashboard muestra contactos con filtros, paginación y cambio de estado
```

### Credenciales hardcodeadas (fallback para Vercel)

| Archivo | Variable | Valor hardcodeado |
|---------|----------|-------------------|
| turso-config.ts | TURSO_URL | libsql://hominins-db-orlandocandia.aws-us-east-2.turso.io |
| turso-config.ts | TURSO_AUTH_TOKEN | eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9... |
| turso-config.ts | NEXTAUTH_SECRET | hominis-agustina-candia-2025-secret-key-secure |
| email.ts | RESEND_API_KEY | re_6X6QSSxh_5nm4YVZUw21fJqPvjQ1vdpoG |
| email.ts | EMAIL_TO | asesoradesaludagustinacandia@gmail.com |
| whatsapp.ts | AGUSTINA_PHONE | 5491165555534 |
| whatsapp.ts | CALLMEBOT_APIKEY | (vacío — no activo) |

### Cadena de DNS (dominio personalizado)

```
asesoradesalud.com.ar
  → NIC Argentina (delegado a Cloudflare)
    → Cloudflare DNS (emely.ns.cloudflare.com / emerson.ns.cloudflare.com)
      → Registro A: @ → 76.76.21.21 (Vercel)
      → Registro CNAME: www → cname.vercel-dns.com
        → Vercel → Landing page de Agustina
```

---

## 3) ¿QUÉ PROMPT USAR PARA REPLICAR ESTE SISTEMA?

```
Creá una landing page profesional para Agustina C. Candia, asesora comercial de Hominis (empresa de coberturas de salud). El sitio debe incluir:

TECNOLOGÍAS:
- Next.js 16 con App Router, TypeScript
- Tailwind CSS 4 con shadcn/ui
- Framer Motion para animaciones
- Turso (libSQL) como base de datos en la nube, usando raw SQL (sin Prisma en las API routes)
- NextAuth.js v4 con Credentials provider y estrategia JWT
- Resend API para notificaciones por email
- Leaflet para mapa interactivo

LANDING PAGE:
- Sección hero con foto de perfil, nombre, título y botones de CTA
- Sección "Sobre mí" con descripción profesional
- Sección de servicios/beneficios (receta electrónica, coberturas, asesoramiento personalizado)
- Sección de contacto con formulario (nombre, email, teléfono, segmento, cobertura, edad, mensaje)
- Sección de ubicación con mapa Leaflet (oficina en Lomas de Zamora)
- Sección de horario (Lunes a Viernes 9:00-18:00, Sábados y Domingos: Cerrado)
- Botón flotante de WhatsApp
- Footer con links de contacto, redes sociales y QR de WhatsApp
- Diseño responsive mobile-first
- Colores principales: violeta, azul, dorado (paleta Hominis)

BACKEND:
- POST /api/leads: recibe formulario, CSRF, rate limit, sanitiza, guarda en Turso, envía email por Resend
- GET /api/contacts: lista contactos con paginación, filtros y estadísticas
- PATCH /api/contacts/[id]: actualizar estado del contacto
- DELETE /api/contacts/[id]: eliminar contacto
- GET /api/setup: crea tablas Contacto y User, crea usuario admin
- GET /api/csrf: genera token CSRF
- GET /api/debug: diagnóstico del sistema

AUTENTICACIÓN:
- Login con email/contraseña contra Turso (raw SQL + bcrypt)
- Bloqueo de cuenta después de 5 intentos fallidos por 15 minutos
- Sesión JWT de 8 horas
- Ruta /login y /dashboard protegidas

CREDENCIALES HARDCODEADAS (fallback para Vercel donde las env vars no cargan):
- Turso URL: libsql://hominins-db-orlandocandia.aws-us-east-2.turso.io
- Turso Auth Token: [PEGAR TOKEN]
- Resend API Key: [PEGAR KEY]
- Email destino: asesoradesaludagustinacandia@gmail.com
- NextAuth Secret: [PEGAR SECRET]
- Teléfono Agustina: 5491165555534

USUARIO ADMIN POR DEFECTO:
- Email: acandia@mphominis.com.ar
- Contraseña: Hominis2025!

DEPLOY:
- Vercel con deploy automático desde GitHub
- Dominio: asesoradesalud.com.ar (NIC Argentina + Cloudflare DNS)
```

---

## 4) ¿CÓMO SUBIR LOS ARCHIVOS AL REPOSITORIO GITHUB?

### Opción A: Desde cero (recomendado si no tenés nada)

1. **Crear repositorio en GitHub:**
   - Entrá a https://github.com/new
   - Nombre: `agustina-candia-hominis` (o el que quieras)
   - Privado o público (recomendado: privado por las credenciales)
   - NO inicialices con README
   - Tocá "Create repository"

2. **Subir archivos:**
   - En el repositorio vacío, GitHub te muestra instrucciones
   - Podés subir archivos uno por uno usando "Add file → Upload files"
   - O usar git desde la terminal:
   ```bash
   git init
   git add .
   git commit -m "Primer commit - Landing page Agustina Candia Hominis"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/agustina-candia-hominis.git
   git push -u origin main
   ```

### Opción B: Actualizar archivos existentes

1. Entrá a tu repositorio en GitHub
2. Navegá hasta el archivo que querés modificar
3. Tocá el ícono de lápiz (Edit this file)
4. Reemplazá el contenido completo
5. Tocá "Commit changes"

### Archivos principales a verificar/subir:

| Archivo | Función |
|---------|---------|
| `src/app/page.tsx` | Landing page completa |
| `src/lib/turso-config.ts` | Credenciales Turso centralizadas |
| `src/lib/auth/config.ts` | Configuración NextAuth |
| `src/lib/notifications/email.ts` | Email con Resend |
| `src/lib/notifications/whatsapp.ts` | WhatsApp (pendiente API key) |
| `src/app/api/leads/route.ts` | API formulario |
| `src/app/api/contacts/route.ts` | API lista contactos |
| `src/app/api/contacts/[id]/route.ts` | API actualizar/eliminar |
| `src/app/api/setup/route.ts` | API crear tablas + admin |
| `package.json` | Dependencias (incluye resend) |

### Archivos de imágenes (carpeta public/):

| Archivo | Uso |
|---------|-----|
| `public/agustina_c_candia.png` | Foto de perfil |
| `public/hero-bg.png` | Imagen sección "Sobre mí" |
| `public/logo_hominis.png` | Logo Hominis |

---

## 5) ¿CÓMO CREAR UN PROYECTO EN VERCEL Y LIGAR A GITHUB?

### Paso 1: Crear cuenta en Vercel
1. Entrá a 👉 https://vercel.com/signup
2. Registráte con tu cuenta de **GitHub** (es la forma más fácil)
3. Autorizá a Vercel a acceder a tus repositorios

### Paso 2: Importar el proyecto
1. En el dashboard de Vercel, tocá **"Add New → Project"**
2. En la sección "Import Git Repository", vas a ver tus repos de GitHub
3. Buscá `agustina-candia-hominis` (o el nombre que le diste)
4. Tocá **"Import"**

### Paso 3: Configurar el proyecto
1. Framework Preset: **Next.js** (se detecta automáticamente)
2. Root Directory: `.` (dejar por defecto)
3. Build Command: `next build` (dejar por defecto)
4. Output Directory: `.next` (dejar por defecto)
5. Environment Variables: **NO hace falta configurar** (las credenciales están hardcodeadas como fallback)
6. Tocá **"Deploy"**

### Paso 4: Esperar el deploy
- Vercel va a instalar dependencias, compilar y deployar
- Tarda 1-3 minutos
- Cuando termine, te da una URL tipo: `agustina-candia-hominis-xxxx.vercel.app`

### Paso 5: Ejecutar el setup
- Una vez deployado, visitá: `https://TU-URL.vercel.app/api/setup`
- Esto crea las tablas en Turso y el usuario admin
- Vas a ver un JSON que dice: `{"success":true, "details":["Tabla Contacto OK", "Tabla User OK", "Usuario admin creado"]}`

### Importante: Límite de deploys
- Vercel Free tiene un límite de deploys por día
- Si te pasás, hay que esperar 24 horas
- Cada push a GitHub genera un deploy automático
- Agregar un dominio NO cuenta como deploy

---

## 6) ¿CÓMO CREAR UN DOMINIO EN NIC ARGENTINA Y LIGARLO A VERCEL?

### Paso 1: Verificar disponibilidad
1. Entrá a 👉 https://nic.ar/buscar-dominio
2. Escribí el nombre que querés y seleccioná `.com.ar`
3. Tocá **Buscar**

### Paso 2: Ingresar con Clave Fiscal
1. Entrá a 👉 https://nic.ar/ingreso
2. Tocá **"N° de CUIT/CUIL y Clave Fiscal"** (para residentes argentinos)
3. Te redirige a AFIP → ingresá con tu CUIT y Clave Fiscal nivel 2+
4. Volvés a NIC ya logueado

### Paso 3: Registrar el dominio
1. Desde el buscador, si el dominio está disponible, tocá **"Registrar"**
2. Completá los datos del titular
3. Pago: **$8.500/año** (precio 2025 para .com.ar)
4. Podés pagar con tarjeta, transferencia o Mercado Pago
5. El dominio es tuyo por 1 año (renovable)

### Paso 4: Agregar dominio en Vercel
1. En Vercel, andá a tu proyecto → **Settings → Domains**
2. Escribí `asesoradesalud.com.ar` → **Add**
3. Elegí "Connect to an environment" → **Production**
4. Tocá **Save**
5. Va a mostrar "Invalid Configuration" (normal, falta configurar DNS)

### Paso 5: Crear cuenta en Cloudflare (gratis)
1. Entrá a 👉 https://dash.cloudflare.com/sign-up
2. Creá cuenta con email o Google
3. Tocá **"Agregar un sitio"** → escribí `asesoradesalud.com.ar`
4. Elegí plan **Free**
5. Agregá estos registros DNS:
   - **A**: Nombre `@`, IPv4 `76.76.21.21`, Proxy **DESACTIVADO** (nube gris)
   - **CNAME**: Nombre `www`, Target `cname.vercel-dns.com`, Proxy **DESACTIVADO** (nube gris)
6. Anotá los **2 nameservers** que te da Cloudflare (ej: `emely.ns.cloudflare.com` / `emerson.ns.cloudflare.com`)

### Paso 6: Delegar DNS en NIC Argentina
1. Entrá a NIC → tu dominio → **Delegación / Servidores DNS**
2. Reemplazá los DNS por los de Cloudflare
3. Guardá

### Paso 7: Esperar propagación
- DNS tarda 5 minutos a 24 horas en propagarse (generalmente 10-30 min)
- En Vercel, el dominio cambia a "Valid Configuration"
- Tu página funciona en https://asesoradesalud.com.ar

### Esquema visual:
```
asesoradesalud.com.ar → NIC Argentina → Cloudflare DNS → Vercel → Tu landing page
```

---

## 7) ESTADO GENERAL DEL SISTEMA

### ✅ FUNCIONANDO

| Función | Estado | Detalle |
|---------|--------|---------|
| 🏠 Landing Page | ✅ OK | Formulario, mapa, info, CTA |
| 💾 Base de datos | ✅ OK | Turso (nube) con credenciales hardcodeadas |
| 📧 Email automático | ✅ OK | Resend → asesoradesaludagustinacandia@gmail.com |
| 🔐 Login / Auth | ✅ OK | NextAuth + Turso, bloqueo por intentos |
| 📋 Dashboard | ✅ OK | Ver contactos, cambiar estado, eliminar |
| 🛡️ Seguridad | ✅ OK | CSRF, rate limit, sanitización, bcrypt |
| 🗓️ Horario | ✅ OK | Lun-Vie 9-18, Sáb-Dom Cerrado |
| 📸 Fotos | ✅ OK | Foto perfil profesional + imagen fondo |
| 🌐 Dominio | ✅ OK | asesoradesalud.com.ar (NIC + Cloudflare + Vercel) |
| ☁️ DNS | ✅ OK | Cloudflare (emely/emerson.ns.cloudflare.com) |

### ⏳ PENDIENTE

| Función | Estado | Detalle |
|---------|--------|---------|
| 📱 WhatsApp automático | ⏳ Sin API key | CallMeBot no respondió. El email incluye botón de WhatsApp como alternativa |
| 🚀 Deploy actualizado | ⏳ Esperando | Vercel límite de deploys. Cuando se resetee, detecta cambios de GitHub automáticamente |
| 🔧 /api/setup en producción | ⏳ Después del deploy | Correr una vez para crear tablas (si no están ya) |

### Credenciales de acceso

| Servicio | Dato |
|----------|------|
| Login dashboard | Email: `acandia@mphominis.com.ar` / Pass: `Hominis2025!` |
| Turso DB | URL: `libsql://hominins-db-orlandocandia.aws-us-east-2.turso.io` |
| Resend | API Key: `re_6X6QSSxh_5nm4YVZUw21fJqPvjQ1vdpoG` |
| Cloudflare | Cuenta: Orlando.candia@gmail.com |
| Vercel | Proyecto: agustina-candia-hominis |
| GitHub | Repositorio con todo el código |

### URLs del sistema

| URL | Función |
|-----|---------|
| https://asesoradesalud.com.ar | Landing page (dominio personalizado) |
| https://asesoradesalud.com.ar/login | Login del dashboard |
| https://asesoradesalud.com.ar/dashboard | Panel de gestión |
| https://asesoradesalud.com.ar/api/setup | Crear tablas + admin (correr 1 vez) |
| https://asesoradesalud.com.ar/api/debug | Diagnóstico del sistema |

### Nota importante sobre seguridad
Las credenciales están hardcodeadas como fallback porque Vercel no cargaba las variables de entorno. Esto funciona pero NO es la mejor práctica de seguridad. En el futuro, cuando se confirme que Vercel carga bien las env vars, se deberían eliminar los valores hardcodeados y usar solo variables de entorno.

---

*Documentación generada el 15/05/2025*
