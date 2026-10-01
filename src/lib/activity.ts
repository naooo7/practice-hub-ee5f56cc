// Local-first activity store (this device/browser only).
// Shape mirrors future backend tables: `sessions` and `attempts`.
import { useSyncExternalStore } from "react";

export type Attempt = {
  id: string;
  sessionId: string;
  examId: string;
  subtestId: string;
  materialId: string;
  materialName: string;
  questionId: string;
  selected: string;
  correct: boolean;
  answeredAt: string; // ISO
  durationMs: number;
};

export type StudySession = {
  id: string;
  examId: string;
  subtestId: string;
  materialId: string;
  materialName: string;
  mode: string;
  startedAt: string;
  endedAt: string | null;
};

export type ActivityData = { version: 1; sessions: StudySession[]; attempts: Attempt[] };

const KEY = "fundamental.activity.v1";
const empty: ActivityData = { version: 1, sessions: [], attempts: [] };
let cache: ActivityData | null = null;
const listeners = new Set<() => void>();

function read(): ActivityData {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    cache = raw ? { ...empty, ...JSON.parse(raw) } : empty;
  } catch {
    cache = empty;
  }
  return cache!;
}

function write(next: ActivityData) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full / disabled */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

/** Returns null until hydrated on the client. */
export function useActivity(): ActivityData | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function startSession(s: Omit<StudySession, "id" | "startedAt" | "endedAt">): string {
  const session: StudySession = { ...s, id: uid(), startedAt: new Date().toISOString(), endedAt: null };
  const d = read();
  write({ ...d, sessions: [...d.sessions, session] });
  return session.id;
}

export function recordAttempt(a: Omit<Attempt, "id" | "answeredAt">) {
  const d = read();
  write({ ...d, attempts: [...d.attempts, { ...a, id: uid(), answeredAt: new Date().toISOString() }] });
}

export function endSession(id: string) {
  const d = read();
  write({
    ...d,
    sessions: d.sessions.map((s) => (s.id === id && !s.endedAt ? { ...s, endedAt: new Date().toISOString() } : s)),
  });
}

export function clearActivity() {
  write(empty);
}

// ---------- derived stats ----------

export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function formatDuration(ms: number) {
  const totalSec = Math.round(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

export function summarize(attempts: Attempt[]) {
  const total = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;
  const timeMs = attempts.reduce((s, a) => s + a.durationMs, 0);
  return { total, correct, accuracy: total ? Math.round((correct / total) * 100) : 0, timeMs };
}

/** Last 7 days ending today (Mon–Sun labels by actual weekday). */
export function weekActivity(attempts: Attempt[], now = new Date()) {
  const labels = ["S", "M", "T", "W", "T", "F", "S"];
  const days = [] as { key: string; label: string; count: number; isToday: boolean }[];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push({ key: dayKey(d), label: labels[d.getDay()]!, count: 0, isToday: i === 0 });
  }
  const byKey = new Map(days.map((d) => [d.key, d]));
  const inWeek: Attempt[] = [];
  for (const a of attempts) {
    const day = byKey.get(dayKey(new Date(a.answeredAt)));
    if (day) {
      day.count++;
      inWeek.push(a);
    }
  }
  return { days, attempts: inWeek };
}

export function streak(attempts: Attempt[], now = new Date()) {
  const active = new Set(attempts.map((a) => dayKey(new Date(a.answeredAt))));
  const d = new Date(now);
  if (!active.has(dayKey(d))) d.setDate(d.getDate() - 1); // today not yet done doesn't break it
  let n = 0;
  while (active.has(dayKey(d))) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/** Questions whose most recent attempt was incorrect, grouped by material. */
export function needsReview(attempts: Attempt[]) {
  const latest = new Map<string, Attempt>();
  for (const a of attempts) latest.set(`${a.examId}/${a.subtestId}/${a.materialId}/${a.questionId}`, a);
  const groups = new Map<string, { examId: string; subtestId: string; materialId: string; material: string; count: number }>();
  for (const a of latest.values()) {
    if (a.correct) continue;
    const k = `${a.examId}/${a.subtestId}/${a.materialId}`;
    const g = groups.get(k) ?? { examId: a.examId, subtestId: a.subtestId, materialId: a.materialId, material: a.materialName, count: 0 };
    g.count++;
    groups.set(k, g);
  }
  return [...groups.values()];
}

export function bySubtest(attempts: Attempt[]) {
  const m = new Map<string, Attempt[]>();
  for (const a of attempts) m.set(a.subtestId, [...(m.get(a.subtestId) ?? []), a]);
  return [...m.entries()].map(([subtestId, list]) => ({ subtestId, ...summarize(list) }));
}

