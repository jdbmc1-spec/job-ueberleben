// Gemeinsame Helfer und Farbpalette für die Glow-Up-Serie.

export const F = {
  linie: '#2a1f3d',
  lila: '#7c4dff',
  lilaDunkel: '#2b1b57',
  lilaNacht: '#1d1238',
  gelb: '#ffd43b',
  hl: '#ffe14d',
  pink: '#ff4d6d',
  blau: '#3b82f6',
  orange: '#f97316',
  gruen: '#22c55e',
  rot: '#ef4444',
  weiss: '#ffffff',
};

export const esc = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Deterministischer Zufall (Hyperframes verlangt reproduzierbare Frames).
export function rng(seed = 1) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const n = (v) => Math.round(v * 100) / 100;

// Stern-/Explosionsform für Comic-Soundwords.
export function burstPath(cx, cy, rOut, rIn, spikes = 14, seed = 3) {
  const r = rng(seed);
  let d = '';
  for (let i = 0; i < spikes * 2; i++) {
    const a = (Math.PI * i) / spikes - Math.PI / 2;
    const rad = i % 2 === 0 ? rOut * (0.85 + r() * 0.3) : rIn * (0.9 + r() * 0.15);
    d += `${i ? 'L' : 'M'}${n(cx + Math.cos(a) * rad)} ${n(cy + Math.sin(a) * rad)} `;
  }
  return d + 'Z';
}

// Wandelt Werte wie "links", "mitte", 0.3 oder 540 in Pixel um.
export function posX(v, def = 540) {
  if (v == null) return def;
  if (v === 'links') return 300;
  if (v === 'mitte') return 540;
  if (v === 'rechts') return 780;
  return v <= 1 ? Math.round(v * 1080) : v;
}
export function posY(v, def = 960) {
  if (v == null) return def;
  if (v === 'oben') return 420;
  if (v === 'mitte') return 900;
  if (v === 'unten') return 1500;
  return v <= 1 ? Math.round(v * 1920) : v;
}
