import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { addSingle } from "@/lib/storage";
import type { SingleEntry } from "@/lib/storage";
import StarField from "@/components/StarField";

const ExposeSingle = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"form" | "upload" | "done">("form");
  const [formData, setFormData] = useState({
    friendName: "",
    age: "",
    phoneNo: "",
    talent: "",
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach(file => {
      if (photos.length >= 3) return; // Max 3 check
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ratio = Math.min(600 / img.width, 800 / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          setPhotos(prev => {
            if (prev.length >= 3) return prev;
            return [...prev, canvas.toDataURL("image/jpeg", 0.7)];
          });
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (photos.length === 0) {
      alert("You must upload at least 1 photo to expose them!");
      return;
    }

    setIsSubmitting(true);
    const entry: SingleEntry = {
      id: crypto.randomUUID(),
      friendName: formData.friendName,
      age: parseInt(formData.age) || 18,
      phoneNo: formData.phoneNo,
      talent: formData.talent,
      photos: photos,
      timestamp: Date.now(),
    };

    await addSingle(entry);
    setIsSubmitting(false);
    setStep("done");
  };

  return (
    <div className="min-h-[100dvh] bg-mystical relative overflow-hidden flex flex-col justify-between">
      <StarField />

      <div className="relative z-10 max-w-lg mx-auto w-full px-4 py-8 md:py-16">
        <div className="text-center mb-8">
          <Link to="/" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors font-bold mb-4 inline-block">← Back to Main</Link>
          <h1 className="font-heading text-4xl text-accent glow-gold mb-2">Expose a Single</h1>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">Drop your friend onto the public singles board. If they want it down, they have to pay the coward's fee.</p>
        </div>

        {step === "form" && (
          <div className="bg-secondary/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl">
            <h2 className="text-xl font-heading text-foreground mb-4">Target Intel</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Friend's Name</label>
                  <input
                    value={formData.friendName}
                    onChange={e => setFormData({ ...formData, friendName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                    placeholder="E.g. David"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Their Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors text-sm"
                    placeholder="Ex: 22"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Their Phone Number</label>
                <input
                  type="tel"
                  value={formData.phoneNo}
                  onChange={e => setFormData({ ...formData, phoneNo: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors font-mono tracking-widest text-sm"
                  placeholder="+91 00000 00000"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Bio / Their Talent</label>
                <textarea
                  value={formData.talent}
                  onChange={e => setFormData({ ...formData, talent: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors resize-none text-sm leading-relaxed"
                  placeholder="What makes them special? Or what is their biggest red flag?"
                />
              </div>

              <button
                onClick={() => {
                  if (!formData.friendName || !formData.age || !formData.phoneNo || !formData.talent) {
                    alert("Fill out all intel first!");
                    return;
                  }
                  setStep("upload");
                }}
                className="w-full py-4 mt-2 bg-primary text-primary-foreground font-black text-lg rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:scale-[1.02] transition-transform uppercase tracking-widest"
              >
                Continue to Photos
              </button>
            </div>
          </div>
        )}

        {step === "upload" && (
          <div className="bg-secondary/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-heading text-foreground mb-2 flex justify-between items-center">
              <span>Photographic Evidence</span>
              <span className="text-xs text-muted-foreground bg-black/40 px-2 py-1 rounded">{photos.length} / 3 Uploaded</span>
            </h2>
            <p className="text-xs text-muted-foreground mb-6">Upload their best (or worst) pictures. We need at least one.</p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-primary/50 group">
                  <img src={photo} alt="Friend preview" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removePhoto(idx)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-lg"
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              {photos.length < 3 && (
                <div className="aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-white/20 hover:border-primary/50 hover:bg-white/5 transition-colors relative flex flex-col items-center justify-center gap-2 group cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <span className="text-3xl group-hover:scale-110 transition-transform text-white/50 group-hover:text-primary">📸</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary/70">Add Photo</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("form")}
                className="flex-1 py-4 bg-muted/20 text-muted-foreground font-bold rounded-xl hover:bg-muted/40 transition-colors uppercase tracking-widest text-sm"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || photos.length === 0}
                className="flex-[2] py-4 bg-accent text-accent-foreground font-black text-lg rounded-xl shadow-[0_0_15px_rgba(255,0,100,0.4)] hover:scale-[1.02] transition-transform uppercase tracking-widest disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? "Exposing..." : "Publish to Board 🔥"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="bg-secondary/80 backdrop-blur-md p-8 rounded-3xl border border-accent flex flex-col items-center text-center shadow-[0_0_50px_rgba(255,0,100,0.2)] animate-in zoom-in duration-500">
            <span className="text-6xl mb-4 block animate-bounce">🎯</span>
            <h2 className="text-3xl font-heading text-accent mb-2">Target Exposed</h2>
            <p className="text-foreground/80 mb-6">
               <strong className="text-primary">{formData.friendName}</strong> is now live on the Public Singles Board. May the odds be ever in their favor.
            </p>
            <div className="flex flex-col w-full gap-3">
              <button
                onClick={() => {
                   const shareLink = `https://wa.me/?text=${encodeURIComponent(`I just put you up for sale on the Singles Market 💀😭 Your photo is completely public, go look 👇\n${window.location.origin}/`)}`;
                   window.open(shareLink, '_blank');
                }}
                className="w-full py-4 bg-green-600 text-white font-black rounded-xl hover:bg-green-500 transition-colors uppercase tracking-widest shadow-lg"
              >
                Tell Them on WhatsApp
              </button>
              <Link
                to="/"
                className="w-full py-4 bg-white/5 border border-white/10 text-muted-foreground font-bold rounded-xl hover:text-white hover:bg-white/10 transition-colors uppercase tracking-widest text-sm"
              >
                View the Board
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ExposeSingle;
