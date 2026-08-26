import { db } from '../src/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding database...')

  // --- Admin ---
  const adminPassword = await bcrypt.hash('Hominis2025!', 10)
  const admin = await db.user.upsert({
    where: { email: 'admin@hominis.com' },
    update: {},
    create: {
      email: 'admin@hominis.com',
      password: adminPassword,
      nombre: 'Orlando',
      apellido: 'Candia',
      rol: 'ADMIN',
      activo: true,
      coverageAreas: JSON.stringify(['CABA', 'GBA_NORTE']),
    },
  })
  console.log('  ✅ Admin:', admin.email)

  // --- Vendedores ---
  const vendedorPassword = await bcrypt.hash('vendedor123', 10)
  const vendedoresData = [
    { email: 'agustina@hominis.com', nombre: 'Agustina', apellido: 'Candia', coverageAreas: ['CABA', 'GBA_NORTE'] },
    { email: 'martina@hominis.com', nombre: 'Martina', apellido: 'Suarez', coverageAreas: ['GBA_SUR', 'GBA_OESTE'] },
    { email: 'javier@hominis.com', nombre: 'Javier', apellido: 'Perez', coverageAreas: ['INTERIOR'] },
    { email: 'lucia@hominis.com', nombre: 'Lucia', apellido: 'Gomez', coverageAreas: ['CABA'] },
  ]

  const vendedores = []
  for (const v of vendedoresData) {
    const vendedor = await db.user.upsert({
      where: { email: v.email },
      update: {},
      create: {
        email: v.email,
        password: vendedorPassword,
        nombre: v.nombre,
        apellido: v.apellido,
        rol: 'VENDEDOR',
        activo: true,
        coverageAreas: JSON.stringify(v.coverageAreas),
      },
    })
    vendedores.push(vendedor)
    console.log('  ✅ Vendedor:', vendedor.email)
  }

  // --- Leads (Contacto table — legacy landing leads) ---
  const leadsData = [
    { nombre: 'Juan Perez', email: 'juan@test.com', telefono: '+54 11 1234-5678', origen: 'landing-hominis', mensaje: 'Quiero info sobre Vita Más' },
    { nombre: 'Maria Lopez', email: 'maria@test.com', telefono: '+54 11 8765-4321', origen: 'landing-seguros', mensaje: 'Cotizar plan Premedic' },
    { nombre: 'Carlos Ruiz', email: 'carlos@test.com', telefono: '+54 11 1111-2222', origen: 'landing-hominis', mensaje: 'Necesito cobertura para mi familia' },
    { nombre: 'Ana Garcia', email: 'ana@test.com', telefono: '+54 11 3333-4444', origen: 'landing-seguros', mensaje: 'Plan para monotributista' },
  ]

  for (const l of leadsData) {
    await db.contacto.create({
      data: {
        nombre: l.nombre,
        email: l.email,
        telefono: l.telefono,
        segmento: 'premedic',
        mensaje: l.mensaje,
        origen: l.origen,
        estado: 'NUEVO',
      },
    })
  }
  console.log(`  ✅ ${leadsData.length} leads creados`)

  // --- Notificaciones ---
  const notifsData = [
    { title: 'Nuevo lead de Hominis', message: 'Juan Perez (juan@test.com) — tel: +54 11 1234-5678', type: 'CONTACT' as const },
    { title: 'Nuevo lead de Cotiza Seguros', message: 'Maria Lopez (maria@test.com) — tel: +54 11 8765-4321', type: 'CONTACT' as const },
    { title: 'Bienvenido al CRM', message: 'Sistema inicializado correctamente.', type: 'SYSTEM' as const },
  ]

  for (const n of notifsData) {
    await db.notification.create({
      data: {
        userId: admin.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: '/dashboard',
      },
    })
  }
  console.log(`  ✅ ${notifsData.length} notificaciones creadas`)

  console.log('\n🎉 Seed completado!')
  console.log('   Login: admin@hominis.com / Hominis2025!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
