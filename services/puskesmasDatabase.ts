/**
 * Puskesmas Medical Database Service
 * Provides treatment protocols, danger signs, and first aid procedures
 */

export interface TreatmentProtocol {
  nama_obat: string;
  dosis: string | null;
  durasi: string | null;
}

export interface PuskesmasDisease {
  nama_penyakit: string;
  gejala_klinis: string[];
  pemeriksaan_penunjang: string[];
  kriteria_diagnosis: string | null;
  tata_laksana: TreatmentProtocol[];
  tanda_bahaya: string;
  sumber_halaman: string;
}

// Import database
import databaseJson from '../database/med_database.json';
const database: PuskesmasDisease[] = databaseJson as PuskesmasDisease[];

/**
 * Find disease by name (case-insensitive, fuzzy match)
 */
export function findDiseaseByName(diseaseName: string): PuskesmasDisease | null {
  if (!diseaseName) return null;

  const normalized = diseaseName.toLowerCase().trim();

  // Exact match first
  let match = database.find(d =>
    d.nama_penyakit.toLowerCase() === normalized
  );

  if (match) return match;

  // Partial match (disease name contains search term OR vice versa)
  match = database.find(d => {
    const dbName = d.nama_penyakit.toLowerCase();
    return dbName.includes(normalized) || normalized.includes(dbName);
  });

  return match || null;
}

/**
 * Find disease by symptoms (match gejala_klinis)
 */
export function findDiseaseBySymptoms(symptoms: string[]): PuskesmasDisease | null {
  if (!symptoms || symptoms.length === 0) return null;

  const normalizedSymptoms = symptoms.map(s => s.toLowerCase().trim());

  // Find disease with most matching symptoms
  let bestMatch: { disease: PuskesmasDisease; score: number } | null = null;

  for (const disease of database) {
    let matchCount = 0;

    for (const symptom of disease.gejala_klinis) {
      const normalizedSymptom = symptom.toLowerCase();

      // Check if any input symptom matches this disease symptom
      if (normalizedSymptoms.some(s =>
        normalizedSymptom.includes(s) || s.includes(normalizedSymptom)
      )) {
        matchCount++;
      }
    }

    if (matchCount > 0 && (!bestMatch || matchCount > bestMatch.score)) {
      bestMatch = { disease, score: matchCount };
    }
  }

  return bestMatch?.disease || null;
}

/**
 * Extract first aid actions from treatment protocol
 */
export function getFirstAidActions(disease: PuskesmasDisease): string[] {
  const actions: string[] = [];

  // Extract from tata_laksana
  for (const treatment of disease.tata_laksana) {
    let action = treatment.nama_obat;

    if (treatment.dosis) {
      action += ` - ${treatment.dosis}`;
    }

    if (treatment.durasi) {
      action += ` (${treatment.durasi})`;
    }

    actions.push(action);
  }

  return actions;
}

/**
 * Get danger signs for a disease
 */
export function getDangerSigns(disease: PuskesmasDisease): string[] {
  if (!disease.tanda_bahaya) return [];

  // Split by comma or semicolon
  return disease.tanda_bahaya
    .split(/[,;]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Check if disease can be handled at Puskesmas
 */
export function canBeHandledAtPuskesmas(diseaseName: string): boolean {
  return findDiseaseByName(diseaseName) !== null;
}

/**
 * Get all diseases in database
 */
export function getAllDiseases(): PuskesmasDisease[] {
  return database;
}

/**
 * Search diseases by partial name
 */
export function searchDiseases(query: string): PuskesmasDisease[] {
  if (!query || query.length < 2) return [];

  const normalized = query.toLowerCase().trim();

  return database.filter(d =>
    d.nama_penyakit.toLowerCase().includes(normalized)
  );
}
