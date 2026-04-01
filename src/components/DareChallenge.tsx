import { useState, useEffect, useCallback } from "react";
import { DareChallenge as DareType, getRandomDare, addAura, updateEntryDare, getAuraRank } from "@/lib/storage";

interface Props {
  entryId: string;
  entryName: string;
  onClose: () => void;
}

type Phase = "offer" | "countdown" | "proof" | "chickened" | "failed" | "completed" | "pending_review";

function formatMs(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const m = Math.floor(totalSecs / 60).toString().padStart(2, "0");
  const s = (totalSecs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

const DareChallengeModal = ({ entryId, entryName, onClose }: Props) => {
  const [dare] = useState<DareType>(() => getRandomDare());
  const [phase, setPhase] = useState<Phase>("offer");
  const [msLeft, setMsLeft] = useState(dare.durationMs);
  const [proof, setProof] = useState<string>("");
  const [auraResult, setAuraResult] = useState<number | null>(null);

  // Countdown
  useEffect(() => {
    if (phase !== "countdown") return;
    if (msLeft <= 0) {
      handleFail();
      return;
    }
    const t = setTimeout(() => setMsLeft(m => m - 1000), 1000);
    return () => clearTimeout(t);
  }, [phase, msLeft]);

  const handleAccept = useCallback(async () => {
    const now = Date.now();
    await updateEntryDare(entryId, {
      dareId: dare.id,
      dareStatus: "accepted",
      dareStartTime: now,
    });
    setPhase("countdown");
  }, [entryId, dare]);

  const handleChicken = useCallback(async () => {
    await updateEntryDare(entryId, {
      dareId: dare.id,
      dareStatus: "chickened",
      shameReason: "🐔 Chickened Out",
    });
    const newAura = addAura(-40);
    setAuraResult(newAura);
    setPhase("chickened");
  }, [entryId, dare]);

  const handleFail = useCallback(async () => {
    await updateEntryDare(entryId, {
      dareId: dare.id,
      dareStatus: "failed",
      shameReason: "💀 Challenge Failed",
    });
    const newAura = addAura(-50);
    setAuraResult(newAura);
    setPhase("failed");
  }, [entryId, dare]);

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setProof(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = useCallback(async () => {
    await updateEntryDare(entryId, {
      dareId: dare.id,
      dareStatus: "pending_review",
      dareProofPhoto: proof, // store base64 proof
    });
    setPhase("pending_review");
  }, [entryId, dare, proof]);

  const difficultyColor = dare.difficulty === 'hard' ? 'text-red-400 border-red-500/50 bg-red-500/10'
    : dare.difficulty === 'medium' ? 'text-orange-400 border-orange-500/50 bg-orange-500/10'
    : 'text-green-400 border-green-500/50 bg-green-500/10';

  const progressPct = ((dare.durationMs - msLeft) / dare.durationMs) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/90 p-4 backdrop-blur-xl">
      <div className="bg-black/40 border-[0.5px] border-white/10 rounded-3xl w-full max-w-md shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl overflow-hidden before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none animate-float-slow">

        {/* OFFER PHASE */}
        {phase === "offer" && (
          <div className="p-8">
            <div className="text-center mb-8">
              <span className="text-6xl block mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">🎲</span>
              <h2 className="font-heading text-3xl font-black text-foreground mb-1 tracking-wider uppercase">Dare Challenge</h2>
              <p className="text-primary/70 text-xs tracking-widest uppercase mt-2">The Oracle demands proof, {entryName}.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 mb-6 shadow-inner backdrop-blur-md">
              <div className="flex items-start gap-4">
                <span className="text-2xl mt-0.5 animate-pulse text-gold">⚡</span>
                <p className="text-foreground/90 text-lg leading-relaxed font-medium">{dare.text}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-8 opacity-80">
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${difficultyColor}`}>
                {dare.difficulty} difficulty
              </span>
              <span className="text-muted-foreground text-xs font-mono tracking-widest">⏱ {formatMs(dare.durationMs)} limit</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleChicken}
                className="flex-1 px-4 py-4 bg-white/5 border border-white/10 text-muted-foreground rounded-2xl font-bold tracking-widest hover:bg-white/10 hover:text-foreground transition-all uppercase text-xs"
              >
                🐔 Chicken Out
              </button>
              <button
                onClick={handleAccept}
                className="flex-[2] px-4 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl font-black shadow-[0_0_30px_rgba(230,194,122,0.3)] hover:shadow-[0_0_50px_rgba(230,194,122,0.5)] hover:-translate-y-1 transition-all uppercase tracking-widest text-xs"
              >
                ⚡ Accept Challenge
              </button>
            </div>
            <button onClick={onClose} className="w-full text-center text-white/30 text-xs mt-6 hover:text-white transition-colors uppercase tracking-widest font-bold">
              Skip this time
            </button>
          </div>
        )}

        {/* COUNTDOWN + PROOF PHASE */}
        {phase === "countdown" && (
          <div className="p-8">
            <div className="text-center mb-8">
              <p className="text-primary/60 text-xs mb-3 uppercase tracking-widest font-bold">Time remaining</p>
              <p className={`font-mono text-7xl font-black tracking-tighter ${msLeft < 60000 ? 'text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse' : 'text-foreground drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]'}`}>
                {formatMs(msLeft)}
              </p>
              <div className="mt-6 h-[2px] bg-white/10 rounded-full overflow-hidden relative">
                <div className="absolute inset-0 bg-primary/20 blur-sm" />
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_#fff] relative z-10"
                  style={{ width: `${100 - progressPct}%` }}
                />
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 mb-6 backdrop-blur-md">
              <p className="text-foreground/90 text-sm leading-relaxed font-medium">📋 {dare.text}</p>
            </div>
            <div className="space-y-4">
              <label className="block">
                <p className="text-primary/70 text-xs mb-3 tracking-widest uppercase font-bold">Upload Proof Screenshot/Video:</p>
                <div className="relative group cursor-pointer w-full bg-black/40 border border-white/10 rounded-2xl hover:border-white/30 transition-all overflow-hidden flex items-center justify-center p-4 min-h-[120px]">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleProofUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                  />
                   {proof ? (
                     <img src={proof} alt="proof" className="absolute inset-0 w-full h-full object-cover z-10 opacity-60 mix-blend-screen" />
                   ) : (
                     <div className="text-center z-10 opacity-50 group-hover:opacity-100 transition-opacity">
                       <span className="text-3xl block mb-2">📸</span>
                       <span className="text-xs uppercase tracking-widest font-bold">Tap to Upload</span>
                     </div>
                   )}
                </div>
              </label>
              
              <button
                onClick={handleSubmitProof}
                disabled={!proof}
                className="w-full px-4 py-4 bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] rounded-2xl font-bold hover:bg-[#25D366]/30 transition-all uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed mt-2"
              >
                ✅ Submit Proof
              </button>
              <button
                onClick={handleChicken}
                className="w-full px-4 py-3 text-red-400/50 text-xs hover:text-red-400 transition-colors uppercase tracking-widest font-bold mt-2"
              >
                Give up (Guaranteed Shame)
              </button>
            </div>
          </div>
        )}

        {/* CHICKENED OUT */}
        {phase === "chickened" && (
          <div className="p-6 text-center">
            <span className="text-6xl block mb-4 animate-shake">🐔</span>
            <h2 className="font-heading text-3xl text-accent mb-2">COWARD CONFIRMED</h2>
            <p className="text-foreground/80 mb-4">{entryName} has been added to the Global Shame Board.</p>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-5">
              <p className="text-red-400 font-bold text-lg">-40 AURA</p>
              {auraResult !== null && (
                <p className="text-muted-foreground text-sm mt-1">
                  New Aura: {auraResult} — {getAuraRank(auraResult).emoji} {getAuraRank(auraResult).label}
                </p>
              )}
            </div>
            <button onClick={onClose} className="w-full px-4 py-3 bg-muted text-muted-foreground rounded-xl font-heading">
              Accept My Fate
            </button>
          </div>
        )}

        {/* TIME FAILED */}
        {phase === "failed" && (
          <div className="p-6 text-center">
            <span className="text-6xl block mb-4">💀</span>
            <h2 className="font-heading text-3xl text-red-400 mb-2">CHALLENGE FAILED</h2>
            <p className="text-foreground/80 mb-4">Time's up, {entryName}. The Oracle has spoken. Shame board it is.</p>
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl mb-5">
              <p className="text-red-400 font-bold text-lg">-50 AURA</p>
              {auraResult !== null && (
                <p className="text-muted-foreground text-sm mt-1">
                  New Aura: {auraResult} — {getAuraRank(auraResult).emoji} {getAuraRank(auraResult).label}
                </p>
              )}
            </div>
            <button onClick={onClose} className="w-full px-4 py-3 bg-muted text-muted-foreground rounded-xl font-heading">
              Accept My Fate
            </button>
          </div>
        )}

        {/* PENDING REVIEW (NEW) */}
        {phase === "pending_review" && (
          <div className="p-6 text-center">
            <span className="text-6xl block mb-4 animate-pulse">👀</span>
            <h2 className="font-heading text-3xl text-primary glow-gold mb-2">PROOF SUBMITTED!</h2>
            <p className="text-foreground/80 mb-4">The Oracle (Admin) is reviewing your claim, {entryName}.</p>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl mb-5 text-left">
              <p className="text-primary font-bold text-sm mb-1">What happens now?</p>
              <p className="text-muted-foreground text-xs">If approved: +20 Aura 🏆<br/>If caught faking: -50 Aura & Global Shame 🤡</p>
            </div>
            <button onClick={onClose} className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl font-heading glow-box-gold">
              I'll Await My Fate
            </button>
          </div>
        )}

        {/* COMPLETED (Only triggered via Admin now, this block won't happen locally anymore) */}
        {phase === "completed" && (
          <div className="p-6 text-center">
            <span className="text-6xl block mb-4 animate-pulse">🏆</span>
            <h2 className="font-heading text-3xl text-primary glow-gold mb-2">DARE COMPLETED!</h2>
            <p className="text-foreground/80 mb-4">You actually did it, {entryName}. Respect. +20 Aura incoming.</p>
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-5">
              <p className="text-green-400 font-bold text-lg">+20 AURA</p>
              {auraResult !== null && (
                <p className="text-muted-foreground text-sm mt-1">
                  New Aura: {auraResult} — {getAuraRank(auraResult).emoji} {getAuraRank(auraResult).label}
                </p>
              )}
            </div>
            <button onClick={onClose} className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-xl font-heading glow-box-gold">
              Flex This Win 💪
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DareChallengeModal;
