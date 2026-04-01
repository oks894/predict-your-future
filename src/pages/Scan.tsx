import { useState, useRef, useEffect, useCallback } from "react";
import html2canvas from "html2canvas";
import { Link, useNavigate } from "react-router-dom";
import { addEntry, generateRoast, isExpired } from "@/lib/storage";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<Step>("capture");
  const [photo, setPhoto] = useState<string>("");
  const [crushPhoto, setCrushPhoto] = useState<string>("");
  const [countdown, setCountdown] = useState(5);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [formData, setFormData] = useState({ name: "", age: "", crushName: "", crushAge: "" });
  const [result, setResult] = useState<ScanEntry | null>(null);
  const [copied, setCopied] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Start webcam
  useEffect(() => {
    if (step !== "capture") return;
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
  }, [step]);

  // Countdown & auto-capture
  useEffect(() => {
    if (step !== "capture") return;
    if (countdown <= 0) {
      capturePhoto();
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, countdown]);

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
      // Camera failed — generate a placeholder "scan" image
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

  // Cycling loading messages during form
  useEffect(() => {
    if (step !== "form") return;
    const interval = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length), 2000);
    return () => clearInterval(interval);
  }, [step]);

  // Fake loading screen after form submit
  useEffect(() => {
    if (step !== "loading") return;
    const msgInterval = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length), 800);
    const progressInterval = setInterval(() => {
      setLoadingProgress(p => {
        if (p >= 100) return 100;
        return p + Math.random() * 15 + 5;
      });
    }, 400);
    const timeout = setTimeout(() => {
      setStep("result");
    }, 4000);
    return () => {
      clearInterval(msgInterval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [step]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const age = parseInt(formData.age);
    const crushAge = parseInt(formData.crushAge);
    if (!formData.name || !age || !formData.crushName || !crushAge) return;

    const roast = generateRoast(formData.name, age, formData.crushName, crushAge);
    const entry: ScanEntry = {
      id: crypto.randomUUID(),
      name: formData.name,
      age,
      crushName: formData.crushName,
      crushAge,
      facePhoto: photo,
      crushPhoto,
      roastText: roast,
      timestamp: Date.now(),
    };
    addEntry(entry);
    setResult(entry);
    setLoadingProgress(0);
    setLoadingMsg(0);
    setStep("loading");
  };

  const downloadCardAsImage = async () => {
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
    }
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

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 md:py-12">
        {/* STEP 1: Capture */}
        {step === "capture" && (
          <div className="text-center">
            <h2 className="font-heading text-2xl text-primary glow-gold mb-6">Scanning Your Face...</h2>
            <div className="relative mx-auto w-72 h-72 rounded-full overflow-hidden border-4 border-primary/50 glow-box-gold">
              {cameraError ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/50">
                  <p className="text-4xl mb-2">🔮</p>
                  <p className="text-muted-foreground text-sm px-4">Scanning via neural link...</p>
                </div>
              ) : (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              )}
              {/* Scan overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 border-4 border-accent/30 rounded-full animate-pulse-glow" />
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
              </div>
            </div>
            <p className="mt-6 text-primary font-heading text-4xl">{countdown}</p>
            <p className="text-muted-foreground text-sm mt-2">Hold still... scanning biometrics</p>
          </div>
        )}

        {/* STEP 2: Form with fake loading */}
        {step === "form" && (
          <div>
            <div className="text-center mb-6">
              <p className="text-green-400 text-lg mb-2">Face scan complete ✅</p>
              <p className="text-muted-foreground italic">We need a few details to cross-reference your timeline...</p>
            </div>

            {/* Fake loading */}
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

        {/* STEP 3: Fake "Processing" loading screen */}
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

        {/* STEP 4: Result — THIS is where the prank is revealed */}
        {step === "result" && result && (
          <div className="text-center">
            <h2 className="font-heading text-2xl text-primary glow-gold mb-6">Your Roasted Meme</h2>

            {/* Prophecy Card — also used for image export */}
            <div
              id="prophecy-card"
              className="mx-auto max-w-sm p-6 rounded-xl bg-gradient-to-b from-secondary to-card border border-primary/30 glow-box-gold"
            >
              <div className="flex justify-center items-center gap-2 mb-4">
                <img
                  src={result.facePhoto}
                  alt={result.name}
                  className="w-20 h-20 rounded-full border-2 border-primary object-cover"
                />
                {result.crushPhoto ? (
                  <>
                    <span className="text-2xl animate-pulse">💔</span>
                    <img
                      src={result.crushPhoto}
                      alt={result.crushName}
                      className="w-20 h-20 rounded-full border-2 border-accent object-cover"
                    />
                  </>
                ) : (
                  <span className="text-2xl animate-pulse">🔮</span>
                )}
              </div>
              <h3 className="font-heading text-xl text-primary mb-1">{result.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">Age {result.age} • Crushing on {result.crushName}</p>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <p className="text-foreground text-lg italic">"{result.roastText}"</p>
              </div>
              <p className="text-muted-foreground text-xs mt-3">— Predict Your Future™ 🤡 Happy April Fools'</p>
              <p className="text-muted-foreground text-xs">@itsnextgenfounder</p>
            </div>

            {/* Share buttons */}
            <div className="flex flex-col gap-3 justify-center mt-8">
              <button
                onClick={downloadCardAsImage}
                className="px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                📸 Download as Image (Share on Instagram)
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`My prophecy: "${result.roastText}" 😂 Try yours 👇 ${appUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-600 text-foreground rounded-lg hover:bg-green-700 transition-colors text-center"
              >
                Share on WhatsApp
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`My prophecy: "${result.roastText}" 😂 Try yours 👇 ${appUrl}`);
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
