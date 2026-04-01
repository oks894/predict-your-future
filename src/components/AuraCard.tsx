import { useEffect, useRef } from "react";
import { ScanEntry, getAuraRank } from "@/lib/storage";

interface Props {
  entry: ScanEntry;
  onClose: () => void;
  onDownloadPost: () => void;
  onDownloadStory: () => void;
}

const RANK_CONFIGS: Record<string, { bgColor: string; orbColor: string; glowColor: string; crackColor: string }> = {
  'Cosmic Sigma':        { bgColor: '#0a0512', orbColor: '#FFD700', glowColor: 'rgba(255,215,0,0.6)',   crackColor: '#fff7d4' },
  'Aura Intact':         { bgColor: '#0d0822', orbColor: '#C084FC', glowColor: 'rgba(192,132,252,0.5)', crackColor: '#e9d5ff' },
  'Aura Cracking':       { bgColor: '#120800', orbColor: '#FB923C', glowColor: 'rgba(251,146,60,0.5)',  crackColor: '#fed7aa' },
  'Aura Shattered':      { bgColor: '#120000', orbColor: '#F87171', glowColor: 'rgba(248,113,113,0.5)', crackColor: '#fecaca' },
  'Aura Deleted':        { bgColor: '#080808', orbColor: '#6B7280', glowColor: 'rgba(107,114,128,0.4)', crackColor: '#d1d5db' },
  'Negative Aura Entity':{ bgColor: '#000000', orbColor: '#1F2937', glowColor: 'rgba(30,30,30,0.8)',    crackColor: '#374151' },
};

function drawAuraCard(
  canvas: HTMLCanvasElement,
  entry: ScanEntry,
  aura: number,
  width: number,
  height: number
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = width;
  canvas.height = height;

  const rank = getAuraRank(aura);
  const cfg = RANK_CONFIGS[rank.label] || RANK_CONFIGS['Aura Deleted'];
  const isStory = height > width;
  const cx = width / 2;
  const orbY = isStory ? height * 0.42 : height * 0.45;
  const orbR = Math.min(width, height) * (isStory ? 0.28 : 0.3);

  // Background
  const bgGrad = ctx.createRadialGradient(cx, orbY, 0, cx, orbY, Math.max(width, height));
  bgGrad.addColorStop(0, cfg.bgColor === '#000000' ? '#050505' : cfg.bgColor);
  bgGrad.addColorStop(0.5, `${cfg.bgColor}ee`);
  bgGrad.addColorStop(1, '#000000');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Star particles
  const rng = (seed: number) => (Math.sin(seed * 127.1) * 43758.5453) % 1;
  for (let i = 0; i < 80; i++) {
    const sx = rng(i) * width;
    const sy = rng(i + 100) * height;
    const ss = rng(i + 200) * 1.5 + 0.3;
    const sa = rng(i + 300) * 0.7 + 0.3;
    ctx.beginPath();
    ctx.arc(sx, sy, ss, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${sa})`;
    ctx.fill();
  }

  // Outer glow rings
  for (let ring = 3; ring >= 1; ring--) {
    ctx.beginPath();
    ctx.arc(cx, orbY, orbR + ring * 18, 0, Math.PI * 2);
    ctx.strokeStyle = cfg.glowColor.replace(')', `, ${0.15 / ring})`).replace('rgba', 'rgba');
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  // Main orb gradient
  const orbGrad = ctx.createRadialGradient(cx - orbR * 0.2, orbY - orbR * 0.2, 0, cx, orbY, orbR);
  orbGrad.addColorStop(0, `${cfg.orbColor}dd`);
  orbGrad.addColorStop(0.5, `${cfg.orbColor}99`);
  orbGrad.addColorStop(1, `${cfg.orbColor}22`);
  ctx.beginPath();
  ctx.arc(cx, orbY, orbR, 0, Math.PI * 2);
  ctx.fillStyle = orbGrad;
  ctx.fill();

  // Face photo clipped to orb
  const faceImg = new Image();
  faceImg.crossOrigin = 'anonymous';
  faceImg.onload = () => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, orbY, orbR * 0.85, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(faceImg, cx - orbR * 0.85, orbY - orbR * 0.85, orbR * 1.7, orbR * 1.7);
    ctx.restore();

    // Orb edge glow
    const edgeGrad = ctx.createRadialGradient(cx, orbY, orbR * 0.6, cx, orbY, orbR);
    edgeGrad.addColorStop(0, 'transparent');
    edgeGrad.addColorStop(1, cfg.glowColor);
    ctx.beginPath();
    ctx.arc(cx, orbY, orbR, 0, Math.PI * 2);
    ctx.fillStyle = edgeGrad;
    ctx.fill();

    // Top name text
    const topY = isStory ? height * 0.1 : height * 0.08;
    ctx.textAlign = 'center';
    ctx.fillStyle = cfg.orbColor;
    ctx.font = `bold ${Math.round(width * 0.06)}px 'Cinzel', serif`;
    ctx.shadowColor = cfg.glowColor;
    ctx.shadowBlur = 20;
    ctx.fillText(entry.name.toUpperCase(), cx, topY);
    ctx.shadowBlur = 0;

    // Rank emoji + label
    const rankY = orbY + orbR + (isStory ? 55 : 45);
    ctx.font = `bold ${Math.round(width * 0.072)}px serif`;
    ctx.fillText(rank.emoji, cx, rankY);
    ctx.font = `bold ${Math.round(width * 0.045)}px 'Cinzel', serif`;
    ctx.fillStyle = cfg.orbColor;
    ctx.shadowColor = cfg.glowColor;
    ctx.shadowBlur = 15;
    ctx.fillText(rank.label.toUpperCase(), cx, rankY + Math.round(width * 0.058));
    ctx.shadowBlur = 0;

    // Aura score
    ctx.font = `bold ${Math.round(width * 0.18)}px 'Cinzel', serif`;
    ctx.fillStyle = cfg.orbColor;
    ctx.shadowColor = cfg.glowColor;
    ctx.shadowBlur = 40;
    ctx.fillText(aura.toString(), cx, rankY + Math.round(width * 0.2));
    ctx.shadowBlur = 0;

    ctx.font = `${Math.round(width * 0.04)}px 'Inter', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('AURA SCORE', cx, rankY + Math.round(width * 0.24));

    // Bottom watermark
    const botY = height - Math.round(height * 0.04);
    ctx.font = `${Math.round(width * 0.035)}px 'Inter', sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('🔮 Certified by FutureScan AI Oracle — predictyourfuture', cx, botY);

    // Holographic shimmer
    const shimmer = ctx.createLinearGradient(0, 0, width, height);
    shimmer.addColorStop(0, 'rgba(255,255,255,0)');
    shimmer.addColorStop(0.4, 'rgba(255,255,255,0.03)');
    shimmer.addColorStop(0.6, 'rgba(255,255,255,0.06)');
    shimmer.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = shimmer;
    ctx.fillRect(0, 0, width, height);
  };
  faceImg.src = entry.facePhoto;
}

export function generateAuraCardBlob(
  entry: ScanEntry,
  aura: number,
  mode: 'post' | 'story'
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const [w, h] = mode === 'post' ? [1080, 1080] : [1080, 1920];
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      drawAuraCard(canvas, entry, aura, w, h);
      // Wait for face to paint (onload inside drawAuraCard)
      setTimeout(() => resolve(canvas.toDataURL('image/png')), 200);
    };
    img.onerror = () => {
      drawAuraCard(canvas, entry, aura, w, h);
      setTimeout(() => resolve(canvas.toDataURL('image/png')), 200);
    };
    img.src = entry.facePhoto;
  });
}

const AuraCardGenerator = ({ entry, aura, onClose }: { entry: ScanEntry; aura: number; onClose: () => void }) => {
  const previewRef = useRef<HTMLCanvasElement>(null);
  const rank = getAuraRank(aura);

  useEffect(() => {
    if (previewRef.current) {
      drawAuraCard(previewRef.current, entry, aura, 400, 400);
    }
  }, [entry, aura]);

  const download = async (mode: 'post' | 'story') => {
    const url = await generateAuraCardBlob(entry, aura, mode);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auracard-${entry.name}-${mode}.png`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="bg-secondary border border-primary/30 rounded-2xl w-full max-w-sm p-6 shadow-[0_0_40px_rgba(212,175,55,0.2)]">
        <div className="text-center mb-4">
          <h2 className="font-heading text-2xl text-primary glow-gold">Your Aura Card</h2>
          <p className="text-muted-foreground text-sm">{rank.emoji} {rank.label} — {aura} Aura</p>
        </div>
        <canvas
          ref={previewRef}
          className="w-full aspect-square rounded-xl border border-primary/20 mb-4"
          style={{ imageRendering: 'crisp-edges' }}
        />
        <p className="text-muted-foreground text-xs text-center mb-3">Downloads at full resolution (1080px)</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => download('post')}
            className="px-4 py-3 bg-primary text-primary-foreground rounded-xl font-heading text-sm hover:opacity-90 transition-opacity glow-box-gold"
          >
            📸 Save as Post
          </button>
          <button
            onClick={() => download('story')}
            className="px-4 py-3 bg-accent text-accent-foreground rounded-xl font-heading text-sm hover:opacity-90 transition-opacity"
          >
            📱 Save as Story
          </button>
        </div>
        <button onClick={onClose} className="w-full text-muted-foreground/50 text-xs hover:text-muted-foreground text-center transition-colors">
          Close
        </button>
      </div>
    </div>
  );
};

export default AuraCardGenerator;
