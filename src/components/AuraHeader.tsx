import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getAura, getAuraRank } from "@/lib/storage";

export default function AuraHeader() {
  const [aura, setAura] = useState(getAura());

  useEffect(() => {
    const handleAuraChange = () => setAura(getAura());
    window.addEventListener("auraChanged", handleAuraChange);
    return () => window.removeEventListener("auraChanged", handleAuraChange);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in pointer-events-auto flex gap-3">
      <Link to="/idiots" className="px-4 py-2 bg-red-950/80 backdrop-blur-md rounded-full border border-red-500/40 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:scale-105 transition-transform group">
        <span className="text-xl group-hover:scale-110 transition-transform">🏆</span>
        <span className="text-xs text-red-400 uppercase tracking-widest font-bold hidden sm:inline-block">Idiot Board</span>
      </Link>
      
      <div className="px-4 py-2 bg-secondary/80 backdrop-blur-md rounded-full border border-primary/40 flex items-center gap-3 shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-help" title="Your Current Aura">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-heading">Your Aura</span>
          <span className="text-primary font-bold text-xs tracking-wide">{getAuraRank(aura).label}</span>
        </div>
        <div className="flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-primary/20 text-primary font-bold border border-primary/50 text-sm">
          {aura}
        </div>
      </div>
    </div>
  );
}
