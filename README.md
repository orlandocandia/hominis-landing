# 🏥 Agustina C. Candia — Landing Page Hominis

Landing page profesional para **Agustina C. Candia**, asesora comercial de **Hominis**. Incluye formulario de contacto, catálogo de planes (Vita Más / Aqua Más), promociones, servicios digitales, ubicación de sucursal con mapa, QR de WhatsApp y panel de gestión con login seguro.

---

## 🚀 Tecnologías

- **Next.js 16** (App Router)
- **TypeScript 5**
- **Tailwind CSS 4** + **shadcn/ui**
- **Prisma ORM** (SQLite)
- **NextAuth.js v4** (autenticación JWT)
- **Framer Motion** (animaciones)
- **Leaflet** (mapa interactivo)
- **QRCode.react** (código QR WhatsApp)

---

## 📂 Estructura del proyecto

```
├── prisma/
│   ├── schema.prisma        # Modelos de base de datos (Contacto, User)
│   └── seed.ts              # Script para crear usuario admin
├── public/
│   ├── logo_hominis.png     # Logo corporativo
│   ├── agustina_c_candia.png # Foto de perfil
│   └── hero-bg.png          # Imagen de fondo sección "Sobre Mí"
├── src/
│   ├── app/
│   │   ├── page.tsx         # Landing page principal
│   │   ├── layout.tsx       # Layout global con AuthProvider
│   │   ├── globals.css      # Estilos globales + colores Hominis
│   │   ├── login/
│   │   │   └── page.tsx     # Página de login
│   │   ├── dashboard/
│   │   │   └── page.tsx     # Panel de gestión de contactos
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts  # NextAuth API
│   │       ├── leads/route.ts               # POST formulario público
│   │       ├── contacts/route.ts            # GET contactos (protegido)
│   │       ├── contacts/[id]/route.ts       # PATCH/DELETE (protegido)
│   │       └── csrf/route.ts                # CSRF token
│   ├── components/
│   │   ├── auth-provider.tsx   # SessionProvider wrapper
│   │   ├── whatsapp-button.tsx # Botón flotante WhatsApp
│   │   ├── MapWithAgustina.tsx # Mapa Leaflet con marker personalizado
│   │   └── ui/                 # Componentes shadcn/ui
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── config.ts      # Configuración NextAuth
│   │   │   └── index.ts       # Helper getServerSession
│   │   ├── db.ts              # Prisma Client
│   │   ├── csrf.ts            # Protección CSRF
│   │   ├── sanitize.ts        # Sanitización de inputs
│   │   ├── rate-limit.ts      # Rate limiting
│   │   └── utils.ts           # Utilidades generales
│   └── middleware.ts          # Middleware de rutas
└── package.json
```

---

## ⚙️ Instalación y configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/agustina-candia-hominis.git
cd agustina-candia-hominis
```

### 2. Instalar dependencias
```bash
npm install
# o
bun install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editá `.env` con tus valores:
```env
DATABASE_URL=file:./db/custom.db
NEXTAUTH_SECRET=tu-secret-seguro-aqui
```

Para generar un secret seguro:
```bash
openssl rand -base64 32
```

### 4. Crear la base de datos
```bash
npx prisma db push
# o
bun run db:push
```

### 5. Crear el usuario administrador
```bash
npx tsx prisma/seed.ts
# o
bunx tsx prisma/seed.ts
```

Esto crea el usuario con:
- **Email**: `acandia@mphominis.com.ar`
- **Contraseña**: `Hominis2025!`

⚠️ **Cambiá la contraseña después del primer inicio de sesión.**

### 6. Iniciar el servidor de desarrollo
```bash
npm run dev
# o
bun run dev
```

La página estará disponible en `http://localhost:3000`

---

## 🔐 Credenciales de acceso

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page pública |
| `/login` | Formulario de login |
| `/dashboard` | Panel de gestión (requiere login) |

### Usuario admin por defecto
- **Email**: `acandia@mphominis.com.ar`
- **Contraseña**: `Hominis2025!`

---

## 🛡️ Seguridad

- ✅ Contraseñas encriptadas con **bcrypt** (12 rounds)
- ✅ Sesiones JWT con **NextAuth.js** (8 horas)
- ✅ Protección contra fuerza bruta (5 intentos → bloqueo 15 min)
- ✅ CSRF token en formulario de contacto
- ✅ Sanitización de inputs (XSS prevention)
- ✅ Rate limiting (5 envíos cada 15 minutos)
- ✅ Rutas protegidas (`/dashboard`, `/api/contacts`)

---

## 📱 Funcionalidades

### Landing page
- Hero section con foto de perfil
- Sección "Sobre Mí"
- Planes Vita Más / Aqua Más
- Promociones con descuentos escalonados
- Servicios digitales (Médico Virtual, Farmacia Virtual, App)
- Sucursal con mapa interactivo (Leaflet + marker personalizado)
- Formulario de contacto con validaciones
- QR de WhatsApp con mensaje pre-cargado
- Botón flotante de WhatsApp

### Dashboard
- Estadísticas de contactos (nuevos, leídos, atendidos)
- Búsqueda por nombre, email o teléfono
- Filtros por estado y segmento
- Cambio de estado de contactos
- Contacto directo por WhatsApp desde el panel
- Eliminación de contactos
- Paginación

---

## 🌐 Despliegue en Vercel

1. Subir el código a **GitHub**
2. Crear cuenta en [vercel.com](https://vercel.com)
3. Importar el repositorio desde GitHub
4. Configurar variables de entorno en Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
5. ¡Deploy!

> ⚠️ **Nota**: SQLite no funciona en Vercel (serverless). Para producción, usar [Turso](https://turso.tech) (SQLite en la nube, plan gratuito) y cambiar la `DATABASE_URL`.

---

## 📄 Licencia

Proyecto privado — Agustina C. Candia © 2025
