import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import StarField from "@/components/StarField";

const Index = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Shared Link Params
  const sharedScore = searchParams.get("sharedScore");
  const p1 = searchParams.get("p1");
  const p2 = searchParams.get("p2");

  return (
    <div className="min-h-[100dvh] bg-mystical relative overflow-hidden flex flex-col justify-between">
      <StarField />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8 md:py-16 flex flex-col items-center justify-center flex-grow">
        
        {/* If this is a shared link from a friend */}
        {sharedScore && p1 && p2 && (
          <div className="mb-10 w-full max-w-md animate-in fade-in zoom-in duration-500">
            <div className="bg-secondary/90 border-2 border-accent/40 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(255,0,100,0.3)]">
              <span className="text-4xl mb-3 block animate-bounce">💌</span>
              <h2 className="text-xl md:text-2xl font-black text-foreground uppercase tracking-widest mb-2">
                A Challenge Declared
              </h2>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed mb-4">
                <strong className="text-primary">{p1}</strong> used the Love Calculator and tested their compatibility with <strong className="text-accent">{p2}</strong>!
              </p>
              
              <div className="inline-block px-4 py-2 bg-black/40 border border-white/10 rounded-full mb-4">
                <span className="text-xs uppercase tracking-widest text-muted-foreground mr-2 font-bold">Their Result:</span>
                <span className="text-lg font-black text-white glow-gold">{sharedScore}% Compatible</span>
              </div>
              
              <p className="text-accent text-sm font-bold uppercase tracking-[0.2em]">
                Do you dare to test your own crush?
              </p>
            </div>
          </div>
        )}

        {/* Hero */}
        <div className="text-center w-full max-w-2xl bg-black/20 backdrop-blur-sm p-8 rounded-3xl border border-white/5">
          <span className="text-6xl mb-6 block animate-pulse">💔</span>
          <h1 className="font-heading text-4xl md:text-6xl text-accent drop-shadow-[0_0_20px_rgba(255,0,100,0.6)] mb-4">
            Love Calculator
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 font-heading tracking-widest mb-2">
            Are you soulmates or fully delusional?
          </p>
          <p className="text-muted-foreground mt-2 text-sm mb-10 leading-relaxed max-w-md mx-auto">
            Upload two photos. Let the advanced AI calculate your exact chemical compatibility and give you the brutal truth. 
          </p>

          <button
            onClick={() => navigate("/love")}
            className="px-10 py-5 w-full sm:w-auto bg-gradient-to-r from-accent to-pink-600 text-white font-heading text-xl md:text-2xl rounded-2xl shadow-[0_0_30px_rgba(255,0,100,0.5)] hover:scale-105 hover:shadow-[0_0_50px_rgba(255,0,100,0.8)] transition-all uppercase tracking-widest"
          >
            Calculate Now 🔥
          </button>
        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-muted-foreground text-sm pb-8 space-y-2 relative z-10">
        <p>Advanced AI Chemical Matcher 🧠</p>
        <p className="text-xs">
          Made by{" "}
          <a
            href="https://instagram.com/itsnextgenfounder"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            @itsnextgenfounder
          </a>
        </p>
        <div>
          <Link to="/admin" className="text-muted-foreground/30 hover:text-muted-foreground text-[10px] inline-block uppercase tracking-widest mt-4">
            Admin Access
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default Index;
