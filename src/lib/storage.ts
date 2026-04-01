import { supabase } from './supabase';

export type DareStatus = 'pending' | 'accepted' | 'chickened' | 'failed' | 'completed' | 'pending_removal' | 'pending_review';

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
  // Dare system fields
  dareId?: string;
  dareStatus?: DareStatus;
  dareStartTime?: number;
  shameReason?: string;
  // Aura
  aura?: number;
  dareProofPhoto?: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number; // 1-5
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
}

export interface DareChallenge {
  id: string;
  text: string;
  durationMs: number; // countdown duration
  difficulty: 'easy' | 'medium' | 'hard';
}

export const DARE_CHALLENGES: DareChallenge[] = [
  { id: 'd1', text: 'Send your crush a voice note saying "thinking of you" — screenshot their reply', durationMs: 30 * 60 * 1000, difficulty: 'hard' },
  { id: 'd2', text: 'Change your WhatsApp status to your roast text for 1 hour — screenshot it', durationMs: 60 * 60 * 1000, difficulty: 'medium' },
  { id: 'd3', text: 'Text your ex "you were right" with no context — screenshot their reaction', durationMs: 45 * 60 * 1000, difficulty: 'hard' },
  { id: 'd4', text: 'Post your most embarrassing photo on your story for 30 mins — screenshot', durationMs: 35 * 60 * 1000, difficulty: 'medium' },
  { id: 'd5', text: 'Call a friend and read your roast out loud to them — video proof', durationMs: 20 * 60 * 1000, difficulty: 'easy' },
  { id: 'd6', text: 'Text your group chat your full roast result — screenshot it', durationMs: 15 * 60 * 1000, difficulty: 'easy' },
  { id: 'd7', text: 'Send your mom a "we need to talk" text — wait 5 minutes — screenshot her panic', durationMs: 10 * 60 * 1000, difficulty: 'hard' },
  { id: 'd8', text: 'Post a selfie with caption: The oracle has spoken about me 💀 — screenshot it', durationMs: 25 * 60 * 1000, difficulty: 'medium' },
];

export function getRandomDare(): DareChallenge {
  return DARE_CHALLENGES[Math.floor(Math.random() * DARE_CHALLENGES.length)];
}

const FIRST_USE_KEY = "futurescan_first_use";
const EXPIRY_HOURS = 14;

export function getFirstUseTimestamp(): number | null {
  const val = localStorage.getItem(FIRST_USE_KEY);
  return val ? parseInt(val, 10) : null;
}

const AURA_KEY = "futurescan_aura";

export function getAura(): number {
  const val = localStorage.getItem(AURA_KEY);
  return val ? parseInt(val, 10) : 100;
}

export function addAura(points: number): number {
  const current = getAura();
  const newAura = current + points;
  localStorage.setItem(AURA_KEY, newAura.toString());
  window.dispatchEvent(new Event("auraChanged"));
  return newAura;
}

export function getAuraRank(points: number): { label: string; color: string; emoji: string } {
  if (points >= 200) return { label: 'Cosmic Sigma', color: '#FFD700', emoji: '👑' };
  if (points >= 150) return { label: 'Aura Intact', color: '#C084FC', emoji: '✨' };
  if (points >= 80)  return { label: 'Aura Cracking', color: '#FB923C', emoji: '😬' };
  if (points >= 30)  return { label: 'Aura Shattered', color: '#F87171', emoji: '💔' };
  if (points >= 0)   return { label: 'Aura Deleted', color: '#6B7280', emoji: '💀' };
  return { label: 'Negative Aura Entity', color: '#1F2937', emoji: '🕳️' };
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

export async function updateEntryDare(
  id: string,
  updates: { dareId?: string; dareStatus?: DareStatus; dareStartTime?: number; shameReason?: string; aura?: number; dareProofPhoto?: string; }
) {
  const { error } = await supabase
    .from('entries')
    .update(updates)
    .eq('id', id);
  if (error) console.error("Error updating dare status:", error);
}

export async function updateEntry(id: string, updates: Partial<ScanEntry>) {
  const { error } = await supabase
    .from('entries')
    .update(updates)
    .eq('id', id);
  if (error) console.error("Error updating entry:", error);
}

export async function getShameEntries(): Promise<ScanEntry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .in('dareStatus', ['chickened', 'failed'])
    .order('timestamp', { ascending: false });
  if (error) { console.error("Error fetching shame entries:", error); return []; }
  return data || [];
}

export async function getPendingDares(): Promise<ScanEntry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .in('dareStatus', ['pending_review', 'pending_removal'])
    .order('timestamp', { ascending: false });
  if (error) { console.error("Error fetching pending dares:", error); return []; }
  return data || [];
}

export async function getTopAuraEntries(limit = 10): Promise<ScanEntry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .gt('aura', 0)
    .order('aura', { ascending: false })
    .limit(limit);
  if (error) { console.error("Error fetching top aura:", error); return []; }
  return data || [];
}

export async function getEntryById(id: string): Promise<ScanEntry | null> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return data;
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

  // Prepend the score as a fake AI header (timer removed)
  const finalText = `[ SYSTEM RATING: ${percentLabel} ]\n\n${rawRoast}`;

  return { text: finalText, percentage: percent };
}

const UPI_STORAGE_KEY = 'admin_upi_id';
const IG_STORAGE_KEY = 'admin_ig_id';

// Sync getters use localStorage as cache (set by admin on their device or loaded from Supabase)
export function getAdminUpiId(): string {
  return localStorage.getItem(UPI_STORAGE_KEY) || 'admin@okicici'; // Hardcoded default
}

export function setAdminUpiId(upiId: string): void {
  localStorage.setItem(UPI_STORAGE_KEY, upiId);
  // Also persist to Supabase so all users see it
  supabase.from('config').upsert({ key: 'admin_upi_id', value: upiId }).then(() => {});
}

export function getAdminIgAccount(): string {
  return localStorage.getItem(IG_STORAGE_KEY) || '@itsnextgenfounder'; // Hardcoded default
}

export function setAdminIgAccount(igHandle: string): void {
  localStorage.setItem(IG_STORAGE_KEY, igHandle);
  // Also persist to Supabase so all users see it
  supabase.from('config').upsert({ key: 'admin_ig_id', value: igHandle }).then(() => {});
}

// Call this on app load to sync admin config from Supabase to localStorage
export async function syncAdminConfig(): Promise<void> {
  const { data } = await supabase.from('config').select('key, value').in('key', ['admin_upi_id', 'admin_ig_id']);
  if (data) {
    data.forEach((row: { key: string; value: string }) => {
      localStorage.setItem(row.key, row.value);
    });
  }
}

export async function getReviews(): Promise<Review[]> {
  const { data, error } = await supabase.from('config').select('value').eq('key', 'platform_reviews').single();
  if (data?.value && !error) {
    try { return JSON.parse(data.value); } catch(e) { return []; }
  }
  return [];
}

export async function addReview(review: Review): Promise<void> {
  const reviews = await getReviews();
  reviews.push(review);
  await supabase.from('config').upsert({ key: 'platform_reviews', value: JSON.stringify(reviews) });
}

export async function updateReviewStatus(id: string, status: 'approved' | 'rejected'): Promise<void> {
  const reviews = await getReviews();
  const index = reviews.findIndex(r => r.id === id);
  if (index !== -1) {
    reviews[index].status = status;
    await supabase.from('config').upsert({ key: 'platform_reviews', value: JSON.stringify(reviews) });
  }
}

export async function deleteReview(id: string): Promise<void> {
  const reviews = await getReviews();
  const newReviews = reviews.filter(r => r.id !== id);
  await supabase.from('config').upsert({ key: 'platform_reviews', value: JSON.stringify(newReviews) });
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
