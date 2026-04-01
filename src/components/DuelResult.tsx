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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl">
      <div className="bg-black/60 border-[0.5px] border-white/10 rounded-3xl w-full max-w-lg p-8 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none">
        
        {/* Background glow based on result */}
        <div className={`absolute -top-1/2 left-1/2 -translate-x-1/2 w-[200%] h-[300px] blur-[100px] opacity-20 pointer-events-none rounded-full ${defenderWins ? 'bg-[#4ade80]' : isDraw ? 'bg-zinc-500' : 'bg-red-500'}`} />

        <div className="text-center mb-8 relative z-10">
          <span className="text-6xl block mb-4 animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">⚔️</span>
          <h2 className="font-heading text-4xl font-black text-foreground mb-1 tracking-wider uppercase glow-gold">DUEL RESULT</h2>
          <p className="text-xl font-black tracking-widest mt-3 uppercase" style={{ color: defenderWins ? '#4ade80' : isDraw ? '#a1a1aa' : '#f87171', textShadow: `0 0 20px ${defenderWins ? 'rgba(74,222,128,0.5)' : isDraw ? 'rgba(161,161,170,0.5)' : 'rgba(248,113,113,0.5)'}` }}>
            {getStatusText()}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 relative z-10 mb-10">
          {/* CHALLENGER */}
          <div className="flex-1 flex flex-col items-center">
            <div className="relative mb-4">
              <img src={challenger.facePhoto} className={`w-28 h-28 rounded-full object-cover border-[3px] shadow-2xl ${!defenderWins && !isDraw ? 'border-[#4ade80] shadow-[0_0_30px_rgba(74,222,128,0.5)]' : 'border-red-500/30 grayscale opacity-60'}`} alt="Challenger" />
              {!defenderWins && !isDraw && <div className="absolute -top-4 -right-2 text-3xl drop-shadow-[0_0_10px_gold] rotate-12">👑</div>}
            </div>
            <p className="font-black text-xl mb-1 text-foreground drop-shadow-md">{challenger.name}</p>
            <p className="text-4xl font-heading text-primary glow-gold mb-1">{cScore}%</p>
            <p className="text-[10px] font-black tracking-widest text-primary/60 uppercase">{challenger.scanType === 'love' ? 'Delusion' : 'Cringe'}</p>
          </div>

          <div className="text-3xl font-black text-white/20 px-2 italic font-heading drop-shadow-lg">VS</div>

          {/* DEFENDER */}
          <div className="flex-1 flex flex-col items-center">
            <div className="relative mb-4">
              <img src={defender.facePhoto} className={`w-28 h-28 rounded-full object-cover border-[3px] shadow-2xl ${defenderWins ? 'border-[#4ade80] shadow-[0_0_30px_rgba(74,222,128,0.5)]' : 'border-red-500/30 grayscale opacity-60'}`} alt="You" />
              {defenderWins && <div className="absolute -top-4 -right-2 text-3xl drop-shadow-[0_0_10px_gold] rotate-12">👑</div>}
            </div>
            <p className="font-black text-xl mb-1 text-foreground drop-shadow-md">You</p>
            <p className="text-4xl font-heading text-primary glow-gold mb-1">{dScore}%</p>
            <p className="text-[10px] font-black tracking-widest text-primary/60 uppercase">{defender.scanType === 'love' ? 'Delusion' : 'Cringe'}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center relative z-10 mb-8 backdrop-blur-md shadow-inner">
          {isDraw ? (
            <p className="text-sm text-foreground/80 font-medium leading-relaxed">The Oracle has determined that both of you are equally hopeless.</p>
          ) : (
            <p className="text-sm font-medium leading-relaxed text-foreground/90">
              <strong className="text-[#4ade80] drop-shadow-[0_0_10px_rgba(74,222,128,0.5)] font-black uppercase text-base tracking-wide">{winner?.name || 'You'}</strong> asserts their dominance with lower cringe levels. <strong className="text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)] font-black uppercase text-base tracking-wide">{loser?.name || 'You'}</strong> is officially a Certified NPC.
            </p>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full px-4 py-5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl font-black shadow-[0_0_30px_rgba(230,194,122,0.3)] hover:shadow-[0_0_50px_rgba(230,194,122,0.5)] hover:-translate-y-1 transition-all uppercase tracking-widest text-sm"
        >
          Accept Judgment
        </button>
      </div>
    </div>
  );
};

export default DuelResult;
