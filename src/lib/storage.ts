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

  if (gap > 5) {
    roasts.push(`${name}, you're ${age} chasing a ${crushAge}-year-old? Your future is a restraining order. 🚔`);
  }

  const commonNames = ["sarah", "ahmed", "mohammed", "fatima", "john", "maria", "ali", "omar", "lina", "david", "emma", "noah"];
  if (commonNames.includes(crushName.toLowerCase())) {
    roasts.push(`Really? ${crushName}? There are 47 ${crushName}s in your area and none noticed you. 💀`);
  }

  roasts.push(
    `In ALL 14 billion timelines, ${crushName} does not text back. 📱❌`,
    `${name}, the stars aligned and they all said "${crushName} left you on read." ✨`,
    `Our AI scanned 9,000 dimensions. In 8,999 of them, ${crushName} has you blocked. 🔮`,
    `${name}, age ${age}, crushing on ${crushName}? Even the crystal ball cringed. 😬`,
    `The cosmos whispered: "${name} will die alone, but at least they tried." 💫`,
    `${crushName} just updated their bio to "not interested in ${name}." Across all realities. 🌌`,
  );

  if (age < 18) {
    roasts.push(`${name}, you're ${age}. Your biggest crush should be your homework. 📚`);
  }
  if (age > 40) {
    roasts.push(`${name}, at ${age}, your future isn't with ${crushName} — it's with a good chiropractor. 🦴`);
  }

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
