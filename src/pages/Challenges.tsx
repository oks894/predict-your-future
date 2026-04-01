import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addAura, getAura, getAuraRank } from "@/lib/storage";
import StarField from "@/components/StarField";

interface Challenge {
  id: string;
  type: 'solo' | 'duet';
  title: string;
  description: string;
  auraReward: number;
  penalty: number;
  emoji: string;
  dareText: string;
}

const CHALLENGES: Challenge[] = [
  {
    id: 'future-solo',
    type: 'solo',
    title: 'Solo Prophecy',
    description: 'Scan your own face. No backing out. The AI will expose EVERYTHING.',
    auraReward: 20,
    penalty: -30,
    emoji: '🔮',
    dareText: 'I dare you to face the truth about yourself.',
  },
  {
    id: 'love-solo',
    type: 'solo',
    title: 'Cupid Trial',
    description: 'Submit your crush\'s name and photo. The AI calculates your delusion level.',
    auraReward: 25,
    penalty: -35,
    emoji: '💔',
    dareText: 'Confess your crush. Let the AI judge you.',
  },
  {
    id: 'duet-friend',
    type: 'duet',
    title: 'Duet Roast',
    description: 'Tag a friend. You BOTH get scanned. The one with the higher cringe % loses 50 Aura.',
    auraReward: 40,
    penalty: -50,
    emoji: '⚔️',
    dareText: 'Challenge a friend to see who gets destroyed worse.',
  },
  {
    id: 'duet-couple',
    type: 'duet',
    title: 'Couple Compatibility Trial',
    description: 'Both of you upload photos. The AI reveals your compatibility — and it\'s not pretty.',
    auraReward: 50,
    penalty: -60,
    emoji: '💀',
    dareText: 'Find out if your relationship is actually a mistake.',
  },
];

const Challenges = () => {
  const navigate = useNavigate();
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [friendName, setFriendName] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [chickened, setChickened] = useState(false);
  const aura = getAura();
  const rank = getAuraRank(aura);

  const handleAccept = (challenge: Challenge) => {
    addAura(challenge.auraReward);
    setAccepted(true);
    setTimeout(() => {
      if (challenge.id === 'love-solo' || challenge.id === 'duet-couple') {
        navigate('/love');
      } else {
        navigate('/scan');
      }
    }, 1500);
  };

  const handleChicken = (challenge: Challenge) => {
    addAura(challenge.penalty);
    setChickened(true);
    setTimeout(() => {
      setActiveChallenge(null);
      setChickened(false);
      setAccepted(false);
    }, 3000);
  };

  return (
    <div className="min-h-[100dvh] bg-mystical relative overflow-hidden">
      <StarField />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="text-muted-foreground text-sm hover:text-primary transition-colors mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="font-heading text-4xl md:text-5xl text-primary glow-gold mb-2">⚔️ Dare To Challenge</h1>
          <p className="text-foreground/70 text-lg">Accept a dare. Earn Aura. Or chicken out and lose it all.</p>
        </div>

        {/* Aura widget */}
        <div className="flex justify-center mb-10">
          <div className="px-6 py-4 bg-secondary/80 border border-primary/40 rounded-2xl flex items-center gap-4 shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Your Aura</p>
              <p className="text-3xl font-heading font-bold text-primary">{aura}</p>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Rank</p>
              <p className="text-sm font-bold text-foreground">{rank.emoji} {rank.label}</p>
            </div>
          </div>
        </div>

        {/* Challenge Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {CHALLENGES.map(challenge => (
            <button
              key={challenge.id}
              onClick={() => { setActiveChallenge(challenge); setAccepted(false); setChickened(false); setFriendName(''); }}
              className="group p-6 rounded-2xl bg-secondary/80 border border-primary/20 hover:border-primary/70 hover:bg-secondary transition-all text-left shadow-md hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">{challenge.emoji}</span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${challenge.type === 'duet' ? 'bg-accent/10 text-accent border-accent/30' : 'bg-primary/10 text-primary border-primary/30'}`}>
                  {challenge.type === 'duet' ? '2 Players' : 'Solo'}
                </span>
              </div>
              <h3 className="font-heading text-xl text-foreground mb-2 group-hover:text-primary transition-colors">{challenge.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{challenge.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-green-400 text-xs font-bold">+{challenge.auraReward} Aura if accepted ✅</span>
                <span className="text-red-400 text-xs font-bold">{challenge.penalty} if chickened 🐓</span>
              </div>
            </button>
          ))}
        </div>

        {/* Challenge Modal */}
        {activeChallenge && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-secondary border border-primary/40 rounded-2xl p-6 max-w-md w-full shadow-[0_0_40px_rgba(212,175,55,0.25)]">
              {!accepted && !chickened ? (
                <>
                  <div className="text-center mb-6">
                    <span className="text-6xl mb-4 block">{activeChallenge.emoji}</span>
                    <h2 className="font-heading text-2xl text-primary mb-2">{activeChallenge.title}</h2>
                    <p className="text-foreground/80 italic mb-4 text-sm">"{activeChallenge.dareText}"</p>
                    <div className="flex justify-center gap-6 text-sm mb-4">
                      <span className="text-green-400 font-bold">✅ Accept: +{activeChallenge.auraReward}</span>
                      <span className="text-red-400 font-bold">🐓 Chicken: {activeChallenge.penalty}</span>
                    </div>
                  </div>

                  {activeChallenge.type === 'duet' && (
                    <div className="mb-4">
                      <input
                        value={friendName}
                        onChange={e => setFriendName(e.target.value)}
                        placeholder="Friend's name (for the record)"
                        className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleAccept(activeChallenge)}
                      className="w-full py-4 bg-primary text-primary-foreground font-heading text-lg rounded-xl hover:opacity-90 transition-opacity glow-box-gold uppercase tracking-wide"
                    >
                      I Accept The Challenge 🔥
                    </button>
                    <button
                      onClick={() => handleChicken(activeChallenge)}
                      className="w-full py-3 bg-muted/30 text-muted-foreground font-heading rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border border-border transition-all uppercase tracking-wide text-sm"
                    >
                      🐓 I'm a Coward ({activeChallenge.penalty} Aura)
                    </button>
                    <button
                      onClick={() => setActiveChallenge(null)}
                      className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : accepted ? (
                <div className="text-center py-6">
                  <span className="text-6xl mb-4 block animate-bounce">🔥</span>
                  <h2 className="font-heading text-3xl text-primary mb-2">CHALLENGER!</h2>
                  <p className="text-foreground font-bold text-lg mb-2">+{activeChallenge.auraReward} Aura Added</p>
                  <p className="text-muted-foreground text-sm">Redirecting to the arena...</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <span className="text-6xl mb-4 block">🐓</span>
                  <h2 className="font-heading text-3xl text-accent mb-2">COWARD.</h2>
                  <p className="text-foreground font-bold text-xl mb-2">{activeChallenge.penalty} Aura Deducted</p>
                  <p className="text-muted-foreground text-sm animate-pulse">The Shame Board has been notified.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Challenges;
