import { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { addEntry, generateGenZRoast, isExpired, getTier, addAura } from "@/lib/storage";
import { playEerieScanSound, playDunDunDuuun, playSadTrombone } from "@/lib/audio";
import type { ScanEntry } from "@/lib/storage";
import StarField from "@/components/StarField";
import ExpiryGate from "@/components/ExpiryGate";

const LOADING_MESSAGES = [
  "Analyzing facial structure...",
  "Consulting cosmic database...",
  "Decoding your life path...",
  "Cross-referencing with parallel universes...",
  "Mapping destiny vectors...",
  "Scanning alternate timelines...",
];

type Step = "capture" | "form" | "loading" | "result";

const Scan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const challenge = searchParams.get("challenge");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<Step>("capture");
  const [photo, setPhoto] = useState<string>("");
  const [crushPhoto, setCrushPhoto] = useState<string>("");
  const [countdown, setCountdown] = useState(2);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [formData, setFormData] = useState({ name: "", age: "", crushName: "", crushAge: "" });
  const [result, setResult] = useState<ScanEntry | null>(null);
  const [copied, setCopied] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  // T&C state (Session storage means it resets every time they close the tab)
  const [showTerms, setShowTerms] = useState(false);
  const [hasSkipped, setHasSkipped] = useState(false);
  const [viewingTerms, setViewingTerms] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    // Check T&C approval strictly using sessionStorage to force it every session/log-in
    if (sessionStorage.getItem("terms_accepted") !== "true") {
      setShowTerms(true);
    } else {
      setTermsAccepted(true);
    }
  }, []);

  const acceptTerms = () => {
    sessionStorage.setItem("terms_accepted", "true");
    setTermsAccepted(true);
    setShowTerms(false);
  };

  // Start webcam ONLY if T&C is accepted
  useEffect(() => {
    if (step !== "capture" || !termsAccepted) return;
    let stream: MediaStream;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.error("Camera error:", e);
        setCameraError(true);
        // Even if camera fails, still move forward after countdown
      }
    };
    start();
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, [step, termsAccepted]);

  // Countdown & auto-capture ONLY if T&C is accepted
  useEffect(() => {
    if (step !== "capture" || !termsAccepted) return;
    if (countdown <= 0) {
      capturePhoto();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown, termsAccepted]);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (video && video.srcObject) {
      ctx.drawImage(video, 0, 0, 320, 240);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
      setPhoto(dataUrl);
      // Stop video
      const stream = video.srcObject as MediaStream;
      stream?.getTracks().forEach(t => t.stop());
    } else {
      ctx.fillStyle = "#1a0a2e";
      ctx.fillRect(0, 0, 320, 240);
      ctx.fillStyle = "#d4af37";
      ctx.font = "40px serif";
      ctx.textAlign = "center";
      ctx.fillText("🔮", 160, 130);
      ctx.font = "14px sans-serif";
      ctx.fillStyle = "#888";
      ctx.fillText("Face scan captured", 160, 170);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
      setPhoto(dataUrl);
    }
    setStep("form");
  }, []);

  useEffect(() => {
    if (step !== "form") return;
    const interval = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length), 2000);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    if (step !== "loading") return;
    playEerieScanSound();
    const msgInterval = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length), 800);
    const progressInterval = setInterval(() => {
      setLoadingProgress(p => {
        if (p >= 100) return 100;
        return p + Math.random() * 15 + 5;
      });
    }, 400);
    const timeout = setTimeout(() => {
      setStep("result");
      Math.random() > 0.5 ? playDunDunDuuun() : playSadTrombone();
    }, 4000);
    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [step]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const age = parseInt(formData.age);
    const crushAge = parseInt(formData.crushAge);
    if (!formData.name || !age || !formData.crushName || !crushAge) return;

    const gen = generateGenZRoast('future', formData.name, formData.crushName);
    const entry: ScanEntry = {
      id: crypto.randomUUID(),
      name: formData.name,
      age,
      crushName: formData.crushName,
      crushAge,
      facePhoto: photo,
      crushPhoto,
      roastText: gen.text,
      timestamp: Date.now(),
      scanType: 'future',
      roastPercentage: gen.percentage,
    };
    
    // Add success aura points
    addAura(15);
    
    setLoadingProgress(0);
    setLoadingMsg(0);
    setStep("loading");

    await addEntry(entry);
    setResult(entry);
  };

  const downloadCardAsImage = () => {
    setIsCapturing(true);
    setTimeout(async () => {
      const card = document.getElementById("prophecy-card");
      if (!card) return;
      try {
        const canvas = await html2canvas(card, {
          backgroundColor: "#1a0a2e",
          scale: 2,
          useCORS: true,
        });
        const link = document.createElement("a");
        link.download = `predictyourfuture-${formData.name || "prophecy"}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (err) {
        console.error("Image export error:", err);
      } finally {
        setIsCapturing(false);
      }
    }, 100);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(320 / img.width, 240 / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        setCrushPhoto(canvas.toDataURL("image/jpeg", 0.6));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (isExpired()) return <ExpiryGate />;

  const appUrl = window.location.origin;

  return (
    <div className="min-h-[100dvh] bg-mystical relative overflow-hidden">
      <StarField />
      <canvas ref={canvasRef} className="hidden" />

      {/* T&C Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="bg-secondary border border-primary/30 p-6 rounded-xl max-w-sm w-full relative glow-box-gold">
            <h2 className="text-2xl font-heading text-primary mb-4 text-center">Terms & Conditions</h2>
            
            {!viewingTerms ? (
              <div>
                {hasSkipped && <p className="text-red-400 mb-4 text-center text-sm font-bold animate-shake">Haha, nice try. You actually have to read it. 🤡</p>}
                <p className="text-foreground/80 mb-6 text-center text-sm">Before seeing your destiny, you must accept our Terms & Conditions and <b>Allow Camera Access</b> for facial aura scanning.</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setViewingTerms(true)}
                    className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-heading hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    Read T&C
                  </button>
                  <button 
                    onClick={() => setHasSkipped(true)}
                    className="flex-1 px-4 py-3 bg-muted text-muted-foreground rounded-lg font-heading hover:opacity-90 transition-opacity"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="bg-background/50 p-4 rounded-lg mb-6 text-sm text-foreground/90 leading-relaxed max-h-60 overflow-y-auto border border-border">
                  <p className="text-primary font-bold">1. Camera Access is strictly required to run the AI facial structure scan.</p>
                  <br />
                  <p>2. This is live in the browser so any scanned faces will be seen by all.</p>
                  <br />
                  <p>3. If you want to delete it, follow my Instagram (<a href="https://instagram.com/itsnextgenfounder" target="_blank" rel="noreferrer" className="text-primary hover:underline">@itsnextgenfounder</a>) and message me "delete face" with your in-platform name.</p>
                  <br />
                  <p className="text-primary font-bold">Only then will it be deleted.</p>
                </div>
                <button 
                  onClick={acceptTerms}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-heading hover:opacity-90 transition-opacity glow-box-gold"
                >
                  I Accept
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 md:py-12">
        
        {/* Challenge Banner specifically for when they land on the Scanner */}
        {challenge && step !== "result" && (
          <div className="mb-8 p-4 rounded-lg border border-primary/30 bg-secondary/50 text-center glow-box-gold">
            <p className="text-primary font-heading text-lg">
              {challenge}, your future was predicted but they're hiding it. Scan yourself to unlock it 👀
            </p>
          </div>
        )}

        {/* STEP 1: Capture */}
        {step === "capture" && (
          <div className="text-center">
            <h2 className="font-heading text-2xl text-primary glow-gold mb-6">Scanning Your Face...</h2>
            <div className={`transition-transform duration-1000 ${countdown < 2 ? '-translate-y-4 animate-float-slow' : ''}`}>
              <div className="relative mx-auto w-72 h-72 rounded-full overflow-hidden border-4 border-primary/50 glow-box-gold">
                {cameraError ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/50">
                    <p className="text-4xl mb-2">🔮</p>
                    <p className="text-muted-foreground text-sm px-4">Scanning via neural link...</p>
                  </div>
                ) : (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 border-4 border-accent/30 rounded-full animate-pulse-glow" />
                  <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
                </div>
              </div>
            </div>
            <div className={`transition-all duration-1000 ${countdown < 2 ? 'opacity-0' : 'opacity-100'}`}>
              <p className="mt-6 text-primary font-heading text-4xl">{countdown}</p>
              <p className="text-muted-foreground text-sm mt-2">Hold still... scanning biometrics</p>
            </div>
          </div>
        )}

        {/* STEP 2: Form */}
        {step === "form" && (
          <div>
            <div className="text-center mb-6">
              <p className="text-green-400 text-lg mb-2">Face scan complete ✅</p>
              <p className="text-muted-foreground italic">We need a few details to cross-reference your timeline...</p>
            </div>

            <div className="mb-6 p-4 rounded-lg bg-secondary/30 border border-border text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.2s" }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: "0.4s" }} />
              </div>
              <p className="text-accent text-sm">{LOADING_MESSAGES[loadingMsg]}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-foreground text-sm mb-1 block">Your name</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="text-foreground text-sm mb-1 block">Your age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={e => setFormData(f => ({ ...f, age: e.target.value }))}
                  required
                  min={1}
                  max={120}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Age"
                />
              </div>
              <div>
                <label className="text-foreground text-sm mb-1 block">Your crush's name</label>
                <input
                  value={formData.crushName}
                  onChange={e => setFormData(f => ({ ...f, crushName: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Who's the lucky one?"
                />
              </div>
              <div>
                <label className="text-foreground text-sm mb-1 block">Your crush's age</label>
                <input
                  type="number"
                  value={formData.crushAge}
                  onChange={e => setFormData(f => ({ ...f, crushAge: e.target.value }))}
                  required
                  min={1}
                  max={120}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Their age"
                />
              </div>
              <div>
                <label className="text-foreground text-sm mb-1 block">Upload their pic (Optional for deeper scan 👁️)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                {crushPhoto && <p className="text-green-400 text-xs mt-1">Photo loaded ✅</p>}
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-primary text-primary-foreground font-heading text-lg rounded-lg glow-box-gold hover:scale-[1.02] transition-transform"
              >
                Reveal My Roasted Meme 🔮
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Processing */}
        {step === "loading" && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-8 rounded-full border-4 border-primary/30 flex items-center justify-center glow-box-gold">
              <span className="text-4xl animate-pulse">🔮</span>
            </div>
            <h2 className="font-heading text-2xl text-primary glow-gold mb-4">Processing Your Destiny...</h2>
            <div className="max-w-xs mx-auto mb-4">
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                />
              </div>
              <p className="text-muted-foreground text-xs mt-2">{Math.min(Math.round(loadingProgress), 100)}% complete</p>
            </div>
            <p className="text-accent text-sm italic">{LOADING_MESSAGES[loadingMsg]}</p>
          </div>
        )}

        {/* STEP 4: Result */}
        {step === "result" && result && (
          <div className="text-center">
            <h2 className="font-heading text-2xl text-primary glow-gold mb-6">Your Roasted Meme</h2>
            <p className="text-muted-foreground text-sm mb-6 animate-float-slow">Your dignity has left the atmosphere 🚀</p>

            <div className="relative animate-float-slow mx-auto max-w-sm">
              {/* Particle Escaping Auras */}
              <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-1/2 left-1/4 w-4 h-4 rounded-full bg-accent/40 blur-sm animate-drift" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-3/4 right-1/4 w-3 h-3 rounded-full bg-primary/40 blur-sm animate-drift" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/4 left-3/4 w-6 h-6 rounded-full bg-accent/20 blur-md animate-drift" style={{ animationDelay: '2s' }}></div>
              </div>

              <div
                id="prophecy-card"
                className="relative z-10 p-6 rounded-xl bg-gradient-to-b from-secondary to-card border border-primary/30 glow-box-gold overflow-hidden"
              >
                <div className="relative flex justify-center items-center h-32 mb-6">
                  {/* Crush Photo as the Burning Planet Core */}
                  {result.crushPhoto ? (
                    <img
                      src={result.crushPhoto}
                      alt={result.crushName}
                      className="w-24 h-24 rounded-full border-2 border-accent object-cover z-0 shadow-[0_0_30px_10px_rgba(255,80,0,0.4)]"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-2 border-accent bg-background shadow-[0_0_30px_10px_rgba(255,80,0,0.4)] flex items-center justify-center">
                      <span className="text-3xl animate-pulse">🔮</span>
                    </div>
                  )}

                  {/* User Photo Orbiting like Debris */}
                  <img
                    src={result.facePhoto}
                    alt={result.name}
                    className={`absolute top-1/2 left-1/2 w-16 h-16 -ml-8 -mt-8 rounded-full border-2 border-primary object-cover z-20 ${!isCapturing ? 'animate-orbit' : 'translate-x-12 translate-y-12'}`}
                  />
                </div>

              <h3 className="font-heading text-xl text-primary mb-1">{result.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">Age {result.age} • Crushing on {result.crushName}</p>
              <div className="flex flex-col gap-3 text-left">
                {result.roastText.split('\n\n').map((part, idx) => {
                  if (!part.trim()) return null;
                  const isSystemScore = part.includes("[ SYSTEM RATING:");
                  const isTimer = part.includes("⏳");
                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-xl border shadow-sm animate-shatter ${
                        isSystemScore 
                          ? 'bg-primary/20 border-primary text-primary font-bold text-center glow-gold uppercase tracking-wide' 
                          : isTimer
                          ? 'bg-red-500/10 border-red-500/50 text-red-500 font-bold text-center animate-pulse'
                          : 'bg-background/80 border-border text-foreground text-base leading-relaxed italic'
                      }`}
                      style={{ animationDelay: `${idx * 0.2}s` }}
                    >
                      {part.trim().replace(/^\[|\]$/g, '')}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-primary/20 flex flex-col items-center justify-between text-[10px] text-primary/60 font-heading tracking-widest uppercase gap-2">
                <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary">
                  {getTier(result.roastPercentage || 0)}
                </div>
                <div className="flex items-center gap-1 opacity-70">
                  <span className="text-sm">🔮</span> PREDICTYOURFUTURE.NET
                </div>
              </div>
            </div>
            </div>

            <div className="flex flex-col gap-3 justify-center mt-8">
              <button
                onClick={downloadCardAsImage}
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                📸 Download as Image
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Bro this AI just humiliated me 💀 It literally rated my face as ${result.roastPercentage}% CRINGE! I double dare you to scan yours and see what it says 👇\n${appUrl}/#/scan`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-600 text-foreground rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Share on WhatsApp
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Bro this AI just humiliated me 💀 It literally rated my face as ${result.roastPercentage}% CRINGE! I double dare you to scan yours and see what it says 👇\n${appUrl}/#/scan`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-6 py-3 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                {copied ? "Copied! ✅" : "📋 Copy Text"}
              </button>
            </div>

            <Link
              to="/"
              className="inline-block mt-6 text-primary hover:underline font-heading"
            >
              ← Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;
