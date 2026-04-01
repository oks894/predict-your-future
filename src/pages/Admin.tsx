import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  getEntries, clearEntries, deleteEntry, exportToCSV, getHoursRemaining, 
  getAdminUpiId, setAdminUpiId, getAdminIgAccount, setAdminIgAccount, getPendingDares, updateEntryDare 
} from "@/lib/storage";
import type { ScanEntry } from "@/lib/storage";
import { Trash2, Download, Search, ShieldAlert, Key, Users, Clock, AlertTriangle, QrCode, Save, Check, X, Image as ImageIcon } from "lucide-react";
import { generateAuraCardBlob } from "@/components/AuraCard";

const ADMIN_PASSWORD = "000000";
const SESSION_KEY = "futurescan_admin";

const Admin = () => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);
  const [denied, setDenied] = useState(false);
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const [pendingDares, setPendingDares] = useState<ScanEntry[]>([]);
  const [search, setSearch] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [igHandle, setIgHandle] = useState("");
  const [upiSaved, setUpiSaved] = useState(false);
  const [igSaved, setIgSaved] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY) === "true") {
      setAuthed(true);
    }
  }, []);

  useEffect(() => {
    if (authed) {
      loadData();
      setUpiId(getAdminUpiId());
      setIgHandle(getAdminIgAccount());
    }
  }, [authed]);

  const loadData = async () => {
    setIsLoading(true);
    const data = await getEntries();
    const dares = await getPendingDares();
    setEntries(data);
    setPendingDares(dares);
    setIsLoading(false);
  };

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

  const handleClear = async () => {
    setIsLoading(true);
    await clearEntries();
    await loadData();
    setShowClearConfirm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this prophecy? It will be removed permanently.")) {
      setIsLoading(true);
      await deleteEntry(id);
      await loadData();
    }
  };

  const filtered = entries.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.crushName.toLowerCase().includes(search.toLowerCase())
  );

  const mostCommonCrush = entries.length > 0
    ? Object.entries(entries.reduce((acc, e) => {
        acc[e.crushName] = (acc[e.crushName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || "N/A"
    : "N/A";

  if (!authed) {
    return (
      <div className="min-h-[100dvh] bg-mystical flex items-center justify-center px-4 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        
        <form onSubmit={handleLogin} className={`relative z-10 w-full max-w-sm ${shake ? "animate-shake" : ""}`}>
          <div className="bg-secondary/60 backdrop-blur-xl border border-primary/20 p-8 rounded-2xl shadow-2xl glow-box-gold">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/30">
                <ShieldAlert className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <h1 className="font-heading text-2xl text-center text-primary mb-2">Admin Dashboard</h1>
            <p className="text-center text-muted-foreground text-sm mb-8">
              Predict Your Future™ Control Center
            </p>
            
            <div className="relative mb-6">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="Enter bypass code"
                autoFocus
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3 bg-primary text-primary-foreground font-heading rounded-xl hover:opacity-90 transition-opacity glow-box-gold"
            >
              Authenticate &rarr;
            </button>
            
            {denied && (
              <p className="text-red-400 text-sm mt-4 text-center font-bold">
                Access Denied. Nice try!
              </p>
            )}
            
            <div className="mt-8 text-center">
              <Link to="/" className="text-muted-foreground text-xs hover:text-primary transition-colors">
                &larr; Return to Safety
              </Link>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-mystical relative text-foreground p-4 md:p-8 overflow-hidden">
      {/* Background elements */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-secondary/40 border border-primary/20 backdrop-blur-md p-6 rounded-2xl glow-box-gold">
          <div>
            <h1 className="text-3xl font-heading text-primary flex items-center gap-3">
              <ShieldAlert className="w-8 h-8" />
              Command Center
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Manage all global predictions and user data.</p>
          </div>
          
          <Link to="/" className="px-5 py-2.5 bg-background/50 border border-border rounded-lg text-sm hover:bg-background/80 transition-colors flex items-center gap-2">
            Exit Dashboard
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-secondary/80 to-background/50 border border-border p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Users className="w-16 h-16" />
            </div>
            <p className="text-muted-foreground text-sm font-semibold tracking-wider mb-2">TOTAL ROASTED</p>
            <p className="text-5xl font-heading text-primary">{entries.length}</p>
          </div>
          
          <div className="bg-gradient-to-br from-secondary/80 to-background/50 border border-border p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <Clock className="w-16 h-16" />
            </div>
            <p className="text-muted-foreground text-sm font-semibold tracking-wider mb-2">HOURS REMAINING (CLIENT)</p>
            <p className="text-5xl font-heading text-white">{getHoursRemaining()}</p>
          </div>
          
          <div className="bg-gradient-to-br from-secondary/80 to-background/50 border border-border p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-16 h-16" />
            </div>
            <p className="text-muted-foreground text-sm font-semibold tracking-wider mb-2">TOP CRUSH TARGET</p>
            <p className="text-3xl font-heading text-accent truncate pt-2">{mostCommonCrush}</p>
          </div>
        </div>

        {/* UPI Settings Card */}
        <div className="bg-secondary/40 backdrop-blur-md border border-border rounded-2xl p-6 mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <QrCode className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-lg text-primary">Coward Fund — UPI Settings</h2>
          </div>
          <p className="text-muted-foreground text-sm mb-4">Set the UPI ID that appears in the ₹1 "Remove" QR code shown to users on the Global Shame Board.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-muted-foreground">UPI ID Config</label>
              <input
                value={upiId}
                onChange={e => { setUpiId(e.target.value); setUpiSaved(false); }}
                placeholder="e.g. yourname@okicici"
                className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono text-sm"
              />
              <button
                onClick={() => {
                  setAdminUpiId(upiId.trim());
                  setUpiSaved(true);
                  setTimeout(() => setUpiSaved(false), 3000);
                }}
                disabled={!upiId.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-heading hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed glow-box-gold"
              >
                <Save className="w-4 h-4" />
                {upiSaved ? "Saved ✓" : "Save UPI ID"}
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-muted-foreground">Instagram DM Config (For verification)</label>
              <input
                value={igHandle}
                onChange={e => { setIgHandle(e.target.value); setIgSaved(false); }}
                placeholder="e.g. @itsnextgenfounder"
                className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all font-mono text-sm"
              />
              <button
                onClick={() => {
                  setAdminIgAccount(igHandle.trim());
                  setIgSaved(true);
                  setTimeout(() => setIgSaved(false), 3000);
                }}
                disabled={!igHandle.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-xl font-heading hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,0,100,0.4)]"
              >
                <Save className="w-4 h-4" />
                {igSaved ? "Saved ✓" : "Save IG Handle"}
              </button>
            </div>
          </div>
          {(upiId || igHandle) && (
            <div className="mt-4 p-3 bg-background/30 rounded-lg border border-border/50 flex flex-wrap gap-4">
              {upiId && <span className="text-primary text-xs font-mono truncate">UPI: {upiId}</span>}
              {igHandle && <span className="text-accent text-xs font-mono truncate">IG: {igHandle}</span>}
            </div>
          )}
        </div>

        {/* Dare Verification Queue */}
        {pendingDares.length > 0 && (
          <div className="mb-8">
            <h2 className="font-heading text-2xl text-accent mb-4 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
              Proof Verification Queue ({pendingDares.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingDares.map(dare => (
                <div key={dare.id} className="bg-secondary border border-accent/30 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(255,0,100,0.15)]">
                  <div className="p-4 border-b border-border bg-background/30 flex items-center gap-3">
                    <img src={dare.facePhoto} alt="user" className="w-10 h-10 rounded-full object-cover border border-accent/20" />
                    <div>
                      <p className="font-bold text-foreground text-sm">{dare.name}</p>
                      <p className="text-xs text-muted-foreground">{dare.dareStatus === 'pending_removal' ? 'Removal Bribe / Follow' : 'Dare Proof Submitted'}</p>
                      {dare.shameReason && <p className="text-xs text-primary font-mono mt-1 pr-2 break-all">{dare.shameReason}</p>}
                    </div>
                  </div>
                  {dare.dareProofPhoto ? (
                    <img src={dare.dareProofPhoto} alt="Review Proof" className="w-full h-48 object-cover border-y border-border" />
                  ) : (
                    <div className="w-full h-48 bg-black/50 flex items-center justify-center border-y border-border">
                      <p className="text-xs text-muted-foreground italic">No image provided.</p>
                    </div>
                  )}
                  <div className="p-4 flex gap-2">
                    {dare.dareStatus === 'pending_removal' ? (
                      <>
                        <button
                          onClick={async () => {
                            await deleteEntry(dare.id);
                            setPendingDares(prev => prev.filter(d => d.id !== dare.id));
                            setEntries(prev => prev.filter(e => e.id !== dare.id));
                          }}
                          className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-bold uppercase"
                        >
                          Approve (Delete)
                        </button>
                        <button
                          onClick={async () => {
                            await updateEntryDare(dare.id, { dareStatus: 'failed', aura: (dare.aura || 0) - 50, shameReason: '🤡 Fake Removal Proof' });
                            setPendingDares(prev => prev.filter(d => d.id !== dare.id));
                            setEntries(prev => prev.map(e => e.id === dare.id ? { ...e, dareStatus: 'failed', aura: (e.aura || 0) - 50, shameReason: '🤡 Fake Removal Proof' } : e));
                          }}
                          className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-bold uppercase"
                        >
                          Reject (-50)
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            await updateEntryDare(dare.id, { dareStatus: 'completed', aura: (dare.aura || 0) + 20 });
                            setPendingDares(prev => prev.filter(d => d.id !== dare.id));
                            setEntries(prev => prev.map(e => e.id === dare.id ? { ...e, dareStatus: 'completed', aura: (e.aura || 0) + 20 } : e));
                          }}
                          className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors text-sm font-bold uppercase"
                        >
                          Approve (+20)
                        </button>
                        <button
                          onClick={async () => {
                            await updateEntryDare(dare.id, { dareStatus: 'failed', aura: (dare.aura || 0) - 50, shameReason: '🤡 Caught Faking' });
                            setPendingDares(prev => prev.filter(d => d.id !== dare.id));
                            setEntries(prev => prev.map(e => e.id === dare.id ? { ...e, dareStatus: 'failed', aura: (e.aura || 0) - 50, shameReason: '🤡 Caught Faking' } : e));
                          }}
                          className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-bold uppercase"
                        >
                          Reject (-50)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions & Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or crush..."
              className="w-full pl-10 pr-4 py-3 bg-secondary/50 backdrop-blur-sm border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isLoading && (
               <div className="text-primary text-sm flex items-center gap-2 mr-2">
                 <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                 Syncing...
               </div>
            )}
            <button
              onClick={() => exportToCSV(entries)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-secondary/80 border border-border rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex-1 sm:flex-none px-5 py-3 border border-red-500/50 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              Nuke Data
            </button>
          </div>
        </div>

        {showClearConfirm && (
          <div className="mb-6 p-6 border border-red-500/50 bg-red-500/10 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
            <div>
              <p className="text-red-400 font-bold mb-1 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" /> 
                WARNING: DESTRUCTIVE ACTION
              </p>
              <p className="text-red-400/80 text-sm">Are you absolutely sure you want to permanently delete all scan records globally? This cannot be undone.</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={handleClear} 
                className="flex-1 sm:flex-none px-6 py-2 bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-500/20 hover:bg-red-600 transition-colors"
                disabled={isLoading}
              >
                Yes, Purge Everything
              </button>
              <button 
                onClick={() => setShowClearConfirm(false)} 
                className="flex-1 sm:flex-none px-6 py-2 bg-background/50 border border-border rounded-lg text-sm hover:bg-background/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-secondary/40 backdrop-blur-md border border-border rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-4 px-4 font-semibold">Type</th>
                  <th className="py-4 px-4 font-semibold">User</th>
                  <th className="py-4 px-4 font-semibold">Target Crush</th>
                  <th className="py-4 px-4 font-semibold max-w-xs">AI Prophecy Overview</th>
                  <th className="py-4 px-4 font-semibold">Aura & Dare</th>
                  <th className="py-4 px-4 font-semibold">Timestamp</th>
                  <th className="py-4 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-background/40 transition-colors group">
                    <td className="py-3 px-4">
                      {e.scanType === 'love' ? (
                        <span className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs font-bold whitespace-nowrap">LOVE</span>
                      ) : (
                        <span className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold whitespace-nowrap">FUTURE</span>
                      )}
                      <div className="text-xs font-bold mt-2 text-primary">{e.roastPercentage || 0}%</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={e.facePhoto} alt="" className="w-10 h-10 rounded-full object-cover border border-primary/20" loading="lazy" />
                        <div>
                          <p className="font-semibold text-foreground">{e.name}</p>
                          <p className="text-muted-foreground text-xs">Age {e.age}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {e.crushPhoto ? (
                        <div className="flex items-center gap-3">
                          <img src={e.crushPhoto} alt="" className="w-10 h-10 rounded-full object-cover border border-accent/20" loading="lazy" />
                          <div>
                            <p className="font-medium text-foreground">{e.crushName}</p>
                            <p className="text-muted-foreground text-xs">Age {e.crushAge}</p>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-foreground">{e.crushName}</p>
                          <p className="text-muted-foreground text-xs">Age {e.crushAge}</p>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs xl:max-w-md">
                      <p className="truncate text-muted-foreground group-hover:text-foreground transition-colors" title={e.roastText}>
                        {e.roastText}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      {e.aura !== undefined ? (
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-sm" style={{ color: e.aura >= 100 ? '#C084FC' : e.aura >= 0 ? '#FB923C' : '#F87171' }}>
                            {e.aura} Aura
                          </span>
                          {e.dareStatus && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full inline-block w-fit uppercase font-bold tracking-wider ${
                              e.dareStatus === 'completed' ? 'bg-green-500/20 text-green-400' :
                              e.dareStatus === 'failed' || e.dareStatus === 'chickened' ? 'bg-red-500/20 text-red-400' :
                              'bg-primary/20 text-primary'
                            }`}>
                              {e.dareStatus}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs italic">Legacy</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap text-xs">
                      {new Date(e.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                      <button 
                        onClick={async () => {
                          const oldBg = document.body.style.background;
                          try {
                            const url = await generateAuraCardBlob(e, e.aura || 0, 'post');
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `roast-${e.name}.png`;
                            a.click();
                          } catch (err) {
                            console.error(err);
                          } finally {
                            document.body.style.background = oldBg;
                          }
                        }}
                        className="p-2 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors inline-block"
                        title="Download Meme Card"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(e.id)}
                        disabled={isLoading}
                        className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors inline-flex"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-muted-foreground">
                      {isLoading ? (
                        <div className="flex flex-col items-center justify-center">
                          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
                          Syncing the timelines...
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center">
                          <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
                          <p>No prophecies discovered across any timelines.</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
