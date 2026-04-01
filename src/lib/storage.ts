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
}

const STORAGE_KEY = "futurescan_entries";
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

// ─────────────────────────────────────────────────────────────────────
// 🔥 DYNAMIC ROAST ENGINE — 100+ roasts with smart personalization
// ─────────────────────────────────────────────────────────────────────

// Detect "vibe" based on name patterns and age
function detectVibe(name: string, age: number): string {
  const n = name.toLowerCase();
  if (age < 14) return "baby";
  if (age < 18) return "teen";
  if (age > 40) return "uncle";
  if (age > 30) return "midlife";
  if (n.length <= 3) return "tryhard";
  if (n.length > 10) return "overconfident";
  if (/[aeiou]{3,}/.test(n)) return "dramatic";
  if (/^[a-z]$/.test(n.charAt(0)) && n.charAt(0) === n.charAt(0).toUpperCase()) return "basic";
  return "lost";
}

// Random fake AI confidence line
function fakeAILine(name: string, crushName: string): string {
  const lines = [
    `⚠️ AI Confidence Level: 0.03% (rounding error)`,
    `📊 Compatibility Score: -7 out of 10`,
    `🧠 Neural network checked twice… still no.`,
    `🤖 AI Analysis: "${name}" and "${crushName}" exist in different emotional galaxies.`,
    `📡 Signal strength between you two: weaker than airport WiFi.`,
    `🔬 Our algorithm ran 14 billion simulations. You weren't in any of them.`,
    `⚙️ Processing complete. Result: catastrophic mismatch.`,
    `🧪 Chemistry test result: noble gas — zero reactions detected.`,
    `🛰️ Satellite scan confirms: ${crushName} is emotionally unreachable.`,
    `📉 Match probability: Error 404 — Hope Not Found.`,
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

// Random "pause" / "double-check" line
function pauseLine(name: string): string {
  const lines = [
    `I checked twice… still no.`,
    `Hold on, let me rerun the scan... Nope, same result.`,
    `Wait — actually... no, never mind. It's bad.`,
    `Listen ${name}, let's be honest…`,
    `${name}, I'm not gonna sugarcoat this…`,
    `We gave you a second chance. The AI didn't.`,
    `The algorithm whispered: "yikes."`,
    `We consulted 3 oracles. All of them laughed.`,
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

// ─── THE 100 ROAST TEMPLATES ───
// {N} = user name, {A} = user age, {C} = crush name, {CA} = crush age
const ROAST_TEMPLATES: string[] = [
  // 1-10
  `{N} entered {C}'s name like it's a wishlist item 💀`,
  `{N}, you really thought this was gonna say "perfect match"? Be serious.`,
  `{N}, your love life loading slower than your WiFi.`,
  `{N} typed {C}'s name with hope… bold of you.`,
  `This isn't compatibility, {N}. This is a reality check.`,
  `Even autocorrect tried to fix {N}'s chances with {C}.`,
  `{C} saw {N} and chose "skip ad."`,
  `{N}, you're not a red flag, you're the whole parade. 🚩🚩🚩`,
  `{N}'s out here applying for a position that was never open.`,
  `The only connection here is {N}'s delusion.`,

  // 11-20
  `{C}'s standards called… they said "{N} not found."`,
  `This isn't love, {N}. It's a one-sided subscription.`,
  `{N} is emotionally invested in someone who doesn't know their last name.`,
  `{N} said "maybe we're meant to be" — based on what exactly?? 🤡`,
  `Even AI couldn't hallucinate a chance for {N}.`,
  `{N} brought hope into a situation that required logic.`,
  `This match has the same energy as "seen 2 years ago." 👀`,
  `{N}'s fighting for someone who wouldn't fight their notification.`,
  `This isn't a crush, {N}. It's a misunderstanding.`,
  `{N} didn't fall in love, they tripped and stayed down. 💀`,

  // 21-30
  `{C} has more chemistry with their charger than with {N}.`,
  `{N} typed their name like it carries weight. It doesn't.`,
  `The only spark here is {N}'s phone overheating. 🔥📱`,
  `{N} is the "just a friend" starter pack.`,
  `Even {N}'s reflection would reject this idea.`,
  `{N}'s not in {C}'s league. Not even in the same sport. 🏟️`,
  `This relationship exists only in {N}'s notes app.`,
  `{C} would swipe left on {N} in real life.`,
  `{N} built a whole future on zero signals.`,
  `This isn't love, {N}. It's fan behavior. 📸`,

  // 31-40
  `{N}'s not chasing love, they're chasing embarrassment.`,
  `Even {N}'s shadow wouldn't back them on this. 👤`,
  `{C}'s type? Definitely not experimental.`,
  `{N} entered {C}'s name like it's destiny… it's not.`,
  `{N}'s in a situationship with imagination.`,
  `This pairing has less chance than {N}'s alarm waking them up. ⏰`,
  `{N} thought this would validate them… tragic.`,
  `{C} is {N}'s crush, not {N}'s option.`,
  `{N} is emotionally buffering. Forever. ♾️`,
  `This isn't romance, it's a one-man show. 🎭`,

  // 41-50
  `{C} would rather charge at 1% than talk to {N}. 🔋`,
  `{N} really hit submit like something magical would happen. ✨❌`,
  `Even April Fools' is laughing at {N}. 🤡`,
  `{N}'s confidence deserves a refund. 💸`,
  `This match has negative probability. 📉`,
  `{N}'s not on {C}'s mind, barely in their notifications.`,
  `{N} treated this like fate, it treated {N} like spam. 📧🗑️`,
  `{N} is in love alone. Congrats. 🎉😢`,
  `{C}'s interest level is in airplane mode. ✈️`,
  `{N}'s not a choice, they're background noise. 🔇`,

  // 51-60
  `{N} typed {C}'s name like they're summoned together 💀`,
  `This isn't compatibility, it's comedy. 😂`,
  `{N}'s hoping for miracles, not messages.`,
  `{N}'s love life needs a software update. 🔄`,
  `{N} brought feelings to a one-sided situation.`,
  `{N} is romantically unemployed. 📋❌`,
  `Even the algorithm gave up halfway on {N}.`,
  `{N}'s chasing someone who's not even jogging. 🏃💨`,
  `{C} has better conversations with silence than with {N}.`,
  `This match expired before it started. ⏳`,

  // 61-70
  `{N}'s not a "what if," they're a "what no."`,
  `{C} wouldn't even notice {N}'s absence.`,
  `This isn't rejection, it's prevention. 🛡️`,
  `{N} is emotionally invested in fiction. 📖`,
  `{N}'s love story is just loading… forever. ⏳`,
  `{N}'s applying pressure where there's no surface.`,
  `This connection is weaker than {N}'s excuses.`,
  `{C} is living rent-free in a house {N} doesn't own. 🏠`,
  `{N}'s not {C}'s type, they're {C}'s lesson.`,
  `This is why self-awareness exists, {N}. 🪞`,

  // 71-80
  `{N}'s chasing a dream that's not even theirs.`,
  `{C} has more interest in their battery percentage than in {N}. 🔋`,
  `{N} entered {C}'s name like it's mutual 💀`,
  `This isn't destiny, {N}. It's denial.`,
  `{N} is emotionally buffering with no connection. 📶❌`,
  `{N}'s chances? Still in beta testing. 🧪`,
  `{N}'s not {C}'s future, they're {C}'s "who?"`,
  `This pairing is a system error. ⚠️💔`,
  `{N} was hoping for chemistry, but got physics. 📐`,
  `{C} is unavailable in all realities. All 14 billion of them.`,

  // 81-90
  `{N}'s writing chapters alone in a book with no co-author. 📕`,
  `{C} wouldn't even recognize {N}'s effort.`,
  `This isn't love, it's a solo mission. 🚀`,
  `{N} is romantically lost with full confidence. 🧭`,
  `Even {N}'s playlist knows this won't work. 🎵`,
  `{N}'s investing in a stock that doesn't exist. 📈❌`,
  `This match is powered by imagination only. 🌈`,
  `{N}'s hoping for signals from someone offline. 📵`,
  `{C} is {N}'s crush… not {N}'s outcome.`,
  `{N}'s not close, they're just consistent. 🔁`,

  // 91-100
  `{N}'s chasing vibes that were never sent. 📡`,
  `This isn't compatibility, it's coincidence. 🎲`,
  `{N} is emotionally ahead of the storyline.`,
  `{C} has already moved on… from nothing.`,
  `{N}'s building castles on unread messages. 🏰💬`,
  `This connection is weaker than {N}'s WiFi bars. 📶`,
  `{N}'s in love with the idea, not the reality.`,
  `{C} isn't ignoring {N}… they just don't see them. 👻`,
  `This match failed before it began.`,
  `{N} didn't lose a chance… they never had one. ❌`,
];

// ─── AGE-SPECIFIC BONUS ROASTS ───
function getAgeRoasts(name: string, age: number, crushName: string, crushAge: number): string[] {
  const gap = Math.abs(age - crushAge);
  const extras: string[] = [];

  if (gap > 5) {
    extras.push(
      `{N}, you're {A} going after a {CA}-year-old? That's not a crush, that's a crime documentary waiting to happen. 🚨`,
      `{N} ({A}) likes {C} ({CA}). That age gap is bigger than your chances. Which are zero. 📉`,
    );
  }

  if (age < 14) {
    extras.push(
      `{N}, you're literally {A}. The only thing you should be crushing on is your homework. Go study. 📚`,
      `{N}, at {A} your love life should be non-existent. And looking at your face, it will stay that way. 💀`,
      `Bro is {A} years old and already shooting shots 😭 Aim for a good grade first.`,
    );
  } else if (age < 18) {
    extras.push(
      `{N}'s {A} and out here acting like they've got life figured out. Baby, you can't even drive. 🚗❌`,
      `At {A}, the only relationship {N} should worry about is with their textbook. 📖`,
      `{N} ({A}) crushing hard when they should be crushing exams. Priorities, bestie. 📝`,
    );
  }

  if (age > 35) {
    extras.push(
      `{N}, at {A}, {C} isn't your crush — they're your midlife crisis. Buy a sports car instead. 🏎️`,
      `Bro is {A} and still out here crushing like a teenager. {C} can smell the desperation from 3 blocks away. 😭`,
      `{N}'s {A} and still believes in love at first sight. That's not love, that's cataracts. 👓`,
    );
  }

  if (age > 25 && crushAge < 20) {
    extras.push(
      `{N} ({A}) crushing on {C} ({CA})? Somebody call a counselor. 🧑‍⚖️`,
    );
  }

  if (crushAge > age + 10) {
    extras.push(
      `{C} is {CA}. {N}, you're {A}. They see you as a younger sibling at best. 👶`,
    );
  }

  return extras;
}

// ─── MASTER ROAST GENERATOR ───
export function generateRoast(name: string, age: number, crushName: string, crushAge: number): string {
  const vibe = detectVibe(name, age);

  // Collect all available roasts
  const allRoasts = [...ROAST_TEMPLATES, ...getAgeRoasts(name, age, crushName, crushAge)];

  // Add vibe-specific bonus roasts
  const vibeRoasts: Record<string, string[]> = {
    baby: [
      `{N}, at {A}, the scariest prediction is your math test tomorrow. 🧮`,
      `{N} ({A}) is worried about love? Worry about learning to cook first. 🍳`,
    ],
    teen: [
      `{N}'s {A} and thinks this is the love of their life. Spoiler: it's not even chapter 1.`,
      `Dear {N} ({A}), your biggest relationship right now should be with your alarm clock. ⏰`,
    ],
    uncle: [
      `{N} at {A}? At this point it's not a crush, it's a museum exhibit. 🏛️`,
      `{N} ({A}) still has hope? That's the most impressive thing about this scan. 💪😭`,
    ],
    midlife: [
      `{N}'s {A} and still manifesting. The only thing manifesting is back pain. 🦴`,
      `At {A}, {N} should be investing, not simping.`,
    ],
    tryhard: [
      `{N}… really? A 3-letter name chasing {C}? You couldn't even commit to a full name. 🤏`,
    ],
    overconfident: [
      `{N}'s name is longer than their chance with {C}. And that name is looooong.`,
      `With a name like {N}, you'd think the universe would show some mercy. It didn't.`,
    ],
    dramatic: [
      `{N}, your name is dramatic and so is your love life — but only the tragic kind. 🎭`,
    ],
    lost: [
      `{N} gives off "confused main character" energy. Plot twist: you're an extra. 🎬`,
    ],
  };

  if (vibeRoasts[vibe]) {
    allRoasts.push(...vibeRoasts[vibe]);
  }

  // Pick a random roast
  let roast = allRoasts[Math.floor(Math.random() * allRoasts.length)];

  // Replace placeholders
  roast = roast
    .replace(/\{N\}/g, name)
    .replace(/\{A\}/g, String(age))
    .replace(/\{C\}/g, crushName)
    .replace(/\{CA\}/g, String(crushAge));

  // 40% chance to prepend a "pause" line for extra brutality
  if (Math.random() < 0.4) {
    roast = pauseLine(name) + " " + roast;
  }

  // 30% chance to append a fake AI analysis line
  if (Math.random() < 0.3) {
    roast = roast + "\n\n" + fakeAILine(name, crushName);
  }

  return roast;
}

export function exportToCSV(entries: ScanEntry[]): void {
  const headers = ["#", "Name", "Age", "Crush Name", "Crush Age", "Roast", "Time"];
  const rows = entries.map((e, i) => [
    i + 1,
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
