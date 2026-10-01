// Institution accent layer + appearance preference (local to this browser only).
// Colors live in src/styles.css under [data-institution="..."]; this file holds identity + persistence.
import { useSyncExternalStore } from "react";

export type InstitutionId = "pknstan" | "unpad" | "ui" | "itb";
export type Appearance = "light" | "dark" | "system";

export type Institution = {
  id: InstitutionId;
  short: string;
  name: string;
  /** Swatch for the selector (light-mode accent). */
  swatch: string;
};

export const institutions: Institution[] = [
  { id: "pknstan", short: "PKN STAN", name: "Politeknik Keuangan Negara STAN", swatch: "oklch(0.42 0.12 255)" },
  { id: "unpad", short: "Unpad", name: "Universitas Padjadjaran", swatch: "oklch(0.6 0.17 48)" },
  { id: "ui", short: "UI", name: "Universitas Indonesia", swatch: "oklch(0.78 0.15 88)" },
  { id: "itb", short: "ITB", name: "Institut Teknologi Bandung", swatch: "oklch(0.5 0.17 265)" },
];

export const findInstitution = (id: string | null) => institutions.find((i) => i.id === id) ?? null;

const INST_KEY = "fundamental.institution.v1";
const APPEAR_KEY = "fundamental.appearance.v1";

/** Inline, pre-paint script: applies saved accent + appearance before hydration (no flash). */
export const bootScript = `(function(){try{var d=document.documentElement;var i=localStorage.getItem("${INST_KEY}");if(i)d.setAttribute("data-institution",i);var a=localStorage.getItem("${APPEAR_KEY}")||"light";var dk=a==="dark"||(a==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);d.classList.toggle("dark",dk);}catch(e){}})();`;

type Prefs = { institution: InstitutionId | null; appearance: Appearance };
const serverPrefs: Prefs = { institution: null, appearance: "light" };
let cache: Prefs | null = null;
const listeners = new Set<() => void>();

function read(): Prefs {
  if (cache) return cache;
  try {
    const i = localStorage.getItem(INST_KEY);
    const a = localStorage.getItem(APPEAR_KEY) as Appearance | null;
    cache = {
      institution: findInstitution(i)?.id ?? null,
      appearance: a === "dark" || a === "system" ? a : "light",
    };
  } catch {
    cache = serverPrefs;
  }
  return cache;
}

function applyAppearance(a: Appearance) {
  const dark = a === "dark" || (a === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

function emit() {
  listeners.forEach((l) => l());
}

export function setInstitution(id: InstitutionId | null) {
  cache = { ...read(), institution: id };
  try {
    if (id) localStorage.setItem(INST_KEY, id);
    else localStorage.removeItem(INST_KEY);
  } catch {
    /* storage disabled */
  }
  if (id) document.documentElement.setAttribute("data-institution", id);
  else document.documentElement.removeAttribute("data-institution");
  emit();
}

export function setAppearance(a: Appearance) {
  cache = { ...read(), appearance: a };
  try {
    localStorage.setItem(APPEAR_KEY, a);
  } catch {
    /* storage disabled */
  }
  applyAppearance(a);
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const onScheme = () => {
    if (read().appearance === "system") applyAppearance("system");
  };
  mq.addEventListener("change", onScheme);
  return () => {
    listeners.delete(l);
    mq.removeEventListener("change", onScheme);
  };
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribe, read, () => serverPrefs);
}

export function useInstitution() {
  return findInstitution(usePrefs().institution);
}

