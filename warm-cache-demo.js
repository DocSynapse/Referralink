/**
 * Cache Warmer Script
 * Pre-populate diagnosis cache with common demo queries
 * Run before demo: node warm-cache-demo.js
 */

const DEMO_QUERIES = [
  "Demam tinggi 3 hari, batuk kering, sesak napas",
  "Nyeri dada kiri menjalar ke rahang, riwayat hipertensi",
  "Demam 4 hari, trombosit turun, bintik merah",
  "Nyeri ulu hati kronis, berat badan turun 5kg sebulan",
  "Batuk darah, keringat malam, kontak TB positif",
  "Sakit kepala hebat mendadak, pandangan kabur",
  "Demam tinggi anak 2 tahun, kejang 2x",
  "Sesak napas progresif, bengkak kaki, riwayat jantung"
];

const API_URL = process.env.API_URL || 'https://www.sentraai.id/api/diagnosis/generate';

async function warmCache() {
  console.log('🔥 Cache Warming Started...\n');

  let success = 0;
  let failed = 0;

  for (let i = 0; i < DEMO_QUERIES.length; i++) {
    const query = DEMO_QUERIES[i];
    console.log(`[${i+1}/${DEMO_QUERIES.length}] Processing: "${query.substring(0, 40)}..."`);

    try {
      const startTime = Date.now();
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const result = await response.json();
      const latency = Date.now() - startTime;

      if (result.success) {
        console.log(`  ✅ Success - ${latency}ms - ${result.data.code}: ${result.data.description}`);
        success++;
      } else {
        console.log(`  ❌ Failed - ${result.error}`);
        failed++;
      }

    } catch (error) {
      console.log(`  ❌ Error - ${error.message}`);
      failed++;
    }

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 Cache Warming Complete:');
  console.log(`  ✅ Success: ${success}/${DEMO_QUERIES.length}`);
  console.log(`  ❌ Failed: ${failed}/${DEMO_QUERIES.length}`);
  console.log('\n🚀 Demo queries now cached for 24 hours!');
  console.log('   Repeat queries will be <100ms instant response.\n');
}

warmCache().catch(console.error);
