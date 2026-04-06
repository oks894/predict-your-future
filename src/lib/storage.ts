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

const BAD_OPENERS = [
  `{N}, let's just rip the band-aid off…`,
  `Listen closely {N}, because clearly nobody else tells you the truth…`,
  `We fed your data to our most advanced AI and it started laughing.`,
  `Not gonna lie {N}, this scan was physically painful to process.`,
];

const BAD_BODIES = [
  `You and {C}? Stop. You're not a red flag, you're the whole parade.`,
  `The only chemistry here is your phone overheating while you stalk their story.`,
  `{C} sees you as a younger sibling's annoying friend. At best.`,
  `You're romantically invested in a person who doesn't even know your last name.`,
  `This isn't love, you're just bored and delusional. 🤡`,
];

const BAD_CLOSERS = [
  `Please reconsider all your life choices. 🛑`,
  `Touch grass immediately. 🌿`,
  `Self-awareness is free. Use it. 🪞`,
];

const GOOD_OPENERS = [
  `{N}, the algorithm doesn't lie. I am genuinely impressed…`,
  `Stop scrolling {N}. I just ran the numbers and this is crazy.`,
  `Warning: Insanely high chemistry detected.`,
];

const GOOD_BODIES = [
  `You and {C} are mathematically destined for each other. The facial symmetry alignment here is insane.`,
  `This isn't a joke anymore. {C} is literally your soulmate based on our 14 billion timeline scan.`,
  `Your vibes match flawlessly. It's giving main character couple energy.`,
  `The algorithm is shipping you two so hard right now. This is a rare 1-in-a-million match.`,
];

const GOOD_CLOSERS = [
  `Stop overthinking and just ask {C} out immediately. Do it now. 💍`,
  `Slide into {C}'s DMs right this second. The math is on your side. 💌`,
  `You literally have nothing to lose, go get {C}! 🔥`,
];

export function getTier(percentage: number): string {
  if (percentage >= 90) return "Destined Soulmates 💍";
  if (percentage >= 75) return "High Chemistry 🔥";
  if (percentage >= 50) return "Green Flag 🟢";
  if (percentage >= 30) return "Friendzone Material 🧊";
  if (percentage >= 15) return "Silver Delusional 🥈";
  return "Bronze Clown 🤡";
}

export function generateGenZRoast(scanType: 'future' | 'love', name: string, crushName: string): { text: string, percentage: number } {
  const percent = Math.floor(Math.random() * 100);
  
  let rawRoast = "";
  let percentLabel = `${percent}% Compatibility Detected`;

  if (percent > 50) {
    const opener = GOOD_OPENERS[Math.floor(Math.random() * GOOD_OPENERS.length)];
    const body = GOOD_BODIES[Math.floor(Math.random() * GOOD_BODIES.length)];
    const closer = GOOD_CLOSERS[Math.floor(Math.random() * GOOD_CLOSERS.length)];
    rawRoast = `${opener} ${body} ${closer}`;
  } else {
    const opener = BAD_OPENERS[Math.floor(Math.random() * BAD_OPENERS.length)];
    const body = BAD_BODIES[Math.floor(Math.random() * BAD_BODIES.length)];
    const closer = BAD_CLOSERS[Math.floor(Math.random() * BAD_CLOSERS.length)];
    rawRoast = `${opener} ${body} ${closer}`;
    percentLabel = `${percent}% Delusional Rating`;
  }
  
  // Replace tokens
  rawRoast = rawRoast.replace(/\{N\}/g, name || 'bro');
  if (crushName) {
    rawRoast = rawRoast.replace(/\{C\}/g, crushName);
  } else {
    rawRoast = rawRoast.replace(/\{C\}/g, 'literally anyone');
  }

  // Prepend the score as a fake AI header
  const finalText = `[ AI VERDICT: ${percentLabel} ]\n\n${rawRoast}`;

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
