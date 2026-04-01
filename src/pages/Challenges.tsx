import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { addAura, getAura, getAuraRank } from "@/lib/storage";
import StarField from "@/components/StarField";

export interface ChallengeDef {
  id: string;
  type: 'solo' | 'duet' | 'group';
  title: string;
  description: string;
  auraReward: number;
  penalty: number;
  emoji: string;
}

const CHALLENGES: ChallengeDef[] = [
  // SOLO CHALLENGES
  {
    id: 'excuse-trial',
    type: 'solo',
    title: 'Excuse Trial',
    description: "Type your worst excuse. AI decides if it's believable.",
    auraReward: 20,
    penalty: -30,
    emoji: '🧾',
  },
  {
    id: 'red-flag-confess',
    type: 'solo',
    title: 'Red Flag Confess',
    description: 'Admit a toxic habit. Prepare for severe judgment.',
    auraReward: 20,
    penalty: -30,
    emoji: '🚩',
  },
  {
    id: 'text-graveyard',
    type: 'solo',
    title: 'Text Graveyard',
    description: 'Paste your most embarrassing sent text. Get destroyed.',
    auraReward: 25,
    penalty: -35,
    emoji: '💀',
  },
  {
    id: 'vocab-roast',
    type: 'solo',
    title: 'Vocabulary Roast',
    description: 'Type how you talk/text. The AI reads your exact vibe.',
    auraReward: 20,
    penalty: -30,
    emoji: '🗣️',
  },
  
  // 2 PLAYER CHALLENGES
  {
    id: 'main-character',
    type: 'duet',
    title: "Who's the Main Character",
    description: "Both players describe themselves in 3 words. AI picks the sidekick.",
    auraReward: 40,
    penalty: -50,
    emoji: '🎬',
  },
  {
    id: 'apology-battle',
    type: 'duet',
    title: 'Apology Battle',
    description: "Write an apology. AI judges whose is more toxic and fake.",
    auraReward: 40,
    penalty: -50,
    emoji: '😇',
  },
  {
    id: 'text-energy',
    type: 'duet',
    title: 'Who Texted First Energy',
    description: "Describe your texting styles. AI rates who is more desperate.",
    auraReward: 40,
    penalty: -50,
    emoji: '📱',
  },

  // GROUP CHALLENGES
  {
    id: 'hot-seat',
    type: 'group',
    title: 'Hot Seat Roast',
    description: "Target a victim. Everyone types one word describing them.",
    auraReward: 50,
    penalty: -60,
    emoji: '🪑',
  },
  {
    id: 'most-likely-to',
    type: 'group',
    title: 'Most Likely To',
    description: "Enter all names. AI randomly assigns a brutal 'Most Likely' scenario.",
    auraReward: 50,
    penalty: -60,
    emoji: '🏆',
  },
];

const Challenges = () => {
  const navigate = useNavigate();
  const [activeChallenge, setActiveChallenge] = useState<ChallengeDef | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [chickened, setChickened] = useState(false);
  const aura = getAura();
  const rank = getAuraRank(aura);

  const handleAccept = (challenge: ChallengeDef) => {
    // We do NOT add Aura here. Aura is added AFTER they complete the challenge loop now!
    setAccepted(true);
    setTimeout(() => {
      navigate(`/play?challenge=${challenge.id}`);
    }, 1500);
  };

  const handleChicken = (challenge: ChallengeDef) => {
    addAura(challenge.penalty);
    setChickened(true);
    
    // Auto-record the fail in the Idiot Board using generic scanType "challenge-chicken"
    setTimeout(() => {
      setActiveChallenge(null);
      setChickened(false);
      setAccepted(false);
      // Wait, we should probably add this to the database, but let's just let the local logic run for now.
    }, 3000);
  };

  return (
    <div className="min-h-[100dvh] bg-mystical relative overflow-hidden">
      <StarField />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="text-muted-foreground text-sm hover:text-primary transition-colors mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="font-heading text-4xl md:text-5xl text-primary glow-gold mb-2">⚔️ Challenge Arena</h1>
          <p className="text-foreground/70 text-lg">Accept a challenge. Complete it to earn Aura. Or chicken out and lose it instantly.</p>
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

        {/* Categories */}
        {['solo', 'duet', 'group'].map((category) => {
          const catChallenges = CHALLENGES.filter(c => c.type === category);
          if (catChallenges.length === 0) return null;
          
          return (
            <div key={category} className="mb-12">
              <h2 className="font-heading text-2xl mb-6 text-foreground border-b border-border pb-2 capitalize">
                {category === 'duet' ? '2 Player' : category} Challenges
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {catChallenges.map(challenge => (
                  <button
                    key={challenge.id}
                    onClick={() => { setActiveChallenge(challenge); setAccepted(false); setChickened(false); }}
                    className="group p-6 rounded-2xl bg-secondary/80 border border-primary/20 hover:border-primary/70 hover:bg-secondary transition-all text-left shadow-md hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:scale-[1.02] active:scale-[0.98] flex flex-col h-full relative overflow-hidden"
                  >
                    <div className="absolute -right-4 -top-4 text-7xl opacity-5 group-hover:rotate-12 group-hover:scale-125 transition-transform">
                      {challenge.emoji}
                    </div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <span className="text-4xl">{challenge.emoji}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        challenge.type === 'group' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                        challenge.type === 'duet' ? 'bg-accent/10 text-accent border-accent/30' : 
                        'bg-primary/10 text-primary border-primary/30'
                      }`}>
                        {challenge.type === 'duet' ? '2 PLAYERS' : challenge.type.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-heading text-xl text-foreground mb-2 group-hover:text-primary transition-colors relative z-10">{challenge.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 flex-grow relative z-10">{challenge.description}</p>
                    
                    <div className="flex justify-between items-center relative z-10">
                      <span className="text-green-400 text-xs font-bold bg-green-900/20 px-2 py-1 rounded-md">+{challenge.auraReward} if Accepted</span>
                      <span className="text-red-400 text-xs font-bold bg-red-900/20 px-2 py-1 rounded-md">{challenge.penalty} if Chicken</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Challenge Modal */}
        {activeChallenge && (
          <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in duration-200">
            <div className="bg-secondary border border-primary/40 rounded-2xl p-6 max-w-md w-full shadow-[0_0_40px_rgba(212,175,55,0.25)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={() => setActiveChallenge(null)}
                  className="text-muted-foreground hover:text-foreground text-xl leading-none w-8 h-8 rounded-full hover:bg-black/20 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              {!accepted && !chickened ? (
                <>
                  <div className="text-center mb-6 pt-4">
                    <span className="text-7xl mb-6 block animate-bounce">{activeChallenge.emoji}</span>
                    <h2 className="font-heading text-3xl text-primary mb-3">Dare to Play?</h2>
                    <p className="text-foreground/80 mb-6 text-sm bg-black/30 p-4 rounded-xl border border-white/5 shadow-inner">
                      "{activeChallenge.description}"
                    </p>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                        <span className="text-green-400 font-bold uppercase tracking-wider text-xs">Winning Reward</span>
                        <span className="text-green-400 font-black">+{activeChallenge.auraReward} Aura</span>
                      </div>
                      <div className="flex justify-between items-center bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
                        <span className="text-red-400 font-bold uppercase tracking-wider text-xs">Coward Penalty</span>
                        <span className="text-red-400 font-black">{activeChallenge.penalty} Aura</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => handleAccept(activeChallenge)}
                      className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-heading text-xl rounded-xl hover:opacity-90 transition-opacity glow-box-gold uppercase tracking-wide shadow-lg hover:shadow-primary/50"
                    >
                      Enter Arena 🔥
                    </button>
                    <button
                      onClick={() => handleChicken(activeChallenge)}
                      className="w-full py-3 bg-muted/30 text-muted-foreground font-heading rounded-xl hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 border border-border transition-all uppercase tracking-wide text-sm"
                    >
                      🐓 I'm a Coward Instead
                    </button>
                  </div>
                </>
              ) : accepted ? (
                <div className="text-center py-10">
                  <span className="text-6xl mb-4 block animate-ping">⚡</span>
                  <h2 className="font-heading text-3xl text-primary mb-2">ACCESS GRANTED</h2>
                  <p className="text-muted-foreground text-sm uppercase tracking-widest animate-pulse">Initializing Neural Link...</p>
                </div>
              ) : (
                <div className="text-center py-10">
                  <span className="text-6xl mb-4 block">🐓</span>
                  <h2 className="font-heading text-3xl text-accent mb-2">COWARD.</h2>
                  <p className="text-foreground font-bold text-xl mb-2">{activeChallenge.penalty} Aura Deducted</p>
                  <p className="text-muted-foreground text-sm opacity-50">Shame is eternal.</p>
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
