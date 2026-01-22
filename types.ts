
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface ProposedReferral {
  code: string;
  description: string;
  clinical_reasoning: string;
}

export interface MedicalQuery {
  id: string;
  query: string;
  timestamp: number;
}

export interface ICD10Result {
  code: string;
  description: string;
  category: string;
  proposed_referrals: ProposedReferral[];
  clinical_notes: string;
  confidence_score: number;
}

export interface ProcessedResult {
  id: string;
  input: MedicalQuery;
  output: ICD10Result | null;
  logs: string[];
  durationMs: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}
