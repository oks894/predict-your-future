import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEntries, clearEntries, exportToCSV, getHoursRemaining } from "@/lib/storage";
import type { ScanEntry } from "@/lib/storage";

const ADMIN_PASSWORD = "000000";
const SESSION_KEY = "futurescan_admin";

const Admin = () => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);
  const [denied, setDenied] = useState(false);
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const [search, setSearch] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "true") {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) setEntries(getEntries());
  }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem(SESSION_KEY, "true");
    } else {
      setShake(true);
      setDenied(true);
      setTimeout(() => { setShake(false); setDenied(false); }, 1500);
    }
  };

  const handleClear = () => {
    clearEntries();
    setEntries([]);
    setShowClearConfirm(false);
  };

  const filtered = entries.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.crushName.toLowerCase().includes(search.toLowerCase())
  );

  const mostCommonCrush = entries.length > 0
    ? Object.entries(entries.reduce((acc, e) => {
        acc[e.crushName] = (acc[e.crushName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
    : "N/A";

  if (!authed) {
    return (
      <div className="min-h-screen bg-terminal flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className={`max-w-sm w-full ${shake ? "animate-shake" : ""}`}>
          <div className="p-6 border border-terminal-green/30 rounded-lg">
            <h1 className="font-terminal text-terminal text-xl mb-1">$ futurescan --admin</h1>
            <p className="font-terminal text-terminal/60 text-sm mb-6">Enter access code:</p>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-terminal-green/40 rounded font-terminal text-terminal-green focus:outline-none focus:border-terminal-green"
              placeholder="••••••"
              autoFocus
            />
            <button type="submit" className="w-full mt-4 py-3 border border-terminal-green/40 rounded font-terminal text-terminal-green hover:bg-terminal-green/10 transition-colors">
              ACCESS
            </button>
            {denied && <p className="font-terminal text-red-500 text-sm mt-3 text-center">Access Denied, mortal.</p>}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-terminal text-terminal font-terminal p-4 md:p-8">
      <h1 className="text-2xl mb-1">$ futurescan --admin --dashboard</h1>
      <p className="text-terminal/50 text-sm mb-6">[ CLASSIFIED — LEVEL 6 CLEARANCE ]</p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 border border-terminal-green/20 rounded">
          <p className="text-terminal/50 text-xs">TOTAL ROASTED</p>
          <p className="text-3xl">{entries.length}</p>
        </div>
        <div className="p-4 border border-terminal-green/20 rounded">
          <p className="text-terminal/50 text-xs">HOURS REMAINING</p>
          <p className="text-3xl">{getHoursRemaining()}</p>
        </div>
        <div className="p-4 border border-terminal-green/20 rounded">
          <p className="text-terminal/50 text-xs">TOP CRUSH</p>
          <p className="text-xl truncate">{mostCommonCrush}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or crush..."
          className="flex-1 px-4 py-2 bg-transparent border border-terminal-green/30 rounded font-terminal text-terminal-green placeholder:text-terminal-green/30 focus:outline-none focus:border-terminal-green"
        />
        <button
          onClick={() => exportToCSV(entries)}
          className="px-4 py-2 border border-terminal-green/40 rounded hover:bg-terminal-green/10 transition-colors"
        >
          Export CSV
        </button>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="px-4 py-2 border border-red-500/40 text-red-400 rounded hover:bg-red-500/10 transition-colors"
        >
          Clear All
        </button>
      </div>

      {showClearConfirm && (
        <div className="mb-4 p-3 border border-red-500/30 rounded">
          <p className="text-red-400 text-sm mb-2">Confirm: Delete ALL scan data?</p>
          <div className="flex gap-2">
            <button onClick={handleClear} className="px-3 py-1 border border-red-500 text-red-400 rounded text-sm hover:bg-red-500/10">
              Yes, purge
            </button>
            <button onClick={() => setShowClearConfirm(false)} className="px-3 py-1 border border-terminal-green/30 rounded text-sm hover:bg-terminal-green/10">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-terminal-green/20">
              <th className="py-2 px-2 text-left text-terminal/50">#</th>
              <th className="py-2 px-2 text-left text-terminal/50">Photo</th>
              <th className="py-2 px-2 text-left text-terminal/50">Name</th>
              <th className="py-2 px-2 text-left text-terminal/50">Age</th>
              <th className="py-2 px-2 text-left text-terminal/50">Crush</th>
              <th className="py-2 px-2 text-left text-terminal/50">C.Age</th>
              <th className="py-2 px-2 text-left text-terminal/50">Roast</th>
              <th className="py-2 px-2 text-left text-terminal/50">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e, i) => (
              <tr key={e.id} className="border-b border-terminal-green/10 hover:bg-terminal-green/5">
                <td className="py-2 px-2">{i + 1}</td>
                <td className="py-2 px-2">
                  <img src={e.facePhoto} alt="" className="w-8 h-8 rounded object-cover" loading="lazy" />
                </td>
                <td className="py-2 px-2">{e.name}</td>
                <td className="py-2 px-2">{e.age}</td>
                <td className="py-2 px-2">{e.crushName}</td>
                <td className="py-2 px-2">{e.crushAge}</td>
                <td className="py-2 px-2 max-w-xs truncate">{e.roastText}</td>
                <td className="py-2 px-2 whitespace-nowrap">{new Date(e.timestamp).toLocaleTimeString()}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="py-8 text-center text-terminal/30">No data found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="text-terminal/40 hover:text-terminal text-sm">← Back to main</Link>
      </div>
    </div>
  );
};

export default Admin;
