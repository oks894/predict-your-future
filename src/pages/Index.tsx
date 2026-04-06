import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { getEntries, getSingles, getAdminUpiId, getAdminIgAccount, updateEntryDare, updateSingleDare, syncAdminConfig } from "@/lib/storage";
import type { ScanEntry, SingleEntry } from "@/lib/storage";
import SinglesMarket from "@/components/SinglesMarket";
import html2canvas from "html2canvas";
import StarField from "@/components/StarField";

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Shared Link Params
  const sharedScore = searchParams.get("sharedScore");
  const p1 = searchParams.get("p1");
  const p2 = searchParams.get("p2");

  // Dashboard State
  const [showDashboard, setShowDashboard] = useState(false);
  const [showSingles, setShowSingles] = useState(false);
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const [singles, setSingles] = useState<SingleEntry[]>([]);
  
  const [cowardPromptEntry, setCowardPromptEntry] = useState<ScanEntry | null>(null);
  const [cowardSingleEntry, setCowardSingleEntry] = useState<SingleEntry | null>(null);
  const [paymentClicked, setPaymentClicked] = useState(false);
  const [proofText, setProofText] = useState("");
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [upiId, setUpiIdState] = useState('');
  const [igAccount, setIgAccountState] = useState('');

  useEffect(() => {
    syncAdminConfig().then(() => {
      setUpiIdState(getAdminUpiId());
      setIgAccountState(getAdminIgAccount());
    });
    getEntries().then(setEntries);
    getSingles().then(setSingles);
  }, []);

  const downloadSingleAsImage = async (id: string, name: string) => {
    const card = document.getElementById(`single-card-${id}`);
    if (!card) return;
    try {
      const canvas = await html2canvas(card, {
        backgroundColor: "#1a0a2e",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `singles-market-${name}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Image export error:", err);
    }
  };

  const handleGlobalInvite = () => {
    const shareText = `Are you soulmates or fully delusional? Use the AI Love Calculator to find out, or expose your single friends on the brutal public market 🔥👇\n${window.location.origin}`;
    if (navigator.share) {
      navigator.share({
        title: 'Love Calculator & Singles Market',
        text: shareText,
        url: window.location.origin,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText);
      alert("Invite link copied to clipboard! Send it to your friends.");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-mystical relative overflow-hidden flex flex-col justify-between">
      <StarField />

      {/* Floating Dashboard Toggles */}
      <div className="fixed top-4 right-4 z-40 flex gap-3">
        <button 
          onClick={() => setShowSingles(true)}
          className="bg-accent/20 backdrop-blur-md border border-accent/30 rounded-full px-4 py-2 flex items-center gap-2 hover:bg-accent/40 shadow-[0_0_15px_rgba(255,0,100,0.3)] transition-all group"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">🔥</span>
          <span className="text-xs uppercase tracking-widest font-bold text-accent hidden sm:inline-block">Singles Market</span>
        </button>

        <button 
          onClick={() => setShowDashboard(true)}
          className="bg-secondary/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors shadow-lg group"
        >
          <span className="text-xl group-hover:scale-110 transition-transform">📂</span>
          <span className="text-xs uppercase tracking-widest font-bold text-muted-foreground hidden lg:inline-block">Love Archives</span>
        </button>
      </div>

      {/* Global Invite Button */}
      <button
        onClick={handleGlobalInvite}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(255,0,100,0.4)] flex items-center gap-2 hover:scale-105 transition-transform uppercase font-black tracking-widest text-xs"
      >
        <span className="text-lg">💌</span> Invite a Friend
      </button>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center flex-grow mt-12 sm:mt-0 pb-20 mt-12 sm:pb-0">
        
        {/* If this is a shared link from a friend */}
        {sharedScore && p1 && p2 && (
          <div className="mb-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
            <div className="bg-secondary/90 border-2 border-accent/40 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(255,0,100,0.3)]">
              <span className="text-4xl mb-3 block animate-bounce">💌</span>
              <h2 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-widest mb-2">
                A Challenge Declared
              </h2>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-4">
                <strong className="text-primary">{p1}</strong> used the Love Calculator and tested their compatibility with <strong className="text-accent">{p2}</strong>!
              </p>
              
              <div className="inline-block px-4 py-2 bg-black/40 border border-white/10 rounded-full mb-4">
                <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2 font-bold">Their Result:</span>
                <span className="text-lg font-black text-white glow-gold">{sharedScore}% Compatible</span>
              </div>
              
              <p className="text-accent text-sm font-bold uppercase tracking-[0.2em]">
                Do you dare to test your own crush?
              </p>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="text-center w-full max-w-2xl bg-black/20 backdrop-blur-sm p-8 rounded-3xl border border-white/5">
          <span className="text-6xl mb-6 block animate-pulse">💔</span>
          <h1 className="font-heading text-4xl md:text-6xl text-accent drop-shadow-[0_0_20px_rgba(255,0,100,0.6)] mb-4">
            Love Calculator
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 font-heading tracking-widest mb-2">
            Are you soulmates or fully delusional?
          </p>
          <p className="text-muted-foreground mt-2 text-sm mb-10 leading-relaxed max-w-md mx-auto">
            Upload two photos. Let the advanced AI calculate your exact chemical compatibility and give you the brutal truth. 
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => navigate("/love")}
              className="px-10 py-5 w-full sm:w-auto bg-gradient-to-r from-accent to-pink-600 text-white font-heading text-xl md:text-2xl rounded-2xl shadow-[0_0_30px_rgba(255,0,100,0.5)] hover:scale-105 hover:shadow-[0_0_50px_rgba(255,0,100,0.8)] transition-all uppercase tracking-widest"
            >
              Calculate Now 🔥
            </button>
            <button
              onClick={() => {
                document.getElementById('singles-market-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-10 py-5 w-full sm:w-auto bg-black text-white font-heading text-xl md:text-2xl rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:scale-105 transition-all border border-white/20 uppercase tracking-widest"
            >
              Sell Your Single Friend 💀
            </button>
          </div>
        </div>

        <div id="singles-market-section" className="w-full mt-16 scroll-mt-24">
          {/* Public Singles Market */}
          <SinglesMarket />
        </div>

      </div>

      {/* Hidden Dashboard Modal */}
      {showDashboard && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
          <div className="p-4 md:p-6 flex justify-between items-center border-b border-white/10 bg-black/50 sticky top-0 z-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-heading text-primary glow-gold uppercase tracking-widest">Public Archives</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">All results are permanently public.</p>
            </div>
            <button 
              onClick={() => setShowDashboard(false)}
              className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {entries.filter(e => e.scanType === 'love').map((e) => (
                <div key={e.id} className="bg-secondary/60 border border-white/10 rounded-2xl p-5 relative group flex flex-col">
                  {e.dareStatus === 'pending_removal' && (
                    <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-3xl mb-2">⚖️</span>
                      <p className="text-yellow-400 font-bold uppercase tracking-widest text-sm mb-1">Under Review</p>
                      <p className="text-xs text-muted-foreground">Admin is verifying takedown payment.</p>
                    </div>
                  )}
                  
                  <div className="flex -space-x-4 mb-4 justify-center">
                    <img src={e.facePhoto || ''} alt="User" className="w-16 h-16 rounded-full object-cover border-2 border-primary relative z-10" loading="lazy" />
                    {e.crushPhoto && (
                      <img src={e.crushPhoto} alt="Crush" className="w-16 h-16 rounded-full object-cover border-2 border-accent relative z-0" loading="lazy" />
                    )}
                  </div>
                  
                  <div className="text-center mb-4 flex-grow">
                    <h3 className="text-foreground font-bold text-lg leading-tight flex items-center justify-center gap-2">
                       {e.name} <span className="text-muted-foreground text-xs font-normal font-mono">({e.age})</span>
                    </h3>
                    <p className="text-accent text-sm mt-1 flex items-center justify-center gap-1">
                       ❤️ {e.crushName} <span className="text-muted-foreground text-xs font-normal font-mono">({e.crushAge})</span>
                    </p>
                    <div className="mt-3 inline-block px-3 py-1 bg-black/40 rounded border border-white/5">
                       <p className="text-white font-black">{e.roastPercentage || 0}% Compatible</p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setCowardPromptEntry(e); setPaymentClicked(false); setProofText(""); }}
                    className="w-full py-3 bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/30 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors mt-auto"
                  >
                    Take Down Result
                  </button>
                </div>
              ))}
              {entries.length === 0 && (
                <div className="col-span-full text-center py-20 text-muted-foreground">
                  <span className="text-4xl block mb-4 opacity-50">📂</span>
                  <p>The archives are empty. No one has been scanned yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Singles Market Board */}
      {showSingles && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
          <div className="p-4 md:p-6 flex justify-between items-center border-b border-accent/20 bg-black/50 sticky top-0 z-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-heading text-accent glow-gold uppercase tracking-widest">Singles Market 🔥</h2>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Auctioning off your desperate friends.</p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/expose')}
                className="px-4 py-2 bg-accent text-accent-foreground text-xs uppercase tracking-widest font-bold rounded-full hover:scale-105 transition-transform"
              >
                + Expose Friend
              </button>
              <button 
                onClick={() => setShowSingles(false)}
                className="w-10 h-10 rounded-full bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24">
            <div className="max-w-6xl mx-auto grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {singles.map((s) => (
                <div key={s.id} id={`single-card-${s.id}`} className="bg-secondary/60 border border-white/10 rounded-3xl p-5 relative group flex flex-col shadow-2xl">
                  {s.dareStatus === 'pending_removal' && (
                    <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-4 text-center">
                      <span className="text-4xl mb-2 animate-pulse">💸</span>
                      <p className="text-yellow-400 font-bold uppercase tracking-widest text-sm mb-1">Under Review</p>
                      <p className="text-xs text-muted-foreground">They paid the coward fee. Awaiting admin clearance.</p>
                    </div>
                  )}
                  
                  {/* Photo Scroller */}
                  <div className="w-full aspect-[3/4] rounded-2xl overflow-x-auto overflow-y-hidden snap-x snap-mandatory flex scrollbar-hide border-2 border-accent/30 relative shadow-inner mb-4">
                    {s.photos?.map((pic, idx) => (
                       <img key={idx} src={pic} className="w-full h-full object-cover snap-center flex-shrink-0" alt="Exposed single" loading="lazy" />
                    ))}
                    {/* Image Counter Indicator */}
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                      {s.photos?.map((_, idx) => (
                         <div key={idx} className="w-1.5 h-1.5 rounded-full bg-white/80 shadow" />
                      ))}
                    </div>
                  </div>

                  <div className="text-left mb-4 flex-grow px-2">
                    <h3 className="text-white font-black text-2xl tracking-wide flex items-baseline gap-2 mb-2">
                       {s.friendName} <span className="text-accent text-lg font-mono">({s.age})</span>
                    </h3>
                    <div className="bg-black/40 border border-white/5 p-3 rounded-xl italic">
                       <p className="text-foreground/80 text-sm leading-relaxed">{s.talent}</p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <button
                      onClick={() => downloadSingleAsImage(s.id, s.friendName)}
                      className="w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      <span>📸</span> Share as Image
                    </button>
                    <button
                      onClick={() => { setCowardSingleEntry(s); setPaymentClicked(false); setProofText(""); }}
                      className="w-full py-3 bg-[#F43F5E]/10 hover:bg-[#F43F5E]/20 text-[#F43F5E] border border-[#F43F5E]/30 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Take Down Profile
                    </button>
                  </div>
                </div>
              ))}
              {singles.length === 0 && (
                <div className="col-span-full text-center py-20 text-muted-foreground">
                  <span className="text-4xl block mb-4 opacity-50">👻</span>
                  <p className="uppercase tracking-widest text-sm">No singles exposed yet.</p>
                  <button onClick={() => navigate('/expose')} className="mt-4 text-accent uppercase font-bold text-xs hover:underline">Upload a friend now</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Coward Fund Modal / Take Down Hook (Shared by Both) */}
      {(cowardPromptEntry || cowardSingleEntry) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="bg-secondary border border-primary/30 p-6 rounded-xl max-w-sm w-full relative shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            {!paymentClicked ? (
              <div className="text-center">
                <span className="text-5xl mb-4 block">⚖️</span>
                <h2 className="text-2xl font-heading text-primary mb-2">Buy Your Silence</h2>
                <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
                 Too embarrassed to leave <strong className="text-primary">{cowardPromptEntry ? cowardPromptEntry.name : cowardSingleEntry?.friendName}</strong> on the public archives? Apply for removal below.
                </p>

                <div className="space-y-4 mb-6 text-left">
                  <div className="p-4 bg-background/50 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Option 1: Pay ₹1 via UPI</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-black/50 rounded border border-primary/20 text-xs font-mono text-primary truncate">
                        {upiId || "admin@okicici"}
                      </code>
                      <button onClick={() => navigator.clipboard.writeText(upiId || "admin@okicici")} className="px-3 py-2 bg-primary/20 text-primary text-xs rounded border border-primary/30 hover:bg-primary/30 transition-colors shrink-0">Copy</button>
                    </div>
                  </div>

                  <div className="p-4 bg-background/50 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Option 2: Follow these 7 IG Accounts</p>
                    <div className="space-y-2">
                      {Array.from({ length: 7 }).map((_, i) => (
                        <a key={i} href={`https://instagram.com/${igAccount.replace('@', '')}`} target="_blank" rel="noreferrer" className="block w-full text-center py-2 bg-accent/10 text-accent text-xs rounded border border-accent/20 hover:bg-accent/20 transition-colors truncate px-2">
                          {igAccount || '@itsnextgenfounder'} #{i+1}
                        </a>
                      ))}
                    </div>
                  </div>

                  <div>
                    <input
                      value={proofText}
                      onChange={(e) => setProofText(e.target.value)}
                      placeholder="Enter Transaction ID or your IG Handle"
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setCowardPromptEntry(null); setCowardSingleEntry(null); setProofText(""); }}
                    className="flex-1 px-4 py-3 bg-muted/50 text-muted-foreground rounded-lg font-heading hover:bg-muted transition-colors uppercase tracking-wide text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!proofText.trim()) return;
                      setIsSubmittingProof(true);
                      
                      if (cowardPromptEntry) {
                        await updateEntryDare(cowardPromptEntry.id, {
                          dareStatus: 'pending_removal',
                          shameReason: proofText.trim()
                        });
                        setEntries(entries.map(e => e.id === cowardPromptEntry.id ? { ...e, dareStatus: 'pending_removal', shameReason: proofText.trim() } : e));
                      } else if (cowardSingleEntry) {
                        await updateSingleDare(cowardSingleEntry.id, {
                          dareStatus: 'pending_removal',
                          shameReason: proofText.trim()
                        });
                        setSingles(singles.map(e => e.id === cowardSingleEntry.id ? { ...e, dareStatus: 'pending_removal', shameReason: proofText.trim() } : e));
                      }

                      setIsSubmittingProof(false);
                      setPaymentClicked(true);
                    }}
                    disabled={isSubmittingProof || !proofText.trim()}
                    className="flex-[1.5] px-4 py-3 bg-primary text-primary-foreground rounded-lg font-heading hover:bg-primary/80 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)] uppercase tracking-wide text-sm disabled:opacity-50"
                  >
                    {isSubmittingProof ? "Sending..." : "Submit Proof ✨"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="text-6xl mb-4 block animate-bounce">📨</span>
                <h2 className="text-3xl font-heading text-primary mb-2">REQUEST SENT</h2>
                <p className="text-base text-foreground/90 mb-6 font-medium">
                  The admin will review your proof. Once verified, this embarrassing reality will be erased entirely.
                </p>
                <button
                  onClick={() => { setPaymentClicked(false); setCowardPromptEntry(null); setCowardSingleEntry(null); setProofText(""); }}
                  className="w-full px-4 py-4 bg-secondary border border-border text-foreground hover:bg-secondary/80 rounded-lg font-heading transition-colors uppercase tracking-wider shadow-sm"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-muted-foreground text-sm pb-8 space-y-2 relative z-10 mt-auto">
        <p>Advanced AI Chemical Matcher 🧠</p>
        <p className="text-xs">
          Made by{" "}
          <a
            href="https://instagram.com/itsnextgenfounder"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @itsnextgenfounder
          </a>
        </p>
        <div>
          <Link to="/admin" className="text-muted-foreground/30 hover:text-muted-foreground text-[10px] inline-block uppercase tracking-widest mt-4">
            Admin Access
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
