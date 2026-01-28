export interface CeoMessage {
  id: string;
  date: string;
  title: string;
  role: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'PLANNED';
  priority: 'HIGH' | 'NORMAL';
  content: {
    heading: string;
    items: string[];
  };
  footer: string;
}

export const CEO_BROADCASTS: CeoMessage[] = [
  {
    id: "MSG-2026-01-28-WELCOME",
    date: "28 Jan 2026",
    title: "Alpha Entrance",
    role: "System Admin",
    status: "COMPLETED",
    priority: "NORMAL",
    content: {
      heading: "Welcome Alpha Tester",
      items: [
        "Terima kasih telah bergabung dalam misi Sentra.",
        "Fokus pengujian: <strong>Akurasi Mapping ICD-10</strong> dan <strong>Kestabilan Alur Rujukan</strong>.",
        "Gunakan fitur 'Laporkan' jika menemukan anomali diagnosa."
      ]
    },
    footer: "Protocol 7 is now active. Your feedback is our intelligence."
  },
  {
    id: "MSG-2026-01-28-ALPHA", 
    date: "28 Jan 2026",
    title: "Strategic Directive",
    role: "Lead Architect",
    status: "IN_PROGRESS",
    priority: "HIGH",
    content: {
      heading: "Strategic Directive: Phase 1",
      items: [
        "<strong>Dynamic Dashboard Integration</strong>: Integrasi ReferraLink ke Thee Abys.",
        "<strong>Automated Conversion Logic</strong>: Optimasi klasifikasi rujukan.",
        "<strong>Enhanced Asset Security</strong>: Enkripsi data diagnosa."
      ]
    },
    footer: "Next: Deploy Smart Automation."
  }
];
