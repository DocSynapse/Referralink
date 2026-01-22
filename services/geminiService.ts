
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION_REFERRAL } from "../constants";
import { MedicalQuery, ICD10Result } from "../types";

const getClient = () => {
  const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!geminiApiKey) throw new Error("VITE_GEMINI_API_KEY tidak ditemukan di .env");
  return new GoogleGenAI(geminiApiKey);
};

export const searchICD10Code = async (input: MedicalQuery): Promise<{ json: ICD10Result | null, logs: string[], sources?: any[] }> => {
  try {
    const ai = getClient();
    
    const prompt = `
    Input Gejala/Diagnosa Awal: "${input.query}"
    
    Tugas: 
    1. Identifikasi diagnosa awal dan kode ICD-10 nya.
    2. Analisis apakah ini diagnosa non-rujukan.
    3. Jika non-rujukan, carikan 2-3 diagnosa rujukan (RS) yang relevan sebagai usulan alternatif rujukan jika ada indikasi medis berat/red flags.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_REFERRAL,
        temperature: 0.1,
        responseMimeType: 'application/json',
        tools: [{ googleSearch: {} }] 
      }
    });

    const text = response.text || "{}";
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return {
      json: JSON.parse(jsonStr),
      logs: [
        `Menerima diagnosa awal: "${input.query}"`,
        `Menganalisis status rujukan berdasarkan standar BPJS/FKTP...`,
        `Melakukan simulasi klinis untuk diagnosa rujukan alternatif...`,
        `Mengekstrak data ICD-10 dan alasan klinis rujukan...`,
        `Analisis selesai: Memberikan usulan rujukan medis.`
      ]
    };
  } catch (error) {
    console.error("Kesalahan Sistem Rujukan:", error);
    return {
      json: null,
      logs: [`Kesalahan: ${error instanceof Error ? error.message : String(error)}`]
    };
  }
};
