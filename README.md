# 🏥 Hominis CRM — Agustina C. Candia

Sistema CRM multiusuario para **Agustina C. Candia**, asesora comercial de **Hominis**. Incluye landing page pública, panel de gestión con autenticación por roles (ADMIN/VENDEDOR/PRODUCTOR), gestión de contactos con geolocalización, mapas interactivos, sistema de invitaciones por email y notificaciones in-app.

**URL producción:** https://www.asesoradesalud.com.ar/

---

## 🚀 Tecnologías

- **Next.js 16** (App Router, Turbopack)
- **TypeScript 5** (strict)
- **Tailwind CSS 4** + **shadcn/ui** (New York style)
- **Prisma ORM** + **Turso** (libSQL)
- **NextAuth.js v4** (Credentials, JWT, RBAC)
- **Leaflet** + **OpenStreetMap** (geolocalización, gratis)
- **Vercel Blob** (avatars, opcional)
- **Resend** (emails de invitación)
- **bcryptjs** (hash de passwords)
- **Zod** + **react-hook-form** (validaciones)
- **sonner** (toasts)
- **Bun** (runtime + package manager)

---

## 👥 Roles y permisos

| Rol | Acceso | Permisos |
|---|---|---|
| **ADMIN** | `/admin/*` | Todo: CRUD vendedores, CRUD contactos, invitaciones, mapa global, stats |
| **PRODUCTOR** | `/productor/*` + `/vendedor/*` | Vendedor extendido: ve todo el equipo, puede reasignar contactos |
| **VENDEDOR** | `/vendedor/*` | Su cartera de contactos, crear contactos (auto-asignación), su perfil multicanal |

---

## 📁 Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                  # Landing pública (/)
│   ├── login/                    # Login (público)
│   ├── register/                 # Registro con token de invitación (público)
│   ├── admin/                    # Panel ADMIN (protegido)
│   │   ├── page.tsx              # Dashboard con stats
│   │   ├── vendedores/           # CRUD vendedores (lista, nuevo, editar)
│   │   ├── contactos/            # Todos los contactos
│   │   ├── invitaciones/         # Gestión de invitaciones
│   │   ├── mapa/                 # Mapa global
│   │   └── perfil/               # Perfil multicanal
│   ├── productor/                # Panel PRODUCTOR (protegido)
│   │   ├── page.tsx              # Dashboard de equipo
│   │   ├── contactos/            # Contactos del equipo
│   │   ├── mapa/                 # Mapa del equipo
│   │   └── perfil/               # Perfil multicanal
│   ├── vendedor/                 # Panel VENDEDOR (protegido)
│   │   ├── page.tsx              # Dashboard personal
│   │   ├── contactos/            # Mi cartera (lista, nuevo, editar)
│   │   ├── mapa/                 # Mapa de mi cartera
│   │   └── perfil/               # Perfil multicanal
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── admin/                # APIs ADMIN (users, invitations, stats)
│       ├── crm/                  # APIs CRM (contacts, map, activities)
│       ├── profile/              # APIs multicanal (phones, emails, social)
│       ├── invitations/[token]/  # Verificar + completar registro (público)
│       ├── notifications/        # Notificaciones in-app
│       ├── geocode/              # Geocoding OpenStreetMap
│       ├── upload/               # Avatar upload (Vercel Blob)
│       ├── contacts/             # Legacy: leads de la landing (tabla Contacto)
│       └── leads/                # POST público de la landing
├── components/
│   ├── ui/                       # shadcn/ui + componentes custom
│   │   ├── AvatarUpload.tsx      # Uploader de avatar con fallback iniciales
│   │   ├── PhoneManager.tsx      # CRUD teléfonos (multicanal)
│   │   ├── EmailManager.tsx      # CRUD emails (multicanal)
│   │   ├── SocialNetworkManager.tsx # CRUD redes sociales
│   │   └── MapPicker.tsx         # Selector de ubicación en mapa
│   ├── dashboard/
│   │   └── VendedoresMap.tsx     # Mapa reutilizable (vendors + contacts)
│   ├── dashboard-nav.tsx         # Nav común con logout + NotificationBell
│   ├── notification-bell.tsx     # Campana con notificaciones in-app
│   ├── contact-form.tsx          # Formulario crear/editar contacto
│   ├── vendor-form.tsx           # Formulario crear/editar vendedor
│   ├── profile-content.tsx       # Página de perfil (tabs multicanal)
│   └── contactos-list.tsx        # Lista de contactos reutilizable
├── lib/
│   ├── auth/config.ts            # NextAuth config (Credentials + RBAC + brute-force)
│   ├── auth/index.ts             # getAuthSession() helper
│   ├── turso-config.ts           # Cliente Turso (libsql)
│   ├── db.ts                     # Prisma client (con adapter libsql)
│   ├── geocoding.ts              # OpenStreetMap Nominatim
│   ├── assignment.ts             # Motor de asignación (round-robin/geo/capacity)
│   ├── storage.ts                # Vercel Blob + fallback iniciales
│   └── notifications/email.ts    # Resend (invitaciones + notificaciones)
├── types/
│   ├── index.ts                  # Tipos compartidos + enums + labels
│   └── next-auth.d.ts            # Type augmentation (role + id en Session)
└── middleware.ts                 # Protección de rutas por rol (withAuth)
```

---

## 🗄️ Base de datos (Turso)

13 tablas en producción:
- `User` (perfil extendido + geolocalización + métricas)
- `UserPhone`, `UserEmail`, `UserSocialNetwork` (multicanal)
- `Contact` (CRM, con owner + geocoding + status)
- `ContactPhone`, `ContactEmail`, `ContactSocialNetwork` (multicanal contactos)
- `ContactActivity` (log de acciones)
- `AutomaticAssignment` (auditoría de asignaciones)
- `Invitation` (invitaciones por email con token)
- `Notification` (notificaciones in-app)
- `Contacto` (legacy, leads de la landing pública)

**Schema completo:** `prisma/schema.prisma`

---

## 🔐 Autenticación

- **NextAuth.js v4** con estrategia **Credentials** (email + password)
- **JWT** con `role` e `id` del usuario (type-augmented)
- **bcryptjs** para hash de passwords (12 rounds)
- **Brute-force protection**: lockout tras 5 intentos fallidos (15 min)
- **Middleware** (`withAuth`) protege rutas por rol
- **Layouts server-side** con verificación doble (defense-in-depth)

---

## 🗺️ Geolocalización y asignación

- **OpenStreetMap Nominatim** para geocoding (gratis, sin API key)
- **Leaflet** para mapas interactivos
- **Motor de asignación** (`lib/assignment.ts`):
  - **ROUND_ROBIN**: asigna al vendedor asignado hace más tiempo
  - **GEOGRAPHIC**: nearest vendor within their service radius (Haversine)
  - **CAPACITY**: vendor con menos contactos
  - **MANUAL**: admin/productor elige manualmente

---

## 📧 Invitaciones y notificaciones

- **Invitaciones por email**: admin invita vendedores/productores → email con link + token (expira en 7 días)
- **Registro público**: `/register?token=...` completa el registro sin intervención del admin
- **Notificaciones in-app**: campana en el nav con badge de no leídas, dropdown con lista, polling cada 60s
- **Email fallback**: si Resend no está configurado, el admin puede copiar el link manualmente

---

## 🚀 Deploy y CI/CD

- **Vercel** (auto-deploy en push a `main`)
- **GitHub Actions** (`.github/workflows/ci.yml`):
  - **Job 1 (build)**: lint + build en cada push/PR
  - **Job 2 (migrate)**: corre migraciones a Turso en push a main (usa secrets `TURSO_URL` + `TURSO_AUTH_TOKEN`)
- **vercel.json**: headers de seguridad, región SFO1, redirect `/dashboard` → `/login`

### Secrets requeridos en GitHub
- `TURSO_URL` — URL de la DB Turso (ej: `libsql://hominins-db-orlandocandia.aws-us-east-2.turso.io`)
- `TURSO_AUTH_TOKEN` — Token de autenticación de Turso

### Env vars en Vercel
- `NEXTAUTH_SECRET` — Secret para JWT (generar con `openssl rand -base64 32`)
- `NEXTAUTH_URL` — URL pública (`https://www.asesoradesalud.com.ar`)
- `TURSO_URL`, `TURSO_AUTH_TOKEN` — Credenciales Turso (alternativa al hardcoded fallback)
- `BLOB_READ_WRITE_TOKEN` — (opcional) para upload de avatares
- `RESEND_API_KEY` — (opcional) para emails de invitación

---

## 🛠️ Desarrollo local

```bash
# Instalar dependencias
bun install

# Generar cliente Prisma
bunx prisma generate

# Push schema a SQLite local (desarrollo)
bunx prisma db push

# Crear usuario admin inicial
bun run seed

# Levantar dev server
bun run dev
```

---

## 📜 Scripts disponibles

| Script | Descripción |
|---|---|
| `bun run dev` | Dev server en puerto 3000 |
| `bun run build` | Build de producción (standalone) |
| `bun run lint` | ESLint |
| `bun run migrate` | Correr migraciones a Turso (usa env vars) |
| `bun run seed` | Crear/actualizar usuario admin |
| `bun run deploy` | Deploy manual a Vercel |

---

## 🔑 Credenciales de acceso (producción)

```
URL:      https://www.asesoradesalud.com.ar/login
Email:    acandia@mphominis.com.ar
Password: Hominis2025!
Rol:      ADMIN
```

⚠️ **Cambiá la contraseña después del primer login.**

---

## 📝 Licencia

Propiedad de Agustina C. Candia — Hominis. Uso interno.
