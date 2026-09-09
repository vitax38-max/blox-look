/**
 * Helper utilities for Roblox Avatar Searcher
 */

export function formatRobux(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "Off Sale";
  if (amount === 0) return "Free";
  return `${amount.toLocaleString()} R$`;
}

export function formatJoinDate(dateString?: string): { formatted: string; yearsAgo: string } {
  if (!dateString) return { formatted: "Unknown", yearsAgo: "" };
  try {
    const d = new Date(dateString);
    const formatted = d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const years = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25));
    const yearsAgo = years > 0 ? `${years} ${years === 1 ? "year" : "years"} ago` : "Less than a year ago";
    return { formatted, yearsAgo };
  } catch {
    return { formatted: dateString, yearsAgo: "" };
  }
}

export function getRobloxCatalogUrl(assetId: number): string {
  return `https://www.roblox.com/catalog/${assetId}`;
}

export function getRobloxProfileUrl(userId: number): string {
  return `https://www.roblox.com/users/${userId}/profile`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

export const POPULAR_CREATORS = [
  { name: "Builderman", id: 156, tag: "Roblox CEO & Founder" },
  { name: "Roblox", id: 1, tag: "Official Roblox" },
  { name: "Stickmasterluke", id: 80506, tag: "Classic Developer" },
  { name: "KreekCraft", id: 140259850, tag: "Top Creator" },
  { name: "Flamingo", id: 45787405, tag: "Content Creator" },
  { name: "Denis", id: 102434690, tag: "YouTuber" },
  { name: "SharkBlox", id: 130985223, tag: "Roblox News" },
  { name: "LeahAshe", id: 75730310, tag: "Fashion & Roleplay" },
];

/**
 * 100% Filter-Safe Roblox dictionary words.
 * Roblox text filter censors numbers, dashes, and synthetic alphanumeric codes (e.g. "blox-verify-1234").
 * Common simple dictionary words are NEVER tagged or hash-tagged (###) by Roblox.
 */
export const FILTER_SAFE_WORDS = [
  "apple", "banana", "orange", "grape", "cherry", "lemon", "cookie",
  "pizza", "waffle", "rocket", "dragon", "castle", "knight", "wizard", "tiger",
  "panda", "falcon", "guitar", "piano", "silver", "golden", "diamond", "crystal",
  "cosmic", "ocean", "forest", "island", "river", "cloud", "winter", "summer",
  "purple", "yellow", "emerald", "ruby", "sparkle", "thunder", "bacon", "bloxy",
  "builder", "legend", "arcade", "pixel", "bubble", "galaxy", "shield", "compass"
];

export function generateSafeVerificationPhrase(wordCount: number = 4): string {
  const pool = [...FILTER_SAFE_WORDS];
  const selected: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    selected.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return selected.join(" ");
}

