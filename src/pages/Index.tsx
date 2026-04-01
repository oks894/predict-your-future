import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { getEntries, getTier, getAdminUpiId, getAdminIgAccount, updateEntryDare, getAura, getAuraRank, syncAdminConfig } from "@/lib/storage";
import type { ScanEntry } from "@/lib/storage";
import StarField from "@/components/StarField";
import ShameBoard from "@/components/ShameBoard";
import AuraCardGenerator from "@/components/AuraCard";
import TopAuraBoard from "@/components/TopAuraBoard";
import WallOfLove from "@/components/WallOfLove";

const Index = () => {
  const [searchParams] = useSearchParams();
  const challenge = searchParams.get("challenge");
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const [shameTab, setShameTab] = useState<'new' | 'delusional' | 'cringe'>('new');
  const [cowardPromptEntry, setCowardPromptEntry] = useState<ScanEntry | null>(null);
  const [paymentClicked, setPaymentClicked] = useState(false);
  const [proofText, setProofText] = useState("");
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [showAuraCard, setShowAuraCard] = useState(false);
  const [upiId, setUpiIdState] = useState('');
  const [igAccount, setIgAccountState] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (challenge) {
      navigate(`/scan?challenge=${encodeURIComponent(challenge)}`, { replace: true });
    }
  }, [challenge, navigate]);

  useEffect(() => {
    syncAdminConfig().then(() => {
      setUpiIdState(getAdminUpiId());
      setIgAccountState(getAdminIgAccount());
    });
    getEntries().then(setEntries);
  }, []);

  const appUrl = window.location.origin;
  const scanUrl = `${appUrl}/#/scan`;

  let displayEntries = [...entries];
  if (shameTab === 'delusional') {
    displayEntries = displayEntries.filter(e => e.scanType === 'love').sort((a, b) => (b.roastPercentage || 0) - (a.roastPercentage || 0));
  } else if (shameTab === 'cringe') {
    displayEntries = displayEntries.filter(e => e.scanType !== 'love').sort((a, b) => (b.roastPercentage || 0) - (a.roastPercentage || 0));
  }

  return (
    <div className="min-h-[100dvh] bg-mystical relative overflow-hidden">
      <StarField />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 md:py-12">

        {/* Hero */}
        <div className="text-center mb-10 md:mb-16">
          <h1 className="font-heading text-3xl md:text-6xl text-primary glow-gold mb-2 md:mb-4">
            Predict Your Future
          </h1>
          <p className="text-lg md:text-2xl text-foreground/80 font-heading">
            🔮 See Your Destiny
          </p>
          <p className="text-sm md:text-base text-accent font-heading mt-1">Advanced AI face analysis powered by neural networks</p>
          <p className="text-muted-foreground mt-2 text-sm">🧬 AI-powered face analysis • 14 billion timelines scanned</p>

          {/* Game Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => navigate("/scan")}
              className="px-8 py-4 bg-primary text-primary-foreground font-heading text-lg rounded-lg glow-box-gold hover:scale-105 transition-transform w-full sm:w-auto"
            >
              Scan My Future 🔮
            </button>
            <button
              onClick={() => navigate("/love")}
              className="px-8 py-4 bg-accent text-accent-foreground font-heading text-lg rounded-lg shadow-[0_0_15px_rgba(255,0,100,0.5)] hover:scale-105 transition-transform w-full sm:w-auto"
            >
              Love Calculator 💔
            </button>
            <button
              onClick={() => setShowAuraCard(true)}
              className="px-8 py-4 border border-primary/50 text-primary font-heading text-lg rounded-lg hover:bg-primary/10 transition-colors w-full sm:w-auto"
            >
              ✨ Aura Card
            </button>
            <button
              onClick={() => navigate("/challenges")}
              className="px-8 py-4 bg-secondary text-foreground font-heading text-lg rounded-lg border border-primary/40 hover:border-primary hover:scale-105 transition-all w-full sm:w-auto"
            >
              ⚔️ Dare To Challenge
            </button>
          </div>
        </div>

        {/* Top Aura Legends Leaderboard */}
        <TopAuraBoard />

        {/* Global Idiot Ranking Board */}
        {entries.length > 0 && (
          <div className="mb-16">
            <h2 className="font-heading text-3xl text-primary glow-gold text-center mb-6">
              🌍 Global Idiot Ranking Board
            </h2>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              <button
                onClick={() => setShameTab('new')}
                className={`px-4 py-2 text-sm rounded-full font-bold border transition-colors ${shameTab === 'new' ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'}`}
              >
                Newest Fails
              </button>
              <button
                onClick={() => setShameTab('delusional')}
                className={`px-4 py-2 text-sm rounded-full font-bold border transition-colors ${shameTab === 'delusional' ? 'bg-accent text-accent-foreground border-accent shadow-[0_0_10px_rgba(255,0,100,0.4)]' : 'bg-transparent text-muted-foreground border-border hover:border-accent/50'}`}
              >
                Most Delusional 💔
              </button>
              <button
                onClick={() => setShameTab('cringe')}
                className={`px-4 py-2 text-sm rounded-full font-bold border transition-colors ${shameTab === 'cringe' ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'}`}
              >
                Maximum Cringe 💀
              </button>
            </div>

            <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2 overflow-x-hidden p-1">
              {displayEntries.map((e, i) => (
                <div key={e.id} className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 rounded-2xl bg-secondary/90 border-2 ${e.scanType === 'love' ? 'border-accent/40 shadow-[0_0_15px_rgba(255,0,100,0.2)]' : 'border-primary/40 shadow-[0_0_15px_rgba(212,175,55,0.2)]'} hover:border-primary hover:bg-secondary transition-all`}>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <span className={`font-heading text-2xl font-black w-10 text-center ${i === 0 ? 'text-primary glow-gold' : i === 1 ? 'text-slate-300' : 'text-primary/60'}`}>#{i + 1}</span>
                    <div className="flex -space-x-4">
                      <img
                        src={e.facePhoto}
                        alt={e.name}
                        className="w-16 h-16 rounded-full object-cover border-[3px] border-primary relative z-10 shadow-lg"
                        loading="lazy"
                      />
                      {e.crushPhoto && (
                        <img
                          src={e.crushPhoto}
                          alt="Crush"
                          className="w-16 h-16 rounded-full object-cover border-[3px] border-accent relative z-0 shadow-lg shadow-accent/20"
                          loading="lazy"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 ml-2 w-full">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xl font-bold text-foreground">{e.name}</span>
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-black tracking-widest rounded-md ${e.scanType === 'love' ? 'bg-accent/30 text-accent border border-accent/50' : 'bg-primary/30 text-primary border border-primary/50'}`}>
                          {e.scanType === 'love' ? '❤️ Delusion' : '🪐 Cringe'}
                        </span>
                      </div>
                      {e.dareStatus === 'pending_removal' ? (
                        <span className="text-[10px] shrink-0 font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 px-3 py-1 flex items-center gap-1 rounded-full uppercase tracking-widest">
                          Reviewing Bribe
                        </span>
                      ) : (
                        <button
                          onClick={() => { setCowardPromptEntry(e); setPaymentClicked(false); setProofText(""); }}
                          className="text-[10px] shrink-0 font-bold bg-green-500/20 text-green-400 border border-green-500/40 px-3 py-1 flex items-center gap-1 rounded-full hover:bg-green-500/40 transition-all uppercase tracking-widest"
                        >
                          Remove (₹1)
                        </button>
                      )}
                    </div>
                    <p className={`font-black text-sm mb-1 ${e.scanType === 'love' ? 'text-accent' : 'text-primary'}`}>
                      {getTier(e.roastPercentage || 0)} • {e.roastPercentage || 0}% {e.scanType === 'love' ? 'DELUSIONAL' : 'CRINGE'}
                    </p>
                    <p className="text-foreground/90 text-sm italic font-medium leading-relaxed line-clamp-2 bg-black/20 p-2 rounded-lg border border-white/5">
                      "{e.roastText.split('\n\n')[1] || e.roastText.replace(/\n\n/g, ' ')}"
                    </p>
                  </div>
                </div>
              ))}
              {displayEntries.length === 0 && (
                <div className="text-center p-12 border border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground text-lg">Nobody here yet.</p>
                  <p className="text-primary mt-2">Become the first victim.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dare Failures Shame Board */}
        <ShameBoard />

        {/* User Reviews & Feedback */}
        <WallOfLove />
      </div>

      {/* Footer */}
      <footer className="text-center text-muted-foreground text-sm pb-8 space-y-2 mt-12 relative z-10">
        <p>Predict Your Future™ — Powered by Advanced Neural Networks 🧠</p>
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
          {" "}— Follow on Instagram ❤️
        </p>
        <div>
          <Link to="/admin" className="text-muted-foreground/50 hover:text-muted-foreground text-xs inline-block">
            Admin
          </Link>
        </div>
      </footer>

      {/* Coward Fund Modal */}
      {cowardPromptEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="bg-secondary border border-primary/30 p-6 rounded-xl max-w-sm w-full relative shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            {!paymentClicked ? (
              <div className="text-center">
                <span className="text-5xl mb-4 block">⚖️</span>
                <h2 className="text-2xl font-heading text-primary mb-2">Buy Your Silence</h2>
                <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
                  Too embarrassed to leave <strong className="text-primary">{cowardPromptEntry.name}</strong> on the global boards? Apply for removal below.
                </p>

                <div className="space-y-4 mb-6 text-left">
                  <div className="p-4 bg-background/50 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Option 1: Pay ₹1</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-black/50 rounded border border-primary/20 text-xs font-mono text-primary truncate">
                        {upiId || "UPI Not Configured — set in Admin"}
                      </code>
                      <button onClick={() => navigator.clipboard.writeText(upiId)} className="px-3 py-2 bg-primary/20 text-primary text-xs rounded border border-primary/30 hover:bg-primary/30 transition-colors shrink-0">Copy</button>
                    </div>
                  </div>

                  <div className="p-4 bg-background/50 rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2">Option 2: Follow Admin</p>
                    {igAccount ? (
                      <a href={`https://instagram.com/${igAccount.replace('@', '')}`} target="_blank" rel="noreferrer" className="block w-full text-center py-2 bg-accent/20 text-accent text-sm rounded-lg border border-accent/30 hover:bg-accent/30 transition-colors">
                        Follow {igAccount}
                      </a>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">IG Not Configured — set in Admin</p>
                    )}
                  </div>

                  <div>
                    <input
                      value={proofText}
                      onChange={(e) => setProofText(e.target.value)}
                      placeholder="Enter your IG Handle or Transaction ID"
                      className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setCowardPromptEntry(null); setProofText(""); }}
                    className="flex-1 px-4 py-3 bg-muted/50 text-muted-foreground rounded-lg font-heading hover:bg-muted transition-colors uppercase tracking-wide text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      if (!proofText.trim()) return;
                      setIsSubmittingProof(true);
                      await updateEntryDare(cowardPromptEntry.id, {
                        dareStatus: 'pending_removal',
                        shameReason: proofText.trim()
                      });
                      setEntries(entries.map(e => e.id === cowardPromptEntry.id ? { ...e, dareStatus: 'pending_removal', shameReason: proofText.trim() } : e));
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
                  The admin will review your proof. Once verified, this cringe will be erased forever.
                </p>
                <button
                  onClick={() => { setPaymentClicked(false); setCowardPromptEntry(null); setProofText(""); }}
                  className="w-full px-4 py-4 bg-secondary border border-border text-foreground hover:bg-secondary/80 rounded-lg font-heading transition-colors uppercase tracking-wider shadow-sm"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Aura Card Modal — triggered from game buttons only */}
      {showAuraCard && (
        <AuraCardGenerator
          entry={{ id: '', name: 'You', age: 0, crushName: '', crushAge: 0, facePhoto: '', roastText: '', timestamp: Date.now() } as any}
          aura={getAura()}
          onClose={() => setShowAuraCard(false)}
        />
      )}
    </div>
  );
};

export default Index;
