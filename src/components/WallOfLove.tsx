import React, { useState, useEffect } from "react";
import { MessageSquare, Star, Send } from "lucide-react";
import type { Review } from "@/lib/storage";
import { getReviews, addReview } from "@/lib/storage";

const WallOfLove = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formRating, setFormRating] = useState(5);
  const [formComment, setFormComment] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    getReviews().then(data => {
      // Only show approved reviews on the public wall
      const approved = data.filter(r => r.status === 'approved');
      setReviews(approved);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formComment) return;

    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      name: formName,
      rating: formRating,
      comment: formComment,
      status: 'pending', // Admins must approve it
      timestamp: Date.now()
    };

    await addReview(newReview);
    setIsSubmitted(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsSubmitted(false);
      setFormName("");
      setFormComment("");
      setFormRating(5);
    }, 2000);
  };

  return (
    <div className="mb-16">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="font-heading text-3xl font-black text-foreground tracking-widest uppercase glow-gold flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            Hall of Legends
          </h2>
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mt-2 block">What survivors say about the Oracle</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-foreground font-black uppercase tracking-widest text-xs hover:bg-white/10 hover:border-white/20 transition-all shadow-inner whitespace-nowrap"
        >
          Submit Testimony
        </button>
      </div>

      {reviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r) => (
            <div key={r.id} className="bg-black/40 backdrop-blur-md border-[0.5px] border-white/10 rounded-3xl p-6 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)] relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl rounded-full pointer-events-none group-hover:bg-primary/20 transition-colors" />
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <p className="font-bold text-foreground font-heading tracking-wide truncate pr-4">{r.name}</p>
                <div className="flex items-center gap-1 shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-primary fill-primary glow-gold drop-shadow-[0_0_5px_gold]' : 'text-white/10'}`} />
                  ))}
                </div>
              </div>
              
              <p className="text-foreground/80 leading-relaxed font-medium text-sm relative z-10 italic">
                "{r.comment}"
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-black/40 backdrop-blur-md border-[0.5px] border-white/10 rounded-3xl p-10 text-center shadow-inner">
          <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-4" />
          <p className="text-white/30 tracking-widest uppercase font-bold text-sm">No testimonies unlocked. Be the first.</p>
        </div>
      )}

      {/* Leave Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl">
          <div className="bg-black/60 border border-white/10 rounded-3xl w-full max-w-md p-8 relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none">
            
            {isSubmitted ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-[#4ade80]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#4ade80]/30 shadow-[0_0_30px_rgba(74,222,128,0.3)]">
                  <MessageSquare className="w-10 h-10 text-[#4ade80]" />
                </div>
                <h2 className="font-heading text-2xl font-black text-foreground tracking-widest uppercase mb-2">Testimony Logged</h2>
                <p className="text-white/50 text-sm font-medium">The Oracle will review your words shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-heading text-2xl font-black text-foreground tracking-widest uppercase glow-gold">Submit Testimony</h2>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="text-white/30 hover:text-white transition-colors">
                    <span className="sr-only">Close</span>
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black tracking-widest text-primary/70 uppercase mb-3">Your Name</label>
                    <input 
                      value={formName} 
                      onChange={e => setFormName(e.target.value)}
                      placeholder="e.g. Doomed Survivor 42"
                      required
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-foreground text-sm font-mono focus:outline-none focus:border-primary/50 transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black tracking-widest text-primary/70 uppercase mb-3">Oracle Rating</label>
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-4 rounded-2xl">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormRating(star)}
                          className="hover:scale-110 transition-transform"
                        >
                          <Star className={`w-8 h-8 ${star <= formRating ? 'text-primary fill-primary glow-gold drop-shadow-[0_0_10px_gold]' : 'text-white/10'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black tracking-widest text-primary/70 uppercase mb-3">Testimony (Review)</label>
                    <textarea 
                      value={formComment} 
                      onChange={e => setFormComment(e.target.value)}
                      placeholder="Tell the world how much the Oracle cooked you..."
                      required
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 px-5 py-4 rounded-2xl text-foreground text-sm font-mono focus:outline-none focus:border-primary/50 transition-all shadow-inner resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-8 px-6 py-5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-2xl font-black uppercase tracking-widest shadow-[0_0_30px_rgba(230,194,122,0.3)] hover:shadow-[0_0_50px_rgba(230,194,122,0.5)] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 text-sm"
                >
                  <Send className="w-5 h-5" /> Execute
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WallOfLove;
