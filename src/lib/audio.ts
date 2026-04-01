// Web Audio API Synths for viral sound effects
export function playEerieScanSound() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 3);
    
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.5);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3);
    
    // Add some eerie modulation
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 5; // 5Hz wobble
    lfoGain.gain.value = 50; 
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();
    lfo.stop(ctx.currentTime + 3);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 3);
  } catch(e) { console.error("Audio error", e) }
}

export function playDunDunDuuun() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    
    // Notes: C4, C4, G3
    const notes = [261.63, 261.63, 196.00];
    let time = ctx.currentTime;
    
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(f, time);
      
      gain.gain.setValueAtTime(0.15, time);
      const dur = i === 2 ? 1.5 : 0.25;
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur);
      time += (i === 2 ? 0 : 0.4);
    });
  } catch(e) { console.error("Audio error", e) }
}

export function playSadTrombone() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    
    const notes = [300, 280, 260, 230];
    let time = ctx.currentTime;
    
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      
      // Pitch bend down
      osc.frequency.setValueAtTime(f, time);
      const dur = i === 3 ? 1.0 : 0.4;
      osc.frequency.linearRampToValueAtTime(f - 30, time + dur);
      
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(time);
      osc.stop(time + dur);
      time += dur;
    });
  } catch(e) { console.error("Audio error", e) }
}
