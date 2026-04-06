import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  getEntries, clearEntries, deleteEntry, getHoursRemaining, 
  getAdminUpiId, setAdminUpiId, getAdminIgAccount, setAdminIgAccount, getPendingDares, updateEntryDare 
} from "@/lib/storage";
import type { ScanEntry } from "@/lib/storage";
import { ShieldAlert, Key, Users, Clock, AlertTriangle, QrCode, Save, Check, X, LayoutDashboard, Database, CheckSquare, MessageSquare, Settings } from "lucide-react";
import AdminEntries from "@/components/admin/AdminEntries";
import AdminReviews from "@/components/admin/AdminReviews";
import AdminSingles from "@/components/admin/AdminSingles";

const ADMIN_PASSWORD = "000000";
const SESSION_KEY = "futurescan_admin";

type Tab = 'dashboard' | 'prophecies' | 'singles' | 'verification' | 'reviews' | 'settings';

const Admin = () => {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [shake, setShake] = useState(false);
  const [denied, setDenied] = useState(false);
  
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const [singles, setSingles] = useState<any[]>([]);
  const [pendingDares, setPendingDares] = useState<ScanEntry[]>([]);
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
    // Use dynamic import or type bypass for singles since types might be slightly out of sync in Admin.tsx
    const singlesData = await import('@/lib/storage').then(m => m.getSingles());
    const dares = await getPendingDares();
    setEntries(data);
    setSingles(singlesData);
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
  };

  const mostCommonCrush = entries.length > 0
    ? Object.entries(entries.reduce((acc, e) => {
        acc[e.crushName] = (acc[e.crushName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || "N/A"
    : "N/A";

  if (!authed) {
    return (
      <div className="min-h-[100dvh] bg-mystical flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        
        <form onSubmit={handleLogin} className={`relative z-10 w-full max-w-sm ${shake ? "animate-shake" : ""}`}>
          <div className="bg-black/60 backdrop-blur-2xl border-[0.5px] border-white/10 p-10 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] glow-box-gold">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border-[0.5px] border-primary/30 shadow-inner">
                <ShieldAlert className="w-10 h-10 text-primary drop-shadow-[0_0_10px_gold]" />
              </div>
            </div>
            
            <h1 className="font-heading text-3xl font-black text-center text-foreground mb-2 uppercase tracking-widest glow-gold">Command Center</h1>
            <p className="text-center text-primary/60 text-[10px] uppercase font-black tracking-widest mb-10">
              Predict Your Future™ Override
            </p>
            
            <div className="relative mb-8">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-foreground placeholder:text-white/40 focus:outline-none focus:border-white/30 transition-all font-mono tracking-widest text-lg shadow-inner"
                placeholder="BYPASS_CODE"
                autoFocus
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-black text-sm uppercase tracking-widest rounded-2xl hover:-translate-y-1 transition-all shadow-[0_0_30px_rgba(230,194,122,0.3)] hover:shadow-[0_0_50px_rgba(230,194,122,0.5)]"
            >
              Authenticate System
            </button>
            
            {denied && (
              <p className="text-red-500 text-xs mt-6 text-center font-bold uppercase tracking-widest drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                Access Denied. Nice try.
              </p>
            )}
            
            <div className="mt-10 text-center">
              <Link to="/" className="text-white/30 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                &larr; Abort to Safety
              </Link>
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-mystical relative text-foreground flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar Nav */}
      <div className="w-full md:w-64 bg-black/60 backdrop-blur-2xl border-b md:border-b-0 md:border-r border-white/10 flex flex-col relative z-20">
        <div className="p-6 pb-8 border-b border-white/5">
          <h1 className="text-xl font-heading font-black text-foreground flex items-center gap-3 tracking-widest uppercase mt-4">
            <ShieldAlert className="w-6 h-6 text-primary drop-shadow-[0_0_10px_gold]" />
            Control
          </h1>
          <p className="text-primary/60 text-[10px] font-black uppercase tracking-widest mt-2 md:pl-9">System Active</p>
        </div>

        <nav className="p-4 flex-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'prophecies', label: 'Prophecies', icon: Database },
            { id: 'singles', label: 'Singles Board', icon: Users },
            { id: 'verification', label: 'Queue', icon: CheckSquare, badge: pendingDares.length },
            { id: 'reviews', label: 'Reviews', icon: MessageSquare },
            { id: 'settings', label: 'Config', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all uppercase tracking-widest text-[10px] font-black ${
                activeTab === tab.id 
                  ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(230,194,122,0.15)]' 
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge ? (
                <span className="ml-auto bg-primary text-black px-1.5 py-0.5 rounded-md text-[9px] animate-pulse glow-box-gold">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/10 mt-auto hidden md:block">
          <Link to="/" className="flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
            Exit System Mode
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-10 relative z-10 h-[100dvh]">
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <h2 className="font-heading text-3xl font-black text-foreground tracking-widest uppercase glow-gold mb-8">Dashboard Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                <div className="absolute -bottom-4 -right-4 text-white/5 group-hover:scale-110 transition-transform">
                  <Users className="w-32 h-32" />
                </div>
                <p className="text-primary/70 text-[10px] font-black uppercase tracking-widest mb-3 relative z-10">Total Roasted</p>
                <p className="text-6xl font-heading text-foreground drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-10">{entries.length}</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                <div className="absolute -bottom-4 -right-4 text-white/5 group-hover:scale-110 transition-transform">
                  <Clock className="w-32 h-32" />
                </div>
                <p className="text-primary/70 text-[10px] font-black uppercase tracking-widest mb-3 relative z-10">Global Timer (Hrs)</p>
                <p className="text-6xl font-heading text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-10">{getHoursRemaining()}</p>
              </div>
              
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                <div className="absolute -bottom-4 -right-4 text-white/5 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-32 h-32" />
                </div>
                <p className="text-[#F43F5E]/70 text-[10px] font-black uppercase tracking-widest mb-3 relative z-10">Top Crush Target</p>
                <p className="text-4xl font-heading text-[#F43F5E] truncate pt-1 drop-shadow-md relative z-10">{mostCommonCrush}</p>
              </div>
            </div>

            <button
              onClick={async () => {
                if (confirm("Are you absolutely sure you want to hard reset all entries globally?")) {
                  await handleClear();
                }
              }}
              className="mt-10 px-6 py-4 border-[0.5px] border-red-500/50 bg-red-500/10 text-red-500 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-red-500/20 transition-colors shadow-inner w-full sm:w-auto"
            >
              Nuke All Timelines (Hard Reset)
            </button>
          </div>
        )}

        {activeTab === 'prophecies' && (
          <div className="animate-fade-in relative z-10">
            <AdminEntries entries={entries} isLoading={isLoading} onRefresh={loadData} />
          </div>
        )}

        {activeTab === 'singles' && (
          <div className="animate-fade-in relative z-10">
            <h2 className="font-heading text-2xl font-black text-accent tracking-widest uppercase mb-8 flex items-center gap-3">
              Singles Database
            </h2>
            <AdminSingles singles={singles} isLoading={isLoading} onRefresh={loadData} />
          </div>
        )}

        {activeTab === 'verification' && (
          <div className="animate-fade-in relative z-10">
            <h2 className="font-heading text-2xl font-black text-foreground tracking-widest uppercase mb-8 flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-red-400 animate-pulse" />
              Verification Queue
            </h2>
            
            {pendingDares.length === 0 ? (
              <div className="py-20 text-center">
                <CheckSquare className="w-16 h-16 text-white/10 mx-auto mb-4" />
                <p className="text-white/30 tracking-widest uppercase font-bold text-sm">Zone clear. No pending dare proofs.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingDares.map(dare => (
                  <div key={dare.id} className="bg-black/60 backdrop-blur-md border-[0.5px] border-primary/30 rounded-3xl overflow-hidden shadow-[0_20px_40px_-15px_rgba(230,194,122,0.15)] group">
                    <div className="p-5 border-b border-white/10 flex items-center gap-4 bg-white/5">
                      <img src={dare.facePhoto} alt="user" className="w-12 h-12 rounded-full object-cover border border-white/20" />
                      <div>
                        <p className="font-black text-foreground text-sm uppercase tracking-wide">{dare.name}</p>
                        <p className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">
                          {dare.dareStatus === 'pending_removal' ? 'Removal Bribe / Follow' : 'Dare Proof Submitted'}
                        </p>
                        {dare.shameReason && <p className="text-[10px] text-white/50 font-mono mt-1 pr-2 uppercase">{dare.shameReason}</p>}
                      </div>
                    </div>
                    {dare.dareProofPhoto ? (
                      <div className="relative group-hover:scale-[1.02] transition-transform duration-500">
                        <img src={dare.dareProofPhoto} alt="Review Proof" className="w-full h-56 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                      </div>
                    ) : (
                      <div className="w-full h-56 bg-black flex items-center justify-center border-y border-white/5 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.02)_10px,rgba(255,255,255,0.02)_20px)]" />
                        <p className="text-[10px] text-white/30 italic uppercase font-black tracking-widest relative z-10 text-center px-4">No image provided by subject.</p>
                      </div>
                    )}
                    <div className="p-4 flex gap-3 relative z-10 bg-black/60 backdrop-blur-md">
                      {dare.dareStatus === 'pending_removal' ? (
                        <>
                          <button
                            onClick={async () => {
                              await deleteEntry(dare.id);
                              loadData();
                            }}
                            className="flex-1 py-3 bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 rounded-xl hover:bg-[#4ade80]/20 transition-colors uppercase tracking-widest text-[10px] font-black"
                          >
                            Approve (Del)
                          </button>
                          <button
                            onClick={async () => {
                              await updateEntryDare(dare.id, { dareStatus: 'failed', aura: (dare.aura || 0) - 50, shameReason: '🤡 Faked IG Follow' });
                              loadData();
                            }}
                            className="flex-1 py-3 bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20 rounded-xl hover:bg-[#f87171]/20 transition-colors uppercase tracking-widest text-[10px] font-black"
                          >
                            Reject (-50)
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={async () => {
                              await updateEntryDare(dare.id, { dareStatus: 'completed', aura: (dare.aura || 0) + 20 });
                              loadData();
                            }}
                            className="flex-1 py-3 bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 rounded-xl hover:bg-[#4ade80]/20 transition-colors uppercase tracking-widest text-[10px] font-black"
                          >
                            Pass (+20)
                          </button>
                          <button
                            onClick={async () => {
                              await updateEntryDare(dare.id, { dareStatus: 'failed', aura: (dare.aura || 0) - 50, shameReason: '🤡 Caught Faking Proof' });
                              loadData();
                            }}
                            className="flex-1 py-3 bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20 rounded-xl hover:bg-[#f87171]/20 transition-colors uppercase tracking-widest text-[10px] font-black"
                          >
                            Fail (-50)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="animate-fade-in relative z-10">
            <AdminReviews />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-fade-in relative z-10 max-w-2xl">
            <h2 className="font-heading text-2xl font-black text-foreground tracking-widest uppercase glow-gold mb-8">System Configuration</h2>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <QrCode className="w-5 h-5 text-primary drop-shadow-md" />
                <h3 className="font-heading text-xl font-bold text-foreground tracking-wide">Coward Fund API</h3>
              </div>
              <p className="text-white/60 text-xs mb-8 leading-relaxed">System relies on this configuration to display the ₹1 "Remove Me" QR code payment terminal to cowards.</p>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black tracking-widest text-primary/70 uppercase">UPI Address Config</label>
                  <input
                    value={upiId}
                    onChange={e => { setUpiId(e.target.value); setUpiSaved(false); }}
                    className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-foreground placeholder:text-white/30 focus:outline-none focus:border-primary/50 transition-all font-mono text-sm shadow-inner"
                  />
                  <button
                    onClick={() => {
                      setAdminUpiId(upiId.trim());
                      setUpiSaved(true);
                      setTimeout(() => setUpiSaved(false), 3000);
                    }}
                    disabled={!upiId.trim()}
                    className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-6 py-4 bg-primary/20 text-primary border border-primary/30 rounded-2xl font-black hover:bg-primary/30 transition-all uppercase tracking-widest text-[10px]"
                  >
                    <Save className="w-4 h-4" />
                    {upiSaved ? "UPI Saved ✓" : "Commit UPI ID"}
                  </button>
                </div>
                
                <div className="flex flex-col gap-3 pt-6 border-t border-white/5">
                  <label className="text-[10px] font-black tracking-widest text-accent/70 uppercase">Instagram Manual Review Config</label>
                  <input
                    value={igHandle}
                    onChange={e => { setIgHandle(e.target.value); setIgSaved(false); }}
                    className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-foreground placeholder:text-white/30 focus:outline-none focus:border-accent/50 transition-all font-mono text-sm shadow-inner"
                  />
                  <button
                    onClick={() => {
                      setAdminIgAccount(igHandle.trim());
                      setIgSaved(true);
                      setTimeout(() => setIgSaved(false), 3000);
                    }}
                    disabled={!igHandle.trim()}
                    className="w-full sm:w-1/2 flex items-center justify-center gap-2 px-6 py-4 bg-[#F43F5E]/10 text-[#F43F5E] border border-[#F43F5E]/30 rounded-2xl font-black hover:bg-[#F43F5E]/20 transition-all uppercase tracking-widest text-[10px]"
                  >
                    <Save className="w-4 h-4" />
                    {igSaved ? "IG Saved ✓" : "Commit IG Handle"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
