import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getEntries, ScanEntry, getAuraRank } from "@/lib/storage";
import StarField from "@/components/StarField";

export default function IdiotBoard() {
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We want the absolute lowest Aura scores at the top
    getEntries().then(data => {
      const sorted = [...data].sort((a, b) => (a.aura ?? 100) - (b.aura ?? 100));
      setEntries(sorted);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-[100dvh] bg-mystical relative overflow-hidden">
      <StarField />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <Link to="/" className="text-muted-foreground text-sm hover:text-primary transition-colors mb-4 inline-block">
            ← Back to Safety
          </Link>
          <h1 className="font-heading text-4xl md:text-5xl text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] uppercase flex items-center justify-center gap-3">
            <span>🤡</span> Global Idiot Board <span>🤡</span>
          </h1>
          <p className="text-foreground/70 text-lg">The absolute bottom-feeders of the server. Point and laugh.</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-t-red-500 border-red-500/20 rounded-full animate-spin" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p>No idiots found yet. The world is safe (for now).</p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => {
              const aura = entry.aura ?? 100;
              const rankInfo = getAuraRank(aura);
              let podiumBadge = null;
              
              if (index === 0) podiumBadge = <span className="text-3xl animate-pulse">🥇 Supreme Idiot</span>;
              else if (index === 1) podiumBadge = <span className="text-2xl">🥈 Certified Coward</span>;
              else if (index === 2) podiumBadge = <span className="text-xl">🥉 Almost Brave</span>;
              else podiumBadge = <span className="text-lg text-muted-foreground font-heading">#{index + 1}</span>;

              const isTop3 = index < 3;

              return (
                <div 
                  key={entry.id} 
                  className={`relative overflow-hidden flex flex-col sm:flex-row items-center gap-6 p-4 md:p-6 rounded-2xl border transition-all ${
                    isTop3 
                      ? 'bg-red-950/40 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
                      : 'bg-secondary/40 border-border/50 hover:bg-secondary/80 hover:border-red-500/30'
                  }`}
                >
                  {/* Badge & Avatar */}
                  <div className="flex flex-col items-center gap-2 w-full sm:w-auto shrink-0">
                    <div className="font-black tracking-wider text-red-400 font-heading text-center h-8 flex items-center justify-center">
                      {podiumBadge}
                    </div>
                    <div className="relative">
                      <img 
                        src={entry.facePhoto || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png'} 
                        alt={entry.name}
                        className={`w-20 h-20 object-cover rounded-full border-4 ${isTop3 ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'border-slate-700'}`}
                      />
                      {aura < 0 && (
                        <div className="absolute -bottom-2 -right-2 bg-red-600 text-white text-[10px] uppercase font-black px-2 py-0.5 rounded flex items-center gap-1 border border-red-400 animate-pulse">
                          <span>⚠️</span> TOXIC
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 w-full text-center sm:text-left">
                    <h3 className="text-2xl font-black text-foreground uppercase tracking-widest">{entry.name}</h3>
                    <p className="text-sm font-bold uppercase tracking-widest mt-1 mb-2" style={{ color: rankInfo.color }}>
                      {rankInfo.emoji} {rankInfo.label}
                    </p>
                    
                    {entry.shameReason ? (
                      <div className="mt-3 bg-black/40 border border-white/5 p-3 rounded-lg flex items-start gap-2">
                        <span className="text-red-400 mt-0.5 shrink-0">💀</span>
                        <p className="text-muted-foreground text-xs italic leading-relaxed text-left">
                          <span className="font-bold text-red-400 uppercase tracking-widest text-[10px] block mb-1">Downfall Intel</span>
                          "{entry.shameReason}"
                        </p>
                      </div>
                    ) : entry.scanType === 'challenge-chicken' ? (
                      <div className="mt-3 bg-red-900/20 border border-red-500/20 p-2 rounded-lg text-left inline-block">
                        <p className="text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                          <span>🐓</span> Chickened out of a dare
                        </p>
                      </div>
                    ) : entry.scanType === 'love' ? (
                      <div className="mt-3 bg-pink-900/20 border border-pink-500/20 p-3 rounded-lg flex items-start gap-2">
                        <span className="text-pink-400 mt-0.5 shrink-0">💔</span>
                        <p className="text-muted-foreground text-xs italic leading-relaxed text-left">
                          <span className="font-bold text-pink-400 uppercase tracking-widest text-[10px] block mb-1">Delusion Target</span>
                          Caught simulating a timeline with: <strong>{entry.crushName}</strong>
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3 bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-start gap-2">
                        <span className="text-primary mt-0.5 shrink-0">🔮</span>
                        <p className="text-muted-foreground text-xs italic leading-relaxed text-left">
                          <span className="font-bold text-primary uppercase tracking-widest text-[10px] block mb-1">Future Exposed</span>
                          The AI scanned their face and completely destroyed their ego.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Aura Score Right Side */}
                  <div className="shrink-0 w-full sm:w-auto flex flex-col items-center justify-center bg-black/60 p-4 rounded-xl border border-white/5">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-widest mb-1">Aura Level</span>
                    <span className={`text-4xl font-heading font-black drop-shadow-md ${aura < 0 ? 'text-red-500' : 'text-primary glow-gold'}`}>
                      {aura}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
