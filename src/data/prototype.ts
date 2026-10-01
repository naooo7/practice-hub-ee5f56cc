// Prototype data only. Structured so it can later be swapped for real content.

export type Question = {
  id: string;
  prompt: string;
  choices: { key: string; text: string }[];
  answer: string;
  explanation: {
    why: string;
    steps: string[];
  };
};

export type Material = {
  id: string;
  name: string;
  completed: number;
  total: number;
  questionCount: number;
  minutes: number;
};

export type Subtest = {
  id: string;
  name: string;
  caption: string;
  materials: Material[];
};

export type Exam = {
  id: string;
  name: string;
  caption: string;
  subtests: Subtest[];
};

const sampleQuestions: Question[] = [
  {
    id: "q1",
    prompt:
      "Sebuah toko memberi diskon 20% untuk sebuah tas seharga Rp450.000. Jika pembeli membayar dengan kupon tambahan Rp25.000, berapa yang harus dibayar?",
    choices: [
      { key: "A", text: "Rp315.000" },
      { key: "B", text: "Rp335.000" },
      { key: "C", text: "Rp335.000 setelah pajak" },
      { key: "D", text: "Rp345.000" },
      { key: "E", text: "Rp360.000" },
    ],
    answer: "B",
    explanation: {
      why: "Diskon persentase dihitung lebih dulu, baru potongan nominal dari kupon.",
      steps: [
        "Diskon 20% dari Rp450.000 = Rp90.000.",
        "Harga setelah diskon = Rp450.000 − Rp90.000 = Rp360.000.",
        "Kurangi kupon Rp25.000 → Rp335.000.",
      ],
    },
  },
  {
    id: "q2",
    prompt:
      "Jika 3x + 7 = 2x + 15, maka nilai dari x² − 4 adalah …",
    choices: [
      { key: "A", text: "24" },
      { key: "B", text: "32" },
      { key: "C", text: "48" },
      { key: "D", text: "60" },
      { key: "E", text: "64" },
    ],
    answer: "D",
    explanation: {
      why: "Selesaikan persamaan linear lebih dulu, lalu substitusi ke ekspresi.",
      steps: ["3x − 2x = 15 − 7", "x = 8", "x² − 4 = 64 − 4 = 60"],
    },
  },
  {
    id: "q3",
    prompt:
      "Rata-rata nilai 5 siswa adalah 78. Jika satu siswa dengan nilai 68 keluar, berapa rata-rata nilai siswa yang tersisa?",
    choices: [
      { key: "A", text: "78,5" },
      { key: "B", text: "80,0" },
      { key: "C", text: "80,5" },
      { key: "D", text: "81,0" },
      { key: "E", text: "82,5" },
    ],
    answer: "C",
    explanation: {
      why: "Gunakan total nilai, bukan rata-rata, saat anggota berubah.",
      steps: [
        "Total awal = 5 × 78 = 390.",
        "Total setelah keluar = 390 − 68 = 322.",
        "Rata-rata baru = 322 ÷ 4 = 80,5.",
      ],
    },
  },
  {
    id: "q4",
    prompt:
      "Sebuah mobil menempuh 180 km dalam 2 jam 30 menit. Berapa kecepatan rata-ratanya?",
    choices: [
      { key: "A", text: "62 km/jam" },
      { key: "B", text: "68 km/jam" },
      { key: "C", text: "70 km/jam" },
      { key: "D", text: "72 km/jam" },
      { key: "E", text: "75 km/jam" },
    ],
    answer: "D",
    explanation: {
      why: "Kecepatan rata-rata adalah jarak dibagi waktu dalam satuan yang sama.",
      steps: ["2 jam 30 menit = 2,5 jam.", "180 ÷ 2,5 = 72 km/jam."],
    },
  },
  {
    id: "q5",
    prompt:
      "Perbandingan uang Ani dan Budi adalah 3 : 5. Jika selisih uang mereka Rp120.000, berapa uang Budi?",
    choices: [
      { key: "A", text: "Rp180.000" },
      { key: "B", text: "Rp240.000" },
      { key: "C", text: "Rp280.000" },
      { key: "D", text: "Rp300.000" },
      { key: "E", text: "Rp320.000" },
    ],
    answer: "D",
    explanation: {
      why: "Selisih perbandingan mewakili selisih nilai sebenarnya.",
      steps: [
        "Selisih perbandingan = 5 − 3 = 2 bagian.",
        "1 bagian = Rp120.000 ÷ 2 = Rp60.000.",
        "Uang Budi = 5 × Rp60.000 = Rp300.000.",
      ],
    },
  },
];

export function getQuestions(count = 5): Question[] {
  return sampleQuestions.slice(0, Math.min(count, sampleQuestions.length));
}

const mat = (
  id: string,
  name: string,
  completed: number,
  total: number,
  questionCount = 15,
  minutes = 18,
): Material => ({ id, name, completed, total, questionCount, minutes });

export const exams: Exam[] = [
  {
    id: "skd",
    name: "SKD",
    caption: "CPNS / Kedinasan",
    subtests: [
      {
        id: "twk",
        name: "TWK",
        caption: "Wawasan Kebangsaan",
        materials: [
          mat("nasionalisme", "Nasionalisme", 8, 30),
          mat("integritas", "Integritas", 4, 25),
          mat("bela-negara", "Bela Negara", 11, 30),
          mat("pilar-negara", "Pilar Negara", 2, 20),
        ],
      },
      {
        id: "tiu",
        name: "TIU",
        caption: "Intelegensia Umum",
        materials: [
          mat("penalaran-umum", "Penalaran Umum", 18, 30),
          mat("penalaran-matematika", "Penalaran Matematika", 12, 30),
          mat("pengetahuan-kuantitatif", "Pengetahuan Kuantitatif", 6, 25),
          mat("pemahaman-bacaan", "Pemahaman Bacaan & Menulis", 9, 25),
          mat("pengetahuan-umum", "Pengetahuan & Pemahaman Umum", 3, 20),
          mat("lbe", "LBE", 0, 20),
          mat("lbi", "LBI", 0, 20),
        ],
      },
      {
        id: "tkp",
        name: "TKP",
        caption: "Karakteristik Pribadi",
        materials: [
          mat("pelayanan-publik", "Pelayanan Publik", 14, 30),
          mat("jejaring-kerja", "Jejaring Kerja", 7, 25),
          mat("sosial-budaya", "Sosial Budaya", 5, 25),
          mat("teknologi-informasi", "Teknologi Informasi", 2, 20),
        ],
      },
    ],
  },
  {
    id: "utbk",
    name: "UTBK",
    caption: "Perguruan Tinggi",
    subtests: [
      {
        id: "tps",
        name: "TPS",
        caption: "Tes Potensi Skolastik",
        materials: [
          mat("penalaran-induktif", "Penalaran Induktif", 6, 25),
          mat("penalaran-kuantitatif", "Penalaran Kuantitatif", 4, 25),
        ],
      },
      {
        id: "literasi",
        name: "Literasi",
        caption: "Bahasa & Matematika",
        materials: [
          mat("literasi-indonesia", "Literasi Bahasa Indonesia", 10, 30),
          mat("literasi-inggris", "Literasi Bahasa Inggris", 3, 25),
          mat("penalaran-matematika-utbk", "Penalaran Matematika", 8, 30),
        ],
      },
    ],
  },
  {
    id: "psikotes",
    name: "Psikotes",
    caption: "Seleksi Kerja",
    subtests: [
      {
        id: "kognitif",
        name: "Kognitif",
        caption: "Logika & Angka",
        materials: [
          mat("deret-angka", "Deret Angka", 9, 25),
          mat("logika-gambar", "Logika Gambar", 5, 25),
        ],
      },
      {
        id: "kepribadian",
        name: "Kepribadian",
        caption: "Profil Diri",
        materials: [mat("papi-kostick", "PAPI Kostick", 2, 20)],
      },
    ],
  },
  {
    id: "tpa",
    name: "TPA",
    caption: "Tes Potensi Akademik",
    subtests: [
      {
        id: "verbal",
        name: "Verbal",
        caption: "Kata & Makna",
        materials: [
          mat("sinonim-antonim", "Sinonim & Antonim", 12, 30),
          mat("analogi", "Analogi", 7, 25),
        ],
      },
      {
        id: "numerik",
        name: "Numerik",
        caption: "Angka & Pola",
        materials: [mat("aritmetika", "Aritmetika", 6, 25)],
      },
    ],
  },
  {
    id: "tbi",
    name: "TBI",
    caption: "Tes Bahasa Inggris",
    subtests: [
      {
        id: "structure",
        name: "Structure",
        caption: "Grammar & Written Expression",
        materials: [mat("tenses", "Tenses", 8, 30), mat("clauses", "Clauses", 3, 25)],
      },
      {
        id: "reading",
        name: "Reading",
        caption: "Reading Comprehension",
        materials: [mat("main-idea", "Main Idea", 5, 25)],
      },
    ],
  },
];

export function findExam(examId: string) {
  return exams.find((e) => e.id === examId);
}

export function findSubtest(examId: string, subtestId: string) {
  return findExam(examId)?.subtests.find((s) => s.id === subtestId);
}

export function findMaterial(examId: string, subtestId: string, materialId: string) {
  return findSubtest(examId, subtestId)?.materials.find((m) => m.id === materialId);
}

export const user = {
  name: "Nao",
  target: "PKN STAN",
  streak: 12,
};

export const weekStats = {
  questions: 127,
  accuracy: 82,
  studyTime: "4h 32m",
  days: [
    { label: "M", active: true, intensity: 3 },
    { label: "T", active: true, intensity: 2 },
    { label: "W", active: true, intensity: 4 },
    { label: "T", active: false, intensity: 0 },
    { label: "F", active: true, intensity: 3 },
    { label: "S", active: true, intensity: 1 },
    { label: "S", active: false, intensity: 0 },
  ],
};

export const topicBreakdown = [
  { name: "TIU", accuracy: 82 },
  { name: "TWK", accuracy: 76 },
  { name: "TKP", accuracy: 88 },
];

export const reviewItems = [
  { subtest: "TIU", material: "Penalaran Matematika", count: 3 },
  { subtest: "TWK", material: "Nasionalisme", count: 2 },
  { subtest: "TKP", material: "Pelayanan Publik", count: 3 },
];

export const todaysFocus = {
  examId: "skd",
  subtestId: "tiu",
  materialId: "penalaran-matematika",
  name: "Penalaran Matematika",
  questions: 15,
  minutes: 18,
};

