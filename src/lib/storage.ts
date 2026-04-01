export interface ScanEntry {
  id: string;
  name: string;
  age: number;
  crushName: string;
  crushAge: number;
  facePhoto: string;
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

export function getEntries(): ScanEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export function addEntry(entry: ScanEntry) {
  const entries = getEntries();
  entries.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function clearEntries() {
  localStorage.removeItem(STORAGE_KEY);
}

export function generateRoast(name: string, age: number, crushName: string, crushAge: number): string {
  const gap = Math.abs(age - crushAge);
  const roasts: string[] = [];

  // Age gap roasts
  if (gap > 5) {
    roasts.push(
      `${name}, you're ${age} going after a ${crushAge}-year-old? Bro that's not a crush, that's a crime documentary waiting to happen. 🚨`,
      `${name} (${age}) likes ${crushName} (${crushAge}). That age gap is bigger than your chances. Which are zero. 📉`,
    );
  }

  if (age < 16) {
    roasts.push(
      `${name}, you're literally ${age}. The only thing you should be crushing on is your homework. Go study. 📚`,
      `${name}, at ${age} your love life should be non-existent. And looking at your face, it will stay that way. 💀`,
    );
  }

  if (age > 35) {
    roasts.push(
      `${name}, at ${age}, ${crushName} isn't your crush — they're your midlife crisis. Buy a sports car instead. 🏎️`,
      `Bro is ${age} and still out here crushing like a teenager. ${crushName} can smell the desperation from 3 blocks away. 😭`,
    );
  }

  // Crush-specific savagery
  roasts.push(
    `${name}, I showed your face to ${crushName} and they literally said "ew." Not joking. That was the whole response. 🤮`,
    `In 14 billion timelines, ${crushName} texts you back in exactly ZERO of them. Not even a pity reply. ❌📱`,
    `${name}, your face says "love me" but ${crushName}'s face says "I'm calling the police." 👮`,
    `We asked ${crushName} about you and they said "${name}? Never heard of them." You're not even on their radar, you're on their block list. 🚫`,
    `${name} really typed "${crushName}" with those sweaty fingers thinking they had a chance. Baby, the delusion is THICK. 🤡`,
    `Bro ${name} really looked in the mirror, saw THAT face, and thought "${crushName} would totally date me." The audacity. The foolishness. The CLOWNERY. 🎪`,
    `${crushName} would rather eat glass than go on a date with you ${name}. And honestly? I get it. 💅`,
    `${name}, even autocorrect wouldn't suggest your name when ${crushName} types. You're that irrelevant. 😂`,
    `We ran your face through our AI and it said "ERROR: No future detected with ${crushName}. Or anyone. Try cats." 🐱`,
    `${name} thinks ${crushName} is "the one." Bestie, you're not even "the two." You're not even on the list. 📋❌`,
    `Our cosmic scanner detected that ${crushName} has you saved as "DO NOT ANSWER" in 8,999 out of 9,000 dimensions. In the last one, they don't have a phone. 📵`,
    `${name}, age ${age}, crushing on ${crushName}? Even your horoscope is embarrassed for you. Mercury is in retrograde from YOUR life. ♈`,
    `We showed your photo to 100 people and asked "would ${crushName} date this person?" 99 said no. The last one was still laughing. 😂😂`,
    `${name} really said "${crushName}" out loud like they deserve them. Sit DOWN. The universe is BEGGING you to have some self-awareness. 🪑`,
    `Breaking news: ${crushName} just changed their name, moved cities, and went off-grid after learning ${name} has a crush on them. 🏃💨`,
  );

  // Pick 1 random roast
  return roasts[Math.floor(Math.random() * roasts.length)];
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
  a.download = "futurescan_data.csv";
  a.click();
  URL.revokeObjectURL(url);
}
