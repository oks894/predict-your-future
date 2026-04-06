import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getSingles } from "@/lib/storage";
import type { SingleEntry } from "@/lib/storage";
import { Flame, ShieldAlert, Phone } from "lucide-react";

const SinglesMarket = () => {
  const [singles, setSingles] = useState<SingleEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    getSingles().then(setSingles);
  }, []);

  return (
    <div className="mb-20">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="font-heading text-4xl font-black text-accent tracking-widest uppercase shadow-[0_0_20px_rgba(255,0,100,0.3)] flex items-center gap-4">
            <Flame className="w-10 h-10 text-accent animate-pulse" />
            Singles Black Market
          </h2>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-2">Sell your single friends. Buy them back.</p>
        </div>
        <button
          onClick={() => navigate("/expose")}
          className="px-8 py-5 bg-accent/20 border border-accent/50 text-accent rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-accent hover:text-white transition-all shadow-[0_0_30px_rgba(255,0,100,0.2)] hover:shadow-[0_0_50px_rgba(255,0,100,0.5)] hover:-translate-y-1 block"
        >
          Expose A Friend ✨
        </button>
      </div>

      {singles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {singles.map((single) => (
            <div key={single.id} className="bg-black/60 backdrop-blur-xl border border-accent/20 rounded-[2rem] overflow-hidden shadow-[0_20px_40px_-15px_rgba(255,0,100,0.15)] group relative flex flex-col">
              
              {/* Image Carousel Mockup (Just showing the first for now, but styled beautifully) */}
              <div className="relative h-72 w-full overflow-hidden bg-black flex-shrink-0">
                <img 
                  src={single.photos[0]} 
                  alt={single.friendName} 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                
                {/* Age & Status Badge */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full flex items-center gap-2 shadow-xl">
                  <div className="w-2 h-2 rounded-full animate-ping bg-green-500" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-white">Age {single.age}</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-heading font-black text-white uppercase tracking-widest drop-shadow-md">
                    {single.friendName}
                  </h3>
                </div>
              </div>

              {/* Data Card */}
              <div className="p-6 flex-1 flex flex-col relative z-10 bg-gradient-to-b from-black to-accent/5">
                <div className="mb-6 flex-1">
                  <p className="text-[10px] font-black tracking-widest text-accent/70 uppercase mb-2">The Pitch / Details</p>
                  <p className="text-white/80 font-medium text-sm leading-relaxed italic border-l-2 border-accent/50 pl-3 py-1">
                    "{single.talent}"
                  </p>
                </div>

                <div className="flex gap-3 mt-auto pt-5 border-t border-white/10">
                  <a
                    href={`https://wa.me/${single.phoneNo}?text=Hey, I saw your profile on the Singles Market 👀`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-[2] py-4 bg-accent text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-accent/80 transition-colors shadow-lg shadow-accent/20"
                  >
                    <Phone className="w-4 h-4" /> Message Target
                  </a>
                  <button
                    onClick={() => {
                        alert("To remove this profile, the listed individual must pay the coward fee of ₹1 or follow the admin. Refer to the Expose page.");
                    }}
                    className="flex-[1] p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-muted-foreground hover:text-white flex items-center justify-center"
                    title="Report / Take Down"
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-black/80 to-accent/10 border border-accent/20 rounded-[2rem] p-16 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
          <Flame className="w-20 h-20 text-accent/20 mx-auto mb-6 animate-pulse" />
          <h3 className="text-2xl font-heading text-white mb-2 uppercase tracking-widest">The Market is Empty</h3>
          <p className="text-white/50 text-sm font-medium max-w-sm mx-auto mb-8">
            Nobody has sold out their friends yet. Be the first to expose someone to the public. 
          </p>
          <button
            onClick={() => navigate("/expose")}
            className="px-8 py-4 bg-accent text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,0,100,0.4)]"
          >
            Start the Carnage 🔥
          </button>
        </div>
      )}
    </div>
  );
};

export default SinglesMarket;
