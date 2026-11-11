// Parametrische Cartoon-Figur als SVG (viewBox 600x900, Mitte x=300).
// Flacher 2D-Stil: dicke dunkle Konturen, großer Kopf, übertriebene Gesichter.
import { F, rng, n, esc } from './util.mjs';

const L = F.linie;
const SW = 9; // Konturstärke

export const STANDARD_FIGUR = {
  haut: '#f2b98f',
  hautSchatten: '#dc9a72',
  haare: 'locken', // locken | kurz | strubbel | glatze | lang | dutt
  haarFarbe: '#2b1f1a',
  bart: 'keiner', // keiner | stoppeln | voll
  shirt: '#f4f1ea',
  hose: '#5b6170',
  schuhe: '#3b6fd8',
  flagge: 'keine', // keine | tr | de | at | ch | pl | ma | ...
  flecken: true,
  pickel: true,
  headset: false,
  schweissband: false,
  bauch: true, // Bauch schaut unter dem Shirt raus
  gewicht: 0.8, // 0 = schlank, 1 = sehr dick
  fliegen: true,
  muetze: null, // z. B. '#1f2937' für Security-Kappe
  weiblich: false,
  kittel: false, // weißer Arztkittel (offen, mit Brusttasche + Stift)
  stethoskop: false,
  sonnenbrille: false, // dunkle Brille (Bösewicht, Kredithai)
  goldkette: false,
  shorts: false, // kurze Hose, Beine in Hautfarbe
  socken: null, // Farbe der Socken (nur mit shorts sichtbar)
  startnummer: null, // weißes Nummernschild auf dem Shirt, z. B. '13'
  sportstreifen: null, // Farbe des schrägen Streifens über dem Shirt
  schuerze: null, // Farbe der Küchenschürze
  topf: false, // Kochtopf auf dem Kopf
  namensschild: null, // Namensschild auf der Brust, z. B. 'AZUBI'
  schildFarbe: '#ffffff',
};

// Fertige Outfits: in der Szene mit "outfit": "lauf" wählen, "optionen" können einzelne Teile überschreiben
export const OUTFITS = {
  // Neue Alltagsklamotten aus Folge 10: dunkelgrünes Shirt, dunkle Jeans, weiße Sneaker
  neu: { shirt: '#1f6f5c', hose: '#2b3a55', schuhe: '#f2f2f2', flecken: false, flagge: 'keine', headset: false, schweissband: false },
  ringer: { shirt: '#c62f3c', hose: '#c62f3c', shorts: true, socken: null, schuhe: '#1f2937', flecken: false, flagge: 'keine', headset: false, schweissband: false, sportstreifen: '#1f2937' },
  lauf: { shirt: '#ff7a1a', sportstreifen: '#ffe14d', startnummer: '13', hose: '#2b5fb8', shorts: true, socken: '#ffffff', schuhe: '#39ff88', flecken: false, flagge: 'keine', headset: false, schweissband: true },
};

// Ausdruck = Kombination aus Augen, Mund, Brauen, Extras
export const AUSDRUECKE = {
  neutral: { augen: 'normal', mund: 'neutral', brauen: 'flach' },
  gelangweilt: { augen: 'halb', mund: 'schief', brauen: 'flach' },
  gluecklich: { augen: 'froh', mund: 'grinsen', brauen: 'hoch' },
  jubel: { augen: 'froh', mund: 'lachen', brauen: 'hoch' },
  grinsen: { augen: 'halb', mund: 'grinsen', brauen: 'flach' },
  schock: { augen: 'schock', mund: 'offen', brauen: 'hoch', extra: ['schweiss'] },
  panik: { augen: 'schock', mund: 'schrei', brauen: 'traurig', extra: ['schweiss', 'schweiss2'] },
  traurig: { augen: 'normal', mund: 'traurig', brauen: 'traurig' },
  weinen: { augen: 'zu-traurig', mund: 'heulen', brauen: 'traurig', extra: ['traenen'] },
  erschoepft: { augen: 'halb', mund: 'zunge', brauen: 'traurig', extra: ['schweiss', 'schweiss2'] },
  anstrengung: { augen: 'zu', mund: 'zaehne', brauen: 'boese', extra: ['schweiss'] },
  wuetend: { augen: 'klein', mund: 'zaehne', brauen: 'boese' },
  schlafen: { augen: 'schlaf', mund: 'klein-offen', brauen: 'flach' },
  schwindelig: { augen: 'spirale', mund: 'klein-offen', brauen: 'hoch' },
  verliebt: { augen: 'herz', mund: 'grinsen', brauen: 'hoch' },
  verlegen: { augen: 'zu', mund: 'grinsen', brauen: 'traurig', extra: ['schweiss'] },
};

const dunkler = (hex, f = 0.82) => {
  const v = parseInt(hex.slice(1), 16);
  const r = Math.round(((v >> 16) & 255) * f), g = Math.round(((v >> 8) & 255) * f), b = Math.round((v & 255) * f);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};

let flaggenZaehler = 0; // jede Flagge braucht ihre eigene clipPath-ID, sonst verschwindet sie in späteren Szenen
function flaggeSVG(code, x, y) {
  const w = 74, h = 50, r = 6;
  const fid = `flagge-${++flaggenZaehler}`;
  const box = (inner) =>
    `<g transform="translate(${x} ${y}) rotate(-6)"><clipPath id="${fid}"><rect width="${w}" height="${h}" rx="${r}"/></clipPath><g clip-path="url(#${fid})">${inner}</g><rect width="${w}" height="${h}" rx="${r}" fill="none" stroke="${L}" stroke-width="5"/></g>`;
  const streifenH = (cs) => cs.map((c, i) => `<rect y="${(h / cs.length) * i}" width="${w}" height="${h / cs.length + 0.5}" fill="${c}"/>`).join('');
  const streifenV = (cs) => cs.map((c, i) => `<rect x="${(w / cs.length) * i}" width="${w / cs.length + 0.5}" height="${h}" fill="${c}"/>`).join('');
  switch (code) {
    case 'tr':
      return box(`<rect width="${w}" height="${h}" fill="#e30a17"/><circle cx="28" cy="25" r="14" fill="#fff"/><circle cx="32" cy="25" r="11.5" fill="#e30a17"/><path d="M48 25 l-9 3 5.5-7.5v9.5L39 22z" fill="#fff"/>`);
    case 'de': return box(streifenH(['#111', '#dd0000', '#ffce00']));
    case 'at': return box(streifenH(['#ed2939', '#fff', '#ed2939']));
    case 'pl': return box(streifenH(['#fff', '#dc143c']));
    case 'ru': return box(streifenH(['#fff', '#0039a6', '#d52b1e']));
    case 'it': return box(streifenV(['#009246', '#fff', '#ce2b37']));
    case 'fr': return box(streifenV(['#0055a4', '#fff', '#ef4135']));
    case 'ch': return box(`<rect width="${w}" height="${h}" fill="#d52b1e"/><rect x="31" y="12" width="12" height="26" fill="#fff"/><rect x="24" y="19" width="26" height="12" fill="#fff"/>`);
    case 'ma': return box(`<rect width="${w}" height="${h}" fill="#c1272d"/><path d="M37 13 l4 12 h12 l-10 7 4 12 -10-7 -10 7 4-12 -10-7 h12z" fill="none" stroke="#006233" stroke-width="3"/>`);
    case 'al': return box(`<rect width="${w}" height="${h}" fill="#e41e20"/><circle cx="37" cy="25" r="11" fill="#111"/>`);
    default: return '';
  }
}

function haarSVG(art, farbe, hinten) {
  if (art === 'glatze') return '';
  const r = rng(7);
  if (art === 'locken') {
    // Wolke aus Kreisen: erst alle mit Kontur, dann alle ohne Kontur drüber -> eine verschmolzene Silhouette.
    const kreise = [];
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (1.02 + (i / 12) * 0.96);
      kreise.push([300 + Math.cos(a) * 150, 250 + Math.sin(a) * 150, 46 + r() * 12]);
    }
    for (let i = 0; i < 7; i++) kreise.push([200 + i * 33, 112 + r() * 18, 44 + r() * 8]);
    kreise.push([150, 280, 34], [450, 280, 34]);
    if (hinten) return kreise.map(([x, y, rad]) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(rad + SW / 2)}" fill="${L}"/>`).join('');
    const strich = kreise.slice(0, 13).map(([x, y, rad], i) =>
      `<path d="M${n(x - rad * 0.4)} ${n(y + rad * 0.2)} q${n(rad * 0.4)} ${n(-rad * 0.5)} ${n(rad * 0.8)} 0" stroke="${dunkler(farbe, 0.6)}" stroke-width="5" fill="none" stroke-linecap="round" opacity="${i % 2 ? 0.7 : 0}"/>`).join('');
    return kreise.map(([x, y, rad]) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(rad - 1)}" fill="${farbe}"/>`).join('') + strich;
  }
  if (art === 'lang') {
    if (hinten) return `<path d="M135 270 Q120 90 300 85 Q480 90 465 270 L480 520 Q300 560 120 520 Z" fill="${farbe}" stroke="${L}" stroke-width="${SW}"/>`;
    return `<path d="M152 290 Q150 105 300 100 Q450 105 448 290 Q430 190 340 160 Q280 210 175 230 Q160 260 152 290 Z" fill="${farbe}" stroke="${L}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  }
  if (art === 'dutt') {
    if (hinten) return `<circle cx="300" cy="90" r="62" fill="${farbe}" stroke="${L}" stroke-width="${SW}"/>`;
    return `<path d="M152 280 Q150 115 300 112 Q450 115 448 280 Q420 175 300 165 Q180 175 152 280 Z" fill="${farbe}" stroke="${L}" stroke-width="${SW}"/>`;
  }
  if (hinten) return '';
  if (art === 'strubbel') {
    return `<path d="M150 265 Q140 170 190 130 L185 95 L230 118 L250 78 L285 112 L320 74 L345 112 L392 86 L392 128 Q455 160 450 265 Q425 200 380 185 Q300 205 220 185 Q170 200 150 265 Z" fill="${farbe}" stroke="${L}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  }
  // Topfschnitt: runde Haube mit schnurgeradem Pony
  if (art === 'topf') {
    return `<path d="M146 276 Q136 112 300 106 Q464 112 454 276 L422 276 L420 214 Q300 200 180 214 L178 276 Z" fill="${farbe}" stroke="${L}" stroke-width="${SW}" stroke-linejoin="round"/><path d="M196 160 Q300 122 404 160" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".18"/>`;
  }
  // Tolle: frischer Friseurschnitt (Folge 11) – kurze Seiten, Volumen oben, zur Seite gestylt
  if (art === 'tolle') {
    const d = dunkler(farbe, 0.6);
    return `<path d="M150 262 Q144 196 168 158 Q186 92 262 70 Q352 44 424 84 Q462 106 446 138 Q458 190 450 262 Q438 196 396 176 Q300 190 210 178 Q168 194 150 262 Z" fill="${farbe}" stroke="${L}" stroke-width="${SW}" stroke-linejoin="round"/>`
      + `<path d="M206 140 Q270 90 360 86 M236 156 Q300 118 392 116 M282 98 Q340 70 410 92" fill="none" stroke="${d}" stroke-width="7" stroke-linecap="round" opacity=".7"/>`
      + `<path d="M214 118 Q280 74 372 70" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".28"/>`;
  }
  // kurz
  return `<path d="M152 262 Q148 118 300 112 Q452 118 448 262 Q435 192 392 178 Q300 196 208 178 Q165 192 152 262 Z" fill="${farbe}" stroke="${L}" stroke-width="${SW}" stroke-linejoin="round"/>`;
}

function augenSVG(art) {
  const P = [245, 355];
  const y = 252;
  const weiss = (x, r = 30) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${L}" stroke-width="7"/>`;
  switch (art) {
    case 'halb':
      return P.map((x) => `${weiss(x)}<circle cx="${x + 3}" cy="${y + 10}" r="12" fill="${L}"/><path d="M${x - 34} ${y - 2} A34 34 0 0 1 ${x + 34} ${y - 2} Z" fill="var(--haut)" stroke="${L}" stroke-width="7"/>`).join('');
    case 'schock':
      return P.map((x) => `${weiss(x, 40)}<circle cx="${x}" cy="${y}" r="10" fill="${L}"/><circle cx="${x + 14}" cy="${y - 16}" r="5" fill="#dfe6f2"/>`).join('');
    case 'klein':
      return P.map((x) => `${weiss(x, 26)}<circle cx="${x}" cy="${y + 4}" r="10" fill="${L}"/><circle cx="${x + 4}" cy="${y}" r="3" fill="#fff"/>`).join('');
    case 'froh':
      return P.map((x) => `<path d="M${x - 26} ${y + 8} Q${x} ${y - 26} ${x + 26} ${y + 8}" fill="none" stroke="${L}" stroke-width="10" stroke-linecap="round"/>`).join('');
    case 'zu':
      return `<path d="M222 236 L262 254 L222 270" fill="none" stroke="${L}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M378 236 L338 254 L378 270" fill="none" stroke="${L}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'zu-traurig':
      return P.map((x) => `<path d="M${x - 26} ${y - 2} Q${x} ${y + 20} ${x + 26} ${y - 2}" fill="none" stroke="${L}" stroke-width="10" stroke-linecap="round"/>`).join('');
    case 'schlaf':
      return P.map((x) => `<path d="M${x - 26} ${y + 4} Q${x} ${y + 18} ${x + 26} ${y + 4}" fill="none" stroke="${L}" stroke-width="9" stroke-linecap="round"/>`).join('');
    case 'spirale':
      return P.map((x) => `${weiss(x, 34)}<path d="M${x} ${y} m-3 0 a3 3 0 1 1 6 0 a8 8 0 1 1 -14 0 a13 13 0 1 1 24 0 a19 19 0 1 1 -34 0" fill="none" stroke="${L}" stroke-width="4"/>`).join('');
    case 'herz':
      return P.map((x) => `<path d="M${x} ${y + 22} C${x - 40} ${y - 4} ${x - 22} ${y - 34} ${x} ${y - 12} C${x + 22} ${y - 34} ${x + 40} ${y - 4} ${x} ${y + 22}Z" fill="${F.pink}" stroke="${L}" stroke-width="6"/>`).join('');
    default:
      return P.map((x) => `${weiss(x)}<circle cx="${x + 2}" cy="${y + 2}" r="13" fill="${L}"/><circle cx="${x + 7}" cy="${y - 4}" r="5" fill="#fff"/><circle cx="${x - 3}" cy="${y + 7}" r="2" fill="#fff" opacity=".8"/>`).join('');
  }
}

function brauenSVG(art) {
  const b = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${L}" stroke-width="17" stroke-linecap="round"/>`;
  switch (art) {
    case 'hoch': return b(212, 194, 272, 186) + b(328, 186, 388, 194);
    case 'boese': return b(214, 196, 274, 214) + b(326, 214, 386, 196);
    case 'traurig': return b(214, 214, 272, 196) + b(328, 196, 386, 214);
    default: return b(212, 208, 274, 204) + b(326, 204, 388, 208);
  }
}

function mundSVG(art) {
  const y = 338;
  switch (art) {
    case 'grinsen':
      return `<path d="M246 ${y - 8} Q300 ${y + 52} 354 ${y - 8} Z" fill="#fff" stroke="${L}" stroke-width="7" stroke-linejoin="round"/><path d="M262 ${y + 4} L338 ${y + 4}" stroke="${L}" stroke-width="3"/><rect x="290" y="${y - 7}" width="16" height="13" fill="#e9c46a" stroke="${L}" stroke-width="3"/>`;
    case 'lachen':
      return `<path d="M244 ${y - 12} Q300 ${y + 78} 356 ${y - 12} Z" fill="#7a1f2b" stroke="${L}" stroke-width="7" stroke-linejoin="round"/><path d="M252 ${y - 8} L348 ${y - 8} L342 ${y + 6} L258 ${y + 6}Z" fill="#fff"/><ellipse cx="300" cy="${y + 34}" rx="22" ry="11" fill="#ef6f7f"/>`;
    case 'offen':
      return `<ellipse cx="300" cy="${y + 12}" rx="26" ry="34" fill="#7a1f2b" stroke="${L}" stroke-width="7"/><ellipse cx="300" cy="${y + 30}" rx="15" ry="10" fill="#ef6f7f"/>`;
    case 'schrei':
      return `<path d="M250 ${y - 14} Q300 ${y - 26} 350 ${y - 14} Q356 ${y + 70} 300 ${y + 74} Q244 ${y + 70} 250 ${y - 14}Z" fill="#7a1f2b" stroke="${L}" stroke-width="7"/><ellipse cx="300" cy="${y + 50}" rx="24" ry="12" fill="#ef6f7f"/><path d="M262 ${y - 14} L338 ${y - 14} L332 ${y - 2} L268 ${y - 2}Z" fill="#fff"/>`;
    case 'klein-offen':
      return `<ellipse cx="300" cy="${y + 6}" rx="14" ry="17" fill="#7a1f2b" stroke="${L}" stroke-width="6"/>`;
    case 'traurig':
      return `<path d="M262 ${y + 16} Q300 ${y - 16} 338 ${y + 16}" fill="none" stroke="${L}" stroke-width="9" stroke-linecap="round"/>`;
    case 'heulen':
      return `<path d="M256 ${y + 22} Q300 ${y - 26} 344 ${y + 22} Q300 ${y + 6} 256 ${y + 22}Z" fill="#7a1f2b" stroke="${L}" stroke-width="7" stroke-linejoin="round"/>`;
    case 'zunge':
      return `<path d="M258 ${y - 8} Q300 ${y + 44} 342 ${y - 8} Z" fill="#7a1f2b" stroke="${L}" stroke-width="7" stroke-linejoin="round"/><path d="M286 ${y + 10} Q284 ${y + 52} 303 ${y + 52} Q322 ${y + 52} 318 ${y + 10}Z" fill="#ef6f7f" stroke="${L}" stroke-width="5"/>`;
    case 'zaehne':
      return `<rect x="252" y="${y - 16}" width="96" height="42" rx="14" fill="#fff" stroke="${L}" stroke-width="7"/><path d="M252 ${y + 5} H348 M276 ${y - 16} V${y + 26} M300 ${y - 16} V${y + 26} M324 ${y - 16} V${y + 26}" stroke="${L}" stroke-width="4"/>`;
    case 'schief':
      return `<path d="M266 ${y + 4} Q306 ${y + 18} 340 ${y - 8}" fill="none" stroke="${L}" stroke-width="9" stroke-linecap="round"/><rect x="306" y="${y + 2}" width="13" height="12" fill="#e9c46a" stroke="${L}" stroke-width="3"/>`;
    default:
      return `<path d="M268 ${y + 4} Q300 ${y + 16} 332 ${y + 4}" fill="none" stroke="${L}" stroke-width="9" stroke-linecap="round"/>`;
  }
}

function extrasSVG(list = []) {
  let s = '';
  const tropfen = (x, y, sc = 1) => `<path d="M${x} ${y} q${-12 * sc} ${20 * sc} 0 ${28 * sc} q${12 * sc} ${-8 * sc} 0 ${-28 * sc}Z" fill="#7cc8ff" stroke="${L}" stroke-width="4"/>`;
  if (list.includes('schweiss')) s += tropfen(430, 170, 1.2);
  if (list.includes('schweiss2')) s += tropfen(170, 190, 1) + tropfen(455, 230, 0.8);
  if (list.includes('traenen')) {
    s += `<path d="M228 268 Q214 330 226 400 Q240 404 246 398 Q240 330 248 270Z" fill="#7cc8ff" stroke="${L}" stroke-width="4"/>`;
    s += `<path d="M372 268 Q386 330 374 400 Q360 404 354 398 Q360 330 352 270Z" fill="#7cc8ff" stroke="${L}" stroke-width="4"/>`;
  }
  return s;
}

function gesichtSVG(o, ausdruck) {
  const a = AUSDRUECKE[ausdruck] || AUSDRUECKE.neutral;
  const r = rng(11);
  let s = '';
  // Wangen
  s += `<ellipse cx="212" cy="306" rx="30" ry="18" fill="#ff6b6b" opacity="0.35"/><ellipse cx="388" cy="306" rx="30" ry="18" fill="#ff6b6b" opacity="0.35"/>`;
  // Gesichtsmaske: deckt Pickel und Stoppeln ab, Augen und Mund liegen darüber. maskeRisse = eingetrocknet
  if (o.maske) {
    s += `<path d="M162 262 Q150 150 300 138 Q450 150 438 262 Q440 360 372 396 Q300 424 228 396 Q160 360 162 262Z" fill="${o.maske}" stroke="${dunkler(o.maske, 0.7)}" stroke-width="6"/>`;
    s += `<ellipse cx="225" cy="190" rx="26" ry="10" fill="#fff" opacity=".35" transform="rotate(-24 225 190)"/>`;
    if (o.maskeRisse) s += `<path d="M186 300 l26 14 l-8 26 l24 20 M414 290 l-30 10 l6 30 l-22 24 M262 164 l12 22 l-14 18 M352 150 l-8 30 l20 16" fill="none" stroke="${dunkler(o.maske, 0.5)}" stroke-width="6" stroke-linejoin="round"/>`;
  }
  // pickel: true = alle, oder Anzahl (Fortschritt über die Folgen sichtbar machen)
  if (o.pickel && !o.maske) {
    const spots = [[205, 320], [222, 292], [392, 318], [376, 290], [408, 296], [330, 196], [262, 186], [196, 262], [415, 262], [288, 372], [352, 362], [240, 352]];
    s += spots.slice(0, o.pickel === true ? spots.length : o.pickel).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${n(6 + r() * 4)}" fill="#e2474b"/><circle cx="${x - 1.5}" cy="${y - 1.5}" r="2.5" fill="#ffd1c4"/>`).join('');
  }
  if (o.bart === 'stoppeln' && !o.maske) {
    for (let i = 0; i < 46; i++) {
      const ang = Math.PI * (0.12 + r() * 0.76);
      const rad = 105 + r() * 40;
      s += `<circle cx="${n(300 + Math.cos(ang) * rad)}" cy="${n(268 + Math.sin(ang) * rad * 0.95)}" r="2.6" fill="${dunkler(o.haarFarbe, 1.2)}" opacity="0.75"/>`;
    }
  }
  if (o.bart === 'voll') {
    s += `<path d="M160 268 Q150 420 230 500 L300 560 L370 500 Q450 420 440 268 Q420 330 368 326 Q300 300 232 326 Q180 330 160 268Z" fill="${o.haarFarbe}" stroke="${L}" stroke-width="${SW}" stroke-linejoin="round"/>`;
    s += [0, 1, 2, 3, 4, 5].map((i) => `<path d="M${215 + i * 34} ${400 + (i % 2) * 18} q6 30 -4 56" stroke="${dunkler(o.haarFarbe, 0.55)}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('');
    // Schnurrbart
    s += `<path d="M236 318 Q300 290 364 318 Q330 336 300 324 Q270 336 236 318Z" fill="${o.haarFarbe}" stroke="${L}" stroke-width="6"/>`;
  }
  s += brauenSVG(a.brauen);
  s += augenSVG(a.augen);
  // Nase
  s += `<ellipse cx="300" cy="296" rx="23" ry="19" fill="${o.hautSchatten}" stroke="${L}" stroke-width="7"/>`;
  s += mundSVG(a.mund);
  if (o.weiblich) {
    s += `<path d="M214 226 l-12 -10 M226 220 l-6 -14 M386 226 l12 -10 M374 220 l6 -14" stroke="${L}" stroke-width="5" stroke-linecap="round"/>`;
  }
  s += extrasSVG(a.extra);
  return s;
}

function armSVG(o, seite, pose, l, t) {
  const sx = seite < 0 ? l + 30 : 600 - l - 30;
  const sy = t + 85;
  let hx, hy;
  if (pose === 'jubeln') { hx = sx + seite * 70; hy = t - 190; }
  else if (pose === 'zeigen' && seite > 0) { hx = sx + 150; hy = t - 30; }
  else if (pose === 'kopf') { hx = 300 + seite * 172; hy = t - 170; }
  else if (pose === 'handy') { hx = 300 + seite * 62; hy = t + 230; }
  else { hx = sx + seite * 30; hy = t + 270; }
  const d = `M${sx} ${sy} L${hx} ${hy}`;
  // Schattenseite des Arms: parallel versetzte, dunklere Linie innerhalb der Kontur
  const len = Math.hypot(hx - sx, hy - sy) || 1;
  const px = n((-(hy - sy) / len) * 20 * seite), py = n(((hx - sx) / len) * 20 * seite);
  const hy2 = hy + (hy > sy ? 22 : -22);
  return `<path d="${d}" stroke="${L}" stroke-width="${78 + SW * 2}" stroke-linecap="round"/><path d="${d}" stroke="${o.haut}" stroke-width="78" stroke-linecap="round"/>` +
    `<path d="M${n(sx + px)} ${n(sy + py)} L${n(hx + px)} ${n(hy + py)}" stroke="${o.hautSchatten}" stroke-width="24" stroke-linecap="round" opacity=".55"/>` +
    `<circle cx="${hx}" cy="${hy2}" r="36" fill="${o.haut}" stroke="${L}" stroke-width="${SW}"/>` +
    `<path d="M${hx - 18} ${hy2 - 14} q10 -10 24 -6" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".35"/>`;
}

// Rumpf + Beine + Arme (ohne Kopf)
function koerperSVG(o, pose, pid = 'fig') {
  const w = 330 + 150 * o.gewicht;
  const l = 300 - w / 2, r = 300 + w / 2;
  const t = 410, b = 720;
  const saum = o.bauch ? b - 78 : b;
  let s = '';
  // Beine + Schuhe (eigene Gruppen, damit build.mjs sie beim Gehen bewegen kann)
  for (const x of [235, 365]) {
    s += `<g class="bein ${x < 300 ? 'bein-l' : 'bein-r'}">`;
    if (o.shorts) {
      s += `<rect x="${x - 40}" y="${b - 30}" width="80" height="160" rx="20" fill="${o.haut}" stroke="${L}" stroke-width="${SW}"/>`;
      if (o.socken) s += `<rect x="${x - 40}" y="${b + 82}" width="80" height="48" rx="10" fill="${o.socken}" stroke="${L}" stroke-width="6"/><path d="M${x - 34} ${b + 98} h68" stroke="#ef4444" stroke-width="7"/>`;
      s += `<rect x="${x - 50}" y="${b - 34}" width="100" height="76" rx="14" fill="${o.hose}" stroke="${L}" stroke-width="${SW}"/>`;
    } else {
      s += `<rect x="${x - 46}" y="${b - 30}" width="92" height="160" rx="22" fill="${o.hose}" stroke="${L}" stroke-width="${SW}"/>`;
      s += `<rect x="${x + (x < 300 ? 10 : -34)}" y="${b - 22}" width="24" height="144" rx="12" fill="#000" opacity=".14"/>`;
    }
    s += `<ellipse cx="${x + (x < 300 ? -8 : 8)}" cy="${b + 140}" rx="62" ry="26" fill="${o.schuhe}" stroke="${L}" stroke-width="${SW}"/>`;
    s += `</g>`;
  }
  // Hosenbund
  s += `<rect x="${l + 40}" y="${b - 46}" width="${w - 80}" height="70" rx="24" fill="${o.hose}" stroke="${L}" stroke-width="${SW}"/>`;
  // Arme hinter dem Körper zeichnen, wenn sie nach oben gehen
  const armeOben = pose === 'jubeln' || pose === 'kopf';
  if (armeOben) s += armSVG(o, -1, pose, l, t) + armSVG(o, 1, pose, l, t);
  // Bauch
  if (o.bauch) {
    s += `<ellipse cx="300" cy="${b - 70}" rx="${w / 2 - 18}" ry="88" fill="${o.haut}" stroke="${L}" stroke-width="${SW}"/>`;
    s += `<path d="M300 ${b - 40} q-7 9 0 18 q7 -9 0 -18" fill="none" stroke="${L}" stroke-width="5"/>`;
    s += [-60, -30, 30, 60].map((dx) => `<path d="M${300 + dx} ${b - 92} l${dx > 0 ? 6 : -6} 12" stroke="${L}" stroke-width="3" stroke-linecap="round"/>`).join('');
  }
  // Shirt (+ weiche Schattierung: rechte Seite dunkler, Schatten unterm Kinn, Glanzkante links)
  const shirtD = `M${l + 70} ${t} L${r - 70} ${t} Q${r} ${t} ${r + 4} ${t + 90} L${r + 14} ${saum - 70} Q${r + 14} ${saum} ${r - 60} ${saum} L${l + 60} ${saum} Q${l - 14} ${saum} ${l - 14} ${saum - 70} L${l - 4} ${t + 90} Q${l} ${t} ${l + 70} ${t}Z`;
  s += `<path d="${shirtD}" fill="${o.shirt}" stroke="${L}" stroke-width="${SW}" stroke-linejoin="round"/>`;
  s += `<clipPath id="${pid}-shirt"><path d="${shirtD}"/></clipPath><g clip-path="url(#${pid}-shirt)">` +
    `<ellipse cx="${n(r + 30)}" cy="${n((t + saum) / 2 + 30)}" rx="${n(w * 0.36)}" ry="${n((saum - t) * 0.75)}" fill="#1a1030" opacity=".12"/>` +
    `<ellipse cx="300" cy="${t + 8}" rx="${n(w * 0.3)}" ry="46" fill="#1a1030" opacity=".16"/>` +
    `<path d="M${n(l + 22)} ${t + 120} Q${n(l + 14)} ${n((t + saum) / 2)} ${n(l + 34)} ${saum - 40}" stroke="#fff" stroke-width="16" fill="none" stroke-linecap="round" opacity=".22"/></g>`;
  if (o.sportstreifen) {
    s += `<g clip-path="url(#${pid}-shirt)"><path d="M${n(l - 30)} ${saum - 30} L${n(r + 30)} ${t + 30}" stroke="${L}" stroke-width="56" opacity=".9"/><path d="M${n(l - 30)} ${saum - 30} L${n(r + 30)} ${t + 30}" stroke="${o.sportstreifen}" stroke-width="42"/></g>`;
  }
  if (o.startnummer) {
    s += `<g transform="rotate(-3 300 ${t + 130})"><rect x="226" y="${t + 74}" width="148" height="112" rx="10" fill="#fff" stroke="${L}" stroke-width="7"/><text x="300" y="${t + 158}" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="74" fill="${L}">${esc(o.startnummer)}</text>${[[238, 86], [362, 86], [238, 174], [362, 174]].map(([px, py]) => `<circle cx="${px}" cy="${t + py}" r="5" fill="#9aa3b2"/>`).join('')}</g>`;
  }
  // Kragen
  s += `<path d="M250 ${t + 2} Q300 ${t + 46} 350 ${t + 2}" fill="none" stroke="${L}" stroke-width="7"/>`;
  if (o.flecken) {
    s += `<path d="M${r - 120} ${t + 120} q30 -14 44 10 q8 26 -10 36 l4 34 q-6 8 -12 0 l-4 -26 q-26 4 -30 -20 q-4 -22 8 -34z" fill="#d62f2f" stroke="${L}" stroke-width="4"/>`;
    s += `<ellipse cx="${l + 110}" cy="${t + 150}" rx="22" ry="14" fill="#b88a4a" opacity="0.6"/><ellipse cx="${300 - 10}" cy="${saum - 70}" rx="16" ry="10" fill="#b88a4a" opacity="0.5"/><circle cx="${l + 150}" cy="${t + 210}" r="8" fill="#b88a4a" opacity="0.5"/>`;
    s += `<g transform="translate(${l + 112} ${t + 80})"><circle r="16" fill="none" stroke="${L}" stroke-width="4"/><path d="M-22 0 H22 M0 -22 V22" stroke="${L}" stroke-width="4"/></g>`;
  }
  if (o.flagge && o.flagge !== 'keine') s += flaggeSVG(o.flagge, r - 130, t + 60);
  if (o.schuerze) {
    s += `<path d="M236 ${t + 40} L364 ${t + 40} L396 ${saum} L204 ${saum}Z" fill="${o.schuerze}" stroke="${L}" stroke-width="7" stroke-linejoin="round"/><path d="M250 ${t + 8} L240 ${t + 44} M350 ${t + 8} L360 ${t + 44}" stroke="${L}" stroke-width="8"/><rect x="258" y="${t + 150}" width="84" height="56" rx="8" fill="#fff" opacity=".6" stroke="${L}" stroke-width="5"/>`;
  }
  if (o.namensschild) {
    // Namensschild am Shirt (Job-Serie): weiß, mit Clip, links vom Ärmel
    const txt = String(o.namensschild).toUpperCase();
    const fs = Math.min(34, 180 / Math.max(3, txt.length));
    const cx = r - 178;
    s += `<g transform="rotate(-4 ${cx} ${t + 112})"><rect x="${cx - 68}" y="${t + 82}" width="136" height="60" rx="10" fill="${o.schildFarbe || '#fff'}" stroke="${L}" stroke-width="6"/><rect x="${cx - 14}" y="${t + 72}" width="28" height="16" rx="4" fill="#9aa3b2" stroke="${L}" stroke-width="4"/><text x="${cx}" y="${t + 112 + fs * 0.36}" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="${n(fs)}" fill="${L}">${esc(txt)}</text></g>`;
  }
  if (o.kittel) {
    // offener Kittel: Revers, Knopfleiste, Brusttasche mit Stift (Shirt-Farbe = Kittel, darunter blaues Hemd)
    s += `<path d="M250 ${t + 2} L300 ${t + 110} L350 ${t + 2}Z" fill="#7cb7f0" stroke="${L}" stroke-width="6" stroke-linejoin="round"/>`;
    s += `<path d="M250 ${t + 2} L232 ${t + 70} L276 ${t + 92} M350 ${t + 2} L368 ${t + 70} L324 ${t + 92}" fill="none" stroke="${L}" stroke-width="6" stroke-linejoin="round"/>`;
    s += `<path d="M300 ${t + 110} V${saum - 6}" stroke="${L}" stroke-width="6"/>`;
    s += [0, 1, 2].map((i) => `<circle cx="314" cy="${t + 150 + i * 60}" r="7" fill="#d6dbe4" stroke="${L}" stroke-width="3"/>`).join('');
    s += `<rect x="${r - 150}" y="${t + 130}" width="74" height="60" rx="6" fill="${o.shirt}" stroke="${L}" stroke-width="5"/><rect x="${r - 128}" y="${t + 96}" width="12" height="50" rx="4" fill="#3b82f6" stroke="${L}" stroke-width="3"/>`;
  }
  if (o.goldkette) {
    s += `<path d="M244 ${t + 4} Q300 ${t + 120} 356 ${t + 4}" fill="none" stroke="${L}" stroke-width="16"/><path d="M244 ${t + 4} Q300 ${t + 120} 356 ${t + 4}" fill="none" stroke="#ffcf3f" stroke-width="10" stroke-dasharray="8 5"/>`;
    s += `<circle cx="300" cy="${t + 78}" r="20" fill="#ffcf3f" stroke="${L}" stroke-width="5"/><text x="300" y="${t + 87}" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="24" fill="${L}">€</text>`;
  }
  if (o.stethoskop) {
    s += `<path d="M246 ${t + 4} Q232 ${t + 120} 280 ${t + 170} M354 ${t + 4} Q368 ${t + 120} 320 ${t + 170}" fill="none" stroke="#3d3f4c" stroke-width="10" stroke-linecap="round"/>`;
    s += `<path d="M300 ${t + 176} V${t + 230}" stroke="#3d3f4c" stroke-width="10" stroke-linecap="round"/><circle cx="300" cy="${t + 246}" r="22" fill="#cfd3dd" stroke="${L}" stroke-width="6"/><circle cx="300" cy="${t + 246}" r="9" fill="#9aa3b2"/>`;
  }
  if (!armeOben) s += armSVG(o, -1, pose, l, t) + armSVG(o, 1, pose, l, t);
  // Ärmel liegen über den Armen
  s += `<circle cx="${l + 26}" cy="${t + 74}" r="70" fill="${o.shirt}" stroke="${L}" stroke-width="${SW}"/><circle cx="${r - 26}" cy="${t + 74}" r="70" fill="${o.shirt}" stroke="${L}" stroke-width="${SW}"/>`;
  // Handy/Konsole in beiden Händen, Bildschirm leuchtet
  if (pose === 'handy') {
    s += `<rect x="226" y="${t + 214}" width="148" height="82" rx="16" fill="#1b1630" stroke="${L}" stroke-width="7"/><rect x="240" y="${t + 226}" width="120" height="58" rx="8" fill="#7c4dff"/><circle cx="268" cy="${t + 255}" r="10" fill="#39ff88"/><rect x="300" y="${t + 240}" width="44" height="12" rx="6" fill="#ff3cac"/>`;
    s += [-1, 1].map((sg) => `<circle cx="${300 + sg * 70}" cy="${t + 256}" r="34" fill="${o.haut}" stroke="${L}" stroke-width="${SW}"/>`).join('');
  }
  return s;
}

function headsetSVG() {
  return `<path d="M150 262 Q146 78 300 76 Q454 78 450 262" fill="none" stroke="${L}" stroke-width="38" stroke-linecap="round"/>` +
    `<path d="M150 262 Q146 78 300 76 Q454 78 450 262" fill="none" stroke="#3d3f4c" stroke-width="22" stroke-linecap="round"/>` +
    `<rect x="112" y="222" width="62" height="110" rx="28" fill="#3d3f4c" stroke="${L}" stroke-width="${SW}"/>` +
    `<rect x="426" y="222" width="62" height="110" rx="28" fill="#3d3f4c" stroke="${L}" stroke-width="${SW}"/>` +
    `<circle cx="143" cy="277" r="9" fill="#39ff88"/>` +
    `<path d="M150 318 Q170 380 236 372" fill="none" stroke="${L}" stroke-width="10" stroke-linecap="round"/><circle cx="240" cy="372" r="13" fill="#3d3f4c" stroke="${L}" stroke-width="5"/>`;
}

function schweissbandSVG() {
  return `<path d="M158 196 Q300 150 442 196 L446 232 Q300 186 154 232Z" fill="#e63946" stroke="${L}" stroke-width="7" stroke-linejoin="round"/><path d="M160 214 Q300 168 440 214" fill="none" stroke="#fff" stroke-width="9"/>`;
}

function muetzeSVG(farbe) {
  return `<path d="M150 230 Q150 100 300 96 Q450 100 450 230 Z" fill="${farbe}" stroke="${L}" stroke-width="${SW}"/><path d="M140 232 Q300 200 470 236 L470 252 Q300 222 140 250Z" fill="${dunkler(farbe, 0.7)}" stroke="${L}" stroke-width="7"/><circle cx="300" cy="150" r="16" fill="${F.gelb}" stroke="${L}" stroke-width="5"/>`;
}

export function fliegenSVG(prefix, anzahl = 4) {
  // Ab Index 6: Fliegen direkt im Gesicht (fliegen: "viele" – fürs Ekel-Bild beim Einstieg)
  const pos = [[150, 120], [470, 150], [110, 420], [500, 380], [300, 40], [420, 60], [235, 190], [365, 205], [205, 330], [395, 345], [300, 395]];
  return pos.slice(0, anzahl).map(([x, y], i) =>
    `<g class="fliege" id="${prefix}-fl${i}" transform="translate(${x} ${y})"><ellipse cx="-7" cy="-8" rx="9" ry="6" fill="#e9eef5" stroke="${L}" stroke-width="2.5" opacity="0.95"/><ellipse cx="7" cy="-8" rx="9" ry="6" fill="#e9eef5" stroke="${L}" stroke-width="2.5" opacity="0.95"/><circle r="7.5" fill="${L}"/></g>`).join('');
}

// Komplette Figur. pose: stehen | jubeln | zeigen | kopf (Hände am Kopf)
export function figurSVG(optionen = {}, ausdruck = 'neutral', pose = 'stehen', idPrefix = 'fig') {
  const o = { ...STANDARD_FIGUR, ...optionen };
  if (!optionen.hautSchatten) o.hautSchatten = dunkler(o.haut, 0.88);
  let s = `<svg viewBox="0 -40 600 940" xmlns="http://www.w3.org/2000/svg" style="--haut:${o.haut};overflow:visible">`;
  s += `<g class="koerper">${koerperSVG(o, pose, idPrefix)}</g>`;
  s += `<g class="kopf">`;
  s += haarSVG(o.haare, o.haarFarbe, true);
  // Ohren (mit Innenohr)
  s += `<circle cx="150" cy="282" r="32" fill="${o.haut}" stroke="${L}" stroke-width="${SW}"/><circle cx="450" cy="282" r="32" fill="${o.haut}" stroke="${L}" stroke-width="${SW}"/>`;
  s += `<path d="M146 270 q-14 14 0 28 M454 270 q14 14 0 28" stroke="${o.hautSchatten}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  s += `<ellipse cx="300" cy="262" rx="152" ry="150" fill="${o.haut}" stroke="${L}" stroke-width="${SW}"/>`;
  // Gesichts-Schattierung: Schattensichel unten rechts, weicher Glanz oben links (in den Kopf geclippt)
  s += `<clipPath id="${idPrefix}-kopf"><ellipse cx="300" cy="262" rx="148" ry="146"/></clipPath><g clip-path="url(#${idPrefix}-kopf)">` +
    `<path d="M452 200 Q470 380 300 412 Q420 360 452 200Z" fill="${o.hautSchatten}" opacity=".55"/>` +
    `<ellipse cx="228" cy="170" rx="58" ry="26" transform="rotate(-24 228 170)" fill="#fff" opacity=".2"/></g>`;
  if (o.haare === 'locken') s += haarSVG('locken', o.haarFarbe, false);
  s += gesichtSVG(o, ausdruck);
  if (o.haare !== 'locken') s += haarSVG(o.haare, o.haarFarbe, false);
  // Glanz auf den Haaren
  if (['kurz', 'strubbel', 'dutt', 'lang'].includes(o.haare) && !o.muetze) s += `<path d="M206 158 Q248 128 300 126" stroke="#fff" stroke-width="11" fill="none" stroke-linecap="round" opacity=".28"/><path d="M322 128 l18 2" stroke="#fff" stroke-width="11" stroke-linecap="round" opacity=".28"/>`;
  if (o.haare === 'glatze') s += `<ellipse cx="250" cy="150" rx="44" ry="20" transform="rotate(-20 250 150)" fill="#fff" opacity=".35"/>`;
  if (o.muetze) s += muetzeSVG(o.muetze);
  // Kochtopf auf dem Kopf (Gag vor dem Topfschnitt)
  if (o.topf) s += `<g stroke="${L}" stroke-width="${SW}" stroke-linejoin="round"><path d="M138 214 Q300 186 462 214 L440 66 Q300 44 160 66Z" fill="#c4cbd6"/><path d="M130 216 Q300 186 470 216 L470 240 Q300 210 130 240Z" fill="#9aa3b2"/><rect x="74" y="136" width="74" height="26" rx="12" fill="#3d3f4c"/><rect x="452" y="136" width="74" height="26" rx="12" fill="#3d3f4c"/></g><path d="M196 92 q-14 40 -10 86" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round" opacity=".6"/>`;
  if (o.schweissband) s += schweissbandSVG();
  if (o.headset) s += headsetSVG();
  if (o.sonnenbrille) s += `<g stroke="${L}" stroke-width="7" stroke-linejoin="round"><path d="M168 214 H432" stroke-width="10"/><path d="M178 210 h104 q4 70 -50 72 q-54 -2 -54 -72z M318 210 h104 q0 70 -54 72 q-54 -2 -50 -72z" fill="#15121f"/></g><path d="M196 226 l30 -8 M336 226 l30 -8" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".6"/>`;
  // Bei "Hände am Kopf" liegen die Hände sichtbar auf dem Kopf
  if (pose === 'kopf') s += [128, 472].map((x) => `<circle cx="${x}" cy="215" r="40" fill="${o.haut}" stroke="${L}" stroke-width="${SW}"/>`).join('');
  s += `</g>`;
  if (o.fliegen) s += fliegenSVG(idPrefix, o.fliegen === 'viele' ? 11 : 4);
  s += `</svg>`;
  return s;
}

// Kleiner Dackel (Nebenfigur)
// Schaf (Nebenfigur): Wollwolke, dunkler Kopf, Beine
export function schafSVG() {
  const wolle = [[110, 100, 52], [170, 82, 58], [230, 96, 54], [90, 150, 46], [150, 156, 56], [215, 152, 52], [255, 128, 40]];
  return `<svg viewBox="0 0 340 260" xmlns="http://www.w3.org/2000/svg"><g stroke="${L}" stroke-width="7" stroke-linejoin="round">` +
    [100, 140, 200, 240].map((x) => `<rect x="${x}" y="170" width="20" height="70" rx="8" fill="#3d3f4c"/>`).join('') +
    wolle.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 3.5}" fill="${L}" stroke="none"/>`).join('') +
    wolle.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r - 3}" fill="#f6f3ea" stroke="none"/>`).join('') +
    `<ellipse cx="292" cy="118" rx="40" ry="50" fill="#3d3f4c"/><ellipse cx="262" cy="92" rx="24" ry="12" fill="#3d3f4c" transform="rotate(-30 262 92)"/>` +
    `<circle cx="300" cy="106" r="11" fill="#fff" stroke-width="4"/><circle cx="303" cy="108" r="5" fill="${L}" stroke="none"/>` +
    `<path d="M290 142 q12 8 24 0" fill="none" stroke="#fff" stroke-width="4"/></g></svg>`;
}

export function hundSVG() {
  return `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg"><g stroke="${L}" stroke-width="7" stroke-linejoin="round">` +
    `<rect x="60" y="80" width="180" height="70" rx="35" fill="#a0602e"/>` +
    `<rect x="78" y="130" width="22" height="50" rx="10" fill="#8a4f22"/><rect x="200" y="130" width="22" height="50" rx="10" fill="#8a4f22"/>` +
    `<path d="M60 100 Q20 70 30 40" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="262" cy="80" rx="46" ry="38" fill="#a0602e"/><ellipse cx="300" cy="96" rx="22" ry="16" fill="#a0602e"/>` +
    `<ellipse cx="248" cy="100" rx="16" ry="34" fill="#6e3b16" transform="rotate(-15 248 100)"/>` +
    `<circle cx="314" cy="90" r="7" fill="${L}"/><circle cx="272" cy="72" r="6" fill="${L}" stroke="none"/>` +
    `<path d="M292 108 l10 8 l8 -6" fill="#fff" stroke-width="4"/></g></svg>`;
}

// Fake-Foto: verpixelter Typ im Anzug mit "???"
export function fakeFotoSVG(seed = 5) {
  const r = rng(seed);
  const px = 18;
  let s = `<svg viewBox="0 0 360 420" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges">`;
  for (let y = 0; y < 420; y += px) {
    for (let x = 0; x < 360; x += px) {
      const cx = x + px / 2, cy = y + px / 2;
      let c = null;
      const kopf = ((cx - 180) / 62) ** 2 + ((cy - 120) / 76) ** 2 < 1;
      const haar = ((cx - 180) / 70) ** 2 + ((cy - 82) / 50) ** 2 < 1 && cy < 100;
      const koerper = cy > 200 && Math.abs(cx - 180) < 40 + (cy - 200) * 0.9;
      const hals = cy > 180 && cy <= 215 && Math.abs(cx - 180) < 36;
      if (koerper) {
        c = Math.abs(cx - 180) < 22 && cy < 330 ? (Math.abs(cx - 180) < 7 ? '#3a3a40' : '#e8e8ea') : '#1d1d22';
      } else if (hals) c = '#c98e6b';
      if (kopf) c = '#d29c78';
      if (haar) c = '#2a1d16';
      if (c) {
        const v = 0.86 + r() * 0.24;
        s += `<rect x="${x}" y="${y}" width="${px}" height="${px}" fill="${c}" opacity="${v.toFixed(2)}"/>`;
      }
    }
  }
  s += `</svg>`;
  return s;
}
