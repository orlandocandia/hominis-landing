// Recalculate lead scores for all contacts.
// Run with: bun run scripts/recalculate-scores.ts
// or:       bunx tsx scripts/recalculate-scores.ts
//
// Requires TURSO_URL + TURSO_AUTH_TOKEN env vars (or .env file loaded by bun).
import { LeadScoringService } from '../src/lib/services/lead-scoring.service';

async function main() {
  console.log('🔄 Recalculando scores de todos los contactos...\n');
  const result = await LeadScoringService.recalculateAllScores();
  console.log(`\n✅ ${result.scored}/${result.processed} contactos actualizados.`);
  if (result.scored < result.processed) {
    console.warn(`⚠️  ${result.processed - result.scored} contactos fallaron (ver logs arriba).`);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Error fatal:', e);
  process.exit(1);
});
