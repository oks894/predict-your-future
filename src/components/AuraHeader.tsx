import { useState, useEffect } from "react";
import { getAura, getAuraRank } from "@/lib/storage";

export default function AuraHeader() {
  const [aura, setAura] = useState(getAura());

  useEffect(() => {
    const handleAuraChange = () => setAura(getAura());
    window.addEventListener("auraChanged", handleAuraChange);
    return () => window.removeEventListener("auraChanged", handleAuraChange);
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in pointer-events-none">
      <div className="px-4 py-2 bg-secondary/80 backdrop-blur-md rounded-full border border-primary/40 flex items-center gap-3 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
        <div className="flex flex-col items-end leading-tight">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-heading">Your Aura</span>
          <span className="text-primary font-bold text-xs tracking-wide">{getAuraRank(aura)}</span>
        </div>
        <div className="flex items-center justify-center min-w-[32px] h-8 px-2 rounded-full bg-primary/20 text-primary font-bold border border-primary/50 text-sm">
          {aura}
        </div>
      </div>
    </div>
  );
}
