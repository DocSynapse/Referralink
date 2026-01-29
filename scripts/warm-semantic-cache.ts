/**
 * Semantic Cache Warming Script
 * Pre-populate vector cache dengan common diagnosis queries
 *
 * Usage: npm run warm-cache
 *
 * Purpose:
 * - Instant demo readiness (pre-warmed cache)
 * - Higher initial cache hit rate
 * - Better user experience dari hari pertama
 */

import { semanticCache } from '../src/services/semanticCacheService';

// Top 20 common symptom patterns
// Curated based on Indonesian primary care patterns
const COMMON_QUERIES = [
  // Respiratory (Top cause di Indonesia)
  "Demam tinggi 3 hari, batuk kering, sesak napas",
  "Batuk berdahak kuning 5 hari, demam subfebris, nyeri dada",
  "Sesak napas progresif, riwayat asma, wheezing",
  "Batuk darah, keringat malam, berat badan turun",

  // Tropical diseases (Endemic di Indonesia)
  "Demam 4 hari, trombosit turun 80k, bintik merah",
  "Demam tinggi menggigil 3 hari, sakit kepala hebat, berkeringat",
  "Demam lama 2 minggu, pembesaran kelenjar getah bening",

  // Cardiovascular
  "Nyeri dada kiri menjalar ke rahang, berkeringat dingin",
  "Jantung berdebar, pusing berputar, riwayat hipertensi",
  "Sesak napas saat aktivitas, bengkak kedua kaki",

  // Gastrointestinal
  "Nyeri ulu hati, mual muntah, BAB hitam",
  "Diare berdarah 3 hari, demam, kram perut",
  "Nyeri perut kanan atas, kuning pada mata, urin gelap",

  // Neurological
  "Sakit kepala hebat mendadak, kaku kuduk, demam tinggi",
  "Kejang 2x hari ini, penurunan kesadaran, demam tinggi anak 2 tahun",

  // Pediatric
  "Demam tinggi anak 18 bulan, kejang 5 menit, tidak sadar",
  "Sesak napas anak 3 tahun, tarikan dinding dada, demam",
  "Diare cair >10x hari ini, mata cekung, turgor kulit menurun",

  // Musculoskeletal
  "Nyeri sendi bengkak kedua lutut, demam, ruam kulit",

  // Emergency indicators
  "Sesak napas berat, bibir biru, tidak bisa bicara"
];

/**
 * Main cache warming function
 */
async function warmCache() {
  console.log('='.repeat(60));
  console.log('[CacheWarming] Semantic Cache Pre-Population');
  console.log('='.repeat(60));
  console.log(`Total queries to process: ${COMMON_QUERIES.length}`);
  console.log(`Estimated time: ~${(COMMON_QUERIES.length * 20 / 60).toFixed(1)} minutes`);
  console.log('='.repeat(60));
  console.log('');

  const startTime = Date.now();

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (let i = 0; i < COMMON_QUERIES.length; i++) {
    const query = COMMON_QUERIES[i];
    const queryNum = i + 1;

    try {
      console.log(`[${queryNum}/${COMMON_QUERIES.length}] Processing...`);
      console.log(`  Query: "${query.substring(0, 60)}${query.length > 60 ? '...' : ''}"`);

      const queryStartTime = Date.now();

      // NOTE: This is a warming script - in production you would call
      // searchICD10Code with skipCache=true to force AI call
      // For now, we'll just demonstrate the embedding + cache set pattern

      // Mock result for demonstration (replace with actual AI call)
      const mockResult = {
        code: "A00.0",
        description: "Mock diagnosis for cache warming",
        category: "RUJUKAN_MUTLAK" as const,
        confidence_score: 0.95,
        urgency: "URGENT" as const,
        triage_score: 7,
        recommended_timeframe: "Within 24 hours",
        assessment: {
          severity_distress: "Moderate",
          risk_assessment: "Medium",
          functional_impact: "Limited ADL",
          comorbidities: [],
          treatment_history: "None",
          socio_economic: "Standard",
          support_system: "Family available",
          engagement_compliance: "Good"
        },
        evidence: {
          clinical_reasoning: "Mock reasoning",
          guidelines: [],
          red_flags: [],
          differential_diagnosis: []
        },
        clinical_notes: "Mock clinical notes",
        proposed_referrals: []
      };

      // Store in semantic cache
      await semanticCache.set(query, mockResult, 'WARMUP_SCRIPT');

      const queryDuration = Date.now() - queryStartTime;
      console.log(`  ✓ Success (${queryDuration}ms)`);
      successCount++;

      // Rate limiting: 2s delay between requests to avoid API throttling
      if (i < COMMON_QUERIES.length - 1) {
        console.log(`  ⏳ Waiting 2s before next query...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error: any) {
      console.error(`  ✗ Error: ${error.message}`);
      errorCount++;
      errors.push(`Query ${queryNum}: ${error.message}`);
    }

    console.log(''); // Blank line between queries
  }

  const totalTime = Date.now() - startTime;

  // Summary
  console.log('='.repeat(60));
  console.log('[CacheWarming] Summary');
  console.log('='.repeat(60));
  console.log(`Success: ${successCount}/${COMMON_QUERIES.length}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Total time: ${(totalTime / 1000 / 60).toFixed(1)} minutes`);
  console.log(`Avg per query: ${(totalTime / COMMON_QUERIES.length / 1000).toFixed(1)}s`);

  if (errors.length > 0) {
    console.log('');
    console.log('Error details:');
    errors.forEach(err => console.log(`  - ${err}`));
  }

  // Get cache stats
  try {
    const stats = await semanticCache.getStats();
    console.log('');
    console.log('Cache statistics:');
    console.log(`  Total entries: ${stats.totalEntries}`);
    console.log(`  Dimension: ${stats.dimension}`);
    console.log(`  Similarity function: ${stats.similarityFunction}`);
  } catch (error) {
    console.warn('Could not fetch cache stats:', error);
  }

  console.log('='.repeat(60));

  // Exit with appropriate code
  process.exit(errorCount > 0 ? 1 : 0);
}

// Execute
warmCache().catch(error => {
  console.error('[CacheWarming] Fatal error:', error);
  process.exit(1);
});
