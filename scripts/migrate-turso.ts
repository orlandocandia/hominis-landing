// Migration script — applies CRM schema to Turso
// Idempotent: safe to run multiple times (used by GitHub Actions CI/CD).
//
// Required env vars:
//   TURSO_URL        e.g. libsql://hominins-db-orlandocandia.aws-us-east-2.turso.io
//   TURSO_AUTH_TOKEN e.g. eyJhbGciOi...
//
// Usage:
//   bun run scripts/migrate-turso.ts
//   # or via package.json: bun run migrate
import { createClient } from '@libsql/client';

const TURSO_URL = process.env.TURSO_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error('❌ Faltan TURSO_URL o TURSO_AUTH_TOKEN (env vars requeridas)');
  console.error('   En local: copialas de tu .env o src/lib/turso-config.ts');
  console.error('   En GitHub Actions: configuralas como secrets del repo');
  process.exit(1);
}

const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });

const userNewColumns: [string, string][] = [
  ['apellido', 'TEXT'],
  ['telefono', 'TEXT'],
  ['fechaAlta', 'DATETIME'],
  ['ultimoAcceso', 'DATETIME'],
  ['avatarUrl', 'TEXT'],
  ['avatarPublicId', 'TEXT'],
  ['avatarUpdatedAt', 'DATETIME'],
  ['address', 'TEXT'],
  ['city', 'TEXT'],
  ['province', 'TEXT'],
  ['postalCode', 'TEXT'],
  ['latitude', 'REAL'],
  ['longitude', 'REAL'],
  ['geocodingStatus', "TEXT NOT NULL DEFAULT 'PENDING'"],
  ['serviceRadius', 'INTEGER NOT NULL DEFAULT 50'],
  ['coverageAreas', 'TEXT'],
  ['documentNumber', 'TEXT'],
  ['hireDate', 'DATETIME'],
  ['totalContacts', 'INTEGER NOT NULL DEFAULT 0'],
  ['conversionRate', 'REAL NOT NULL DEFAULT 0'],
];

const newTables: string[] = [
  `CREATE TABLE IF NOT EXISTS "UserPhone" (
    "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "phoneNumber" TEXT NOT NULL,
    "phoneType" TEXT NOT NULL, "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isWhatsapp" BOOLEAN NOT NULL DEFAULT false, "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPhone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("userId", "phoneNumber")
  )`,
  `CREATE TABLE IF NOT EXISTS "UserEmail" (
    "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "email" TEXT NOT NULL,
    "emailType" TEXT NOT NULL, "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false, "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserEmail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("userId", "email")
  )`,
  `CREATE TABLE IF NOT EXISTS "UserSocialNetwork" (
    "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL, "url" TEXT, "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSocialNetwork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("userId", "platform", "username")
  )`,
  `CREATE TABLE IF NOT EXISTS "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "primaryEmail" TEXT, "primaryPhone" TEXT,
    "address" TEXT NOT NULL, "city" TEXT, "province" TEXT, "postalCode" TEXT,
    "latitude" REAL NOT NULL, "longitude" REAL NOT NULL, "geocodingStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "photoUrl" TEXT, "photoPublicId" TEXT, "segment" TEXT, "age" INTEGER, "coverage" TEXT,
    "message" TEXT, "status" TEXT NOT NULL DEFAULT 'NUEVO', "ownerId" TEXT NOT NULL,
    "assignedBy" TEXT, "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastContact" DATETIME, "nextFollowup" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contact_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contact_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "ContactPhone" (
    "id" TEXT NOT NULL PRIMARY KEY, "contactId" TEXT NOT NULL, "phoneNumber" TEXT NOT NULL,
    "phoneType" TEXT NOT NULL, "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isWhatsapp" BOOLEAN NOT NULL DEFAULT false, "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContactPhone_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("contactId", "phoneNumber")
  )`,
  `CREATE TABLE IF NOT EXISTS "ContactEmail" (
    "id" TEXT NOT NULL PRIMARY KEY, "contactId" TEXT NOT NULL, "email" TEXT NOT NULL,
    "emailType" TEXT NOT NULL, "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false, "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContactEmail_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("contactId", "email")
  )`,
  `CREATE TABLE IF NOT EXISTS "ContactSocialNetwork" (
    "id" TEXT NOT NULL PRIMARY KEY, "contactId" TEXT NOT NULL, "platform" TEXT NOT NULL,
    "username" TEXT NOT NULL, "url" TEXT, "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContactSocialNetwork_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE("contactId", "platform", "username")
  )`,
  `CREATE TABLE IF NOT EXISTS "ContactActivity" (
    "id" TEXT NOT NULL PRIMARY KEY, "contactId" TEXT NOT NULL, "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL, "note" TEXT, "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactActivity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContactActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "AutomaticAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY, "contactId" TEXT NOT NULL, "assignedTo" TEXT NOT NULL,
    "method" TEXT NOT NULL, "distanceKm" REAL, "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AutomaticAssignment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AutomaticAssignment_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY, "email" TEXT NOT NULL, "role" TEXT NOT NULL,
    "token" TEXT NOT NULL, "invitedBy" TEXT NOT NULL, "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Invitation_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY, "userId" TEXT NOT NULL, "type" TEXT NOT NULL,
    "title" TEXT NOT NULL, "message" TEXT NOT NULL, "read" BOOLEAN NOT NULL DEFAULT false,
    "link" TEXT, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
  )`,
];

const newIndexes: string[] = [
  'CREATE INDEX IF NOT EXISTS "User_lat_lng_idx" ON "User"("latitude", "longitude")',
  'CREATE INDEX IF NOT EXISTS "UserPhone_phone_idx" ON "UserPhone"("phoneNumber")',
  'CREATE INDEX IF NOT EXISTS "UserEmail_email_idx" ON "UserEmail"("email")',
  'CREATE INDEX IF NOT EXISTS "Contact_lat_lng_idx" ON "Contact"("latitude", "longitude")',
  'CREATE INDEX IF NOT EXISTS "Contact_owner_idx" ON "Contact"("ownerId")',
  'CREATE INDEX IF NOT EXISTS "Contact_status_idx" ON "Contact"("status")',
  'CREATE INDEX IF NOT EXISTS "ContactPhone_phone_idx" ON "ContactPhone"("phoneNumber")',
  'CREATE INDEX IF NOT EXISTS "ContactEmail_email_idx" ON "ContactEmail"("email")',
  'CREATE INDEX IF NOT EXISTS "Activity_contact_idx" ON "ContactActivity"("contactId")',
  'CREATE INDEX IF NOT EXISTS "Activity_user_idx" ON "ContactActivity"("userId")',
  'CREATE INDEX IF NOT EXISTS "Assignment_to_idx" ON "AutomaticAssignment"("assignedTo")',
  'CREATE INDEX IF NOT EXISTS "Invitation_email_idx" ON "Invitation"("email")',
  'CREATE UNIQUE INDEX IF NOT EXISTS "Invitation_token_idx" ON "Invitation"("token")',
  'CREATE INDEX IF NOT EXISTS "Notification_user_idx" ON "Notification"("userId")',
];

async function migrate() {
  console.log('🚀 Running Turso migrations...\n');
  console.log(`   DB: ${TURSO_URL}\n`);

  console.log('─ Step 1: Add columns to User ─');
  for (const [col, type] of userNewColumns) {
    try {
      await client.execute(`ALTER TABLE "User" ADD COLUMN "${col}" ${type}`);
      console.log(`  ✅ +${col}`);
    } catch (e: any) {
      if (e.message?.includes('duplicate column')) console.log(`  ⏭️  ${col} (exists)`);
      else console.error(`  ❌ ${col}: ${e.message}`);
    }
  }

  console.log('\n─ Step 2: Drop deprecated ultimoLogin ─');
  try {
    await client.execute('ALTER TABLE "User" DROP COLUMN "ultimoLogin"');
    console.log('  ✅ -ultimoLogin');
  } catch (e: any) {
    if (e.message?.includes('no such column')) console.log('  ⏭️  ultimoLogin (not present)');
    else console.log(`  ⚠️  ultimoLogin: ${e.message}`);
  }

  console.log('\n─ Step 3: Create tables ─');
  for (const sql of newTables) {
    const t = sql.match(/"(\w+)"/)?.[1] ?? '?';
    try { await client.execute(sql); console.log(`  ✅ ${t}`); }
    catch (e: any) { console.error(`  ❌ ${t}: ${e.message}`); }
  }

  console.log('\n─ Step 4: Create indexes ─');
  for (const sql of newIndexes) {
    const i = sql.match(/"(\w+)"/)?.[1] ?? '?';
    try { await client.execute(sql); console.log(`  ✅ ${i}`); }
    catch (e: any) { console.error(`  ❌ ${i}: ${e.message}`); }
  }

  console.log('\n─ Step 5: Verify ─');
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log('  Tables:', tables.rows.map((r) => r.name).join(', '));

  console.log('\n✅ Migrations completed successfully.');
}

migrate().catch((e) => {
  console.error('❌ Fatal migration error:', e);
  process.exit(1);
});
