// Seed script - Create initial admin user
// Run with: bunx tsx prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando usuario administrador...');

  const email = 'agustina.candia@hominis.com';
  const password = 'Hominis2025!';
  const nombre = 'Agustina C. Candia';

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log('⚠️  El usuario ya existe. Actualizando contraseña...');
    const hashedPassword = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword, nombre, activo: true },
    });
    console.log('✅ Contraseña actualizada correctamente.');
  } else {
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        rol: 'ADMIN',
        activo: true,
      },
    });
    console.log('✅ Usuario administrador creado:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.nombre}`);
    console.log(`   Rol: ${user.rol}`);
  }

  console.log('\n📋 Credenciales de acceso:');
  console.log(`   URL: https://tudominio.com/login`);
  console.log(`   Email: ${email}`);
  console.log(`   Contraseña: ${password}`);
  console.log('\n⚠️  ¡Cambiá la contraseña después del primer inicio de sesión!');

  await prisma.$disconnect();
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });
