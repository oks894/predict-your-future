import { supabase } from './supabase';

export interface ScanEntry {
  id: string;
  name: string;
  age: number;
  crushName: string;
  crushAge: number;
  facePhoto: string;
  crushPhoto?: string;
  roastText: string;
  timestamp: number;
  scanType?: string;
  roastPercentage?: number;
}

const FIRST_USE_KEY = "futurescan_first_use";
const EXPIRY_HOURS = 14;

export function getFirstUseTimestamp(): number | null {
  const val = localStorage.getItem(FIRST_USE_KEY);
  return val ? parseInt(val, 10) : null;
}

export function setFirstUseTimestamp() {
  if (!getFirstUseTimestamp()) {
    localStorage.setItem(FIRST_USE_KEY, Date.now().toString());
  }
}

export function isExpired(): boolean {
  const first = getFirstUseTimestamp();
  if (!first) return false;
  return Date.now() - first > EXPIRY_HOURS * 60 * 60 * 1000;
}

export function getHoursRemaining(): number {
  const first = getFirstUseTimestamp();
  if (!first) return EXPIRY_HOURS;
  const elapsed = (Date.now() - first) / (60 * 60 * 1000);
  return Math.max(0, Math.round((EXPIRY_HOURS - elapsed) * 10) / 10);
}

export async function getEntries(): Promise<ScanEntry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error("Error fetching entries:", error);
    return [];
  }
  return data || [];
}

export async function addEntry(entry: ScanEntry) {
  const { error } = await supabase.from('entries').insert([entry]);
  if (error) {
    console.error("Error inserting entry:", error);
  }
}

export async function clearEntries() {
  const { error } = await supabase
    .from('entries')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
    
  if (error) {
    console.error("Error clearing entries:", error);
  }
}

export async function deleteEntry(id: string) {
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error("Error deleting entry:", error);
  }
}

// ─────────────────────────────────────────────────────────────────────
// 🔥 DYNAMIC GENERATOR: 300+ COMBOS
// ─────────────────────────────────────────────────────────────────────

const HARD_OPENERS = [
  `{N}, let's just rip the band-aid off…`,
  `Listen closely {N}, because clearly nobody else tells you the truth…`,
  `We fed your data to our most advanced AI and it started laughing.`,
  `Not gonna lie {N}, this scan was physically painful to process.`,
  `{N}, you typed that in with way too much confidence.`,
  `Even the algorithm feels bad for you right now.`,
  `Bro {N} really thought they had a chance 💀.`,
  `I ran this simulation 14 billion times. You failed every single one.`,
  `Look {N}, someone has to be honest with you…`,
  `{C} would rather stare at a blank wall than look your way.`,
];

const FUTURE_BODIES = [
  `Your vibe is basically the human equivalent of a skipped YouTube ad.`,
  `You dress like a random spawned NPC and flirt like a low-battery smoke detector.`,
  `Your charisma level is stuck in airplane mode. Forever.`,
  `If personality was a currency, you'd be in crippling debt.`,
  `You're out here projecting main character energy but acting like an extra's understudy.`,
  `You give off the exact energy of a "seen 3 weeks ago" message.`,
  `Your entire aesthetic can be best described as "default settings."`,
  `You're emotionally buffering and nobody is waiting for you to load.`,
  `You have the romantic appeal of a wet sock on a Monday morning.`,
  `Even your guardian angel is tired of watching you make these choices.`,
  `It's giving "chronically online but zero social skills in real life."`,
  `You're fighting demons, but it looks like the demons are winning easily.`,
];

const LOVE_BODIES = [
  `You and {C}? Stop. You're not a red flag, you're the whole parade.`,
  `The only chemistry here is your phone overheating while you stalk their story.`,
  `{C} sees you as a younger sibling's annoying friend. At best.`,
  `You're romantically invested in a person who doesn't even know your last name.`,
  `This isn't love, you're just bored and delusional. 🤡`,
  `{C}'s standards called. They said "{N} is exactly what we are avoiding."`,
  `You're building castles on texts they haven't even read yet.`,
  `If this relationship was a stock, Wall Street would warn against it.`,
  `It's giving "situationship with my own imagination."`,
  `You're chasing someone who wouldn't cross the street to give you WiFi.`,
  `Your chances with {C} are lower than my battery percentage.`,
  `The match probability is sitting at a solid Error 404: Hope Not Found.`,
  `You two belong in different galaxies, emotionally and physically.`,
  `Even autocorrect tries to stop you when you type {C}'s name.`,
];

const HARD_CLOSERS = [
  `Please reconsider all your life choices. 🛑`,
  `Touch grass immediately. 🌿`,
  `Self-awareness is free. Use it. 🪞`,
  `Do better. Or at least try to. 📉`,
  `Just log out for me real quick. 💻❌`,
  `Respectfully, seek professional help. 🩺`,
  `Therapy is calling. Pick up the phone. 📞`,
  `The fact that you believed this would be positive is tragic. 🎭`,
  `Anyway, good luck with all... that. 😬`,
  `I'd say there's plenty of fish in the sea, but you can't even fish. 🎣`,
];

export function getTier(percentage: number): string {
  if (percentage >= 98) return "Legendary 💀";
  if (percentage >= 95) return "Diamond Cooked 💎";
  if (percentage >= 90) return "Platinum NPC 🏆";
  if (percentage >= 85) return "Gold Clown 🤡";
  if (percentage >= 80) return "Silver Delusional 🥈";
  return "Bronze Embarrassment 🥉";
}

export function generateGenZRoast(scanType: 'future' | 'love', name: string, crushName: string): { text: string, percentage: number } {
  // Select components randomly
  const opener = HARD_OPENERS[Math.floor(Math.random() * HARD_OPENERS.length)];
  const bodies = scanType === 'future' ? FUTURE_BODIES : LOVE_BODIES;
  const body = bodies[Math.floor(Math.random() * bodies.length)];
  const closer = HARD_CLOSERS[Math.floor(Math.random() * HARD_CLOSERS.length)];

  let rawRoast = `${opener}\n\n${body}\n\n${closer}`;
  
  // Replace tokens
  rawRoast = rawRoast.replace(/\{N\}/g, name).replace(/\{C\}/g, crushName);

  // Generate harsh percentages
  let percent = 0;
  let percentLabel = "";
  
  if (scanType === 'love') {
    // Brutal love percentages (high delusion rating)
    percent = Math.floor(Math.random() * 20) + 80; // 80% to 99%
    percentLabel = `${percent}% Delusional Level`;
  } else {
    // Brutal future percentages (high cringe/failure rating)
    percent = Math.floor(Math.random() * 30) + 70; // 70% to 99%
    percentLabel = `${percent}% Certified Cringe`;
  }

  const timerString = `⏳ Ex will text in: ${Math.floor(Math.random() * 60) + 1} days, ${Math.floor(Math.random() * 24)} hrs`;

  // Prepend the score as a fake AI header
  const finalText = `[ SYSTEM RATING: ${percentLabel} ]\n\n${rawRoast}\n\n${timerString}`;

  return { text: finalText, percentage: percent };
}

export function exportToCSV(entries: ScanEntry[]): void {
  const headers = ["#", "Type", "Roast%", "Name", "Age", "Crush Name", "Crush Age", "Roast", "Time"];
  const rows = entries.map((e, i) => [
    i + 1,
    e.scanType || "future",
    e.roastPercentage || 0,
    e.name,
    e.age,
    e.crushName,
    e.crushAge,
    `"${e.roastText.replace(/"/g, '""')}"`,
    new Date(e.timestamp).toLocaleString(),
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "predictyourfuture_data.csv";
  a.click();
  URL.revokeObjectURL(url);
}
