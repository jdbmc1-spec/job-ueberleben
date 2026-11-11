// Misst Tonhöhe (F0), Melodiebreite, Sprechanteil, Pausen und Silbentempo aus 16-kHz-Mono-PCM (s16le).
import { execFileSync } from 'node:child_process';

const SR = 16000, WIN = 640, HOP = 160;

// Referenz-Profil des Erzählers aus den Vorbild-Videos (Kevin/Emre, gemessen 2026-10-31)
export const REFERENZ = { f0_median_hz: 126, melodie_halbtoene: 14.1, silben_pro_s: 6.0 };

export function ladePCM(datei) {
  return execFileSync('ffmpeg', ['-v', 'error', '-i', datei, '-vn', '-ac', '1', '-ar', String(SR), '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
}

export function analysiere(buf) {
  const x = new Float32Array(buf.length / 2);
  for (let i = 0; i < x.length; i++) x[i] = buf.readInt16LE(i * 2) / 32768;
  const rms = [], f0 = [];
  for (let s = 0; s + WIN < x.length; s += HOP) {
    let e = 0;
    for (let i = 0; i < WIN; i++) e += x[s + i] ** 2;
    rms.push(Math.sqrt(e / WIN));
    let best = 0, bestLag = 0;
    for (let lag = Math.floor(SR / 400); lag <= Math.floor(SR / 70); lag++) {
      let c = 0, e1 = 0, e2 = 0;
      for (let i = 0; i < WIN - lag; i += 2) { c += x[s + i] * x[s + i + lag]; e1 += x[s + i] ** 2; e2 += x[s + i + lag] ** 2; }
      const nc = c / Math.sqrt(e1 * e2 + 1e-12);
      if (nc > best) { best = nc; bestLag = lag; }
    }
    f0.push(best > 0.72 ? SR / bestLag : 0);
  }
  const sorted = [...rms].sort((a, b) => a - b);
  const schwelle = sorted[Math.floor(sorted.length * 0.9)] * 0.25;
  const voiced = f0.filter((f, i) => f && rms[i] > schwelle).sort((a, b) => a - b);
  const q = (p) => voiced[Math.floor(voiced.length * p)] || 0;
  let pausen = 0, lauf = 0;
  for (const r of rms) { if (r < schwelle) lauf++; else { if (lauf >= 25) pausen++; lauf = 0; } }
  const glatt = rms.map((_, i) => { let s = 0, n = 0; for (let k = -3; k <= 3; k++) if (rms[i + k] != null) { s += rms[i + k]; n++; } return s / n; });
  let silben = 0, letzte = -100;
  for (let i = 1; i < glatt.length - 1; i++) {
    if (glatt[i] > glatt[i - 1] && glatt[i] >= glatt[i + 1] && glatt[i] > schwelle * 1.6 && i - letzte >= 10) { silben++; letzte = i; }
  }
  const dauer = x.length / SR;
  const sprechAnteil = rms.filter((r) => r > schwelle).length / rms.length;
  return {
    dauer_s: +dauer.toFixed(1),
    f0_median_hz: Math.round(q(0.5)),
    melodie_halbtoene: q(0.1) ? +(12 * Math.log2(q(0.9) / q(0.1))).toFixed(1) : 0,
    pausen_pro_min: +((pausen / dauer) * 60).toFixed(1),
    silben_pro_s: +(silben / (dauer * sprechAnteil || 1)).toFixed(1),
  };
}

// Abstand zum Referenz-Profil (kleiner = ähnlicher). Tonhöhe in Halbtönen, Melodie und Tempo gewichtet.
export function abstand(m, ref = REFERENZ) {
  if (!m.f0_median_hz) return 99;
  const dTon = Math.abs(12 * Math.log2(m.f0_median_hz / ref.f0_median_hz)) / 2;
  const dMel = Math.abs(m.melodie_halbtoene - ref.melodie_halbtoene) / 3;
  const dTempo = Math.abs(m.silben_pro_s - ref.silben_pro_s) / 0.8;
  return +(dTon + dMel + dTempo).toFixed(2);
}
