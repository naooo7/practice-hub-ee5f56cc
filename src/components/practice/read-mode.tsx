import { useState } from "react";
import { BookOpen, Languages, Newspaper, PenLine, SpellCheck, Type } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardGrid, SelectCard, StepHeader } from "./select-card";

type Article = { id: string; title: string; minutes: number; body: string[]; quiz?: { q: string; options: string[]; answer: number } };
type Topic = { id: string; name: string; description: string; icon: LucideIcon; articles: Article[] };

const topics: Topic[] = [
  { id: "english-reading", name: "English Reading", description: "Short passages to build fluency", icon: Languages, articles: [
    { id: "context", title: "Understanding Context", minutes: 4, body: ["Words rarely carry meaning alone. The sentences around a word — its context — tell you which meaning the writer intends.", "When you meet an unfamiliar word, read the full sentence and the one after it. Look for definitions, examples, or contrasts signalled by words like but, however, and unlike.", "With practice, you'll guess meanings accurately without stopping to use a dictionary."], quiz: { q: "Which word often signals a contrast clue?", options: ["Because", "However", "Also", "Then"], answer: 1 } },
    { id: "skimming", title: "Skimming vs Scanning", minutes: 3, body: ["Skimming means reading quickly to catch the main idea. Scanning means searching for one specific detail, like a date or name.", "In exams, skim the passage first, then scan when a question asks for a specific fact."] },
  ]},
  { id: "vocabulary", name: "Vocabulary", description: "Word families and usage", icon: Type, articles: [
    { id: "roots", title: "Learning Words Through Roots", minutes: 4, body: ["Many English words share Latin or Greek roots. Knowing that 'bio' means life unlocks biology, biography, and antibiotic.", "Collect roots in a notebook and add new words to each family as you meet them."], quiz: { q: "The root 'bio' means…", options: ["Water", "Life", "Earth", "Sound"], answer: 1 } },
  ]},
  { id: "grammar", name: "Grammar", description: "Clear explanations, simple rules", icon: SpellCheck, articles: [
    { id: "tenses", title: "Present Perfect in Plain Words", minutes: 5, body: ["Use the present perfect (have/has + past participle) for past actions connected to now: I have finished my homework.", "Use the simple past for finished time periods: I finished it yesterday."] },
  ]},
  { id: "bahasa-indonesia", name: "Bahasa Indonesia", description: "Kaidah dan kebahasaan", icon: BookOpen, articles: [
    { id: "kata-baku", title: "Mengenal Kata Baku", minutes: 4, body: ["Kata baku adalah kata yang sesuai dengan kaidah dan KBBI. Contoh: apotek, bukan apotik; risiko, bukan resiko.", "Biasakan memeriksa KBBI saat ragu, terutama dalam tulisan resmi."], quiz: { q: "Mana yang baku?", options: ["Resiko", "Risiko", "Resico", "Risico"], answer: 1 } },
  ]},
  { id: "eyd", name: "EYD", description: "Ejaan yang disempurnakan", icon: PenLine, articles: [
    { id: "di", title: "Penulisan \"di\" yang Tepat", minutes: 3, body: ["\"di\" sebagai kata depan ditulis terpisah: di rumah, di sekolah.", "\"di\" sebagai awalan kata kerja ditulis serangkai: dibaca, ditulis."] },
  ]},
  { id: "spok", name: "SPOK", description: "Struktur kalimat", icon: PenLine, articles: [
    { id: "spok-dasar", title: "Subjek, Predikat, Objek, Keterangan", minutes: 4, body: ["Kalimat \"Adik membaca buku di kamar\" terdiri atas S (Adik), P (membaca), O (buku), dan K (di kamar).", "Subjek adalah pelaku; predikat menyatakan tindakan atau keadaan."] },
  ]},
  { id: "kalimat-efektif", name: "Kalimat Efektif", description: "Ringkas, jelas, tepat", icon: PenLine, articles: [
    { id: "hemat", title: "Prinsip Kehematan", minutes: 3, body: ["Kalimat efektif menghindari kata berlebihan. \"Para hadirin-hadirin\" cukup ditulis \"para hadirin\".", "Hindari pengulangan subjek yang tidak perlu."] },
  ]},
  { id: "articles", name: "Articles", description: "Bacaan panjang pilihan", icon: Newspaper, articles: [
    { id: "belajar", title: "Cara Belajar yang Bertahan Lama", minutes: 6, body: ["Pengulangan berjarak (spaced repetition) membantu ingatan bertahan lebih lama dibanding belajar semalam suntuk.", "Menguji diri sendiri — bukan sekadar membaca ulang — adalah salah satu cara paling efektif untuk belajar."] },
  ]},
  { id: "comprehension", name: "Reading Comprehension", description: "Passages with questions", icon: BookOpen, articles: [
    { id: "main-idea", title: "Finding the Main Idea", minutes: 4, body: ["The main idea is the point the whole passage supports. It's often in the first or last sentence of a paragraph.", "Ask: what is the author mostly saying about the topic?"], quiz: { q: "Where is the main idea often found?", options: ["Only in the title", "First or last sentence", "In the middle word", "In footnotes"], answer: 1 } },
  ]},
];

/** Read: a library. Reading is primary; comprehension check is optional. */
export function ReadMode() {
  const [topicId, setTopicId] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const topic = topics.find((t) => t.id === topicId);
  const article = topic?.articles.find((a) => a.id === articleId);

  if (!topic)
    return (
      <>
        <StepHeader trail={["Read"]} title="Pilih topik" caption="Perpustakaan bacaan singkat." />
        <CardGrid cols={3}>
          {topics.map((t) => <SelectCard key={t.id} title={t.name} description={t.description} icon={t.icon} meta={`${t.articles.length}`} onClick={() => setTopicId(t.id)} />)}
        </CardGrid>
      </>
    );

  if (!article)
    return (
      <>
        <StepHeader trail={["Read", topic.name]} title={topic.name} caption={`${topic.articles.length} bacaan`} onBack={() => setTopicId(null)} />
        <div className="divide-y divide-border border-y border-border">
          {topic.articles.map((a) => (
            <button key={a.id} type="button" onClick={() => { setArticleId(a.id); setPicked(null); }} className="tap flex w-full items-center justify-between gap-4 py-4 text-left hover:text-primary">
              <span className="min-w-0">
                <span className="block text-[16px] font-semibold">{a.title}</span>
                <span className="mt-0.5 block truncate text-[13px] text-muted-foreground">{a.body[0]}</span>
              </span>
              <span className="shrink-0 text-[12.5px] text-muted-foreground">{a.minutes} min</span>
            </button>
          ))}
        </div>
      </>
    );

  return (
    <article className="mx-auto max-w-[620px]">
      <StepHeader trail={["Read", topic.name]} title="" onBack={() => setArticleId(null)} />
      <h2 className="-mt-2 text-[26px] font-semibold leading-tight tracking-tight">{article.title}</h2>
      <p className="mt-1 text-[13px] text-muted-foreground">{topic.name} · {article.minutes} menit baca</p>
      <div className="mt-6 space-y-4 text-[16.5px] leading-8">
        {article.body.map((p, k) => <p key={k}>{p}</p>)}
      </div>
      {article.quiz && (
        <section className="mt-8 rounded-lg border border-border bg-surface p-4 shadow-soft">
          <p className="label-xs">Cek pemahaman · opsional</p>
          <p className="mt-2 text-[15px] font-semibold">{article.quiz.q}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {article.quiz.options.map((o, k) => (
              <button key={o} type="button" disabled={picked !== null} onClick={() => setPicked(k)}
                className={cn("tap rounded-lg border-2 px-3.5 py-2.5 text-left text-[14px]",
                  picked === null ? "border-border hover:border-border-strong" : k === article.quiz!.answer ? "border-success bg-success/10" : k === picked ? "border-destructive bg-destructive/10" : "border-border opacity-50")}>
                {o}
              </button>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

