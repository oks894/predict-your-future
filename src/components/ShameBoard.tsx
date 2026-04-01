import { useState, useEffect } from "react";
import { ScanEntry, getShameEntries, getAdminUpiId, getAuraRank, getAdminIgAccount } from "@/lib/storage";

const SHAME_BADGE: Record<string, { icon: string; label: string; color: string }> = {
  '🐔 Chickened Out': { icon: '🐔', label: 'Rookie Coward',    color: '#FB923C' },
  '💀 Challenge Failed': { icon: '💀', label: 'Challenge Failed', color: '#F87171' },
  '🤡 Caught Faking':  { icon: '🤡', label: 'Caught Faking',    color: '#C084FC' },
};

function useLiveTick(timestampMs: number | undefined) {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    if (!timestampMs) return;
    const tick = () => {
      const ms = Date.now() - timestampMs;
      const mins = Math.floor(ms / 60000);
      const hrs = Math.floor(mins / 60);
      if (hrs > 0) setElapsed(`${hrs}h ${mins % 60}m`);
      else setElapsed(`${mins}m`);
    };
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [timestampMs]);
  return elapsed;
}

function downloadShameCard(entry: ScanEntry) {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Dark BG with red glow
  const bg = ctx.createRadialGradient(540, 540, 80, 540, 540, 760);
  bg.addColorStop(0, '#1a0000');
  bg.addColorStop(0.5, '#0d0000');
  bg.addColorStop(1, '#000000');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1080);

  // Red ambient glow
  const redGlow = ctx.createRadialGradient(540, 540, 0, 540, 540, 500);
  redGlow.addColorStop(0, 'rgba(220,38,38,0.18)');
  redGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = redGlow;
  ctx.fillRect(0, 0, 1080, 1080);

  // "OFFICIALLY SHAMED" header
  ctx.textAlign = 'center';
  ctx.font = 'bold 72px serif';
  ctx.fillStyle = '#DC2626';
  ctx.shadowColor = 'rgba(220,38,38,0.8)';
  ctx.shadowBlur = 30;
  ctx.fillText('OFFICIALLY SHAMED', 540, 110);
  ctx.shadowBlur = 0;

  // Face photo with cracked frame
  const faceImg = new Image();
  faceImg.crossOrigin = 'anonymous';
  faceImg.onload = () => {
    // Cracked circle frame
    ctx.save();
    ctx.beginPath();
    ctx.arc(540, 440, 200, 0, Math.PI * 2);
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 8;
    ctx.shadowColor = 'rgba(220,38,38,0.8)';
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(540, 440, 190, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(faceImg, 350, 250, 380, 380);
    ctx.restore();

    // Crack lines
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.6;
    const cracks = [[540,250,480,220],[540,250,560,180],[540,630,590,660],[540,630,510,680]];
    cracks.forEach(([x1,y1,x2,y2]) => {
      ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Shame badge
    const badge = SHAME_BADGE[entry.shameReason || '💀 Challenge Failed'];
    ctx.font = 'bold 56px serif';
    ctx.fillText(badge?.icon || '💀', 540, 700);
    ctx.font = 'bold 44px serif';
    ctx.fillStyle = badge?.color || '#F87171';
    ctx.shadowColor = badge?.color || '#F87171';
    ctx.shadowBlur = 15;
    ctx.fillText((badge?.label || 'FAILED').toUpperCase(), 540, 760);
    ctx.shadowBlur = 0;

    // Name
    ctx.font = 'bold 52px serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(entry.name, 540, 830);

    // Duration on board
    const minsOnBoard = Math.floor((Date.now() - entry.timestamp) / 60000);
    ctx.font = '32px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(`On shame board: ${minsOnBoard}m`, 540, 880);

    // Bottom watermark
    ctx.font = '28px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fillText('🔮 PredictYourFuture — AI Oracle System', 540, 1040);

    // Download
    const link = document.createElement('a');
    link.download = `shameboard-${entry.name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  faceImg.src = entry.facePhoto;
}

function ShameCard({ entry }: { entry: ScanEntry }) {
  const [showUpi, setShowUpi] = useState(false);
  const elapsed = useLiveTick(entry.timestamp);
  const badge = SHAME_BADGE[entry.shameReason || '💀 Challenge Failed'];
  const aura = entry.aura ?? 100;
  const rank = getAuraRank(aura);

  return (
    <div className="relative p-4 rounded-2xl bg-gradient-to-br from-red-950/40 to-black border border-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.15)] animate-float-slow">
      {/* Shame badge */}
      <div className="absolute top-3 right-3">
        <span
          className="text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider"
          style={{ background: `${badge?.color}22`, color: badge?.color, border: `1px solid ${badge?.color}55` }}
        >
          {badge?.icon} {badge?.label}
        </span>
      </div>

      <div className="flex gap-4 mb-3">
        <div className="relative shrink-0">
          <img
            src={entry.facePhoto}
            alt={entry.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-red-500/60"
          />
          {/* Crack overlay */}
          <div className="absolute inset-0 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle at 30% 30%, transparent 40%, rgba(220,38,38,0.15) 100%)' }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground font-bold text-lg truncate">{entry.name}</p>
          <p className="text-red-400 text-xs font-mono">
            ⏱ On board: <span className="font-bold animate-pulse">{elapsed}</span>
          </p>
          <p className="text-muted-foreground text-xs mt-0.5" style={{ color: rank.color }}>
            {rank.emoji} {rank.label} — {aura} aura
          </p>
        </div>
      </div>

      <p className="text-muted-foreground text-sm italic line-clamp-2 mb-3 border-l-2 border-red-500/40 pl-3">
        "{entry.roastText.split('\n\n')[1] || entry.roastText}"
      </p>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => downloadShameCard(entry)}
          className="flex-1 px-3 py-2 text-xs font-bold bg-red-900/40 text-red-300 border border-red-500/30 rounded-lg hover:bg-red-900/60 transition-colors uppercase tracking-wide"
        >
          📥 Download Card
        </button>
        <button
          onClick={() => setShowUpi(v => !v)}
          className="flex-1 px-3 py-2 text-xs font-bold bg-green-900/30 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-900/50 transition-colors uppercase tracking-wide"
        >
          💸 Pay ₹1 to Escape
        </button>
      </div>

      {showUpi && (
        <div className="mt-3 p-3 bg-background/50 rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground mb-2 font-bold uppercase tracking-wider">Scan to pay ₹1 Fine</p>
          {getAdminUpiId() ? (
            <>
              <div className="w-28 h-28 bg-white mx-auto rounded-lg p-1.5 shadow-inner">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=${getAdminUpiId()}&pn=PredictYourFuture&am=1.00&cu=INR`)}`}
                  alt="UPI QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-primary text-xs font-mono mt-2">{getAdminUpiId()}</p>
              {getAdminIgAccount() && (
                <p className="text-muted-foreground text-xs mt-2 italic">Then DM {getAdminIgAccount()} on IG</p>
              )}
            </>
          ) : getAdminIgAccount() ? (
            <p className="text-muted-foreground text-xs italic">DM {getAdminIgAccount()} on Instagram to arrange removal.</p>
          ) : (
            <p className="text-muted-foreground text-xs italic">DM @itsnextgenfounder on Instagram to arrange removal.</p>
          )}
        </div>
      )}
    </div>
  );
}

const ShameBoard = () => {
  const [shameEntries, setShameEntries] = useState<ScanEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShameEntries().then(data => { setShameEntries(data); setLoading(false); });
  }, []);

  if (loading) return null;
  if (shameEntries.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="text-center mb-6">
        <h2 className="font-heading text-3xl text-red-400 text-center" style={{ textShadow: '0 0 20px rgba(220,38,38,0.5)' }}>
          🚨 Global Shame Board
        </h2>
        <p className="text-muted-foreground text-sm mt-1">These cowards failed the Oracle's dare. Their shame is eternal.</p>
        {getAdminUpiId() && (
          <p className="text-green-400 text-xs mt-2 font-mono">
            💰 Coward Fund: ₹{shameEntries.length} collected 😈
          </p>
        )}
      </div>

      <div className="grid gap-4">
        {shameEntries.map(entry => (
          <ShameCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
};

export default ShameBoard;
