import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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

type Step = "capture" | "form" | "result";

const Scan = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [step, setStep] = useState<Step>("capture");
  const [photo, setPhoto] = useState<string>("");
  const [countdown, setCountdown] = useState(5);
  const [loadingMsg, setLoadingMsg] = useState(0);
  const [formData, setFormData] = useState({ name: "", age: "", crushName: "", crushAge: "" });
  const [result, setResult] = useState<ScanEntry | null>(null);
  const [copied, setCopied] = useState(false);

  // Start webcam
  useEffect(() => {
    if (step !== "capture") return;
    let stream: MediaStream;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (e) {
        console.error("Camera error:", e);
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
    if (!video || !canvas) return;
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, 320, 240);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
    setPhoto(dataUrl);
    // Stop video
    const stream = video.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
    setStep("form");
  }, []);

  // Cycling loading messages during form
  useEffect(() => {
    if (step !== "form") return;
    const interval = setInterval(() => setLoadingMsg(m => (m + 1) % LOADING_MESSAGES.length), 2000);
    return () => clearInterval(interval);
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
      roastText: roast,
      timestamp: Date.now(),
    };
    addEntry(entry);
    setResult(entry);
    setStep("result");
  };

  if (isExpired()) return <ExpiryGate />;

  const appUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-mystical relative overflow-hidden">
      <StarField />
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-12">
        {/* STEP 1: Capture */}
        {step === "capture" && (
          <div className="text-center">
            <h2 className="font-heading text-2xl text-primary glow-gold mb-6">Scanning Your Face...</h2>
            <div className="relative mx-auto w-72 h-72 rounded-full overflow-hidden border-4 border-primary/50 glow-box-gold">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
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
              <p className="text-green-400 text-lg mb-2">Face detected ✅</p>
              <p className="text-muted-foreground italic">Extracting destiny markers...</p>
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
              <button
                type="submit"
                className="w-full py-4 bg-primary text-primary-foreground font-heading text-lg rounded-lg glow-box-gold hover:scale-[1.02] transition-transform"
              >
                Reveal My Future 🔮
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Result */}
        {step === "result" && result && (
          <div className="text-center">
            <h2 className="font-heading text-2xl text-primary glow-gold mb-6">Your Prophecy</h2>

            {/* Prophecy Card */}
            <div className="mx-auto max-w-sm p-6 rounded-xl bg-gradient-to-b from-secondary to-card border border-primary/30 glow-box-gold">
              <img
                src={result.facePhoto}
                alt={result.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-primary object-cover"
              />
              <h3 className="font-heading text-xl text-primary mb-1">{result.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">Age {result.age} • Crushing on {result.crushName}</p>
              <div className="p-4 rounded-lg bg-background/50 border border-border">
                <p className="text-foreground text-lg italic">"{result.roastText}"</p>
              </div>
              <p className="text-muted-foreground text-xs mt-3">— FutureScan AI™</p>
            </div>

            {/* Share buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`My FutureScan prophecy: "${result.roastText}" 😂 Try yours 👇 ${appUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-green-600 text-foreground rounded-lg hover:bg-green-700 transition-colors"
              >
                Share on WhatsApp
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`My FutureScan prophecy: "${result.roastText}" 😂 Try yours 👇 ${appUrl}`);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-6 py-3 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                {copied ? "Copied! ✅" : "Copy for Instagram"}
              </button>
            </div>

            <button
              onClick={() => navigate("/")}
              className="mt-6 text-primary hover:underline font-heading"
            >
              ← Back to Hall of Shame
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;
