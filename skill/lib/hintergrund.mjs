// Szenen-Hintergründe (1080x1920). Jeder liefert { hinten, vorne } als HTML/SVG-Strings.
// "vorne" liegt über der Figur (Decke, Theke, Couch, Schreibtisch + Licht/Vignette).
// Klassen für Hintergrund-Animationen (build.mjs): anim-puls, anim-flacker, anim-hue, anim-dreh, anim-schweben
import { F, esc, rng, n } from './util.mjs';

const L = F.linie;
const svg = (inner) => `<svg class="bg-svg" viewBox="0 0 1080 1920" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;

// ---------- Licht-Helfer (Verläufe statt Filter: schnell und gestochen scharf) ----------
// IDs sind pro Variante eindeutig, damit mehrere Szenen im selben Dokument sich nicht stören.
function glow(id, cx, cy, r, farbe, staerke = 0.5, klasse = '') {
  return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${farbe}" stop-opacity="${staerke}"/><stop offset=".45" stop-color="${farbe}" stop-opacity="${n(staerke * 0.35)}"/><stop offset="1" stop-color="${farbe}" stop-opacity="0"/></radialGradient></defs><circle ${klasse ? `class="${klasse}"` : ''} cx="${cx}" cy="${cy}" r="${r}" fill="url(#${id})"/>`;
}
function linGrad(id, farben, x2 = 0, y2 = 1) {
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${farben.map((c, i) => `<stop offset="${n(i / (farben.length - 1))}" stop-color="${c}"/>`).join('')}</linearGradient></defs>`;
}
// Vignette + leichtes Oberlicht: kommt über die Figur (vorne), damit alles "im selben Licht" steht
function licht(id, staerke = 0.55, farbe = '#0b0620') {
  return svg(`<defs><radialGradient id="${id}" cx="50%" cy="46%" r="75%"><stop offset=".55" stop-color="${farbe}" stop-opacity="0"/><stop offset="1" stop-color="${farbe}" stop-opacity="${staerke}"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#${id})"/>`);
}
const NEON_FILTER = `<defs><filter id="neon-blur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter><filter id="neon-blur-gross" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter></defs>`;
function neonText(text, x, y, farbe, groesse = 120, klasse = 'anim-flacker') {
  const t = (extra) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Archivo Black, Montserrat, sans-serif" font-size="${groesse}" ${extra}>${esc(text)}</text>`;
  return `<g class="${klasse}">${t(`fill="none" stroke="${farbe}" stroke-width="14" filter="url(#neon-blur-gross)" opacity=".9"`)}${t(`fill="none" stroke="${farbe}" stroke-width="9" stroke-linejoin="round"`)}${t(`fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round" opacity=".9"`)}</g>`;
}
const schatten = (cx, cy, rx, ry, op = 0.35) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity="${op}"/>`;

const SUNBURST = {
  lila: ['#3a2380', '#2e1b69', '#1d1140'],
  gelb: ['#ffd23f', '#ffc21a', '#f5a400'],
  orange: ['#ffad33', '#ff9a1f', '#f07a00'],
  rot: ['#6a1428', '#56101f', '#2b0710'],
  pink: ['#ff6b9a', '#ff4f86', '#d92f68'],
  blau: ['#5aa9ff', '#3d8ef5', '#1f5fc2'],
  gruen: ['#4cd97b', '#2fbf63', '#178a42'],
};

export function sunburst(farbe = 'lila') {
  const [a, b, rand] = SUNBURST[farbe] || SUNBURST.lila;
  return `<div class="bg-sun" style="background:radial-gradient(circle at 50% 42%, rgba(255,255,255,.16) 0%, transparent 32%, ${rand}cc 95%), repeating-conic-gradient(from 0deg at 50% 42%, ${a} 0deg 8deg, ${b} 8deg 16deg);"></div>`;
}

// Hypnose-Ringe für Gefühls-Momente: rot (Bösewicht/Crash), orange (Panik), gruen (Gewinn), lila (Casino/Nacht) ...
const SPIRALE = {
  rot: ['#c8282f', '#a81e25'], orange: ['#ffa53a', '#f28a12'], gruen: ['#35c46b', '#26a957'], lila: ['#4b2a8a', '#3b2070'],
  blau: ['#4a9af5', '#2f7fe0'], pink: ['#ff6b9a', '#ef4f84'], gelb: ['#ffd23f', '#f5b800'],
};
export function spirale(farbe = 'rot') {
  const [a, b] = SPIRALE[farbe] || SPIRALE.rot;
  return `<div class="bg-sun" style="background:radial-gradient(circle at 50% 46%, transparent 40%, rgba(0,0,0,.28) 100%), repeating-radial-gradient(circle at 50% 46%, ${a} 0 46px, ${b} 46px 92px);"></div>`;
}

function wolken(y0, seed = 2, farbe = '#fff', schattenFarbe = '#cfe3f5') {
  const r = rng(seed);
  let s = '';
  for (let i = 0; i < 4; i++) {
    const x = 80 + i * 280 + r() * 60, y = y0 + r() * 120, k = 0.8 + r() * 0.5;
    s += `<g class="anim-schweben" transform="translate(${n(x)} ${n(y)}) scale(${n(k)})"><ellipse cx="0" cy="8" rx="94" ry="36" fill="${schattenFarbe}"/><g fill="${farbe}"><ellipse cx="0" cy="0" rx="90" ry="34"/><circle cx="-30" cy="-22" r="40"/><circle cx="26" cy="-30" r="48"/></g></g>`;
  }
  return s;
}

// ======================================================================================
// ZIMMER – unordentliches Gamer-Zimmer bei Nacht: LED-Leiste, Neon, Monitor-Setup, PC mit RGB-Lüftern,
// Fenster mit Skyline, Pizzaturm, Müllsack, Klamotten, Dosen, Teppich, farbiges Licht.
// ======================================================================================
function zimmerInhalt(o = {}) {
  const r = rng(21);
  const neon = esc(o.neon ?? 'GG');
  let s = NEON_FILTER;
  s += linGrad('zi-wand', ['#3b2a7c', '#2c1f62', '#1f1548']);
  s += linGrad('zi-led', ['#ff3cac', '#ffd60a', '#39ff88', '#4cc9f0', '#b388ff'], 1, 0);
  s += linGrad('zi-boden', ['#2a1d4c', '#1a1130']);
  s += linGrad('zi-nacht', ['#0a0f2c', '#1d2b63']);
  s += linGrad('zi-screen', ['#2ee6ff', '#7c4dff', '#ff3cac'], 1, 1);

  // Decke + Wand
  s += `<rect width="1080" height="1920" fill="url(#zi-wand)"/><rect width="1080" height="250" fill="#170f33"/>`;
  for (let x = 0; x <= 1080; x += 135) s += `<path d="M${x} 256 V1350" stroke="#2a1d5a" stroke-width="6"/><path d="M${x + 4} 256 V1350" stroke="#43318a" stroke-width="2" opacity=".5"/>`;
  // Tapetenmuster (dezent)
  for (let y = 300; y < 1050; y += 90) for (let x = (y / 90) % 2 ? 67 : 0; x < 1080; x += 135) s += `<path d="M${x} ${y} l10 10 l-10 10 l-10 -10z" fill="#4a389a" opacity=".22"/>`;
  // Untere Wand (Sockel) dunkler + Fußleiste
  s += `<rect y="1060" width="1080" height="290" fill="#1c1342" opacity=".75"/><rect y="1052" width="1080" height="12" fill="#3a2a78"/><rect y="1318" width="1080" height="32" fill="#130c2b"/>`;

  // LED-Leiste mit Leuchten auf die Wand
  s += `<g class="anim-hue"><rect y="232" width="1080" height="40" fill="url(#zi-led)" filter="url(#neon-blur-gross)" opacity=".85"/><rect y="246" width="1080" height="10" fill="url(#zi-led)"/></g>`;
  s += `<defs><linearGradient id="zi-wash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5fd2" stop-opacity=".32"/><stop offset="1" stop-color="#ff5fd2" stop-opacity="0"/></linearGradient></defs><rect y="256" width="1080" height="260" fill="url(#zi-wash)" class="anim-hue"/>`;

  // Fenster links: Nacht, Mond, Skyline, halb hochgezogene Jalousie
  s += `<g stroke="${L}" stroke-width="9"><rect x="58" y="330" width="290" height="390" rx="8" fill="url(#zi-nacht)"/></g>`;
  s += glow('zi-mond', 280, 410, 110, '#fff3b0', 0.45);
  s += `<circle cx="280" cy="410" r="32" fill="#fff6c9"/><circle cx="292" cy="402" r="28" fill="url(#zi-nacht)" opacity=".9"/>`;
  for (let i = 0; i < 18; i++) s += `<circle cx="${n(80 + r() * 250)}" cy="${n(350 + r() * 160)}" r="${n(1.5 + r() * 2)}" fill="#fff" opacity="${n(0.4 + r() * 0.6)}"/>`;
  let sx = 66;
  while (sx < 340) {
    const w = 30 + r() * 40, h = 90 + r() * 150;
    s += `<rect x="${n(sx)}" y="${n(712 - h)}" width="${n(w)}" height="${n(h)}" fill="#0b1230"/>`;
    for (let k = 0; k < 4; k++) if (r() > 0.45) s += `<rect x="${n(sx + 6 + r() * (w - 14))}" y="${n(712 - h + 12 + r() * (h - 30))}" width="7" height="9" fill="#ffd36b" opacity=".85"/>`;
    sx += w + 3;
  }
  for (let i = 0; i < 6; i++) s += `<rect x="66" y="${342 + i * 26}" width="274" height="18" rx="3" fill="#c9cdd8" stroke="${L}" stroke-width="3"/>`;
  s += `<rect x="66" y="498" width="274" height="10" fill="#9aa0b2" stroke="${L}" stroke-width="3" transform="rotate(-6 200 503)"/>`;
  s += `<path d="M330 342 V560" stroke="#e8e8ef" stroke-width="3"/><circle cx="330" cy="566" r="6" fill="#e8e8ef"/>`;
  s += `<rect x="40" y="716" width="326" height="22" rx="6" fill="#4a3a8a" stroke="${L}" stroke-width="6"/>`;
  // Mondlicht-Kegel auf den Boden
  s += `<path d="M70 735 L340 735 L620 1920 L-40 1920Z" fill="#bcd2ff" opacity=".05"/>`;
  // Tote Pflanze auf der Fensterbank
  s += `<g stroke="${L}" stroke-width="5"><path d="M110 715 l8 -40 h44 l8 40z" fill="#b5653a"/><path d="M140 676 q-20 -40 -44 -46 M140 676 q6 -44 30 -60 M140 676 q-4 -30 -6 -70" fill="none" stroke="#7a6a3a" stroke-width="6"/></g>`;

  // Neon-Schild über dem Kopf
  s += `<rect x="${540 - 150}" y="355" width="300" height="170" rx="22" fill="#140b2c" opacity=".55"/>`;
  s += neonText(neon, 540, 485, '#ff3cac', 130);
  s += glow('zi-neonwash', 540, 440, 300, '#ff3cac', 0.28, 'anim-flacker');

  // Poster rechts oben
  s += `<g transform="rotate(5 840 450)"><rect x="728" y="296" width="226" height="310" rx="6" fill="#ff7a59" stroke="${L}" stroke-width="8"/>${linGrad('zi-poster', ['#ff9a5a', '#ff4f86'])}<rect x="736" y="304" width="210" height="294" fill="url(#zi-poster)"/><text x="841" y="372" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="58" fill="#fff" stroke="${L}" stroke-width="3">99</text><path d="M841 395 V530 M808 510 H874" stroke="#fff" stroke-width="16" stroke-linecap="round"/><path d="M841 395 V530" stroke="${L}" stroke-width="3" opacity=".3"/><text x="841" y="580" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="34" fill="#3b1022">LEVEL</text><rect x="800" y="288" width="40" height="18" fill="#f5e6b8" opacity=".85" transform="rotate(-8 820 297)"/></g>`;

  // Regal rechts mit Dosen, Pokal, Spielen
  s += `<rect x="722" y="742" width="300" height="20" rx="6" fill="#5a3f8a" stroke="${L}" stroke-width="6"/><path d="M752 762 l20 26 M992 762 l-20 26" stroke="${L}" stroke-width="7"/>`;
  ['#4cc9f0', '#f72585', '#39ff88', '#ffd60a', '#b388ff'].forEach((c, i) => {
    s += `<g stroke="${L}" stroke-width="5"><rect x="${736 + i * 42}" y="668" width="32" height="74" rx="8" fill="${c}"/></g><rect x="${742 + i * 42}" y="676" width="7" height="58" rx="3" fill="#fff" opacity=".45"/>`;
  });
  s += `<g stroke="${L}" stroke-width="5"><path d="M960 742 v-18 h-16 v-10 h44 v10 h-16 v18z" fill="#f2c94c"/><path d="M944 714 q-6 -46 22 -50 q28 4 22 50z" fill="#f2c94c"/><path d="M944 690 q-18 -2 -16 -18 M988 690 q18 -2 16 -18" fill="none"/></g>`;

  // Schreibtisch-Setup rechts: Monitor mit Spielszene, Leuchten, PC mit RGB-Lüftern
  s += glow('zi-screenglow', 960, 1010, 330, '#2ee6ff', 0.33, 'anim-puls');
  s += `<g stroke="${L}" stroke-width="8"><rect x="822" y="900" width="300" height="200" rx="14" fill="#141024"/><rect x="838" y="914" width="268" height="168" rx="6" fill="url(#zi-screen)" class="anim-puls"/></g>`;
  s += `<g opacity=".95"><rect x="850" y="1036" width="250" height="38" fill="#1b5e3a"/><rect x="900" y="1000" width="34" height="36" fill="#ffd60a" stroke="${L}" stroke-width="3"/><circle cx="1010" cy="990" r="16" fill="#ff3cac" stroke="${L}" stroke-width="3"/><path d="M850 950 h60 M880 935 v30" stroke="#fff" stroke-width="6" opacity=".7"/><text x="972" y="950" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="30" fill="#fff" opacity=".9">GAME</text></g>`;
  s += `<rect x="952" y="1100" width="24" height="44" fill="#141024" stroke="${L}" stroke-width="6"/>`;
  s += `<rect x="770" y="1140" width="330" height="30" rx="6" fill="#3b2a64" stroke="${L}" stroke-width="7"/><rect x="790" y="1170" width="18" height="180" fill="#2a1d4a" stroke="${L}" stroke-width="5"/>`;
  s += `<g stroke="${L}" stroke-width="7"><rect x="880" y="1176" width="170" height="250" rx="12" fill="#18122e"/><rect x="894" y="1192" width="142" height="218" rx="6" fill="#241a44"/></g>`;
  [[965, 1250], [965, 1345]].forEach(([cx, cy]) => {
    s += glow(`zi-fan${cy}`, cx, cy, 70, '#ff3cac', 0.55, 'anim-hue');
    s += `<g class="anim-dreh" data-cx="${cx}" data-cy="${cy}"><circle cx="${cx}" cy="${cy}" r="38" fill="none" stroke="#ff7ad9" stroke-width="5"/>${[0, 72, 144, 216, 288].map((a) => `<path d="M${cx} ${cy} q${n(Math.cos((a * Math.PI) / 180) * 34)} ${n(Math.sin((a * Math.PI) / 180) * 10)} ${n(Math.cos(((a + 40) * Math.PI) / 180) * 32)} ${n(Math.sin(((a + 40) * Math.PI) / 180) * 32)}" stroke="#ffb3ec" stroke-width="6" fill="none"/>`).join('')}<circle cx="${cx}" cy="${cy}" r="9" fill="#ffb3ec"/></g>`;
  });
  s += `<rect x="894" y="1192" width="8" height="218" fill="#39ff88" class="anim-hue"/>`;
  // Kabelsalat
  s += `<path d="M960 1426 q-30 60 -120 50 q-80 -10 -60 60 M1000 1426 q40 50 -10 90" stroke="#0e0a1e" stroke-width="7" fill="none"/>`;

  // Pizzaturm links (mit Fettflecken) + offener Karton mit Rest
  for (let i = 0; i < 7; i++) {
    const y = 1302 - i * 46, x = 46 + (i % 2) * 14 + (i === 6 ? -10 : 0);
    s += `<g stroke="${L}" stroke-width="6"><rect x="${x}" y="${y}" width="230" height="44" rx="5" fill="${i % 2 ? '#d49a5e' : '#dca469'}"/></g><ellipse cx="${x + 60 + (i * 37) % 110}" cy="${y + 22}" rx="16" ry="7" fill="#9a6532" opacity=".5"/><path d="M${x + 12} ${y + 10} h70" stroke="#f3cf9b" stroke-width="4" opacity=".6"/>`;
  }
  s += `<g stroke="${L}" stroke-width="6"><path d="M30 1028 l240 0 l-30 -70 l-200 10z" fill="#e7b277"/><path d="M80 1020 l70 -40 l60 40z" fill="#ffc94d"/><circle cx="130" cy="1006" r="8" fill="#e2474b" stroke-width="3"/><circle cx="165" cy="1012" r="7" fill="#e2474b" stroke-width="3"/></g>`;

  // Boden mit Perspektive, Teppich, Flecken
  s += `<rect y="1350" width="1080" height="570" fill="url(#zi-boden)"/>`;
  for (let i = -8; i <= 8; i++) s += `<path d="M${540 + i * 70} 1350 L${540 + i * 300} 1920" stroke="#140c28" stroke-width="5" opacity=".7"/>`;
  [1395, 1460, 1545, 1660, 1800].forEach((y) => { s += `<path d="M0 ${y} H1080" stroke="#140c28" stroke-width="4" opacity=".55"/>`; });
  s += `<ellipse cx="540" cy="1700" rx="440" ry="130" fill="#46287a" stroke="${L}" stroke-width="7"/><ellipse cx="540" cy="1700" rx="390" ry="104" fill="none" stroke="#6b44b0" stroke-width="10" stroke-dasharray="26 18"/>`;
  s += `<ellipse cx="300" cy="1640" rx="60" ry="16" fill="#2c1846" opacity=".7"/><ellipse cx="820" cy="1790" rx="70" ry="18" fill="#2c1846" opacity=".7"/>`;
  // Müllsack + Klamottenhaufen links
  s += `<g stroke="${L}" stroke-width="7">${schatten(150, 1515, 120, 20, 0.4)}<path d="M60 1510 q-20 -110 70 -140 q-14 -26 10 -34 q24 8 10 34 q90 30 72 140z" fill="#2a2a33"/><path d="M110 1400 q20 30 10 90" stroke="#4a4a58" stroke-width="5" fill="none"/></g>`;
  s += `<g stroke="${L}" stroke-width="6">${schatten(310, 1600, 110, 16, 0.35)}<path d="M210 1600 q20 -50 70 -40 q40 -40 90 0 q50 0 40 40z" fill="#3b6fd8"/><path d="M250 1572 q40 -14 80 6" fill="none" stroke-width="4"/><path d="M330 1590 l60 -16 l30 16 l-10 12z" fill="#e9e9ef"/></g>`;
  // Dosen, Chipstüte, Controller, Papierknäuel rechts/vorne
  s += `<g stroke="${L}" stroke-width="5">${schatten(860, 1610, 70, 12, 0.35)}<rect x="808" y="1574" width="92" height="38" rx="14" fill="#39ff88" transform="rotate(-14 854 1593)"/><rect x="930" y="1632" width="38" height="78" rx="12" fill="#ffd60a"/><path d="M760 1840 l60 -70 l70 40 l-40 70z" fill="#ffcf3f"/><text x="820" y="1832" font-family="Archivo Black, sans-serif" font-size="22" fill="#e2474b" stroke="none" transform="rotate(-38 820 1832)">CHIPS</text><path d="M900 1860 q20 -40 70 -36 q50 -4 70 36 q10 30 -20 30 l-30 -14 h-40 l-30 14 q-30 0 -20 -30z" fill="#2b2b36"/><circle cx="950" cy="1850" r="7" fill="#39ff88"/><circle cx="1000" cy="1846" r="6" fill="#ff3cac"/><circle cx="160" cy="1830" r="22" fill="#e9e9ef"/><circle cx="230" cy="1870" r="17" fill="#e9e9ef"/></g>`;

  // Farbiges Raumlicht: Monitor (cyan) rechts unten, Neon (pink) oben, Mond (blau) links
  s += glow('zi-raum', 540, 1200, 700, '#7c4dff', 0.18);
  s += glow('zi-bodenlicht', 960, 1500, 380, '#2ee6ff', 0.16, 'anim-puls');
  return s;
}

function zimmer(o = {}) {
  const vorne = o.schreibtisch
    ? svg(`${linGrad('zv-tisch', ['#4a3580', '#2a1d4a'])}<rect x="-20" y="1500" width="1120" height="70" rx="10" fill="#3b2a64" stroke="${L}" stroke-width="8"/><rect x="0" y="1570" width="1080" height="400" fill="url(#zv-tisch)"/><rect x="250" y="1508" width="580" height="44" rx="10" fill="#1b1430" stroke="${L}" stroke-width="5"/><g class="anim-hue">${Array.from({ length: 16 }, (_, i) => `<rect x="${268 + i * 35}" y="1516" width="28" height="28" rx="5" fill="${['#ff3cac', '#ffd60a', '#39ff88', '#4cc9f0'][i % 4]}"/>`).join('')}</g><rect x="250" y="1552" width="580" height="12" fill="#ff3cac" opacity=".35" class="anim-hue"/><rect x="900" y="1392" width="60" height="114" rx="12" fill="#39ff88" stroke="${L}" stroke-width="6"/><rect x="908" y="1402" width="10" height="90" rx="4" fill="#fff" opacity=".5"/><ellipse cx="120" cy="1530" rx="80" ry="22" fill="#e9e9ef" stroke="${L}" stroke-width="5"/><ellipse cx="120" cy="1524" rx="56" ry="13" fill="#b03a48"/>`)
    : '';
  // Gaming-Stuhl hinter der Figur (rot/schwarz mit Kopfkissen) – passt zu rahmen "ganz"/"halbnah" + schreibtisch
  const stuhl = o.stuhl
    ? `<g stroke="${L}" stroke-width="9" stroke-linejoin="round">${schatten(540, 1500, 330, 30, 0.35)}<path d="M330 640 Q330 560 400 552 H680 Q750 560 750 640 L790 1380 Q790 1440 730 1440 H350 Q290 1440 290 1380Z" fill="#c62f3c"/><path d="M420 600 H660 L690 1400 H390Z" fill="#1b1622"/><path d="M450 640 H630" stroke="#c62f3c" stroke-width="14"/><rect x="430" y="610" width="220" height="90" rx="40" fill="#e04452"/><path d="M470 1100 H610 M460 1200 H620" stroke="#2c2636" stroke-width="10"/><rect x="250" y="1180" width="90" height="40" rx="14" fill="#1b1622"/><rect x="740" y="1180" width="90" height="40" rx="14" fill="#1b1622"/></g>`
    : '';
  return { hinten: svg(zimmerInhalt(o) + stuhl), vorne: vorne + licht('zi-licht', 0.62) };
}

// ======================================================================================
// STRASSE
// ======================================================================================
function haeuserReihe(yBoden, seed = 4, id = 'h') {
  const farben = [['#f4a7a7', '#d98a8a'], ['#a8c8f0', '#86a9d4'], ['#f6d78b', '#dcbb6c'], ['#b7e4b0', '#94c98c'], ['#f2b6d8', '#d496ba'], ['#c9b8f2', '#a998d6']];
  const r = rng(seed);
  let s = '', x = -60, i = 0;
  while (x < 1140) {
    const w = 230 + r() * 60, h = 380 + r() * 120;
    const [c, cs] = farben[(i + seed) % farben.length];
    const top = yBoden - h;
    s += `<g stroke="${L}" stroke-width="7" stroke-linejoin="round">`;
    // Schornstein
    if (i % 2 === 0) s += `<rect x="${n(x + w * 0.68)}" y="${n(top - 150)}" width="36" height="90" fill="#9a4b3a"/>`;
    s += `<rect x="${n(x)}" y="${n(top)}" width="${n(w)}" height="${n(h)}" fill="${c}"/>`;
    s += `<rect x="${n(x + w - 34)}" y="${n(top)}" width="34" height="${n(h)}" fill="${cs}" stroke="none"/>`;
    s += `<path d="M${n(x - 24)} ${n(top + 4)} L${n(x + w / 2)} ${n(top - 140)} L${n(x + w + 24)} ${n(top + 4)}Z" fill="#8a4b3a"/>`;
    s += `<path d="M${n(x + w / 2)} ${n(top - 140)} L${n(x + w + 24)} ${n(top + 4)} L${n(x + w / 2 + 40)} ${n(top + 4)}Z" fill="#6e3a2d" stroke="none"/>`;
    s += `<rect x="${n(x - 10)}" y="${n(top)}" width="${n(w + 20)}" height="16" fill="#00000022" stroke="none"/>`;
    for (let row = 0; row < 2; row++) for (let col = 0; col < 2; col++) {
      const wx = x + 30 + col * (w / 2 - 10), wy = top + 50 + row * 130, ww = w / 2 - 70;
      s += `<rect x="${n(wx)}" y="${n(wy)}" width="${n(ww)}" height="86" fill="#cfe8ff"/>`;
      s += `<path d="M${n(wx + 8)} ${n(wy + 70)} l${n(ww * 0.45)} -60" stroke="#fff" stroke-width="10" opacity=".8"/>`;
      s += `<path d="M${n(wx + ww / 2)} ${n(wy)} v86 M${n(wx)} ${n(wy + 43)} h${n(ww)}" stroke-width="5"/>`;
      if ((row + col + i) % 3 === 0) s += `<path d="M${n(wx)} ${n(wy)} h${n(ww)} v30 q-${n(ww / 2)} 20 -${n(ww)} 0z" fill="#ff8fab" stroke-width="4"/>`;
      s += `<rect x="${n(wx - 8)}" y="${n(wy + 86)}" width="${n(ww + 16)}" height="12" fill="#fff" stroke-width="4"/>`;
    }
    s += `<rect x="${n(x + w / 2 - 38)}" y="${n(yBoden - 130)}" width="76" height="130" rx="4" fill="#7a4a2a"/><circle cx="${n(x + w / 2 + 22)}" cy="${n(yBoden - 64)}" r="5" fill="#ffd36b" stroke-width="2"/><rect x="${n(x + w / 2 - 50)}" y="${n(yBoden - 12)}" width="100" height="12" fill="#b8b8c4"/>`;
    s += `</g>`;
    // Büsche vor dem Haus
    s += `<g stroke="${L}" stroke-width="6"><circle cx="${n(x + 40)}" cy="${n(yBoden - 30)}" r="38" fill="#5fae5a"/><circle cx="${n(x + 84)}" cy="${n(yBoden - 22)}" r="30" fill="#6fc06a"/><circle cx="${n(x + w - 50)}" cy="${n(yBoden - 26)}" r="34" fill="#5fae5a"/></g>`;
    x += w + 10;
    i++;
  }
  // Zaun mit spitzen Latten
  s += `<g fill="#fff" stroke="${L}" stroke-width="4">${Array.from({ length: 28 }, (_, k) => `<path d="M${k * 40 + 6} ${yBoden} v-62 l10 -14 l10 14 v62z"/>`).join('')}</g><rect y="${yBoden - 46}" width="1080" height="10" fill="#fff" stroke="${L}" stroke-width="3"/>`;
  return s;
}

function laterne(x, y) {
  return `<g stroke="${L}" stroke-width="6"><rect x="${x - 9}" y="${y - 520}" width="18" height="520" fill="#3d3f4c"/><path d="M${x} ${y - 510} q0 -40 50 -40" fill="none" stroke="#3d3f4c" stroke-width="14"/><path d="M${x + 30} ${y - 556} h60 l-10 34 h-40z" fill="#3d3f4c"/><ellipse cx="${x + 60}" cy="${y - 520}" rx="20" ry="8" fill="#fff6c9"/><rect x="${x - 20}" y="${y - 20}" width="40" height="20" fill="#3d3f4c"/></g>`;
}

function strasse(o = {}) {
  const morgen = o.tageszeit === 'morgen' || o.tageszeit === 'abend';
  const v = morgen ? 'm' : 't';
  const himmel = morgen ? ['#f39c7a', '#f8c79a', '#fde6c8'] : ['#6fbdf0', '#a6dbf7', '#e2f5ff'];
  let s = linGrad(`st-sky-${v}`, himmel) + `<rect width="1080" height="1920" fill="url(#st-sky-${v})"/>`;
  s += glow(`st-sonne-${v}`, morgen ? 860 : 900, morgen ? 520 : 200, 360, morgen ? '#fff0b3' : '#ffffff', morgen ? 0.8 : 0.6);
  s += `<circle cx="${morgen ? 860 : 900}" cy="${morgen ? 520 : 200}" r="70" fill="${morgen ? '#ffe7a0' : '#fffbe6'}"/>`;
  s += wolken(240, 3, '#fff', morgen ? '#f7d3c0' : '#d3e9f8');
  // Ferne Stadt (Luftperspektive)
  s += `<g fill="${morgen ? '#e8b7a8' : '#b9d6ee'}">${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 95 - 10}" y="${760 - ((i * 53) % 170)}" width="80" height="${300 + ((i * 53) % 170)}"/>`).join('')}</g>`;
  s += haeuserReihe(1200, 2);
  s += laterne(70, 1206);
  // Gehweg mit Bordstein
  s += `<rect y="1200" width="1080" height="230" fill="#cfcfd8" stroke="${L}" stroke-width="7"/>`;
  s += Array.from({ length: 9 }, (_, i) => `<path d="M${i * 140 - 20} 1200 l-50 230" stroke="#b5b5c2" stroke-width="5"/>`).join('') + `<path d="M0 1310 H1080" stroke="#b5b5c2" stroke-width="5"/>`;
  s += `<rect y="1414" width="1080" height="16" fill="#eeeef4" stroke="${L}" stroke-width="5"/><rect y="1430" width="1080" height="34" fill="#9a9aa8"/>`;
  // Straße
  s += linGrad('st-road', ['#4b4857', '#37343f']) + `<rect y="1464" width="1080" height="456" fill="url(#st-road)"/><path d="M0 1464 H1080" stroke="${L}" stroke-width="8"/>`;
  s += Array.from({ length: 6 }, (_, i) => `<rect x="${30 + i * 190}" y="1670" width="110" height="18" rx="6" fill="#f4f4f4"/>`).join('');
  s += `<ellipse cx="860" cy="1820" rx="80" ry="22" fill="#2f2c36" stroke="#55525f" stroke-width="5"/><path d="M800 1820 h120 M820 1808 h80 M820 1832 h80" stroke="#55525f" stroke-width="4"/>`;
  s += schatten(540, 1440, 360, 16, 0.12);
  return { hinten: svg(s), vorne: licht(`st-licht-${v}`, 0.35, morgen ? '#3a1a10' : '#0a1a30') };
}

// ======================================================================================
// PARK
// ======================================================================================
function park() {
  const r = rng(9);
  let s = linGrad('pk-sky', ['#6fbdf0', '#a6dbf7', '#e2f5ff']) + `<rect width="1080" height="1920" fill="url(#pk-sky)"/>`;
  s += glow('pk-sonne', 200, 260, 320, '#ffffff', 0.6) + `<circle cx="200" cy="260" r="64" fill="#fffbe6"/>`;
  s += wolken(230, 6);
  s += `<path d="M0 820 Q200 700 420 790 T820 760 T1080 780 V1920 H0Z" fill="#a9d99a"/>`;
  s += `<path d="M0 900 Q270 790 540 880 T1080 840 V1920 H0Z" fill="#7cc96b" stroke="${L}" stroke-width="7"/>`;
  s += `<path d="M0 1080 Q300 980 600 1060 T1080 1020 V1920 H0Z" fill="#62b856" stroke="${L}" stroke-width="7"/>`;
  s += `<path d="M420 1920 Q480 1400 640 1080 L720 1080 Q620 1400 760 1920Z" fill="#e9d3a6" stroke="${L}" stroke-width="7"/><path d="M470 1920 Q520 1450 660 1090" stroke="#d8bf8e" stroke-width="10" fill="none"/>`;
  // Teich
  s += `<ellipse cx="880" cy="1240" rx="170" ry="46" fill="#7cc8ff" stroke="${L}" stroke-width="7"/><path d="M800 1236 h60 M900 1250 h70" stroke="#fff" stroke-width="5" opacity=".8"/>`;
  for (const [x, y, sc] of [[150, 1000, 1.15], [960, 930, 0.9]]) {
    s += `<g transform="translate(${x} ${y}) scale(${sc})" stroke="${L}" stroke-width="7">${schatten(0, 200, 120, 22, 0.25)}<rect x="-22" y="0" width="44" height="200" fill="#8a5a33"/><circle cx="0" cy="-60" r="110" fill="#4fae4a"/><circle cx="-80" cy="-10" r="80" fill="#4fae4a"/><circle cx="80" cy="-10" r="80" fill="#4fae4a"/><circle cx="-30" cy="-100" r="40" fill="#6fcf68" stroke="none"/><circle cx="50" cy="-40" r="30" fill="#6fcf68" stroke="none"/></g>`;
  }
  s += `<g stroke="${L}" stroke-width="7">${schatten(930, 1270, 130, 14, 0.25)}<rect x="820" y="1180" width="220" height="24" fill="#8a5a33"/><rect x="820" y="1140" width="220" height="24" fill="#8a5a33"/><rect x="840" y="1204" width="16" height="60" fill="#555"/><rect x="1000" y="1204" width="16" height="60" fill="#555"/></g>`;
  // Büsche, Blumen, Gras
  s += `<g stroke="${L}" stroke-width="6"><circle cx="60" cy="1300" r="70" fill="#4f9e4a"/><circle cx="140" cy="1320" r="56" fill="#5fae5a"/><circle cx="1040" cy="1420" r="80" fill="#4f9e4a"/></g>`;
  for (let i = 0; i < 26; i++) {
    const x = r() * 1080, y = 1150 + r() * 720;
    if (x > 380 && x < 800 && y > 1300) continue;
    s += `<g><path d="M${n(x)} ${n(y)} v-18" stroke="#3e8f3a" stroke-width="4"/><circle cx="${n(x)}" cy="${n(y - 22)}" r="8" fill="${['#ff8fab', '#ffd43b', '#ffffff', '#b388ff'][i % 4]}" stroke="${L}" stroke-width="2"/></g>`;
  }
  s += Array.from({ length: 50 }, () => { const x = r() * 1080, y = 1150 + r() * 750; return `<path d="M${n(x)} ${n(y)} l8 -22 l8 22" fill="none" stroke="#3e8f3a" stroke-width="4"/>`; }).join('');
  s += `<g fill="none" stroke="${L}" stroke-width="4" class="anim-schweben"><path d="M600 380 q12 -12 24 0 q12 -12 24 0"/><path d="M680 430 q10 -10 20 0 q10 -10 20 0"/></g>`;
  return { hinten: svg(s), vorne: licht('pk-licht', 0.3, '#0a2a10') };
}

// ======================================================================================
// GYM
// ======================================================================================
function gym() {
  let s = NEON_FILTER + linGrad('gy-wand', ['#3a4058', '#4a5170', '#3a4058']) + `<rect width="1080" height="1920" fill="url(#gy-wand)"/>`;
  s += `<rect width="1080" height="240" fill="#262a3a"/>`;
  // Deckenlichter
  [160, 540, 920].forEach((x, i) => { s += glow(`gy-l${i}`, x, 150, 240, '#ffffff', 0.35) + `<rect x="${x - 120}" y="138" width="240" height="22" rx="11" fill="#f5f7ff" stroke="${L}" stroke-width="4"/>`; });
  // Spiegel mit Reflexen
  for (let i = 0; i < 4; i++) {
    const x = 30 + i * 265;
    s += `<rect x="${x}" y="470" width="240" height="570" rx="10" fill="#6b7aa3" stroke="${L}" stroke-width="7"/><rect x="${x + 8}" y="478" width="224" height="554" fill="#7f8fbb"/><path d="M${x + 40} 500 l70 510 M${x + 110} 500 l30 230" stroke="#a9b7de" stroke-width="22" opacity=".55"/>`;
  }
  // Neon-Schild unterhalb der Folgen-Anzeige
  s += `<rect x="220" y="300" width="640" height="140" rx="20" fill="#1c1f2e" stroke="${L}" stroke-width="7"/>`;
  s += glow('gy-neon', 540, 370, 380, '#ff4d6d', 0.3, 'anim-flacker');
  s += neonText('FIT ZONE', 540, 405, '#ff4d6d', 92);
  s += `<rect y="1040" width="1080" height="24" fill="${F.pink}"/><rect y="1040" width="1080" height="6" fill="#fff" opacity=".4"/>`;
  // Hantelablage mit bunten Hanteln + Kettlebells
  s += `<g stroke="${L}" stroke-width="6">${schatten(900, 1330, 190, 18, 0.3)}<rect x="740" y="1150" width="320" height="22" rx="6" fill="#2c2f3d"/><rect x="740" y="1240" width="320" height="22" rx="6" fill="#2c2f3d"/><rect x="760" y="1172" width="16" height="150" fill="#2c2f3d"/><rect x="1024" y="1172" width="16" height="150" fill="#2c2f3d"/>`;
  ['#ef4444', '#3b82f6', '#ffd43b', '#22c55e', '#a855f7'].forEach((c, i) => {
    const x = 770 + i * 56;
    s += `<rect x="${x}" y="1124" width="14" height="30" rx="4" fill="${c}"/><rect x="${x + 28}" y="1124" width="14" height="30" rx="4" fill="${c}"/><rect x="${x + 12}" y="1134" width="18" height="8" fill="#9aa0b2"/>`;
    s += `<rect x="${x}" y="1212" width="16" height="32" rx="4" fill="${c}"/><rect x="${x + 30}" y="1212" width="16" height="32" rx="4" fill="${c}"/><rect x="${x + 14}" y="1224" width="18" height="8" fill="#9aa0b2"/>`;
  });
  s += `</g><g stroke="${L}" stroke-width="6">${schatten(110, 1430, 120, 14, 0.3)}<circle cx="70" cy="1390" r="40" fill="#3d3f4c"/><path d="M48 1356 q22 -40 44 0" fill="none" stroke-width="10"/><circle cx="160" cy="1400" r="32" fill="#f97316"/><path d="M142 1372 q18 -32 36 0" fill="none" stroke-width="9"/></g>`;
  // Pflanze + Wasserspender links
  s += `<g stroke="${L}" stroke-width="6"><rect x="40" y="1170" width="90" height="110" rx="10" fill="#e9eef3"/><rect x="56" y="1090" width="58" height="80" rx="20" fill="#7cc8ff" opacity=".9"/><rect x="72" y="1210" width="26" height="14" rx="4" fill="#3b82f6"/></g>`;
  // Gummiboden mit Fugen in Perspektive
  s += linGrad('gy-boden', ['#30354a', '#22263a']) + `<rect y="1320" width="1080" height="600" fill="url(#gy-boden)"/><path d="M0 1320 H1080" stroke="${L}" stroke-width="8"/>`;
  for (let i = -6; i <= 6; i++) s += `<path d="M${540 + i * 90} 1320 L${540 + i * 260} 1920" stroke="#1a1d2c" stroke-width="5"/>`;
  [1400, 1500, 1630, 1790].forEach((y) => { s += `<path d="M0 ${y} H1080" stroke="#1a1d2c" stroke-width="4"/>`; });
  s += glow('gy-boden-l', 540, 1500, 520, '#ffffff', 0.08);
  return { hinten: svg(s), vorne: licht('gy-licht', 0.5) };
}

// ======================================================================================
// BAD
// ======================================================================================
function bad() {
  let s = linGrad('bd-wand', ['#f6ecd4', '#ead9b6']) + `<rect width="1080" height="1920" fill="url(#bd-wand)"/>`;
  for (let y = 0; y < 1300; y += 90) for (let x = (y / 90) % 2 ? -45 : 0; x < 1080; x += 90) s += `<rect x="${x + 3}" y="${y + 3}" width="84" height="84" rx="4" fill="#f7efdc" stroke="#d9c9a6" stroke-width="3"/><path d="M${x + 12} ${y + 14} h22" stroke="#fff" stroke-width="5" opacity=".7"/>`;
  s += `<rect y="760" width="1080" height="40" fill="#5aa9e6" opacity=".85"/>`;
  // Spiegelschrank mit Lichtleiste + Waschbecken links
  s += glow('bd-spiegel', 230, 290, 260, '#fff6d6', 0.6);
  s += `<g stroke="${L}" stroke-width="8"><rect x="80" y="270" width="300" height="360" rx="14" fill="#cfe8f5"/><rect x="100" y="250" width="260" height="22" rx="10" fill="#fff9e0"/></g><path d="M130 320 l80 -0 M130 360 l40 0 M300 560 l40 -60" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity=".9"/>`;
  s += `<g stroke="${L}" stroke-width="7"><path d="M90 760 h290 q0 90 -145 96 q-145 -6 -145 -96z" fill="#ffffff"/><rect x="215" y="850" width="40" height="300" fill="#e9eef3"/><rect x="220" y="716" width="14" height="44" fill="#b8c0cc"/><path d="M234 720 h40" stroke-width="9"/><rect x="120" y="712" width="22" height="48" rx="6" fill="#ff8fab"/><path d="M300 716 l40 -60" stroke="#7cc8ff" stroke-width="12"/></g>`;
  // Duschvorhang rechts
  s += `<rect x="720" y="150" width="380" height="14" rx="7" fill="#b8c0cc" stroke="${L}" stroke-width="5"/>`;
  s += `<path d="M740 164 q30 40 0 80 q30 40 0 80 q30 40 0 80 q30 40 0 80 q30 40 0 80 q30 40 0 80 q30 40 0 80 q30 40 0 80 q30 40 0 80 q30 40 0 80 q30 40 0 80 q30 40 0 80 L1100 1124 V164Z" fill="#7cc8ff" stroke="${L}" stroke-width="7"/>`;
  s += Array.from({ length: 6 }, (_, i) => `<path d="M${800 + i * 50} 170 V1120" stroke="#5aa9e6" stroke-width="10" opacity=".6"/>`).join('');
  s += Array.from({ length: 10 }, (_, i) => `<circle cx="${790 + (i * 67) % 290}" cy="${240 + i * 90}" r="10" fill="#fff" opacity=".7"/>`).join('');
  // Handtuch, Pflanze, Klopapier
  s += `<g stroke="${L}" stroke-width="6"><rect x="470" y="300" width="20" height="16" fill="#b8c0cc"/><path d="M440 316 h80 v190 q-40 18 -80 0z" fill="#ff8fab"/><path d="M440 470 h80" stroke="#fff" stroke-width="8"/>`;
  s += `<path d="M620 1110 l14 -80 h70 l14 80z" fill="#e9eef3"/><path d="M670 1030 q-40 -60 -70 -70 M670 1030 q10 -80 50 -100 M670 1030 q40 -50 80 -40" fill="none" stroke="#4fae4a" stroke-width="12"/><rect x="40" y="1060" width="70" height="60" rx="16" fill="#ffffff"/></g>`;
  // Boden in Perspektive + Badematte
  s += `<rect y="1300" width="1080" height="620" fill="#9fb3c4"/><path d="M0 1300 H1080" stroke="${L}" stroke-width="8"/>`;
  for (let i = -7; i <= 7; i++) s += `<path d="M${540 + i * 80} 1300 L${540 + i * 250} 1920" stroke="#8aa0b3" stroke-width="5"/>`;
  [1370, 1460, 1580, 1740].forEach((y) => { s += `<path d="M0 ${y} H1080" stroke="#8aa0b3" stroke-width="5"/>`; });
  s += `<rect x="300" y="1640" width="480" height="150" rx="40" fill="#ffd1dc" stroke="${L}" stroke-width="7"/><rect x="330" y="1665" width="420" height="100" rx="30" fill="none" stroke="#ff8fab" stroke-width="8" stroke-dasharray="20 14"/>`;
  return { hinten: svg(s), vorne: licht('bd-licht', 0.35, '#2a1a0a') };
}

// ======================================================================================
// BETT
// ======================================================================================
function bett(o = {}) {
  const nacht = o.tageszeit === 'nacht';
  const v = nacht ? 'n' : 'm';
  let s = linGrad(`bt-wand-${v}`, nacht ? ['#2a2f5e', '#1c2046'] : ['#f6d2a8', '#ebbd8c']) + `<rect width="1080" height="1920" fill="url(#bt-wand-${v})"/>`;
  // Fenster
  s += linGrad(`bt-fenster-${v}`, nacht ? ['#0a0f2c', '#1d2b63'] : ['#8fd0f5', '#ffe0b3']);
  s += `<g stroke="${L}" stroke-width="9"><rect x="630" y="230" width="360" height="460" rx="10" fill="url(#bt-fenster-${v})"/></g>`;
  if (nacht) s += `<circle cx="880" cy="330" r="38" fill="#fff6c9"/>` + Array.from({ length: 14 }, (_, i) => `<circle cx="${650 + ((i * 73) % 320)}" cy="${250 + ((i * 41) % 200)}" r="3" fill="#fff"/>`).join('');
  else s += glow('bt-sonne', 760, 600, 220, '#fff3b0', 0.8) + `<circle cx="760" cy="640" r="60" fill="#ffe08a"/>`;
  s += `<path d="M810 230 V690 M630 460 H990" stroke="${L}" stroke-width="9"/>`;
  s += `<path d="M600 210 q60 260 0 520 h70 q-40 -260 0 -520z M1020 210 q-60 260 0 520 h-70 q40 -260 0 -520z" fill="${nacht ? '#5b4a9a' : '#ff8fab'}" stroke="${L}" stroke-width="6"/>`;
  if (!nacht) s += `<path d="M640 690 L990 690 L760 1500 L250 1500Z" fill="#fff7c2" opacity=".22" class="anim-puls"/>`;
  // Poster + Regal
  s += `<g transform="rotate(-4 220 420)" stroke="${L}" stroke-width="7"><rect x="110" y="270" width="220" height="290" rx="6" fill="#7c4dff"/><circle cx="220" cy="380" r="60" fill="#ffd43b"/><text x="220" y="520" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="34" fill="#fff" stroke="none">GAMER</text></g>`;
  // Bett
  s += `<rect x="40" y="820" width="1000" height="440" rx="60" fill="#8a5a33" stroke="${L}" stroke-width="9"/><rect x="70" y="850" width="940" height="380" rx="40" fill="#efeaf7" stroke="${L}" stroke-width="7"/><path d="M120 900 q420 -40 840 0" stroke="#d8d0ea" stroke-width="12" fill="none"/>`;
  // Nachttisch mit Lampe + Wecker
  s += `<g stroke="${L}" stroke-width="7"><rect x="860" y="1060" width="200" height="240" rx="12" fill="#8a5a33"/><rect x="880" y="1150" width="160" height="10" fill="#6e4426" stroke="none"/></g>`;
  s += glow(`bt-lampe-${v}`, 980, 960, 200, '#ffd36b', nacht ? 0.7 : 0.3);
  s += `<g stroke="${L}" stroke-width="6"><rect x="972" y="980" width="16" height="80" fill="#3d3f4c"/><path d="M930 980 l20 -70 h60 l20 70z" fill="#ffe08a"/><circle cx="900" cy="1030" r="30" fill="#ef4444"/><circle cx="900" cy="1030" r="20" fill="#fff"/><path d="M900 1030 v-12 M900 1030 h10" stroke-width="4"/></g>`;
  const vorne = svg(`${linGrad(`bt-decke-${v}`, ['#6aa0ee', '#4776c2'])}<path d="M-40 1280 Q540 1120 1120 1280 V1960 H-40Z" fill="url(#bt-decke-${v})" stroke="${L}" stroke-width="10"/><path d="M-40 1290 Q540 1140 1120 1290" stroke="#9cc3ff" stroke-width="16" fill="none"/>${Array.from({ length: 6 }, (_, i) => `<circle cx="${120 + i * 170}" cy="${1480 + (i % 2) * 120}" r="26" fill="#ffffff" opacity=".35"/>`).join('')}<path d="M200 1300 q30 200 0 400 M520 1250 q30 240 0 520 M840 1290 q30 200 0 420" fill="none" stroke="#3a64aa" stroke-width="8"/>`) + licht(`bt-licht-${v}`, nacht ? 0.65 : 0.35, nacht ? '#05061a' : '#3a1a0a');
  return { hinten: svg(s), vorne };
}

// ======================================================================================
// LADEN, THEKE, KÜCHE, COUCH, HIMMEL
// ======================================================================================
function laden(o = {}) {
  const schild = esc(o.schild || 'SUPERMARKT');
  let s = linGrad('ld-sky', ['#8fd0f5', '#d9f1ff']) + `<rect width="1080" height="1920" fill="url(#ld-sky)"/>` + wolken(120, 8);
  s += `<rect y="380" width="1080" height="1000" fill="#f2ead9" stroke="${L}" stroke-width="8"/><rect x="1040" y="380" width="40" height="1000" fill="#ddd3bd"/>`;
  s += `<rect x="190" y="430" width="700" height="150" rx="20" fill="#25a55f" stroke="${L}" stroke-width="9"/><rect x="204" y="444" width="672" height="20" rx="10" fill="#fff" opacity=".25"/><text x="540" y="537" text-anchor="middle" font-family="Archivo Black, Montserrat, sans-serif" font-size="74" fill="#fff" stroke="${L}" stroke-width="3">${schild}</text>`;
  // Markise
  s += `<g stroke="${L}" stroke-width="6">${Array.from({ length: 9 }, (_, i) => `<path d="M${60 + i * 107} 610 h107 v70 q-53 30 -107 0z" fill="${i % 2 ? '#fff' : '#ef4444'}"/>`).join('')}</g>`;
  s += `<rect x="380" y="720" width="320" height="560" fill="#9fd4ef" stroke="${L}" stroke-width="8"/><path d="M540 720 V1280" stroke="${L}" stroke-width="8"/><path d="M410 760 l80 300 M580 760 l50 200" stroke="#fff" stroke-width="16" opacity=".6"/>`;
  for (const x of [80, 760]) {
    s += `<rect x="${x}" y="730" width="240" height="440" fill="#bfe4f7" stroke="${L}" stroke-width="7"/>`;
    for (let r = 0; r < 4; r++) s += ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'].map((c, i) => `<rect x="${x + 16 + i * 44}" y="${760 + r * 100}" width="34" height="56" rx="4" fill="${c}" stroke="${L}" stroke-width="3"/>`).join('');
  }
  s += `<g transform="rotate(-8 200 820)" stroke="${L}" stroke-width="5"><rect x="110" y="790" width="190" height="60" rx="8" fill="#ffd43b"/><text x="205" y="832" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="30" fill="#ef4444" stroke="none">ANGEBOT</text></g>`;
  s += `<g stroke="${L}" stroke-width="6"><rect x="300" y="1220" width="70" height="80" rx="8" fill="#b5653a"/><circle cx="335" cy="1200" r="44" fill="#4fae4a"/><rect x="710" y="1220" width="70" height="80" rx="8" fill="#b5653a"/><circle cx="745" cy="1200" r="44" fill="#4fae4a"/></g>`;
  s += `<rect y="1380" width="1080" height="540" fill="#55525f"/><path d="M0 1380 H1080" stroke="${L}" stroke-width="9"/>${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 150} 1380 l-60 540" stroke="#46434f" stroke-width="5"/>`).join('')}`;
  return { hinten: svg(s), vorne: licht('ld-licht', 0.3, '#0a1a30') };
}

function theke(o = {}) {
  const schild = esc(o.schild || 'BÄCKEREI');
  let s = `<rect width="1080" height="1920" fill="#fbe3c0"/>${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 80}" y="0" width="40" height="1920" fill="#f6d6aa"/>`).join('')}`;
  s += glow('th-licht', 540, 300, 600, '#fff3d0', 0.5);
  s += `<rect x="150" y="380" width="780" height="420" rx="18" fill="#a6d9f5" stroke="${L}" stroke-width="9"/><text x="540" y="470" text-anchor="middle" font-family="Archivo Black, Montserrat, sans-serif" font-size="72" fill="${F.rot}" stroke="${L}" stroke-width="3">${schild}</text>`;
  // Regale mit Brötchen/Croissants
  for (let r = 0; r < 2; r++) {
    s += `<rect x="190" y="${560 + r * 120}" width="700" height="14" fill="#8a5a33" stroke="${L}" stroke-width="4"/>`;
    for (let i = 0; i < 9; i++) {
      const x = 220 + i * 76, y = 545 + r * 120;
      s += i % 2 ? `<path d="M${x - 26} ${y} q26 -40 52 0 q-26 10 -52 0z" fill="#e8a24a" stroke="${L}" stroke-width="4"/>` : `<ellipse cx="${x}" cy="${y - 12}" rx="26" ry="18" fill="#d9a066" stroke="${L}" stroke-width="4"/><path d="M${x - 10} ${y - 18} l20 6" stroke="#b07a3a" stroke-width="4"/>`;
    }
  }
  const vorne = svg(`<rect x="-20" y="1350" width="1120" height="50" fill="#8a5a33" stroke="${L}" stroke-width="9"/><rect x="0" y="1400" width="1080" height="560" fill="#f3dfc1" stroke="${L}" stroke-width="9"/><rect x="60" y="1430" width="960" height="200" rx="16" fill="#cfe8f5" stroke="${L}" stroke-width="7" opacity=".9"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${120 + i * 160} 1590 q40 -60 80 0 q-40 14 -80 0z" fill="#ff8fab" stroke="${L}" stroke-width="4"/><circle cx="${160 + i * 160}" cy="1560" r="8" fill="#e2474b"/>`).join('')}<path d="M90 1450 l100 160" stroke="#fff" stroke-width="16" opacity=".6"/><path d="M300 1640 V1920 M780 1640 V1920" stroke="#8a5a33" stroke-width="16"/>`) + licht('th-licht2', 0.3, '#3a1a0a');
  return { hinten: svg(s), vorne };
}

function couch(o = {}) {
  const vorne = svg(`<g stroke="${L}" stroke-width="9" stroke-linejoin="round"><rect x="-30" y="1180" width="1140" height="200" rx="40" fill="#d8443a"/><rect x="-40" y="1060" width="190" height="380" rx="60" fill="#e0574b"/><rect x="930" y="1060" width="190" height="380" rx="60" fill="#e0574b"/></g><rect x="-30" y="1190" width="1140" height="20" fill="#ff8a7a" opacity=".5"/><rect y="1430" width="1080" height="500" fill="#8a5a3a" stroke="${L}" stroke-width="9"/>${Array.from({ length: 5 }, (_, i) => `<path d="M0 ${1500 + i * 90} H1080" stroke="#7a4c30" stroke-width="5"/>`).join('')}<g stroke="${L}" stroke-width="6"><rect x="80" y="1520" width="170" height="60" rx="8" fill="#e8c39a" transform="rotate(-8 160 1550)"/><rect x="720" y="1600" width="170" height="60" rx="8" fill="#e8c39a" transform="rotate(6 800 1630)"/><rect x="560" y="1480" width="44" height="90" rx="10" fill="#39ff88" transform="rotate(30 580 1520)"/><rect x="900" y="1500" width="44" height="90" rx="10" fill="#39ff88"/><path d="M340 1700 l70 -60 l60 50 l-40 70z" fill="#ffcf3f"/></g>`);
  return { hinten: svg(zimmerInhalt(o)), vorne: vorne + licht('co-licht', 0.6) };
}

function kueche() {
  let s = `<rect width="1080" height="1920" fill="#e9eef3"/>`;
  for (let y = 600; y < 1100; y += 70) for (let x = 0; x < 1080; x += 70) s += `<rect x="${x + 2}" y="${y + 2}" width="66" height="66" fill="#fff" stroke="#d3dbe4" stroke-width="3"/>`;
  // Hängeschränke + Fenster
  s += `<g stroke="${L}" stroke-width="8"><rect x="40" y="200" width="300" height="300" rx="10" fill="#7cc8ff"/><rect x="740" y="200" width="300" height="300" rx="10" fill="#7cc8ff"/><path d="M190 200 V500 M890 200 V500" /></g><circle cx="170" cy="350" r="8" fill="${L}"/><circle cx="210" cy="350" r="8" fill="${L}"/><circle cx="870" cy="350" r="8" fill="${L}"/><circle cx="910" cy="350" r="8" fill="${L}"/>`;
  s += linGrad('ku-fenster', ['#8fd0f5', '#e2f5ff']) + `<rect x="400" y="230" width="280" height="260" rx="8" fill="url(#ku-fenster)" stroke="${L}" stroke-width="8"/><path d="M540 230 V490" stroke="${L}" stroke-width="7"/>`;
  // Kühlschrank links mit Magneten
  s += `<g stroke="${L}" stroke-width="8">${schatten(150, 1340, 140, 14, 0.25)}<rect x="30" y="560" width="250" height="780" rx="24" fill="#f4f6fa"/><path d="M30 860 H280" /><rect x="240" y="640" width="16" height="140" rx="8" fill="#b8c0cc"/><rect x="240" y="900" width="16" height="200" rx="8" fill="#b8c0cc"/><circle cx="90" cy="640" r="14" fill="#ef4444"/><rect x="120" y="680" width="70" height="90" fill="#ffd43b" stroke-width="4"/></g>`;
  const vorne = svg(`<rect x="-20" y="1330" width="1120" height="50" fill="#5b6170" stroke="${L}" stroke-width="9"/><rect x="0" y="1380" width="1080" height="560" fill="#7c8597" stroke="${L}" stroke-width="9"/><path d="M360 1380 V1920 M720 1380 V1920" stroke="#5b6170" stroke-width="10"/><g stroke="${L}" stroke-width="6"><ellipse cx="760" cy="1320" rx="110" ry="26" fill="#3d3f4c"/><rect x="860" y="1306" width="120" height="16" rx="8" fill="#3d3f4c"/><path d="M200 1330 q-20 -110 30 -140 q50 30 30 140z" fill="#b8e986"/><rect x="420" y="1250" width="80" height="80" rx="10" fill="#ef4444"/><circle cx="460" cy="1290" r="20" fill="#fff"/></g>`) + licht('ku-licht', 0.3, '#0a1a30');
  return { hinten: svg(s), vorne };
}

function himmel() {
  let s = linGrad('hi-sky', ['#6fbdf0', '#a6dbf7', '#e8f7ff']) + `<rect width="1080" height="1920" fill="url(#hi-sky)"/>`;
  s += glow('hi-sonne', 860, 260, 340, '#ffffff', 0.7) + `<circle cx="860" cy="260" r="70" fill="#fffbe6"/>`;
  s += wolken(320, 12) + wolken(900, 13);
  s += `<path d="M-20 520 Q400 470 1100 380" stroke="#fff" stroke-width="10" fill="none" opacity=".7" stroke-dasharray="40 20"/>`;
  s += `<rect y="1250" width="1080" height="670" fill="#d6d6de"/><path d="M0 1250 H1080" stroke="${L}" stroke-width="8"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${30 + i * 190}" y="1560" width="110" height="18" rx="6" fill="#ffd43b"/>`).join('')}`;
  return { hinten: svg(s), vorne: licht('hi-licht', 0.25, '#0a1a30') };
}

// ======================================================================================
// KRANKENHAUS (Patientenzimmer) – o.bett: Krankenbett mit Decke im Vordergrund (Figur mit rahmen "kopf")
// ======================================================================================
function krankenhaus(o = {}) {
  const v = o.bett ? 'b' : 'o';
  let s = linGrad(`kh-wand-${v}`, ['#d8f1ea', '#b7ded3']) + `<rect width="1080" height="1920" fill="url(#kh-wand-${v})"/>`;
  s += glow(`kh-decke-${v}`, 540, 120, 620, '#ffffff', 0.55);
  // Deckenlampe (Neonröhre)
  s += `<rect x="300" y="40" width="480" height="34" rx="17" fill="#f7fbff" stroke="${L}" stroke-width="7"/><rect x="300" y="40" width="480" height="34" rx="17" fill="#fff" class="anim-puls" opacity=".9"/>`;
  // Fenster mit Jalousie + Vorhang
  s += linGrad(`kh-sky-${v}`, ['#8fd0f5', '#d9f1ff']);
  s += `<g stroke="${L}" stroke-width="9"><rect x="620" y="250" width="380" height="470" rx="10" fill="url(#kh-sky-${v})"/></g>`;
  s += `<circle cx="900" cy="560" r="70" fill="#fff" opacity=".8"/><circle cx="960" cy="590" r="50" fill="#fff" opacity=".8"/><circle cx="700" cy="640" r="40" fill="#fff" opacity=".7"/>`;
  s += Array.from({ length: 7 }, (_, i) => `<rect x="628" y="${262 + i * 30}" width="364" height="20" fill="#eef4f7" stroke="#9fb3c4" stroke-width="3"/>`).join('');
  s += `<path d="M810 250 V720 M620 485 H1000" stroke="${L}" stroke-width="8"/>`;
  s += `<path d="M1000 230 q-50 260 0 520 h60 V230z" fill="#5fb8a8" stroke="${L}" stroke-width="7"/><path d="M1020 260 q-30 230 0 460" stroke="#4a9c8e" stroke-width="8" fill="none"/>`;
  // Schild mit rotem Kreuz + Uhr
  s += `<g stroke="${L}" stroke-width="7"><rect x="90" y="250" width="170" height="170" rx="22" fill="#fff"/><path d="M150 278 h50 v45 h45 v50 h-45 v45 h-50 v-45 h-45 v-50 h45z" fill="#ef4444" stroke-width="5" transform="translate(-9 -12) scale(.92)"/></g>`;
  s += `<g stroke="${L}" stroke-width="7"><circle cx="420" cy="320" r="72" fill="#fff"/><path d="M420 320 V272 M420 320 L452 338" stroke-linecap="round"/><circle cx="420" cy="320" r="7" fill="${L}"/></g>`;
  // Herzmonitor am Wandarm (Linie pulsiert)
  s += `<path d="M200 560 V500 H120" stroke="#9fb3c4" stroke-width="16" fill="none"/>`;
  s += `<g stroke="${L}" stroke-width="8"><rect x="60" y="560" width="300" height="220" rx="20" fill="#26323f"/></g><rect x="80" y="580" width="260" height="150" rx="10" fill="#0f1a22"/>`;
  s += `<path d="M90 670 h50 l14 -40 l18 80 l16 -60 l12 20 h60 l12 -30 l14 50 l10 -20 h44" fill="none" stroke="#39ff88" stroke-width="6" stroke-linejoin="round" class="anim-puls"/>`;
  s += `<text x="300" y="764" text-anchor="end" font-family="Archivo Black, sans-serif" font-size="34" fill="#ff4d6d">♥ 72</text><circle cx="96" cy="752" r="9" fill="#39ff88" class="anim-puls"/>`;
  // Wandsockel + Handlauf
  s += `<rect y="1000" width="1080" height="300" fill="#9fd2c4"/><rect y="990" width="1080" height="26" fill="#e9eef3" stroke="${L}" stroke-width="6"/>`;
  // Infusionsständer
  s += `<g stroke="${L}" stroke-width="7"><path d="M930 560 V1560" stroke="#b8c0cc" stroke-width="14"/><path d="M880 560 H980" stroke="#b8c0cc" stroke-width="10"/><path d="M890 580 q-6 120 40 140 q46 -20 40 -140z" fill="#e3f4ff"/><rect x="896" y="640" width="68" height="40" fill="#9fd3ff" stroke-width="4"/><path d="M930 720 q-30 200 -120 260" fill="none" stroke="#7cc8ff" stroke-width="5"/><path d="M880 1560 h100" stroke="#b8c0cc" stroke-width="14"/></g>`;
  // Boden
  s += `<rect y="1300" width="1080" height="620" fill="#cfd8de"/><path d="M0 1300 H1080" stroke="${L}" stroke-width="8"/>`;
  for (let i = -7; i <= 7; i++) s += `<path d="M${540 + i * 90} 1300 L${540 + i * 260} 1920" stroke="#b8c4cc" stroke-width="5"/>`;
  [1380, 1480, 1610, 1780].forEach((y) => { s += `<path d="M0 ${y} H1080" stroke="#b8c4cc" stroke-width="5"/>`; });
  let vorne = '';
  if (o.bett) {
    // Kopfteil + Kissen hinter der Figur
    s += `<g stroke="${L}" stroke-width="9"><rect x="120" y="900" width="840" height="420" rx="40" fill="#e9eef3"/><path d="M160 960 H920" stroke="#b8c0cc" stroke-width="14"/><rect x="200" y="1010" width="680" height="200" rx="80" fill="#ffffff"/></g>`;
    vorne = svg(`${linGrad(`kh-decke-v-${v}`, ['#a9d4f5', '#7fb6e6'])}<path d="M-40 1290 Q540 1180 1120 1290 V1960 H-40Z" fill="url(#kh-decke-v-${v})" stroke="${L}" stroke-width="10"/><path d="M-40 1300 Q540 1196 1120 1300 L1120 1350 Q540 1250 -40 1350Z" fill="#ffffff" stroke="${L}" stroke-width="7"/>` +
      `<g stroke="${L}" stroke-width="7"><rect x="-20" y="1520" width="1120" height="34" rx="17" fill="#cfd3dd"/>${Array.from({ length: 8 }, (_, i) => `<rect x="${60 + i * 135}" y="1554" width="22" height="260" fill="#cfd3dd"/>`).join('')}<rect x="-20" y="1800" width="1120" height="34" rx="17" fill="#cfd3dd"/></g>` +
      `<path d="M260 1400 q30 60 0 110 M760 1390 q30 60 0 120" fill="none" stroke="#5f97cf" stroke-width="8"/>`);
  }
  return { hinten: svg(s), vorne: vorne + licht(`kh-licht-${v}`, 0.3, '#0a2a30') };
}

// ======================================================================================
// KASSE im Supermarkt: Regale hinten, Kassiererin-Platz, Kassenband mit Einkauf vorne
// o.einkauf: Liste aus pizza | chips | energy | cola | burger | salat | wasser
// ======================================================================================
const WARE = {
  pizza: (x, y) => `<rect x="${x}" y="${y - 70}" width="150" height="70" rx="8" fill="#e7b277"/><text x="${x + 75}" y="${y - 26}" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="30" fill="#e2474b" stroke="none">PIZZA</text>`,
  chips: (x, y) => `<path d="M${x} ${y} l12 -110 h96 l12 110z" fill="#ffcf3f"/><text x="${x + 60}" y="${y - 44}" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="24" fill="#e2474b" stroke="none">CHIPS</text>`,
  energy: (x, y) => `<rect x="${x}" y="${y - 120}" width="56" height="120" rx="12" fill="#39ff88"/><path d="M${x + 30} ${y - 90} l-12 30 h16 l-8 26" stroke="${L}" stroke-width="5" fill="none"/>`,
  cola: (x, y) => `<rect x="${x}" y="${y - 140}" width="60" height="140" rx="16" fill="#b5172a"/><rect x="${x}" y="${y - 96}" width="60" height="34" fill="#fff"/>`,
  burger: (x, y) => `<path d="M${x} ${y - 50} q60 -80 120 0z" fill="#e8a24a"/><rect x="${x}" y="${y - 50}" width="120" height="18" rx="9" fill="#7a3e1d"/><rect x="${x}" y="${y - 30}" width="120" height="28" rx="10" fill="#e8a24a"/>`,
  salat: (x, y) => `<path d="M${x} ${y - 50} h130 q0 50 -65 50 q-65 0 -65 -50z" fill="#fff"/><circle cx="${x + 40}" cy="${y - 60}" r="26" fill="#4cd97b"/><circle cx="${x + 84}" cy="${y - 62}" r="22" fill="#4cd97b"/>`,
  wasser: (x, y) => `<path d="M${x + 10} ${y - 150} h40 v24 l12 20 v106 h-64 v-106 l12 -20z" fill="#7cc8ff"/>`,
  creme: (x, y) => `<rect x="${x + 6}" y="${y - 110}" width="92" height="22" rx="6" fill="#ffffff"/><rect x="${x}" y="${y - 90}" width="104" height="90" rx="14" fill="#ff8fab"/><text x="${x + 52}" y="${y - 36}" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="22" fill="#fff" stroke="none">CREME</text>`,
  maske: (x, y) => `<rect x="${x}" y="${y - 130}" width="110" height="130" rx="8" fill="#7ed957"/><circle cx="${x + 55}" cy="${y - 84}" r="26" fill="#fff"/><circle cx="${x + 45}" cy="${y - 90}" r="4" fill="${L}" stroke="none"/><circle cx="${x + 65}" cy="${y - 90}" r="4" fill="${L}" stroke="none"/><text x="${x + 55}" y="${y - 22}" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="22" fill="${L}" stroke="none">MASKE</text>`,
  gurke: (x, y) => `<path d="M${x} ${y - 30} q10 -40 70 -44 q60 -4 70 30 q4 24 -30 28 q-70 6 -110 -14z" fill="#4c9a3c"/><path d="M${x + 30} ${y - 52} q40 -16 80 -8" stroke="#7fd06a" stroke-width="6" fill="none" stroke-linecap="round"/>${[24, 56, 90].map((d) => `<circle cx="${x + d}" cy="${y - 38}" r="3" fill="#2f6a26" stroke="none"/>`).join('')}`,
  muenzen: (x, y) => [[0, 0], [34, -8], [66, 2], [16, -30], [50, -34], [32, -58]].map(([dx, dy]) => `<ellipse cx="${x + 30 + dx}" cy="${y - 20 + dy}" rx="26" ry="14" fill="${(dx + dy) % 3 ? '#d9893a' : '#e8b04a'}"/>`).join(''),
  wagen: (x, y) => `<rect x="${x}" y="${y - 110}" width="140" height="110" rx="10" fill="#cfd3dd"/>${[0, 1, 2].map((i) => `<path d="M${x + 20 + i * 40} ${y - 100} v90" stroke="#9aa3b2" stroke-width="5"/>`).join('')}`,
};
function kasse(o = {}) {
  let s = linGrad('ka-wand', ['#f4f1ea', '#e4ddd0']) + `<rect width="1080" height="1920" fill="url(#ka-wand)"/>`;
  s += glow('ka-licht', 540, 200, 700, '#ffffff', 0.5);
  for (let r = 0; r < 4; r++) {
    s += `<rect x="0" y="${330 + r * 170}" width="1080" height="18" fill="#c9302c" stroke="${L}" stroke-width="5"/>`;
    for (let i = 0; i < 22; i++) {
      const c = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'][(i * 3 + r) % 7];
      const h = 70 + ((i * 37 + r * 11) % 60);
      s += `<rect x="${10 + i * 49}" y="${330 + r * 170 - h}" width="38" height="${h}" rx="6" fill="${c}" stroke="${L}" stroke-width="3"/><rect x="${16 + i * 49}" y="${336 + r * 170 - h}" width="6" height="${h - 14}" rx="3" fill="#fff" opacity=".4"/>`;
    }
  }
  s += `<g transform="rotate(-6 150 420)" stroke="${L}" stroke-width="5"><rect x="60" y="390" width="180" height="56" rx="8" fill="#ffd43b"/><text x="150" y="430" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="28" fill="#ef4444" stroke="none">ANGEBOT</text></g>`;
  if (o.uhr) s += `<g stroke="${L}" stroke-width="8"><rect x="700" y="372" width="300" height="130" rx="18" fill="#1b1630"/><text x="850" y="468" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="78" fill="${o.uhrFarbe || '#ff4d4d'}" stroke="none">${esc(o.uhr)}</text></g>`;
  s += `<rect y="1050" width="1080" height="870" fill="#d9d4cb"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${540 + (i - 5) * 140} 1050 L${540 + (i - 5) * 380} 1920" stroke="#c7c1b6" stroke-width="5"/>`).join('')}`;
  // Kassentheke vorne mit Band und Einkauf
  const ware = (o.einkauf || ['pizza', 'chips', 'energy', 'energy']).map((w, i) => (WARE[w] || WARE.pizza)(470 + i * 150, 1395)).join('');
  const vorne = svg(`<g stroke="${L}" stroke-width="8"><rect x="-20" y="1400" width="1120" height="560" fill="#5b6170"/><rect x="-20" y="1380" width="1120" height="40" fill="#3d3f4c"/><rect x="420" y="1386" width="700" height="28" fill="#22252f"/></g>${Array.from({ length: 12 }, (_, i) => `<path d="M${440 + i * 56} 1390 v20" stroke="#4a4d5a" stroke-width="6"/>`).join('')}<g stroke="${L}" stroke-width="6">${ware}</g><g stroke="${L}" stroke-width="7"><rect x="60" y="1240" width="240" height="150" rx="12" fill="#2c2f3d"/><rect x="80" y="1258" width="200" height="70" rx="6" fill="#39ff88"/><text x="180" y="1306" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="40" fill="#1b1630" stroke="none">${esc(o.betrag || '23,47 €')}</text></g>`) + licht('ka-licht2', 0.3, '#2a1a0a');
  return { hinten: svg(s), vorne };
}

// ======================================================================================
// DETAIL-AUFNAHMEN ohne Figur (Insert-Shots wie in den Referenzen)
// ======================================================================================
function zahnbuerste() {
  let s = linGrad('zb-wand', ['#e9f1f4', '#cfdde3']) + `<rect width="1080" height="1920" fill="url(#zb-wand)"/>`;
  for (let y = 0; y < 1200; y += 120) for (let x = (y / 120) % 2 ? -60 : 0; x < 1080; x += 120) s += `<rect x="${x + 4}" y="${y + 4}" width="112" height="112" rx="6" fill="#eef5f8" stroke="#c4d3da" stroke-width="3"/>`;
  s += `<rect x="90" y="140" width="900" height="760" rx="20" fill="#bfe0ee" stroke="${L}" stroke-width="10"/><path d="M180 220 l240 0 M180 280 l120 0 M820 760 l100 -140" stroke="#fff" stroke-width="18" stroke-linecap="round" opacity=".8"/>`;
  s += `<rect y="1180" width="1080" height="740" fill="#f7f7f9"/><path d="M0 1180 H1080" stroke="${L}" stroke-width="9"/><ellipse cx="540" cy="1460" rx="380" ry="120" fill="#e3e8ee" stroke="${L}" stroke-width="9"/><ellipse cx="540" cy="1470" rx="20" ry="10" fill="#9aa3b2"/>`;
  s += `<g stroke="${L}" stroke-width="8"><rect x="800" y="1040" width="40" height="150" fill="#cfd3dd"/><path d="M820 1050 h120" stroke-width="16"/></g>`;
  // Becher mit vergammelter Zahnbürste, Spinnweben, Fliegen
  s += `<g stroke="${L}" stroke-width="9">${schatten(420, 1200, 150, 18, 0.25)}<path d="M300 900 h240 l-24 300 h-192z" fill="#7cc8ff" opacity=".9"/><path d="M280 380 L470 1040" stroke="#3b82f6" stroke-width="40" stroke-linecap="round"/><path d="M280 380 L470 1040" stroke="#7cb7f0" stroke-width="22" stroke-linecap="round"/><rect x="232" y="280" width="64" height="150" rx="14" fill="#f5f5f5" transform="rotate(-16 264 355)"/></g>`;
  s += `<g transform="rotate(-16 264 355)">${Array.from({ length: 6 }, (_, i) => `<path d="M${226 + i * 4} ${290 + i * 22} h-30" stroke="#8a7f5a" stroke-width="10" stroke-linecap="round"/>`).join('')}</g><circle cx="230" cy="330" r="14" fill="#7a8a3a"/><circle cx="252" cy="390" r="10" fill="#6a7a2a"/>`;
  s += `<path d="M90 150 q120 40 170 170 M90 150 q60 90 40 190 M90 150 l150 70" fill="none" stroke="#fff" stroke-width="4" opacity=".85"/>`;
  s += `<g stroke="${L}" stroke-width="7"><rect x="560" y="1290" width="300" height="80" rx="30" fill="#ffffff" transform="rotate(-8 700 1330)"/><rect x="820" y="1270" width="70" height="56" rx="10" fill="#3b82f6" transform="rotate(-8 850 1300)"/></g>`;
  return { hinten: svg(s), vorne: licht('zb-licht', 0.45, '#0a1a20') };
}

function kuehlschrank() {
  let s = `<rect width="1080" height="1920" fill="#2a2f3d"/>`;
  s += `<g stroke="${L}" stroke-width="12"><rect x="110" y="200" width="860" height="1560" rx="40" fill="#e9eef3"/><rect x="160" y="250" width="760" height="1300" rx="20" fill="#f6fbff"/></g>`;
  s += glow('ks-licht', 540, 300, 700, '#fffbe0', 0.8);
  s += `<rect x="460" y="262" width="160" height="26" rx="13" fill="#fffbe0" stroke="${L}" stroke-width="5"/>`;
  [600, 900, 1200].forEach((y) => { s += `<rect x="170" y="${y}" width="740" height="18" rx="6" fill="#cfe8f5" stroke="${L}" stroke-width="5"/>`; });
  // Inhalt: einsame Ketchupflasche, vergammelter Rest, Energy
  s += `<g stroke="${L}" stroke-width="8"><path d="M420 600 v-180 q0 -40 30 -50 v-40 h40 v40 q30 10 30 50 v180z" fill="#e2474b"/><rect x="440" y="470" width="60" height="60" fill="#fff" stroke-width="5"/><ellipse cx="740" cy="1186" rx="110" ry="26" fill="#9db06a"/><path d="M660 1170 q40 -40 80 0 q40 -40 70 0" fill="none" stroke="#6a7a3a" stroke-width="7"/><rect x="250" y="780" width="56" height="120" rx="12" fill="#39ff88"/></g>`;
  s += Array.from({ length: 5 }, (_, i) => `<path d="M${700 + i * 20} ${1120 - i * 30} q10 -20 0 -40" stroke="#8a9a4a" stroke-width="5" fill="none" opacity=".7"/>`).join('');
  s += `<g stroke="${L}" stroke-width="10"><rect x="0" y="200" width="110" height="1560" rx="20" fill="#d3dbe4"/></g>`;
  return { hinten: svg(s), vorne: licht('ks-licht2', 0.55) };
}

function dusche() {
  let s = `<rect width="1080" height="1920" fill="#e7e2d4"/>`;
  for (let y = 0; y < 1700; y += 110) for (let x = (y / 110) % 2 ? -55 : 0; x < 1080; x += 110) s += `<rect x="${x + 3}" y="${y + 3}" width="104" height="104" rx="5" fill="#efeadf" stroke="#cfc6b2" stroke-width="3"/>`;
  // Schimmel + Dreck
  const r = rng(31);
  for (let i = 0; i < 26; i++) s += `<circle cx="${n(60 + r() * 960)}" cy="${n(1100 + r() * 600)}" r="${n(8 + r() * 26)}" fill="#6b6a3a" opacity="${n(0.25 + r() * 0.4)}"/>`;
  s += `<g stroke="${L}" stroke-width="9"><path d="M760 160 V560" stroke="#b8c0cc" stroke-width="20"/><path d="M640 170 H880" stroke="#b8c0cc" stroke-width="18"/><ellipse cx="640" cy="200" rx="110" ry="40" fill="#cfd3dd"/></g>`;
  s += `<g stroke="${L}" stroke-width="7"><circle cx="760" cy="760" r="60" fill="#cfd3dd"/><path d="M760 700 V820 M700 760 H820" stroke-width="10"/></g>`;
  // Spinne mit Faden
  s += `<path d="M380 0 V430" stroke="#fff" stroke-width="3"/><g stroke="${L}" stroke-width="5"><circle cx="380" cy="450" r="26" fill="#2a1f3d"/>${[-1, 1].map((sg) => `<path d="M${380 + sg * 20} 440 l${sg * 34} -24 M${380 + sg * 24} 452 l${sg * 40} 0 M${380 + sg * 20} 464 l${sg * 34} 24" fill="none"/>`).join('')}<circle cx="372" cy="444" r="5" fill="#fff" stroke="none"/><circle cx="388" cy="444" r="5" fill="#fff" stroke="none"/></g>`;
  s += `<g stroke="${L}" stroke-width="7"><rect x="120" y="880" width="220" height="24" rx="6" fill="#b8c0cc"/><rect x="140" y="790" width="50" height="90" rx="12" fill="#ff8fab"/><rect x="210" y="810" width="44" height="70" rx="12" fill="#7cc8ff"/><rect x="270" y="840" width="56" height="40" rx="10" fill="#ffd43b"/></g>`;
  s += `<rect y="1700" width="1080" height="220" fill="#cfd8de"/><path d="M0 1700 H1080" stroke="${L}" stroke-width="9"/><ellipse cx="540" cy="1800" rx="40" ry="14" fill="#9aa3b2"/>`;
  s += `<g stroke="${L}" stroke-width="8"><path d="M40 0 V1720" stroke="#dfe8ee" stroke-width="14" opacity=".9"/><path d="M1040 0 V1720" stroke="#dfe8ee" stroke-width="14" opacity=".9"/></g>`;
  return { hinten: svg(s), vorne: licht('du-licht', 0.45, '#1a1a10') };
}

// Haus am Abend (Heimkehr), optional Polizeiauto vorne: o.polizei
function haus(o = {}) {
  let s = linGrad('hs-sky', ['#2b2f6e', '#7a4a9a', '#f08a6a']) + `<rect width="1080" height="1920" fill="url(#hs-sky)"/>`;
  s += Array.from({ length: 16 }, (_, i) => `<circle cx="${(i * 137) % 1080}" cy="${80 + ((i * 71) % 400)}" r="3" fill="#fff" opacity=".8"/>`).join('');
  s += `<g fill="#3a2f5e">${Array.from({ length: 9 }, (_, i) => `<path d="M${i * 130 - 40} 1000 l70 -110 l70 110z"/><rect x="${i * 130 - 30}" y="1000" width="120" height="200"/>`).join('')}</g>`;
  s += `<g stroke="${L}" stroke-width="9" stroke-linejoin="round"><rect x="240" y="760" width="600" height="460" fill="#cfc6d8"/><path d="M200 770 L540 500 L880 770Z" fill="#6e3a4d"/><rect x="700" y="560" width="60" height="140" fill="#6e3a4d"/></g>`;
  s += glow('hs-fenster', 380, 900, 160, '#ffd36b', 0.55);
  s += `<g stroke="${L}" stroke-width="7"><rect x="300" y="830" width="160" height="130" fill="#ffd36b"/><path d="M380 830 v130 M300 895 h160"/><rect x="620" y="830" width="160" height="130" fill="#3a3f6e"/>${Array.from({ length: 5 }, (_, i) => `<path d="M620 ${845 + i * 24} h160" stroke-width="4"/>`).join('')}<rect x="490" y="1000" width="100" height="220" fill="#7a4a2a"/></g>`;
  s += `<rect y="1220" width="1080" height="700" fill="#3d3a48"/><path d="M0 1220 H1080" stroke="${L}" stroke-width="9"/>${Array.from({ length: 6 }, (_, i) => `<rect x="${30 + i * 190}" y="1600" width="110" height="16" rx="6" fill="#d8d8e0"/>`).join('')}`;
  let vorne = '';
  if (o.polizei) {
    vorne = svg(`${schatten(400, 1560, 360, 26, 0.45)}<g stroke="${L}" stroke-width="9" stroke-linejoin="round"><path d="M90 1520 v-120 q0 -40 40 -46 l120 -14 l90 -110 h300 l110 110 l70 12 q40 8 40 50 v118z" fill="#f4f6fa"/><path d="M260 1330 l70 -86 h120 v86z M480 1330 v-86 h110 l80 86z" fill="#9fd3ff"/><rect x="90" y="1400" width="660" height="50" fill="#3b82f6"/><text x="420" y="1438" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="40" fill="#fff" stroke="none">POLIZEI</text><circle cx="230" cy="1530" r="56" fill="#2c2f3d"/><circle cx="620" cy="1530" r="56" fill="#2c2f3d"/><circle cx="230" cy="1530" r="20" fill="#9aa3b2"/><circle cx="620" cy="1530" r="20" fill="#9aa3b2"/><rect x="380" y="1210" width="80" height="34" rx="8" fill="#3b82f6"/></g>`)
      + svg(`<g class="anim-flacker">${glow('hs-blau', 420, 1226, 260, '#3b82f6', 0.75)}</g>`);
  }
  return { hinten: svg(s), vorne: vorne + licht('hs-licht', 0.45, '#0a0620') };
}

// ======================================================================================
// IMBISS: Döner-Laden mit Drehspießen links/rechts, Preisschild und Zutaten-Theke vorne
// ======================================================================================
function imbiss(o = {}) {
  const schild = esc(o.schild || 'DÖNER');
  const preis = esc(o.preis || '7,50 €');
  let s = linGrad('im-wand', ['#f6a94f', '#e9823a']) + `<rect width="1080" height="1920" fill="url(#im-wand)"/>`;
  for (let y = 0; y < 1400; y += 90) for (let x = (y / 90) % 2 ? -60 : 0; x < 1080; x += 120) s += `<rect x="${x + 3}" y="${y + 3}" width="114" height="84" rx="4" fill="#f2b56a" stroke="#d98a3e" stroke-width="3" opacity=".55"/>`;
  s += glow('im-licht', 540, 300, 640, '#fff3d0', 0.55);
  s += `<rect x="190" y="280" width="700" height="150" rx="20" fill="#c62f3c" stroke="${L}" stroke-width="9"/><rect x="204" y="292" width="672" height="18" rx="9" fill="#fff" opacity=".25"/><text x="540" y="390" text-anchor="middle" font-family="Archivo Black, Montserrat, sans-serif" font-size="92" fill="#ffd43b" stroke="${L}" stroke-width="4">${schild}</text>`;
  // Zwei Drehspieße mit glühendem Grill dahinter
  for (const [x, i] of [[150, 0], [930, 1]]) {
    s += `<g stroke="${L}" stroke-width="8"><rect x="${x - 110}" y="500" width="220" height="620" rx="16" fill="#3a3f4c"/><rect x="${x - 88}" y="524" width="176" height="572" rx="10" fill="#7a1f12"/></g>`;
    s += glow(`im-glut${i}`, x, 800, 240, '#ff7a1f', 0.8, 'anim-puls');
    s += `<path d="M${x} 490 V1130" stroke="#cfd3dd" stroke-width="14"/>`;
    s += `<path d="M${x - 72} 590 Q${x} 560 ${x + 72} 590 L${x + 46} 1020 Q${x} 1044 ${x - 46} 1020Z" fill="#a8622b" stroke="${L}" stroke-width="8"/>`;
    for (let k = 0; k < 6; k++) {
      const y = 640 + k * 62, b = 62 - k * 4;
      s += `<path d="M${x - b} ${y} q${b} 22 ${b * 2} 0" fill="none" stroke="#6e3a14" stroke-width="9"/><path d="M${x - b + 10} ${y + 22} q${b - 10} 16 ${b * 2 - 20} 0" fill="none" stroke="#d68a42" stroke-width="7"/>`;
    }
  }
  // Preisschild
  s += `<g transform="rotate(-5 300 500)" stroke="${L}" stroke-width="6"><rect x="290" y="450" width="190" height="84" rx="12" fill="#ffd43b"/><text x="385" y="508" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="42" fill="#c62f3c" stroke="none">${preis}</text></g>`;
  const schale = (x, farbe) => `<path d="M${x - 72} 1440 h144 l-16 64 h-112z" fill="#e9eef3" stroke="${L}" stroke-width="6"/><ellipse cx="${x}" cy="1440" rx="72" ry="20" fill="${farbe}" stroke="${L}" stroke-width="6"/>`;
  const vorne = svg(`<rect x="-20" y="1350" width="1120" height="50" fill="#8a5a33" stroke="${L}" stroke-width="9"/><rect x="0" y="1400" width="1080" height="560" fill="#c9502f" stroke="${L}" stroke-width="9"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${60 + i * 200}" y="1540" width="160" height="340" rx="12" fill="#b4432a" stroke="${L}" stroke-width="5"/>`).join('')}${schale(150, '#4cd97b')}${schale(350, '#e2474b')}${schale(730, '#f4f1ea')}${schale(930, '#ffcf3f')}`) + licht('im-licht2', 0.32, '#2a0f05');
  return { hinten: svg(s), vorne };
}

// ======================================================================================
// LAUFSTRECKE: rote Tartanbahn führt in die Tiefe, dahinter Fluss mit Steinbrücke und Stadt, Bäume an den Seiten
// o.tageszeit: "morgen" (Sonnenaufgang) / sonst Tag
// ======================================================================================
function laufstrecke(o = {}) {
  const morgen = o.tageszeit === 'morgen';
  const v = morgen ? 'm' : 't';
  const r = rng(41);
  let s = linGrad(`ls-sky-${v}`, morgen ? ['#6a7fce', '#f39c7a', '#fde2b3'] : ['#5fb2ee', '#a6dbf7', '#e6f7ff']) + `<rect width="1080" height="1920" fill="url(#ls-sky-${v})"/>`;
  const [sx, sy] = morgen ? [790, 720] : [190, 330];
  s += glow(`ls-sonne-${v}`, sx, sy, 400, morgen ? '#fff0b3' : '#ffffff', morgen ? 0.85 : 0.6, 'anim-puls');
  s += `<circle cx="${sx}" cy="${sy}" r="${morgen ? 84 : 66}" fill="${morgen ? '#ffe39a' : '#fffbe6'}"/>`;
  s += wolken(270, 15, '#fff', morgen ? '#f7cfc0' : '#d3e9f8');
  s += `<g fill="none" stroke="${L}" stroke-width="4" class="anim-schweben"><path d="M250 520 q12 -12 24 0 q12 -12 24 0"/><path d="M340 570 q10 -10 20 0 q10 -10 20 0"/></g>`;
  // Stadt im Dunst
  const haze = morgen ? '#c98f9a' : '#a9c9e6';
  s += `<g fill="${haze}">${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 96 - 20}" y="${800 - ((i * 67) % 190)}" width="84" height="${240 + ((i * 67) % 190)}"/>`).join('')}</g>`;
  // Fluss
  s += linGrad(`ls-wasser-${v}`, morgen ? ['#f4b48f', '#6d8fc9'] : ['#9fdcf7', '#3f96d6']) + `<rect y="930" width="1080" height="190" fill="url(#ls-wasser-${v})"/>`;
  for (let i = 0; i < 16; i++) s += `<path d="M${n(r() * 1000)} ${n(960 + r() * 140)} h${n(40 + r() * 70)}" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55"/>`;
  // Steinbrücke mit Bögen
  s += `<path d="M-20 800 H1100 V930 H-20Z" fill="#b9a68f" stroke="${L}" stroke-width="8"/>`;
  for (let i = 0; i < 5; i++) s += `<path d="M${40 + i * 215} 932 v-46 a78 78 0 0 1 156 0 v46z" fill="${morgen ? '#54628f' : '#4f8dbd'}" stroke="${L}" stroke-width="7"/>`;
  s += `<rect x="-20" y="776" width="1120" height="26" fill="#d6c6af" stroke="${L}" stroke-width="7"/>`;
  for (let i = 0; i < 18; i++) s += `<rect x="${i * 62}" y="742" width="14" height="36" fill="#d6c6af" stroke="${L}" stroke-width="4"/>`;
  // Uferwiese
  s += `<path d="M0 1120 Q280 1075 540 1096 T1080 1090 V1920 H0Z" fill="#74c463" stroke="${L}" stroke-width="8"/>`;
  s += `<path d="M0 1300 Q300 1250 540 1270 T1080 1270 V1920 H0Z" fill="#5fb655"/>`;
  // Hintere Bäume, nach vorne größer
  const baum = (x, y, k, c = '#4fae4a', c2 = '#6fcf68') => `<g transform="translate(${x} ${y}) scale(${k})" stroke="${L}" stroke-width="${n(7 / k)}">${schatten(0, 196, 110, 18, 0.22)}<rect x="-20" y="0" width="40" height="196" fill="#8a5a33"/><circle cx="0" cy="-60" r="108" fill="${c}"/><circle cx="-78" cy="-8" r="76" fill="${c}"/><circle cx="78" cy="-8" r="76" fill="${c}"/><circle cx="-28" cy="-98" r="38" fill="${c2}" stroke="none"/><circle cx="48" cy="-36" r="28" fill="${c2}" stroke="none"/></g>`;
  s += baum(390, 1020, 0.34, '#5fb655', '#7bd570') + baum(690, 1020, 0.34, '#5fb655', '#7bd570');
  s += baum(250, 1040, 0.62) + baum(835, 1040, 0.62);
  // Tartanbahn mit Spurlinien in der Tiefe
  s += `<path d="M498 1082 H582 L1340 1920 H-260Z" fill="#d8503f" stroke="${L}" stroke-width="8"/>`;
  s += `<path d="M498 1082 H582 L760 1280 H320Z" fill="#fff" opacity=".1"/>`;
  [-0.5, -0.17, 0.17, 0.5].forEach((f) => { s += `<path d="M${n(540 + f * 84)} 1084 L${n(540 + f * 1600)} 1920" stroke="#fff" stroke-width="9" opacity=".92"/>`; });
  // Holzschild mit großem Ziel (Gag: er schafft 0,8 km)
  s += `<g stroke="${L}" stroke-width="7" transform="rotate(-4 925 1150)"><rect x="912" y="1110" width="26" height="240" fill="#8a5a33"/><rect x="800" y="1040" width="252" height="118" rx="12" fill="#d9a066"/><text x="926" y="1092" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="27" fill="${L}" stroke="none">LAUFSTRECKE</text><text x="926" y="1138" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="38" fill="#c62f3c" stroke="none">10 KM</text></g>`;
  // Bank links, große Bäume vorne, Gras und Blumen an den Rändern
  s += `<g stroke="${L}" stroke-width="7">${schatten(120, 1350, 130, 12, 0.25)}<rect x="10" y="1250" width="220" height="24" fill="#8a5a33"/><rect x="10" y="1210" width="220" height="24" fill="#8a5a33"/><rect x="26" y="1274" width="16" height="70" fill="#555"/><rect x="196" y="1274" width="16" height="70" fill="#555"/></g>`;
  for (let i = 0; i < 46; i++) {
    const links = i % 2 === 0, y = 1180 + r() * 700, rand = Math.max(0, ((y - 1082) / 838) * 760 - 60);
    const x = links ? r() * Math.max(30, 500 - rand) : 1080 - r() * Math.max(30, 500 - rand);
    s += i % 5 === 0
      ? `<path d="M${n(x)} ${n(y)} v-18" stroke="#3e8f3a" stroke-width="4"/><circle cx="${n(x)}" cy="${n(y - 22)}" r="8" fill="${['#ff8fab', '#ffd43b', '#ffffff', '#b388ff'][i % 4]}" stroke="${L}" stroke-width="2"/>`
      : `<path d="M${n(x)} ${n(y)} l8 -22 l8 22" fill="none" stroke="#3e8f3a" stroke-width="4"/>`;
  }
  return { hinten: svg(s), vorne: licht(`ls-licht-${v}`, morgen ? 0.42 : 0.3, morgen ? '#3a1a30' : '#0a2030') };
}

// ======================================================================================
// WASCHBECKEN: Detailaufnahme von oben, braunes Wasser läuft in den Abfluss
// ======================================================================================
function waschbecken() {
  let s = linGrad('wb-wand', ['#e9f1f4', '#cfdde3']) + `<rect width="1080" height="1920" fill="url(#wb-wand)"/>`;
  for (let y = 0; y < 720; y += 120) for (let x = (y / 120) % 2 ? -60 : 0; x < 1080; x += 120) s += `<rect x="${x + 4}" y="${y + 4}" width="112" height="112" rx="6" fill="#eef5f8" stroke="#c4d3da" stroke-width="3"/>`;
  s += `<rect y="700" width="1080" height="1220" fill="#f4f5f8"/><path d="M0 700 H1080" stroke="${L}" stroke-width="9"/>`;
  // Armatur mit laufendem Wasser
  s += `<g stroke="${L}" stroke-width="9"><rect x="505" y="520" width="70" height="210" rx="14" fill="#cfd3dd"/><path d="M540 570 h-2 q0 -60 60 -60 h60 v50" fill="none" stroke-width="44" stroke-linecap="round"/><path d="M540 570 h-2 q0 -60 60 -60 h60 v50" fill="none" stroke="#cfd3dd" stroke-width="28" stroke-linecap="round"/></g>`;
  // Becken
  s += `<ellipse cx="540" cy="1140" rx="470" ry="340" fill="#e3e8ee" stroke="${L}" stroke-width="10"/><ellipse cx="540" cy="1160" rx="415" ry="285" fill="#fff" stroke="#c4d3da" stroke-width="6"/>`;
  s += `<path d="M658 580 Q660 900 560 1190" fill="none" stroke="#9fd3ff" stroke-width="26" stroke-linecap="round" opacity=".9"/>`;
  // Braune Brühe mit Strudel und Schaum
  s += `<ellipse cx="540" cy="1195" rx="345" ry="215" fill="#7a5230" stroke="${L}" stroke-width="7"/><ellipse cx="540" cy="1195" rx="345" ry="215" fill="#a4733f" opacity=".45"/>`;
  s += `<g fill="none" stroke="#5a3a1f" stroke-width="9" stroke-linecap="round" class="anim-puls"><path d="M380 1195 Q440 1090 560 1110 Q690 1130 680 1220"/><path d="M450 1200 Q490 1145 560 1155 Q625 1170 615 1215"/></g><ellipse cx="540" cy="1205" rx="42" ry="24" fill="#3a2412"/>`;
  [[300, 1120, 34], [345, 1085, 24], [760, 1130, 30], [720, 1090, 22], [420, 1320, 28], [660, 1330, 34]].forEach(([x, y, r]) => { s += `<circle cx="${x}" cy="${y}" r="${r}" fill="#efe6d4" stroke="#a48a5e" stroke-width="4"/>`; });
  return { hinten: svg(s), vorne: licht('wb-licht', 0.4, '#1a1a10') };
}

// ======================================================================================
// BERG: steiler Bergpfad im Kaukasus-Stil – Schneegipfel, Wiesenhang, Serpentinenweg, Steinhaus, Felsen
// o.tageszeit: "morgen" (Sonnenaufgang) / sonst Tag; o.gipfel: true = Figur steht oben, Blick ins Tal
// ======================================================================================
function berg(o = {}) {
  const morgen = o.tageszeit === 'morgen';
  const v = morgen ? 'm' : 't';
  const r = rng(53);
  let s = linGrad(`bg-sky-${v}`, morgen ? ['#5a6fc4', '#f2a07e', '#fde2b3'] : ['#4fa6ea', '#9fd6f7', '#e3f5ff']) + `<rect width="1080" height="1920" fill="url(#bg-sky-${v})"/>`;
  const [sx, sy] = morgen ? [820, 600] : [200, 300];
  s += glow(`bg-sonne-${v}`, sx, sy, 380, morgen ? '#fff0b3' : '#ffffff', morgen ? 0.85 : 0.6) + `<circle cx="${sx}" cy="${sy}" r="${morgen ? 80 : 64}" fill="${morgen ? '#ffe39a' : '#fffbe6'}"/>`;
  s += wolken(250, 21, '#fff', morgen ? '#f7cfc0' : '#d3e9f8');
  // Ferne Gipfel mit Schnee
  const fern = morgen ? '#8f7fb8' : '#8db3d9';
  s += `<path d="M-40 980 L120 640 L230 760 L380 520 L520 730 L640 560 L800 760 L930 610 L1120 900 V1100 H-40Z" fill="${fern}"/>`;
  s += `<path d="M330 600 L380 520 L430 600 L405 590 L380 612 L355 590Z M590 640 L640 560 L690 640 L665 630 L640 650 L615 630Z M880 690 L930 610 L980 690 L955 680 L930 700 L905 680Z" fill="#fff"/>`;
  // Mittlerer Berg
  s += `<path d="M-40 1100 L200 760 L360 900 L560 690 L760 900 L1120 780 V1300 H-40Z" fill="${morgen ? '#6f7a9a' : '#6d8fa8'}" stroke="${L}" stroke-width="8" stroke-linejoin="round"/>`;
  s += `<path d="M500 760 L560 690 L620 760 L590 752 L560 780 L530 752Z" fill="#fff" stroke="${L}" stroke-width="5" stroke-linejoin="round"/>`;
  // Wiesenhang vorne, steil
  s += `<path d="M-40 1920 L-40 1240 Q300 1120 620 1000 Q860 920 1120 880 V1920Z" fill="#6fb85a" stroke="${L}" stroke-width="8"/>`;
  s += `<path d="M-40 1920 L-40 1420 Q340 1280 700 1140 Q900 1070 1120 1040 V1920Z" fill="#5fa84c"/>`;
  // Serpentinenweg hoch zum Gipfel
  s += `<path d="M260 1920 Q420 1700 700 1640 Q980 1580 820 1430 Q680 1300 900 1180 Q1010 1120 1060 1000" fill="none" stroke="${L}" stroke-width="96" stroke-linecap="round"/>`;
  s += `<path d="M260 1920 Q420 1700 700 1640 Q980 1580 820 1430 Q680 1300 900 1180 Q1010 1120 1060 1000" fill="none" stroke="#d8c08e" stroke-width="80" stroke-linecap="round"/>`;
  s += `<path d="M300 1900 Q440 1720 690 1665 M840 1450 Q730 1330 900 1210" fill="none" stroke="#c6ab78" stroke-width="10" stroke-linecap="round" stroke-dasharray="30 26"/>`;
  // Steinhaus mit Holzbalkon links oben am Hang
  s += `<g stroke="${L}" stroke-width="7" stroke-linejoin="round">${schatten(170, 1210, 120, 14, 0.25)}<rect x="70" y="1060" width="200" height="150" fill="#cdb79a"/><path d="M50 1066 L170 990 L290 1066Z" fill="#8a5a3a"/><rect x="150" y="1130" width="44" height="80" fill="#7a4a2a"/><rect x="92" y="1090" width="40" height="34" fill="#ffd36b"/><rect x="208" y="1090" width="40" height="34" fill="#9fd3ff"/></g>`;
  s += [[110, 1092], [130, 1150], [200, 1170], [240, 1110]].map(([x, y]) => `<rect x="${x}" y="${y}" width="22" height="12" rx="3" fill="#b5a084" opacity=".7"/>`).join('');
  // Felsen und Gras
  s += `<g stroke="${L}" stroke-width="7" stroke-linejoin="round">${schatten(130, 1560, 90, 12, 0.25)}<path d="M40 1560 L70 1480 L150 1460 L200 1520 L190 1560Z" fill="#9aa3b2"/><path d="M70 1480 L120 1500 L150 1460" fill="none" stroke-width="5"/>${schatten(980, 1360, 70, 10, 0.25)}<path d="M920 1360 L940 1300 L1010 1290 L1040 1340 L1030 1360Z" fill="#9aa3b2"/></g>`;
  for (let i = 0; i < 46; i++) {
    const x = r() * 1080, y = 1250 + r() * 660;
    s += i % 6 === 0
      ? `<path d="M${n(x)} ${n(y)} v-16" stroke="#3e8f3a" stroke-width="4"/><circle cx="${n(x)}" cy="${n(y - 20)}" r="7" fill="${['#ffd43b', '#ffffff', '#b388ff'][i % 3]}" stroke="${L}" stroke-width="2"/>`
      : `<path d="M${n(x)} ${n(y)} l7 -20 l7 20" fill="none" stroke="#3e8f3a" stroke-width="4"/>`;
  }
  // Wegweiser am Pfad
  s += `<g stroke="${L}" stroke-width="7" transform="rotate(4 820 1370)"><rect x="808" y="1300" width="22" height="150" fill="#8a5a33"/><path d="M700 1270 h220 l30 30 l-30 30 h-220z" fill="#d9a066"/><text x="815" y="1316" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="32" fill="${L}" stroke="none">GIPFEL 3 KM</text></g>`;
  s += `<g fill="none" stroke="${L}" stroke-width="4" class="anim-schweben"><path d="M520 470 q14 -14 28 0 q14 -14 28 0"/><path d="M600 520 q10 -10 20 0 q10 -10 20 0"/></g>`;
  return { hinten: svg(s), vorne: licht(`bg-licht-${v}`, morgen ? 0.4 : 0.28, morgen ? '#3a1a30' : '#0a2030') };
}

// ======================================================================================
// GIPFEL: Figur steht auf dem Felsgipfel über den Wolken, Gipfelkreuz-freie Fahne, Bergkette im Hintergrund
// ======================================================================================
function gipfel() {
  let s = linGrad('gp-sky', ['#3f8fe0', '#8fcff5', '#e8f7ff']) + `<rect width="1080" height="1920" fill="url(#gp-sky)"/>`;
  s += glow('gp-sonne', 860, 330, 420, '#ffffff', 0.75, 'anim-puls') + `<circle cx="860" cy="330" r="72" fill="#fffbe6"/>`;
  // Bergkette weit unten im Dunst
  s += `<path d="M-40 1180 L110 960 L240 1060 L400 880 L560 1050 L700 900 L860 1060 L1000 940 L1120 1020 V1300 H-40Z" fill="#a9c6e3"/>`;
  s += `<path d="M370 920 L400 880 L430 920 L415 914 L400 930 L385 914Z M670 940 L700 900 L730 940 L715 934 L700 950 L685 934Z" fill="#fff"/>`;
  // Wolkenmeer
  for (let i = 0; i < 9; i++) {
    const x = i * 140 - 40, y = 1170 + (i % 3) * 26;
    s += `<g class="anim-schweben"><ellipse cx="${x}" cy="${y + 26}" rx="120" ry="44" fill="#d3e9f8"/><ellipse cx="${x}" cy="${y}" rx="112" ry="46" fill="#fff"/><circle cx="${x - 40}" cy="${y - 26}" r="44" fill="#fff"/><circle cx="${x + 34}" cy="${y - 32}" r="52" fill="#fff"/></g>`;
  }
  // Felsgipfel mit Schneekappe, Figur steht oben bei y≈1700
  s += `<path d="M-60 1920 L120 1560 L260 1640 L420 1420 L540 1460 L660 1410 L820 1600 L960 1540 L1140 1920Z" fill="#7d8796" stroke="${L}" stroke-width="10" stroke-linejoin="round"/>`;
  s += `<path d="M120 1560 L260 1640 L300 1920 M660 1410 L700 1700 M820 1600 L840 1920" fill="none" stroke="#5f6878" stroke-width="10"/>`;
  s += `<path d="M330 1530 L420 1420 L540 1460 L660 1410 L760 1530 Q700 1560 640 1540 Q560 1580 480 1550 Q400 1580 330 1530Z" fill="#ffffff" stroke="${L}" stroke-width="7" stroke-linejoin="round"/>`;
  s += `<rect y="1690" width="1080" height="230" fill="#6b7483"/><path d="M0 1690 H1080" stroke="${L}" stroke-width="8"/>`;
  s += `<path d="M120 1760 h140 M520 1800 h180 M820 1750 h120" stroke="#5a6372" stroke-width="10" stroke-linecap="round"/>`;
  // Fahne auf dem Gipfel
  s += `<g stroke="${L}" stroke-width="7"><path d="M890 1700 V1380" stroke-width="12"/><path d="M896 1390 h150 l-30 50 l30 50 h-150z" fill="#ef4444"/></g><text x="960" y="1452" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="34" fill="#fff">TOP</text>`;
  s += `<g fill="none" stroke="${L}" stroke-width="4" class="anim-schweben"><path d="M200 520 q14 -14 28 0 q14 -14 28 0"/><path d="M290 570 q10 -10 20 0 q10 -10 20 0"/></g>`;
  return { hinten: svg(s), vorne: licht('gp-licht', 0.25, '#0a2030') };
}

// ======================================================================================
// RINGPLATZ: Dorfplatz in den Bergen – Ringermatte, Holzzaun, Zuschauerreihe, Banner
// o.banner: Text auf dem Banner (Standard "DORF-TURNIER")
// ======================================================================================
function ringplatz(o = {}) {
  const banner = esc(o.banner || 'DORF-TURNIER');
  const r = rng(61);
  let s = linGrad('rp-sky', ['#4fa6ea', '#9fd6f7', '#e3f5ff']) + `<rect width="1080" height="1920" fill="url(#rp-sky)"/>`;
  s += glow('rp-sonne', 180, 290, 340, '#ffffff', 0.6) + `<circle cx="180" cy="290" r="62" fill="#fffbe6"/>`;
  s += wolken(240, 31);
  s += `<path d="M-40 1000 L120 700 L260 820 L420 600 L580 800 L720 640 L880 820 L1000 700 L1120 860 V1120 H-40Z" fill="#8db3d9"/>`;
  s += `<path d="M390 650 L420 600 L450 650 L435 644 L420 662 L405 644Z M690 690 L720 640 L750 690 L735 684 L720 702 L705 684Z" fill="#fff"/>`;
  // Steinhäuser des Dorfs
  for (const [x, y, k] of [[60, 1020, 1], [300, 980, 0.8], [760, 990, 0.85], [960, 1030, 1]]) {
    s += `<g transform="translate(${x} ${y}) scale(${k})" stroke="${L}" stroke-width="7" stroke-linejoin="round"><rect x="-80" y="-120" width="160" height="120" fill="#cdb79a"/><path d="M-96 -116 L0 -180 L96 -116Z" fill="#8a5a3a"/><rect x="-24" y="-64" width="40" height="64" fill="#7a4a2a"/><rect x="-66" y="-96" width="32" height="28" fill="#ffd36b"/></g>`;
  }
  s += `<rect y="1040" width="1080" height="880" fill="#b7a07a"/><path d="M0 1040 H1080" stroke="${L}" stroke-width="8"/>`;
  // Zuschauerreihe hinter dem Zaun (Köpfe, bunte Oberteile)
  const farben = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#ec4899', '#14b8a6'];
  for (let i = 0; i < 13; i++) {
    const x = 40 + i * 82, y = 1030 + (i % 2) * 14;
    s += `<g stroke="${L}" stroke-width="5"><rect x="${x - 34}" y="${y + 10}" width="68" height="90" rx="26" fill="${farben[i % farben.length]}"/><circle cx="${x}" cy="${y - 16}" r="32" fill="${['#f2b98f', '#e8b08a', '#d9a07a', '#f5c7a9'][i % 4]}"/><path d="M${x - 30} ${y - 26} Q${x} ${y - 62} ${x + 30} ${y - 26}" fill="${['#2b1f1a', '#3a2618', '#6b4a2a', '#1f1a16'][i % 4]}"/></g>`;
    if (i % 3 === 0) s += `<path d="M${x + 30} ${y + 20} l26 -50" stroke="${L}" stroke-width="16" stroke-linecap="round"/><path d="M${x + 30} ${y + 20} l26 -50" stroke="#f2b98f" stroke-width="9" stroke-linecap="round"/>`;
  }
  // Holzzaun
  s += `<g stroke="${L}" stroke-width="6"><rect y="1120" width="1080" height="20" fill="#8a5a33"/><rect y="1170" width="1080" height="20" fill="#8a5a33"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 96 + 20}" y="1100" width="20" height="120" fill="#7a4a2a"/>`).join('')}</g>`;
  // Banner zwischen zwei Pfosten
  s += `<g stroke="${L}" stroke-width="7"><rect x="180" y="560" width="18" height="520" fill="#7a4a2a"/><rect x="882" y="560" width="18" height="520" fill="#7a4a2a"/><path d="M198 600 Q540 650 882 600 L882 720 Q540 770 198 720Z" fill="#c62f3c"/></g><text x="540" y="705" text-anchor="middle" font-family="Archivo Black, sans-serif" font-size="70" fill="#ffd43b" stroke="${L}" stroke-width="3">${banner}</text>`;
  // Ringermatte mit Kreis
  s += `<ellipse cx="540" cy="1640" rx="560" ry="230" fill="#2b5fb8" stroke="${L}" stroke-width="10"/><ellipse cx="540" cy="1640" rx="420" ry="168" fill="none" stroke="#ffd43b" stroke-width="16"/><ellipse cx="540" cy="1640" rx="120" ry="46" fill="none" stroke="#fff" stroke-width="10"/>`;
  for (let i = 0; i < 20; i++) s += `<circle cx="${n(r() * 1080)}" cy="${n(1250 + r() * 120)}" r="${n(4 + r() * 6)}" fill="#9a8460" opacity=".6"/>`;
  return { hinten: svg(s), vorne: licht('rp-licht', 0.28, '#0a2030') };
}

// ======================================================================================
// FRISEUR: Salon mit großem Spiegel (Glühbirnen), Regal mit Flaschen, Preistafel,
// Ablage mit Schere/Kamm/Sprühflasche, Schachbrett-Boden mit Haarschnipseln
// Optionen: schild ("SALON"), preis ("25 €"), preisText ("HERREN-\nSCHNITT"), haare (Anzahl Schnipsel, Standard 26)
// ======================================================================================
function friseur(o = {}) {
  const schild = esc(o.schild || 'SALON');
  const preis = esc(o.preis || '25 €');
  const preisZeilen = String(o.preisText || 'HERREN-\nSCHNITT').split('\n').map(esc);
  const r = rng(7);
  let s = linGrad('fr-wand', ['#bfe9e0', '#93d3c5']) + `<rect width="1080" height="1920" fill="url(#fr-wand)"/>`;
  s += Array.from({ length: 14 }, (_, i) => `<rect x="${i * 80}" y="0" width="34" height="1300" fill="#d4f2ea" opacity=".55"/>`).join('');
  s += glow('fr-licht', 540, 300, 620, '#fff6e0', 0.5);
  // Schild oben
  s += `<rect x="250" y="285" width="580" height="130" rx="22" fill="#2a1f3d" stroke="${L}" stroke-width="9"/><text x="540" y="380" text-anchor="middle" font-family="Archivo Black, Montserrat, sans-serif" font-size="88" fill="#ff6b9a" stroke="${L}" stroke-width="3">${schild}</text>`;
  // Großer Spiegel mit Glühbirnen
  s += glow('fr-spiegel', 540, 800, 420, '#fff3c4', 0.45);
  s += linGrad('fr-glas', ['#e6f6ff', '#b9dcf0', '#d8eefa']);
  s += `<g stroke="${L}" stroke-width="10"><rect x="250" y="470" width="580" height="680" rx="36" fill="#f6d98a"/><rect x="290" y="510" width="500" height="600" rx="22" fill="url(#fr-glas)"/></g>`;
  s += `<path d="M340 560 l120 0 M340 600 l60 0 M700 1040 l60 -90" stroke="#fff" stroke-width="16" stroke-linecap="round" opacity=".85"/>`;
  for (let i = 0; i < 6; i++) {
    const y = 540 + i * 110;
    s += `<circle class="anim-puls" cx="270" cy="${y}" r="15" fill="#fff6c9" stroke="${L}" stroke-width="4"/><circle class="anim-puls" cx="810" cy="${y}" r="15" fill="#fff6c9" stroke="${L}" stroke-width="4"/>`;
  }
  // Regal links mit Flaschen
  s += `<g stroke="${L}" stroke-width="6"><rect x="30" y="600" width="190" height="16" fill="#8a5a33"/><rect x="30" y="800" width="190" height="16" fill="#8a5a33"/>`;
  [['#ff6b9a', 0], ['#7c4dff', 1], ['#ffd43b', 2], ['#4cd97b', 0], ['#5aa9ff', 1], ['#ff8a3d', 2]].forEach(([c, k], i) => {
    const x = 46 + (i % 3) * 60, y = i < 3 ? 600 : 800, h = 70 + k * 18;
    s += `<rect x="${x}" y="${y - h}" width="42" height="${h}" rx="10" fill="${c}"/><rect x="${x + 12}" y="${y - h - 16}" width="18" height="18" rx="4" fill="#e9eef3"/>`;
  });
  s += `</g>`;
  // Preistafel rechts
  s += `<g transform="rotate(4 960 660)" stroke="${L}" stroke-width="7"><rect x="868" y="520" width="190" height="290" rx="12" fill="#2f3b36"/><rect x="868" y="520" width="190" height="290" rx="12" fill="none" stroke="#a0703f" stroke-width="12"/></g>`;
  s += `<g transform="rotate(4 960 660)" font-family="Archivo Black, sans-serif" text-anchor="middle" stroke="none">${preisZeilen.map((z, i) => `<text x="963" y="${590 + i * 38}" font-size="30" fill="#fff">${z}</text>`).join('')}<text x="963" y="${600 + preisZeilen.length * 38 + 40}" font-size="58" fill="#ffd43b">${preis}</text></g>`;
  // Friseurstange links unten (dreht sich)
  s += `<defs><clipPath id="fr-stange"><rect x="92" y="930" width="56" height="300" rx="14"/></clipPath></defs><g clip-path="url(#fr-stange)"><rect x="92" y="930" width="56" height="300" fill="#fff"/><g class="anim-schweben">${Array.from({ length: 9 }, (_, i) => `<path d="M60 ${900 + i * 60} l120 -50 v28 l-120 50z" fill="${i % 2 ? '#3d8ef5' : '#e2474b'}"/>`).join('')}</g></g><rect x="92" y="930" width="56" height="300" rx="14" fill="none" stroke="${L}" stroke-width="7"/><rect x="84" y="908" width="72" height="26" rx="12" fill="#c4cbd6" stroke="${L}" stroke-width="6"/><rect x="84" y="1226" width="72" height="26" rx="12" fill="#c4cbd6" stroke="${L}" stroke-width="6"/>`;
  // Ablage unter dem Spiegel mit Schere, Kamm, Sprühflasche
  s += `<g stroke="${L}" stroke-width="7"><rect x="220" y="1150" width="640" height="40" rx="10" fill="#f4f1ea"/><rect x="240" y="1190" width="600" height="110" fill="#e2ddd2"/>`;
  s += `<circle cx="330" cy="1130" r="16" fill="none" stroke-width="7"/><circle cx="366" cy="1130" r="16" fill="none" stroke-width="7"/><path d="M340 1118 l70 -50 M356 1118 l-6 -70" stroke="#9aa3b2" stroke-width="9" stroke-linecap="round"/>`;
  s += `<rect x="690" y="1050" width="44" height="100" rx="10" fill="#7cc8ff"/><path d="M700 1050 v-24 h34 l14 12" fill="#3d3f4c"/><rect x="470" y="1124" width="120" height="22" rx="6" fill="#2a1f3d"/>${Array.from({ length: 9 }, (_, i) => `<path d="M${478 + i * 12} 1146 v18" stroke-width="4"/>`).join('')}</g>`;
  // Schachbrett-Boden + Haarschnipsel
  s += `<rect y="1300" width="1080" height="620" fill="#f4f1ea"/><path d="M0 1300 H1080" stroke="${L}" stroke-width="8"/>`;
  for (let row = 0; row < 6; row++) for (let col = 0; col < 10; col++) if ((row + col) % 2) s += `<rect x="${col * 120 - (row % 2) * 20}" y="${1300 + row * 110}" width="120" height="110" fill="#2a1f3d" opacity=".85"/>`;
  for (let i = 0; i < (o.haare ?? 26); i++) {
    const x = n(40 + r() * 1000), y = n(1330 + r() * 560), w = n(14 + r() * 26);
    s += `<path d="M${x} ${y} q${n(w / 2)} -${n(8 + r() * 10)} ${w} 0" fill="none" stroke="#3a2618" stroke-width="5" stroke-linecap="round"/>`;
  }
  return { hinten: svg(s), vorne: licht('fr-licht2', 0.3, '#0a2a24') };
}

export const HINTERGRUENDE = { friseur, zimmer, strasse, park, gym, bad, bett, laden, theke, couch, kueche, himmel, krankenhaus, kasse, zahnbuerste, kuehlschrank, dusche, haus, imbiss, laufstrecke, waschbecken, berg, gipfel, ringplatz };

// typ: Name aus HINTERGRUENDE oder "sunburst-<farbe>" oder "chat" (lila Sunburst)
export function hintergrund(typ = 'zimmer', o = {}) {
  if (typ === 'chat') return { hinten: sunburst('lila'), vorne: '' };
  if (typ.startsWith('sunburst')) return { hinten: sunburst(typ.split('-')[1] || 'lila'), vorne: '' };
  if (typ.startsWith('spirale')) return { hinten: spirale(typ.split('-')[1] || 'rot'), vorne: '' };
  const fn = HINTERGRUENDE[typ];
  if (!fn) throw new Error(`Unbekannter Hintergrund: ${typ}`);
  return fn(o);
}
