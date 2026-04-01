import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import html2canvas from "html2canvas";
import { addAura, getAura, addEntry, ScanEntry } from "@/lib/storage";
import { generateChallengeRoast } from "@/lib/challengePrompts";
import { playEerieScanSound, playDunDunDuuun } from "@/lib/audio";
import StarField from "@/components/StarField";
import AuraCardGenerator from "@/components/AuraCard";

// Mock constant for checking if challenge exists
const CHALLENGES_MAP: Record<string, { title: string; reward: number; type: string }> = {
  'excuse-trial': { title: 'Excuse Trial', reward: 20, type: 'solo' },
  'red-flag-confess': { title: 'Red Flag Confess', reward: 20, type: 'solo' },
  'text-graveyard': { title: 'Text Graveyard', reward: 25, type: 'solo' },
  'vocab-roast': { title: 'Vocabulary Roast', reward: 20, type: 'solo' },
  'main-character': { title: "Who's the Main Character", reward: 40, type: 'duet' },
  'apology-battle': { title: 'Apology Battle', reward: 40, type: 'duet' },
  'text-energy': { title: 'Who Texted First Energy', reward: 40, type: 'duet' },
  'hot-seat': { title: 'Hot Seat Roast', reward: 50, type: 'group' },
  'most-likely-to': { title: 'Most Likely To', reward: 50, type: 'group' },
};

type Step = "form" | "loading" | "result";

export default function ChallengeRunner() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const challengeId = searchParams.get("challenge");
  const meta = challengeId ? CHALLENGES_MAP[challengeId] : null;

  const [step, setStep] = useState<Step>("form");
  const [players, setPlayers] = useState<string[]>(['']);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [p2Name, setP2Name] = useState('');
  const [groupNames, setGroupNames] = useState('');
  
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [result, setResult] = useState<ScanEntry | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!meta) navigate('/challenges');
  }, [meta, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!players[0] || !challengeId || !meta) return;

    // Build the final players array
    const finalPlayers = [...players];
    if (meta.type === 'duet') finalPlayers[1] = p2Name;
    if (meta.type === 'group') {
      const g = groupNames.split(',').map(n => n.trim()).filter(Boolean);
      finalPlayers.push(...g);
    }

    setStep("loading");
    if (typeof window !== "undefined" && window.localStorage.getItem("sound_enabled") !== "false") {
      playEerieScanSound();
    }

    // Loader interval
    const LOADING_MESSAGES = [
      "Analyzing inputs...",
      "Feeding text to AI...",
      "Generating brutal consequences...",
      "Judging your entire existence..."
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx++;
      if (msgIdx < LOADING_MESSAGES.length) setLoadingMsg(msgIdx);
    }, 1500);

    // Simulate network
    await new Promise(r => setTimeout(r, 6000));
    clearInterval(msgInterval);

    // Generate Roast
    const roastData = generateChallengeRoast(challengeId, inputs, finalPlayers);
    const newAura = getAura() + meta.reward;

    // Join all inputs to save in shameReason so everyone can read it on the Idiot board!
    const inputSummary = Object.entries(inputs).map(([k, v]) => `${k.toUpperCase()}: "${v}"`).join(' | ');

    const entry: ScanEntry = {
      id: crypto.randomUUID(),
      name: finalPlayers[0],
      age: 18,
      crushName: '',
      crushAge: 18,
      facePhoto: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png', // Generic fallback
      roastText: roastData.text,
      timestamp: Date.now(),
      scanType: `challenge_${challengeId}`,
      roastPercentage: roastData.percentage,
      aura: newAura,
      shameReason: inputSummary || 'They completed a challenge.',
    };

    addAura(meta.reward);
    await addEntry(entry);
    setResult(entry);
    setStep("result");

    if (typeof window !== "undefined" && window.localStorage.getItem("sound_enabled") !== "false") {
      playDunDunDuuun();
    }
  };

  if (!meta) return null;

  return (
    <div className="min-h-[100dvh] bg-mystical relative overflow-hidden">
      <StarField />
      
      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        {step === "form" && (
          <div className="animate-in fade-in zoom-in duration-500">
            <div className="text-center mb-10">
              <button onClick={() => navigate('/challenges')} className="text-muted-foreground text-sm hover:text-primary mb-4 inline-block tracking-wider uppercase font-bold">
                ← Fleeting Bravery (Go Back)
              </button>
              <h1 className="font-heading text-4xl text-primary glow-gold mb-2 uppercase">{meta.title}</h1>
              <p className="text-accent text-sm font-bold uppercase tracking-widest bg-accent/10 py-1.5 px-3 rounded-md inline-block border border-accent/20">
                Reward: +{meta.reward} Aura
              </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-secondary/90 p-6 md:p-8 rounded-2xl border border-primary/30 shadow-[0_0_40px_rgba(212,175,55,0.15)] flex flex-col gap-5">
              
              <div>
                <label className="text-primary text-xs font-bold uppercase tracking-widest mb-1.5 block glow-gold">Player 1 Name</label>
                <input
                  required
                  value={players[0]}
                  onChange={e => setPlayers([e.target.value, ...players.slice(1)])}
                  className="w-full px-4 py-3 bg-black/40 border border-primary/20 rounded-xl text-foreground focus:outline-none focus:border-primary/60 transition-colors font-mono tracking-wide"
                  placeholder="Your name"
                />
              </div>

              {meta.type === 'duet' && (
                <div>
                  <label className="text-accent text-xs font-bold uppercase tracking-widest mb-1.5 block">Player 2 Name</label>
                  <input
                    required
                    value={p2Name}
                    onChange={e => setP2Name(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-accent/20 rounded-xl text-foreground focus:outline-none focus:border-accent/60 transition-colors font-mono tracking-wide"
                    placeholder="Friend's name or Victim's name"
                  />
                </div>
              )}

              {meta.type === 'group' && (
                <div>
                  <label className="text-purple-400 text-xs font-bold uppercase tracking-widest mb-1.5 block">Other Players</label>
                  <input
                    required
                    value={groupNames}
                    onChange={e => setGroupNames(e.target.value)}
                    className="w-full px-4 py-3 bg-black/40 border border-purple-500/20 rounded-xl text-foreground focus:outline-none focus:border-purple-500/60 transition-colors font-mono tracking-wide"
                    placeholder="Comma separated names (e.g. Sam, Alex)"
                  />
                </div>
              )}

              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent my-2" />

              {/* Dynamic Inputs based on Challenge */}
              {challengeId === 'excuse-trial' && (
                <div>
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">The Excuse</label>
                  <textarea required value={inputs.excuse || ''} onChange={e => setInputs({...inputs, excuse: e.target.value})} rows={3}
                    className="w-full px-4 py-3 bg-black/40 border border-border rounded-xl text-foreground focus:border-primary/50 transition-colors"
                    placeholder="Type the worst excuse you've ever used..." />
                </div>
              )}
              {challengeId === 'red-flag-confess' && (
                <div>
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">Toxic Habit</label>
                  <textarea required value={inputs.habit || ''} onChange={e => setInputs({...inputs, habit: e.target.value})} rows={3}
                    className="w-full px-4 py-3 bg-black/40 border border-border rounded-xl text-foreground focus:border-primary/50 transition-colors"
                    placeholder="Admit your biggest red flag..." />
                </div>
              )}
              {challengeId === 'text-graveyard' && (
                <div>
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">Embarrassing Text</label>
                  <textarea required value={inputs.text || ''} onChange={e => setInputs({...inputs, text: e.target.value})} rows={3}
                    className="w-full px-4 py-3 bg-black/40 border border-border rounded-xl text-foreground focus:border-primary/50 transition-colors"
                    placeholder="Paste the text you regret sending..." />
                </div>
              )}
              {challengeId === 'vocab-roast' && (
                <div>
                  <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">How you talk</label>
                  <textarea required value={inputs.vocab || ''} onChange={e => setInputs({...inputs, vocab: e.target.value})} rows={3}
                    className="w-full px-4 py-3 bg-black/40 border border-border rounded-xl text-foreground focus:border-primary/50 transition-colors"
                    placeholder="List 3 slang words you overuse..." />
                </div>
              )}
              {challengeId === 'main-character' && (
                <>
                  <div>
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">Player 1: Describe yourself in 3 words</label>
                    <input required value={inputs.player1Words || ''} onChange={e => setInputs({...inputs, player1Words: e.target.value})}
                      className="w-full px-4 py-3 bg-black/40 border border-border rounded-xl text-foreground focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">Player 2: Describe yourself in 3 words</label>
                    <input required value={inputs.player2Words || ''} onChange={e => setInputs({...inputs, player2Words: e.target.value})}
                      className="w-full px-4 py-3 bg-black/40 border border-border rounded-xl text-foreground focus:border-primary/50" />
                  </div>
                </>
              )}
              {challengeId === 'apology-battle' && (
                <>
                  <div>
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">Player 1: Type an apology</label>
                    <textarea required value={inputs.apology1 || ''} onChange={e => setInputs({...inputs, apology1: e.target.value})} rows={2}
                      className="w-full px-4 py-3 bg-black/40 border border-border rounded-xl text-foreground focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">Player 2: Type an apology</label>
                    <textarea required value={inputs.apology2 || ''} onChange={e => setInputs({...inputs, apology2: e.target.value})} rows={2}
                      className="w-full px-4 py-3 bg-black/40 border border-border rounded-xl text-foreground focus:border-primary/50" />
                  </div>
                </>
              )}
              {challengeId === 'text-energy' && (
                <>
                  <div>
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">Player 1: Texting Style</label>
                    <input required value={inputs.style1 || ''} onChange={e => setInputs({...inputs, style1: e.target.value})}
                      className="w-full px-4 py-3 bg-black/40 border border-border rounded-xl text-foreground focus:border-primary/50" placeholder="e.g. Double texts, uses 'lol' too much" />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">Player 2: Texting Style</label>
                    <input required value={inputs.style2 || ''} onChange={e => setInputs({...inputs, style2: e.target.value})}
                      className="w-full px-4 py-3 bg-black/40 border border-border rounded-xl text-foreground focus:border-primary/50" placeholder="e.g. Dry, leaves on read" />
                  </div>
                </>
              )}
              {challengeId === 'hot-seat' && (
                <>
                  <div>
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">Target Victim Name</label>
                    <input required value={inputs.target || ''} onChange={e => setInputs({...inputs, target: e.target.value})}
                      className="w-full px-4 py-3 bg-black/40 border border-border rounded-xl text-foreground focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-muted-foreground text-xs font-bold uppercase tracking-widest mb-1.5 block">Words from the group</label>
                    <textarea required value={inputs.words || ''} onChange={e => setInputs({...inputs, words: e.target.value})} rows={3}
                      className="w-full px-4 py-3 bg-black/40 border border-border rounded-xl text-foreground focus:border-primary/50" placeholder="Comma separated list of insulting words about them" />
                  </div>
                </>
              )}
              {challengeId === 'most-likely-to' && (
                <p className="text-muted-foreground text-sm italic text-center pb-2">All players entered! The AI will now randomly assign a brutal scenario.</p>
              )}

              <button type="submit" className="w-full py-4 mt-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-heading text-xl rounded-xl shadow-lg hover:shadow-primary/50 transition-all uppercase tracking-widest">
                Submit to AI 🔮
              </button>
            </form>
          </div>
        )}

        {step === "loading" && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
            <div className="relative w-40 h-40 flex items-center justify-center mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary border-l-primary animate-spin" style={{ animationDuration: '3s' }} />
              <div className="absolute inset-2 rounded-full border-4 border-accent/20 border-b-accent border-r-accent animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
              <span className="text-6xl animate-pulse">👁️</span>
            </div>
            <h2 className="font-heading text-3xl text-primary glow-gold mb-4">Neural Link Active</h2>
            <p className="text-accent font-mono tracking-widest animate-pulse h-6">
              {[
                "Analyzing inputs...",
                "Feeding text to AI...",
                "Generating brutal consequences...",
                "Judging your entire existence..."
              ][loadingMsg]}
            </p>
          </div>
        )}

        {step === "result" && result && (
          <div className="flex flex-col items-center max-w-lg mx-auto w-full animate-in zoom-in slide-in-from-bottom-8 duration-700">
            <h2 className="font-heading text-4xl mb-2 text-center text-primary glow-gold">VERDICT RENDERED</h2>
            <p className="text-accent text-sm mb-6 uppercase tracking-widest font-bold bg-accent/10 px-4 py-1.5 rounded-full mt-2 inline-flex items-center gap-2 border border-accent/30 shadow-[0_0_10px_rgba(255,0,100,0.2)]">
              <span>Aura Destroyed</span>
              <span className="text-white">+ {meta.reward} Aura For Surviving</span>
            </p>

            <div className="w-full bg-secondary/80 border border-primary/40 rounded-2xl p-6 md:p-8 shadow-[0_0_40px_rgba(212,175,55,0.15)] mb-8 relative">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full pointer-events-none" />
              
              <div className="flex flex-col gap-4 text-left">
                {result.roastText.split('\n\n').map((part, idx) => {
                  const isRating = part.includes('[ SYSTEM ') || part.includes('[ BELIEVABILITY ') || part.includes('[');
                  if (isRating) {
                    return (
                      <div key={idx} className="bg-black/60 border-l-4 border-accent p-4 -mx-2 rounded-r-lg font-mono text-accent text-sm md:text-base tracking-wider flex items-center justify-between">
                        <span>{part}</span>
                        <span className="text-xl animate-pulse">⚡</span>
                      </div>
                    );
                  }
                  return (
                    <p key={idx} className="text-foreground/90 font-medium text-lg leading-relaxed md:leading-loose">
                      {part}
                    </p>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button
                onClick={() => navigate('/idiots')}
                className="flex-1 py-4 bg-primary text-primary-foreground font-heading text-lg rounded-xl hover:scale-105 transition-transform glow-box-gold uppercase shadow-lg shadow-primary/20"
              >
                View Idiot Board 🏆
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-4 bg-transparent border border-primary/50 text-primary font-heading text-lg rounded-xl hover:bg-primary/10 transition-colors uppercase tracking-widest"
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
