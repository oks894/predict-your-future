import { ScanEntry, getAuraRank } from "@/lib/storage";

interface Props {
  challenger: ScanEntry;
  defender: ScanEntry;
  onClose: () => void;
}

const DuelResult = ({ challenger, defender, onClose }: Props) => {
  // Determine winner (lower cringe/delusion percentage wins)
  const cScore = challenger.roastPercentage || 100;
  const dScore = defender.roastPercentage || 100;
  
  const isDraw = cScore === dScore;
  const defenderWins = dScore < cScore;

  const winner = isDraw ? null : defenderWins ? defender : challenger;
  const loser = isDraw ? null : defenderWins ? challenger : defender;

  const getStatusText = () => {
    if (isDraw) return "IT'S A TRAGIC TIE 💀";
    return defenderWins ? "YOU SURVIVED! 🎉" : "YOU GOT COOKED! 🤡";
  };

  const cRank = getAuraRank(challenger.aura || 100);
  const dRank = getAuraRank(defender.aura || 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
      <div className="bg-secondary/80 border border-primary/30 rounded-2xl w-full max-w-lg p-6 relative overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.15)]">
        
        {/* Background glow based on result */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] blur-[100px] opacity-30 ${defenderWins ? 'bg-green-500' : isDraw ? 'bg-zinc-500' : 'bg-red-500'}`} />

        <div className="text-center mb-6 relative z-10">
          <span className="text-5xl block mb-2 animate-bounce">⚔️</span>
          <h2 className="font-heading text-3xl text-primary glow-gold">ROAST DUEL RESULT</h2>
          <p className="text-xl font-bold mt-2" style={{ color: defenderWins ? '#4ade80' : isDraw ? '#a1a1aa' : '#f87171' }}>
            {getStatusText()}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 relative z-10 mb-8">
          {/* CHALLENGER */}
          <div className="flex-1 flex flex-col items-center">
            <div className="relative mb-3">
              <img src={challenger.facePhoto} className={`w-24 h-24 rounded-full object-cover border-4 ${!defenderWins && !isDraw ? 'border-green-400 shadow-[0_0_20px_#4ade80]' : 'border-red-500/50 grayscale'}`} alt="Challenger" />
              {!defenderWins && !isDraw && <div className="absolute -top-3 -right-3 text-2xl">👑</div>}
            </div>
            <p className="font-bold text-lg mb-1">{challenger.name}</p>
            <p className="text-3xl font-heading text-primary glow-gold mb-1">{cScore}%</p>
            <p className="text-xs text-muted-foreground uppercase">{challenger.scanType === 'love' ? 'Delusion' : 'Cringe'}</p>
          </div>

          <div className="text-4xl font-heading text-muted-foreground/30 px-2 italic">VS</div>

          {/* DEFENDER */}
          <div className="flex-1 flex flex-col items-center">
            <div className="relative mb-3">
              <img src={defender.facePhoto} className={`w-24 h-24 rounded-full object-cover border-4 ${defenderWins ? 'border-green-400 shadow-[0_0_20px_#4ade80]' : 'border-red-500/50 grayscale'}`} alt="You" />
              {defenderWins && <div className="absolute -top-3 -right-3 text-2xl">👑</div>}
            </div>
            <p className="font-bold text-lg mb-1">You</p>
            <p className="text-3xl font-heading text-primary glow-gold mb-1">{dScore}%</p>
            <p className="text-xs text-muted-foreground uppercase">{defender.scanType === 'love' ? 'Delusion' : 'Cringe'}</p>
          </div>
        </div>

        <div className="bg-background/40 border border-border rounded-xl p-4 text-center relative z-10 mb-6">
          {isDraw ? (
            <p className="text-sm text-muted-foreground">The Oracle has determined that both of you are equally hopeless.</p>
          ) : (
            <p className="text-sm">
              <strong className="text-green-400">{winner?.name || 'You'}</strong> asserts their dominance with lower cringe levels. <strong className="text-red-400">{loser?.name || 'You'}</strong> is officially a Certified NPC.
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-4 bg-primary text-primary-foreground rounded-xl font-heading text-lg hover:opacity-90 transition-opacity glow-box-gold relative z-10 uppercase tracking-widest"
        >
          Accept Judgment
        </button>
      </div>
    </div>
  );
};

export default DuelResult;
