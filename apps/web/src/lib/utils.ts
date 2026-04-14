import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- Cricket helpers (used by markets pages with real API data) ---

const TEAM_FLAGS: Record<string, string> = {
  PAK: "\u{1F1F5}\u{1F1F0}",
  IND: "\u{1F1EE}\u{1F1F3}",
  AUS: "\u{1F1E6}\u{1F1FA}",
  ENG: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  SA: "\u{1F1FF}\u{1F1E6}",
  NZ: "\u{1F1F3}\u{1F1FF}",
  SL: "\u{1F1F1}\u{1F1F0}",
  BAN: "\u{1F1E7}\u{1F1E9}",
  WI: "\u{1F3CF}",
  AFG: "\u{1F1E6}\u{1F1EB}",
  ZIM: "\u{1F1FF}\u{1F1FC}",
  IRE: "\u{1F1EE}\u{1F1EA}",
  SCO: "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
};

export function getTeamFlag(shortName: string): string {
  return TEAM_FLAGS[shortName?.toUpperCase()] || "\u{1F3CF}";
}

export function formatPKR(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (isNaN(n)) return "Rs. 0";
  if (n >= 100000) {
    return `Rs. ${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} Lac`;
  }
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

export function formatCALL(amount: number | string): string {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (isNaN(n)) return "0";
  return n.toLocaleString("en-PK");
}

export function getYesPercentage(yesPool: number | string, noPool: number | string): number {
  const yes = typeof yesPool === "string" ? Number(yesPool) : yesPool;
  const no = typeof noPool === "string" ? Number(noPool) : noPool;
  const total = yes + no;
  if (total === 0) return 50;
  return Math.round((yes / total) * 100);
}

export function timeUntil(dateStr: string): string {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "Now";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}d`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}
