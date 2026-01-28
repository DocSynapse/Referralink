
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface MedicalQuery {
  id: string;
  query: string;
  timestamp: number;
}

export interface MultiDomainAssessment {
  severity_distress: string;       // Tingkat keparahan & distress
  risk_assessment: string;         // Risiko membahayakan diri/orang lain
  functional_impact: string;       // Dampak ke ADL/Pekerjaan
  comorbidities: string[];         // Penyakit penyerta & komplikasi
  treatment_history: string;       // Riwayat pengobatan sebelumnya
  socio_economic: string;          // Faktor ekonomi & lingkungan
  support_system: string;          // Ketersediaan dukungan keluarga/sosial
  engagement_compliance: string;   // Kepatuhan pasien
}

export interface EvidenceBase {
  clinical_reasoning: string;      // Auto-generated reasoning
  guidelines: string[];            // Referensi PMK/Protocols
  red_flags: string[];             // Tanda bahaya terdeteksi
  differential_diagnosis: string[];// Kemungkinan diagnosa lain
}

export interface ICD10Result {
  // Core Diagnosis
  code: string;
  description: string;
  category: "NON_RUJUKAN" | "RUJUKAN_TAKTIK" | "RUJUKAN_MUTLAK";
  confidence_score: number;

  // 1. Clinical Prioritization (Triage)
  urgency: "EMERGENCY" | "URGENT" | "SEMI_URGENT" | "ROUTINE";
  triage_score: number; // 1-10 (10 = Critical)
  recommended_timeframe: string; // e.g., "Immediate (<24h)", "Within 1 week"

  // 2. Multi-Domain Assessment (IAR-DST Style)
  assessment: MultiDomainAssessment;

  // 3. Evidence & Strategy
  evidence: EvidenceBase;

  // Legacy/Tactical (Keep for compatibility/display)
  clinical_notes: string;
  proposed_referrals: {
    code: string;
    description: string;
    kompetensi?: "3B" | "3A" | "2" | "1";
    clinical_reasoning: string;
  }[];
}

export interface ProcessedResult {
  id: string;
  input: MedicalQuery;
  output: ICD10Result | null;
  logs: string[];
  durationMs: number;
  status: 'processing' | 'completed' | 'failed';
}

/**
 * Streaming callbacks for progressive AI reasoning display
 */
export interface StreamCallbacks {
  onThinkingChunk: (text: string) => void;
  onComplete: (result: ICD10Result) => void;
  onError: (error: Error) => void;
}

/**
 * Cache entry structure for diagnosis caching
 */
export interface CacheEntry {
  result: ICD10Result;
  timestamp: number;
  queryHash: string;
  originalQuery: string;
  model: string;
}
