import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { getEntries, setFirstUseTimestamp, isExpired } from "@/lib/storage";
import type { ScanEntry } from "@/lib/storage";
import StarField from "@/components/StarField";
import ExpiryGate from "@/components/ExpiryGate";

const Index = () => {
  const [searchParams] = useSearchParams();
  const challenge = searchParams.get("challenge");
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const [shareLink, setShareLink] = useState("");
  const [friendName, setFriendName] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If a legacy challenge link hits the homepage, instantly redirect them to the scanner.
    if (challenge) {
      navigate(`/scan?challenge=${encodeURIComponent(challenge)}`, { replace: true });
    }
  }, [challenge, navigate]);

  useEffect(() => {
    setFirstUseTimestamp();
    getEntries().then(setEntries);
  }, []);

  if (isExpired()) return <ExpiryGate />;

  const appUrl = window.location.origin;
  const scanUrl = `${appUrl}/#/scan`;
  const whatsappText = encodeURIComponent(`This AI just predicted my future and I'm SHOOK 😱🔮 Try it yourself 👇 ${scanUrl}`);

  const generateChallengeLink = () => {
    if (!friendName.trim()) return;
    setShareLink(`${scanUrl}?challenge=${encodeURIComponent(friendName.trim())}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[100dvh] bg-mystical relative overflow-hidden">
      <StarField />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-6 md:py-12">
        {/* Hero */}
        <div className="text-center mb-10 md:mb-16">
          <h1 className="font-heading text-3xl md:text-6xl text-primary glow-gold mb-2 md:mb-4">
            Predict Your Future
          </h1>
          <p className="text-lg md:text-2xl text-foreground/80 font-heading">
            🔮 See Your Destiny
          </p>
          <p className="text-sm md:text-base text-accent font-heading mt-1">Advanced AI face analysis powered by neural networks</p>
          <p className="text-muted-foreground mt-2 text-sm">🧬 AI-powered face analysis • 14 billion timelines scanned</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <button
              onClick={() => navigate("/scan")}
              className="px-8 py-4 bg-primary text-primary-foreground font-heading text-lg rounded-lg glow-box-gold hover:scale-105 transition-transform w-full sm:w-auto"
            >
              Scan My Future 🔮
            </button>
            <button
              onClick={() => navigate("/love")}
              className="px-8 py-4 bg-accent text-accent-foreground font-heading text-lg rounded-lg shadow-[0_0_15px_rgba(255,0,100,0.5)] hover:scale-105 transition-transform w-full sm:w-auto"
            >
              Love Calculator 💔
            </button>
          </div>
        </div>

        {/* Hall of Prophecies */}
        {entries.length > 0 && (
          <div className="mb-16">
            <h2 className="font-heading text-2xl text-primary glow-gold text-center mb-6">
              🔥 Hall of Roasted Idiots
            </h2>
            <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
              {entries.map((e, i) => (
                <div key={e.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 border border-border">
                  <span className="text-primary font-heading text-sm whitespace-nowrap">#{i + 1}</span>
                  <div className="flex -space-x-4">
                    <img
                      src={e.facePhoto}
                      alt={e.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary relative z-10"
                      loading="lazy"
                    />
                    {e.crushPhoto && (
                      <img
                        src={e.crushPhoto}
                        alt="Crush"
                        className="w-12 h-12 rounded-full object-cover border-2 border-accent relative z-0"
                        loading="lazy"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 ml-2">
                    <p className="text-foreground font-medium truncate">
                      {e.name}, {e.age}
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${e.scanType === 'love' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                        {e.scanType === 'love' ? 'Love Scan' : 'Future Scan'}
                      </span>
                    </p>
                    <p className="text-primary font-bold text-xs mt-0.5">
                      {e.roastPercentage || 0}% {e.scanType === 'love' ? 'Delusional' : 'Cringe'}
                    </p>
                    <p className="text-muted-foreground text-sm truncate w-full" title={e.roastText}>{e.roastText}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Section */}
        <div className="mb-16 space-y-4">
          <h2 className="font-heading text-2xl text-primary glow-gold text-center mb-4">
            📤 Share Your Prophecy
          </h2>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={`https://wa.me/?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-green-600 text-foreground rounded-lg text-center hover:bg-green-700 transition-colors"
            >
              Share on WhatsApp
            </a>
            <button
              onClick={() => copyToClipboard(`This AI just predicted my future and I'm SHOOK 😱🔮 Try it yourself 👇 ${scanUrl}`)}
              className="px-6 py-3 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              {copied ? "Copied! ✅" : "Copy for Instagram"}
            </button>
          </div>

           {/* Challenge Link */}
          <div className="max-w-md mx-auto mt-8 border-t border-border/50 pt-6 text-center">
            <h3 className="text-primary font-heading text-xl mb-2">⚔️ Challenge a Friend</h3>
            <p className="text-muted-foreground text-sm mb-4">Send a direct challenge link to trigger their roast 👇</p>
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <input
                value={friendName}
                onChange={e => setFriendName(e.target.value)}
                placeholder="Friend's name"
                className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                onClick={generateChallengeLink}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Generate Link
              </button>
            </div>
            {shareLink && (
              <div className="mt-2 p-2 bg-muted rounded text-sm break-all">
                <span className="text-muted-foreground">{shareLink}</span>
                <button onClick={() => copyToClipboard(shareLink)} className="ml-2 text-primary hover:underline text-xs">
                  Copy
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-muted-foreground text-sm pb-8 space-y-2">
          <p>Predict Your Future™ — Powered by Advanced Neural Networks 🧠</p>
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
            {" "}— Follow on Instagram ❤️
          </p>
          <div>
            <Link to="/admin" className="text-muted-foreground/50 hover:text-muted-foreground text-xs inline-block">
              Admin
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
