// Seed script - Create initial admin user
// Run with: bunx tsx prisma/seed.ts
//
// Uses the shared `db` client from src/lib/db, which resolves Turso (production)
// or local SQLite automatically via turso-config.ts / DATABASE_URL.
// So the admin user is written to the SAME database the auth reads from.

import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'acandia@mphominis.com.ar';
  const password = 'Hominis2025!';
  const nombre = 'Agustina';
  const apellido = 'Candia';

  console.log('🌱 Creando usuario administrador...');

  const hashedPassword = await bcrypt.hash(password, 12);

  // upsert: create if missing, update password/role if exists
  const user = await db.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      nombre,
      apellido,
      rol: 'ADMIN',
      activo: true,
    },
    create: {
      email,
      password: hashedPassword,
      nombre,
      apellido,
      rol: 'ADMIN',
      activo: true,
    },
  });

  console.log('✅ Usuario administrador listo:');
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Nombre: ${user.nombre} ${user.apellido ?? ''}`.trim());
  console.log(`   Rol: ${user.rol}`);

  console.log('\n📋 Credenciales de acceso:');
  console.log(`   Email: ${email}`);
  console.log(`   Contraseña: ${password}`);
  console.log('\n⚠️  ¡Cambiá la contraseña después del primer inicio de sesión!');

  await db.$disconnect();
}

main().catch((e) => {
  console.error('❌ Error en seed:', e);
  process.exit(1);
});
