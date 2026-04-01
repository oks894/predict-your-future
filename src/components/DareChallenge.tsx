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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="bg-secondary border border-primary/30 rounded-2xl w-full max-w-md shadow-[0_0_40px_rgba(212,175,55,0.2)] animate-float-slow">

        {/* OFFER PHASE */}
        {phase === "offer" && (
          <div className="p-6">
            <div className="text-center mb-5">
              <span className="text-5xl block mb-3">🎲</span>
              <h2 className="font-heading text-2xl text-primary glow-gold">Dare Challenge</h2>
              <p className="text-muted-foreground text-sm mt-1">The Oracle demands proof of your bravery, {entryName}.</p>
            </div>
            <div className="p-4 rounded-xl bg-background/60 border border-border mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">⚡</span>
                <p className="text-foreground text-base leading-relaxed font-medium">{dare.text}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-5">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${difficultyColor}`}>
                {dare.difficulty} difficulty
              </span>
              <span className="text-muted-foreground text-xs">⏱ {formatMs(dare.durationMs)} limit</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleChicken}
                className="flex-1 px-4 py-3 bg-muted/50 text-muted-foreground rounded-xl font-heading hover:bg-muted transition-colors uppercase tracking-wide text-sm"
              >
                🐔 Chicken Out
              </button>
              <button
                onClick={handleAccept}
                className="flex-[2] px-4 py-3 bg-primary text-primary-foreground rounded-xl font-heading hover:opacity-90 transition-opacity glow-box-gold uppercase tracking-wide text-sm"
              >
                ⚡ Accept Challenge
              </button>
            </div>
            <button onClick={onClose} className="w-full text-center text-muted-foreground/50 text-xs mt-3 hover:text-muted-foreground transition-colors">
              Skip this time
            </button>
          </div>
        )}

        {/* COUNTDOWN + PROOF PHASE */}
        {phase === "countdown" && (
          <div className="p-6">
            <div className="text-center mb-4">
              <p className="text-muted-foreground text-sm mb-2">Time remaining</p>
              <p className={`font-heading text-6xl glow-gold ${msLeft < 60000 ? 'text-red-400 animate-pulse' : 'text-primary'}`}>
                {formatMs(msLeft)}
              </p>
              <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                  style={{ width: `${100 - progressPct}%` }}
                />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-background/60 border border-border mb-4">
              <p className="text-foreground text-sm leading-relaxed">📋 {dare.text}</p>
            </div>
            <div className="space-y-3">
              <label className="block">
                <p className="text-foreground text-sm mb-2 font-medium">Upload your proof screenshot / video:</p>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleProofUpload}
                  className="w-full px-4 py-3 bg-input border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </label>
              {proof && (
                <img src={proof} alt="proof" className="w-full h-40 object-cover rounded-xl border border-primary/30" />
              )}
              <button
                onClick={handleSubmitProof}
                disabled={!proof}
                className="w-full px-4 py-3 bg-green-600 text-foreground rounded-xl font-heading hover:bg-green-700 transition-colors uppercase tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ✅ Submit Proof
              </button>
              <button
                onClick={handleChicken}
                className="w-full px-4 py-2 text-muted-foreground text-xs hover:text-foreground transition-colors"
              >
                Give up (guaranteed shame board)
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
