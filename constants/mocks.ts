import { ICD10Result } from "../types";

// --- MOCK DATA FOR FALLBACK (Skenario Valid: Hipertensi Urgensi) ---
export const MOCK_RESULT: ICD10Result = {
  code: "I11.9",
  description: "Hypertensive Heart Disease",
  category: "RUJUKAN_MUTLAK",
  confidence_score: 0.99,
  urgency: "EMERGENCY",
  triage_score: 9,
  recommended_timeframe: "Segera ke IGD (< 2 Jam)",
  assessment: {
    severity_distress: "Nyeri dada kiri tipikal (skala 7/10), Tensi 180/110 mmHg (Krisis).",
    risk_assessment: "Risiko ACS (Acute Coronary Syndrome) & Gagal Jantung Akut.",
    functional_impact: "Intoleransi aktivitas berat, sesak saat berbaring.",
    comorbidities: ["Diabetes Melitus Tipe 2", "Dyslipidemia"],
    treatment_history: "Amlodipine 10mg tidak respon.",
    socio_economic: "Peserta PBI (Aktif).",
    support_system: "Diantar keluarga.",
    engagement_compliance: "Riwayat putus obat."
  },
  evidence: {
    clinical_reasoning: "Pasien mengalami Krisis Hipertensi (Urgensi) disertai tanda Angina Pectoris (Nyeri Dada). Sesuai PPK Jantung & Aturan BPJS, kasus ini kompetensi Spesialis Jantung (FKTL) karena risiko kerusakan organ target akut.",
    guidelines: ["ESC Guidelines 2024 Hypertension", "Peraturan BPJS No 1/2014 (Kompetensi 3B)"],
    red_flags: ["Tekanan darah >180/110", "Nyeri dada menjalar (Angina)", "Sesak nafas (Dyspnea)"],
    differential_diagnosis: ["Unstable Angina (I20.0)", "Hypertensive Emergency (I10+R57)"]
  },
  clinical_notes: "Berikan Oksigen 3L, ISDN 5mg sublingual jika nyeri, Loading Aspilet/Clopidogrel jika EKG ST-Elevasi. Rujuk IGD segera.",
  proposed_referrals: [
    { code: "I11.9", description: "Hypertensive Heart Disease without Heart Failure", kompetensi: "3B", clinical_reasoning: "Diagnosis paling tepat untuk Hipertensi dengan keterlibatan jantung (Nyeri Dada) namun belum Gagal Jantung kongestif nyata." },
    { code: "I20.9", description: "Angina Pectoris, Unspecified", kompetensi: "3B", clinical_reasoning: "Gunakan jika nyeri dada lebih dominan daripada riwayat hipertensinya." },
    { code: "I13.9", description: "Hypertensive Heart and CKD, Unspecified", kompetensi: "3A", clinical_reasoning: "Gunakan jika ada tanda gangguan fungsi ginjal (Cr >1.5 atau eGFR <60)." }
  ]
};
