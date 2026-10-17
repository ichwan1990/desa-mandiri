// Audio Desa Mandiri: musik ambien generatif + SFX, semuanya dibuat dengan WebAudio (tanpa file).
// Dimulai hanya setelah gestur pertama pemain (kebijakan autoplay browser). Volume: AUDIO.setVolumes(musik0..1, efek0..1), AUDIO.setMuted(bool).
window.AUDIO = (() => {
  let ctx = null, master, musicGain, sfxGain, started = false, muted = false, vol = { musik: 0.6, efek: 0.7 }, timer = null, nextT = 0, step = 0;
  const last = {};
  const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25]; // C mayor pentatonik + oktaf
  const CHORDS = [[130.81, 196.0], [110.0, 164.81], [146.83, 220.0], [98.0, 146.83]];
  function init() {
    if (ctx) return; const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); musicGain = ctx.createGain(); sfxGain = ctx.createGain();
    musicGain.connect(master); sfxGain.connect(master); master.connect(ctx.destination); apply();
    started = true; nextT = ctx.currentTime + 0.1; timer = setInterval(schedule, 200);
  }
  function apply() { if (!ctx) return; master.gain.value = muted ? 0 : 1; musicGain.gain.value = vol.musik * 0.25; sfxGain.gain.value = vol.efek * 0.6; }
  function tone(freq, t, dur, { type = 'sine', gain = 0.2, out = sfxGain, attack = 0.005, slide = 0 } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(t, dur, { freq = 1200, q = 1, gain = 0.3 } = {}) {
    const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2;
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); src.buffer = buf; f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    g.gain.value = gain; src.connect(f); f.connect(g); g.connect(sfxGain); src.start(t);
  }
  // musik: pad akor pelan + melodi pentatonik acak yang jarang (cozy)
  function schedule() {
    if (!ctx || ctx.state !== 'running') return;
    while (nextT < ctx.currentTime + 0.6) {
      const beat = 0.55;
      if (step % 16 === 0) CHORDS[(step / 16) % CHORDS.length].forEach(f => tone(f, nextT, beat * 16, { type: 'triangle', gain: 0.07, out: musicGain, attack: 1.2 }));
      if (Math.random() < 0.42) tone(SCALE[Math.floor(Math.random() * SCALE.length)], nextT, beat * 2.2, { type: 'sine', gain: 0.11, out: musicGain, attack: 0.02 });
      nextT += beat; step++;
    }
  }
  const SFX = {
    tebang: t => { noise(t, 0.09, { freq: 900, q: 2, gain: 0.5 }); tone(120, t, 0.12, { type: 'triangle', gain: 0.25, slide: 0.6 }); },
    tambang: t => { noise(t, 0.06, { freq: 3000, q: 4, gain: 0.35 }); tone(520, t, 0.15, { type: 'square', gain: 0.06, slide: 0.9 }); },
    bangun: t => { tone(180, t, 0.08, { type: 'square', gain: 0.12 }); tone(160, t + 0.14, 0.08, { type: 'square', gain: 0.12 }); },
    panen: t => [523.25, 659.25, 783.99].forEach((f, i) => tone(f, t + i * 0.08, 0.35, { gain: 0.15 })),
    event: t => { tone(880, t, 1.2, { gain: 0.18 }); tone(1320, t, 0.9, { gain: 0.08 }); tone(660, t + 0.25, 1.0, { gain: 0.1 }); },
    lonceng: t => { tone(1046.5, t, 0.8, { gain: 0.14 }); tone(1568, t + 0.12, 0.7, { gain: 0.1 }); },
    koin: t => { tone(1318.5, t, 0.12, { type: 'square', gain: 0.06 }); tone(1975.5, t + 0.07, 0.2, { type: 'square', gain: 0.05 }); },
    klik: t => tone(1200, t, 0.04, { type: 'square', gain: 0.05 }),
  };
  function sfx(name) { if (!ctx || !SFX[name] || ctx.state !== 'running') return; const now = ctx.currentTime;
    if (last[name] && now - last[name] < 0.12) return; last[name] = now; SFX[name](now + 0.01); }
  // mulai setelah gestur pertama
  const kick = () => { init(); if (ctx && ctx.state === 'suspended') ctx.resume(); };
  ['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, kick, { once: false, passive: true }));
  return { sfx, init, get started() { return started && !!ctx && ctx.state === 'running'; }, get ctx() { return ctx; },
    setVolumes(m, e) { vol.musik = m; vol.efek = e; apply(); }, setMuted(b) { muted = !!b; apply(); }, get muted() { return muted; } };
})();
