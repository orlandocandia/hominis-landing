// Seed script — Fase 1: Admin user with extended profile + multicanal
// Uses raw SQL via libsql client (same as auth/config.ts) to avoid Prisma adapter version mismatch.
// Run with: bun prisma/seed.ts  (bun loads .env automatically)
import { getTursoClient } from '@/lib/turso-config';
import bcrypt from 'bcryptjs';

async function main() {
  const libsql = getTursoClient();
  const email = 'acandia@mphominis.com.ar';
  const password = 'Hominis2025!';
  const nombre = 'Agustina';
  const apellido = 'C. Candia';

  console.log('🌱 Fase 1 — Creando usuario administrador con perfil extendido...');

  const hashedPassword = await bcrypt.hash(password, 12);

  // ─── Check if admin exists ───
  const existing = await libsql.execute({
    sql: 'SELECT id FROM User WHERE email = ? LIMIT 1',
    args: [email],
  });

  let userId: string;

  if (existing.rows.length > 0) {
    // UPDATE existing admin with extended fields
    userId = existing.rows[0].id as string;
    await libsql.execute({
      sql: `UPDATE User SET
        password = ?, nombre = ?, apellido = ?, rol = 'ADMIN', activo = 1,
        address = ?, city = ?, province = ?,
        latitude = ?, longitude = ?, geocodingStatus = 'SUCCESS',
        serviceRadius = ?, ultimoAcceso = ultimoAcceso
      WHERE id = ?`,
      args: [
        hashedPassword, nombre, apellido,
        'Portela 266, Lomas de Zamora', 'Lomas de Zamora', 'Buenos Aires',
        -34.7629, -58.4014,
        50,
        userId,
      ],
    });
    console.log(`  ✅ Admin actualizado (ID: ${userId})`);
  } else {
    // INSERT new admin
    userId = 'admin_' + Date.now().toString(36);
    await libsql.execute({
      sql: `INSERT INTO User (id, email, password, nombre, apellido, rol, activo,
        address, city, province, latitude, longitude, geocodingStatus, serviceRadius, fechaAlta)
      VALUES (?, ?, ?, ?, ?, 'ADMIN', 1, ?, ?, ?, ?, ?, 'SUCCESS', ?, CURRENT_TIMESTAMP)`,
      args: [
        userId, email, hashedPassword, nombre, apellido,
        'Portela 266, Lomas de Zamora', 'Lomas de Zamora', 'Buenos Aires',
        -34.7629, -58.4014, 50,
      ],
    });
    console.log(`  ✅ Admin creado (ID: ${userId})`);
  }

  // ─── Upsert WhatsApp phone ───
  const phoneExists = await libsql.execute({
    sql: 'SELECT id FROM UserPhone WHERE userId = ? AND phoneNumber = ?',
    args: [userId, '5491165555534'],
  });
  if (phoneExists.rows.length > 0) {
    await libsql.execute({
      sql: `UPDATE UserPhone SET phoneType = 'WHATSAPP', isPrimary = 1, isWhatsapp = 1, isVerified = 1 WHERE userId = ? AND phoneNumber = ?`,
      args: [userId, '5491165555534'],
    });
  } else {
    await libsql.execute({
      sql: `INSERT INTO UserPhone (id, userId, phoneNumber, phoneType, isPrimary, isWhatsapp, isVerified, updatedAt)
        VALUES (?, ?, '5491165555534', 'WHATSAPP', 1, 1, 1, CURRENT_TIMESTAMP)`,
      args: ['phone_' + Date.now().toString(36), userId],
    });
  }
  console.log('  ✅ WhatsApp: +54 9 11 6555-5534');

  // ─── Upsert personal email ───
  const emailExists = await libsql.execute({
    sql: 'SELECT id FROM UserEmail WHERE userId = ? AND email = ?',
    args: [userId, 'asesoradesaludagustinacandia@gmail.com'],
  });
  if (emailExists.rows.length > 0) {
    await libsql.execute({
      sql: `UPDATE UserEmail SET emailType = 'PERSONAL', isPrimary = 1, isVerified = 1 WHERE userId = ? AND email = ?`,
      args: [userId, 'asesoradesaludagustinacandia@gmail.com'],
    });
  } else {
    await libsql.execute({
      sql: `INSERT INTO UserEmail (id, userId, email, emailType, isPrimary, isVerified, updatedAt)
        VALUES (?, ?, 'asesoradesaludagustinacandia@gmail.com', 'PERSONAL', 1, 1, CURRENT_TIMESTAMP)`,
      args: ['email_' + Date.now().toString(36), userId],
    });
  }
  console.log('  ✅ Email secundario: asesoradesaludagustinacandia@gmail.com');

  // ─── Verify ───
  const verify = await libsql.execute({
    sql: 'SELECT id, email, nombre, apellido, rol, city, province, latitude, longitude, serviceRadius FROM User WHERE email = ?',
    args: [email],
  });
  const u = verify.rows[0];
  console.log('\n✅ Usuario administrador verificado:');
  console.log(`   ID: ${u.id}`);
  console.log(`   Email: ${u.email}`);
  console.log(`   Nombre: ${u.nombre} ${u.apellido}`);
  console.log(`   Rol: ${u.rol}`);
  console.log(`   Ubicación: ${u.city}, ${u.province} (${u.latitude}, ${u.longitude})`);
  console.log(`   Radio: ${u.serviceRadius} km`);

  console.log('\n📋 Credenciales de acceso:');
  console.log(`   Email: ${email}`);
  console.log(`   Contraseña: ${password}`);
  console.log('\n⚠️  ¡Cambiá la contraseña después del primer inicio de sesión!');
}

main().catch((e) => {
  console.error('❌ Error en seed:', e);
  process.exit(1);
});
