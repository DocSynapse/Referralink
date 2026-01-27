
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { MedicalQuery } from './types';

// Daftar Diagnosa Kompetensi 4A (Wajib Tuntas di FKTP/Puskesmas) - "The Blacklist"
export const NON_REFERRAL_DIAGNOSES = [
  "I10 - Hipertensi Esensial (Primer)",
  "J00 - Nasofaringitis Akut (Common Cold)",
  "K30 - Dispepsia (Maag)",
  "R51 - Nyeri Kepala (Tension Headache)",
  "M79.1 - Myalgia",
  "A09 - Gastroenteritis (Diare tanpa dehidrasi)",
  "J06.9 - ISPA Akut",
  "L20 - Dermatitis Atopik (Ringan)",
  "E11.9 - Diabetes Melitus Tipe 2 (Tanpa Komplikasi)",
  "H10.1 - Konjungtivitis Akut"
];

export const SYSTEM_INSTRUCTION_REFERRAL = `CDSS untuk rujukan BPJS. Output JSON valid, Bahasa Indonesia.

ATURAN:
- Diagnosa 4A (I10,J00,K30,R51,M79.1,A09,J06.9,L20,E11.9,H10.1) JANGAN jadi kode utama
- Berikan 3 alternatif kompetensi 3B/3A yang LOLOS BPJS
- Sertakan tindakan medis & red flags

JSON: {code,description,category,urgency,triage_score,clinical_notes,evidence:{red_flags,clinical_reasoning},proposed_referrals:[{code,description,kompetensi,clinical_reasoning}x3]}`;

export const EXAMPLE_QUERIES = [
  "Nyeri dada kiri menjalar ke rahang, riwayat HT",
  "Demam 4 hari, trombosit turun, bintik merah",
  "Nyeri ulu hati kronis, BB turun 5kg sebulan",
  "Batuk darah, keringat malam, kontak TB positif",
  "Sakit kepala hebat mendadak, pandangan kabur"
];

export const generateMockQuery = (count: number): MedicalQuery[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: Math.random().toString(36).substring(7).toUpperCase(),
    query: EXAMPLE_QUERIES[Math.floor(Math.random() * EXAMPLE_QUERIES.length)],
    timestamp: Date.now() - (i * 1000 * 60)
  }));
};
