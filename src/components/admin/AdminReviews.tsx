import React, { useState, useEffect } from "react";
import { Check, X, Trash2, MessageSquare, Star } from "lucide-react";
import type { Review } from "@/lib/storage";
import { getReviews, updateReviewStatus, deleteReview } from "@/lib/storage";

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = async () => {
    setIsLoading(true);
    const data = await getReviews();
    // sort by newest first
    setReviews(data.sort((a, b) => b.timestamp - a.timestamp));
    setIsLoading(false);
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleStatusChange = async (id: string, status: 'approved' | 'rejected') => {
    await updateReviewStatus(id, status);
    loadReviews();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this review forever?")) {
      await deleteReview(id);
      loadReviews();
    }
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-6 h-6 text-primary animate-pulse" />
        <h2 className="font-heading text-2xl font-black text-foreground tracking-widest uppercase glow-gold">Platform Reviews</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((r) => (
          <div key={r.id} className="bg-black/40 backdrop-blur-md border-[0.5px] border-white/10 rounded-3xl p-6 shadow-2xl relative group overflow-hidden">
            {r.status === 'approved' && <div className="absolute top-0 right-0 w-16 h-16 bg-[#4ade80]/20 blur-2xl rounded-full" />}
            {r.status === 'rejected' && <div className="absolute top-0 right-0 w-16 h-16 bg-[#f87171]/20 blur-2xl rounded-full" />}
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="font-bold text-foreground text-lg">{r.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-primary fill-primary glow-gold' : 'text-white/20'}`} />
                  ))}
                </div>
              </div>
              <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full border ${
                r.status === 'approved' ? 'bg-[#4ade80]/10 text-[#4ade80] border-[#4ade80]/30' :
                r.status === 'rejected' ? 'bg-[#f87171]/10 text-[#f87171] border-[#f87171]/30' :
                'bg-white/5 text-white/50 border-white/10'
              }`}>
                {r.status}
              </span>
            </div>

            <p className="text-foreground/80 leading-relaxed font-medium text-sm mb-6 relative z-10">
              "{r.comment}"
            </p>

            <div className="flex gap-2 relative z-10 pt-4 border-t border-white/5">
              {r.status !== 'approved' && (
                <button
                  onClick={() => handleStatusChange(r.id, 'approved')}
                  className="flex-1 py-3 bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/20 rounded-xl hover:bg-[#4ade80]/20 transition-colors uppercase tracking-widest text-[10px] font-black flex justify-center items-center gap-2"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
              )}
              {r.status !== 'rejected' && (
                <button
                  onClick={() => handleStatusChange(r.id, 'rejected')}
                  className="flex-1 py-3 bg-[#f87171]/10 text-[#f87171] border border-[#f87171]/20 rounded-xl hover:bg-[#f87171]/20 transition-colors uppercase tracking-widest text-[10px] font-black flex justify-center items-center gap-2"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
              )}
              <button
                onClick={() => handleDelete(r.id)}
                className="py-3 px-4 bg-white/5 text-muted-foreground border border-white/10 rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                title="Delete Review"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {reviews.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center">
            <MessageSquare className="w-16 h-16 text-white/10 mx-auto mb-4" />
            <p className="text-white/30 tracking-widest uppercase font-bold text-sm">No reviews submitted yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
