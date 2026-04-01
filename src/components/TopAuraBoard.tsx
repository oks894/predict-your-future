import React, { useState, useEffect } from "react";
import { ScanEntry, getTopAuraEntries, getAuraRank } from "@/lib/storage";
import AuraCardGenerator from "./AuraCard";

const TopAuraBoard = () => {
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<ScanEntry | null>(null);

  useEffect(() => {
    const loadTopAura = async () => {
      setLoading(true);
      const data = await getTopAuraEntries(10);
      setEntries(data);
      setLoading(false);
    };

    loadTopAura();
    
    // Refresh every 30 seconds to keep the leaderboard live
    const interval = setInterval(loadTopAura, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && entries.length === 0) {
    return (
      <div className="text-center py-10 mt-6">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground text-sm">Summoning Legends...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return null; // hide if completely empty to not clutter
  }

  return (
    <div className="mb-16 mt-8">
      <h2 className="font-heading text-4xl text-center mb-6 bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
        👑 TOP AURA LEGENDS
      </h2>
      <p className="text-center text-muted-foreground mb-8 -mt-4 text-sm max-w-sm mx-auto">
        These elites survived the AI Oracle and dominated their dares.
      </p>

      <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2 overflow-x-hidden p-1 pb-10">
        {entries.map((e, i) => {
          const rankColor = getAuraRank(e.aura || 0).color;
          
          return (
            <div 
              key={e.id} 
              className={`flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                i === 0 ? 'bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.2)] animate-float-slow' : 
                i === 1 ? 'bg-secondary/80 border-slate-300/50 shadow-[0_0_20px_rgba(203,213,225,0.1)]' : 
                i === 2 ? 'bg-secondary/80 border-amber-700/50 shadow-[0_0_20px_rgba(180,83,9,0.1)]' : 
                'bg-background/50 border-border/50 hover:bg-secondary/80'
              }`}
              onClick={() => setSelectedEntry(e)}
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="text-center w-10">
                  {i === 0 ? <span className="text-3xl animate-bounce inline-block">🥇</span> : 
                   i === 1 ? <span className="text-2xl">🥈</span> : 
                   i === 2 ? <span className="text-2xl">🥉</span> : 
                   <span className="text-xl font-heading text-muted-foreground font-bold">#{i + 1}</span>}
                </div>
                <div className="relative">
                  <img
                    src={e.facePhoto}
                    alt={e.name}
                    className="w-16 h-16 rounded-full object-cover border-[3px] shadow-lg"
                    style={{ borderColor: rankColor, boxShadow: `0 0 15px ${rankColor}40` }}
                    loading="lazy"
                  />
                  {i === 0 && (
                    <div className="absolute -top-3 -right-2 text-xl rotate-12 drop-shadow-[0_0_5px_gold]">👑</div>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0 w-full text-center sm:text-left mt-2 sm:mt-0">
                <p className="text-foreground font-bold text-xl truncate tracking-wide">
                  {e.name}
                </p>
                <p className="text-sm font-bold uppercase tracking-widest mt-0.5" style={{ color: rankColor, textShadow: `0 0 10px ${rankColor}80` }}>
                  {getAuraRank(e.aura || 0).label}
                </p>
              </div>

              <div className="flex flex-col items-center sm:items-end justify-center w-full sm:w-auto mt-2 sm:mt-0">
                <div className="px-4 py-2 rounded-lg bg-black/40 border sm:text-right" style={{ borderColor: `${rankColor}40` }}>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider text-[10px] font-bold mb-0.5">Aura Score</p>
                  <p className="text-2xl font-heading" style={{ color: rankColor, textShadow: `0 0 10px ${rankColor}` }}>
                    {e.aura?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedEntry && (
        <AuraCardGenerator
          entry={selectedEntry}
          aura={selectedEntry.aura || 100}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </div>
  );
};

export default TopAuraBoard;
