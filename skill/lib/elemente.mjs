// Overlay-Elemente einer Szene. Jede Funktion bekommt (el, ctx) und liefert { html, tl[] }.
// ctx: { id, t (absolute Startzeit in s), ende (Szenenende), zeit(anker) -> s, figurOpts }
import { F, esc, burstPath, posX, posY, n, rng } from './util.mjs';
import { figurSVG, hundSVG, schafSVG, fakeFotoSVG } from './figur.mjs';

const L = F.linie;

export const ICONS = {
  doener: `<circle cx="16" cy="13" r="6" fill="#4cd97b" stroke="currentColor" stroke-width="2"/><circle cx="31" cy="12" r="6" fill="#4cd97b" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="10" r="6" fill="#e2474b" stroke="currentColor" stroke-width="2"/><path d="M10 17l6-5 5 4 6-5 5 5 6-3 1 7H9z" fill="#9b5a2c" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M7 20Q24 14 41 20L32 43Q24 46 16 43Z" fill="#eec07c" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M14 25Q24 22 34 25" fill="none" stroke="#c88f4a" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="34" r="1.6" fill="#c88f4a"/><circle cx="28" cy="31" r="1.6" fill="#c88f4a"/><circle cx="25" cy="39" r="1.6" fill="#c88f4a"/>`,
  kochtopf: `<path d="M9 18h30v18a6 6 0 0 1-6 6H15a6 6 0 0 1-6-6z" fill="#c4cbd6" stroke="currentColor" stroke-width="3"/><path d="M6 18h36" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M2 26h7M39 26h7" stroke="currentColor" stroke-width="5" stroke-linecap="round"/><path d="M15 24v12" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>`,
  paket: `<rect x="6" y="14" width="36" height="28" rx="3" fill="#d9a066" stroke="currentColor" stroke-width="3"/><path d="M6 24h36" stroke="currentColor" stroke-width="3"/><rect x="20" y="14" width="8" height="28" fill="#f5e6b8" stroke="currentColor" stroke-width="2"/><path d="M14 8l10 6 10-6" fill="none" stroke="currentColor" stroke-width="3"/>`,
  hantel: `<path d="M8 24h32" stroke="currentColor" stroke-width="5"/><rect x="4" y="14" width="8" height="20" rx="2" fill="currentColor"/><rect x="36" y="14" width="8" height="20" rx="2" fill="currentColor"/>`,
  pfanne: `<circle cx="20" cy="24" r="13" fill="none" stroke="currentColor" stroke-width="5"/><circle cx="20" cy="24" r="5" fill="#ffd43b"/><path d="M33 24h13" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>`,
  dusche: `<path d="M10 40V10h18" fill="none" stroke="currentColor" stroke-width="4"/><rect x="22" y="8" width="20" height="8" rx="4" fill="currentColor"/>${[26, 31, 36].map((x) => `<path d="M${x} 20v14" stroke="#7cc8ff" stroke-width="3" stroke-linecap="round"/>`).join('')}`,
  koffer: `<rect x="6" y="16" width="36" height="24" rx="4" fill="#8a5a33" stroke="currentColor" stroke-width="3"/><path d="M18 16v-6h12v6" fill="none" stroke="currentColor" stroke-width="4"/><rect x="21" y="25" width="6" height="5" fill="#ffd43b"/>`,
  herz: `<rect x="4" y="6" width="40" height="30" rx="8" fill="#fff" stroke="currentColor" stroke-width="3"/><path d="M14 40l4-6h8z" fill="#fff" stroke="currentColor" stroke-width="3"/><path d="M24 30c-9-6-9-14-4-14 2 0 3 1 4 3 1-2 2-3 4-3 5 0 5 8-4 14z" fill="#ff4d6d"/>`,
  schuh: `<path d="M6 34V18l10 2c4 6 12 8 22 8 4 0 6 3 6 6v2H6z" fill="#fff" stroke="currentColor" stroke-width="3"/><path d="M6 36h38" stroke="currentColor" stroke-width="4"/>`,
  besen: `<path d="M34 6L18 30" stroke="#8a5a33" stroke-width="5" stroke-linecap="round"/><path d="M10 26l14 8-6 10-14-8z" fill="#ffd43b" stroke="currentColor" stroke-width="3"/>`,
  pizza: `<path d="M24 6L42 40H6z" fill="#ffc94d" stroke="currentColor" stroke-width="3"/><circle cx="22" cy="28" r="4" fill="#e2474b"/><circle cx="30" cy="34" r="3" fill="#e2474b"/>`,
  geld: `<rect x="4" y="12" width="40" height="24" rx="4" fill="#4cd97b" stroke="currentColor" stroke-width="3"/><circle cx="24" cy="24" r="6" fill="none" stroke="currentColor" stroke-width="3"/>`,
  buch: `<path d="M6 10h16c2 0 2 2 2 2v28c0-2-2-2-2-2H6z M42 10H26c-2 0-2 2-2 2v28c0-2 2-2 2-2h16z" fill="#7c4dff" stroke="currentColor" stroke-width="3"/>`,
  handy: `<rect x="14" y="4" width="20" height="40" rx="4" fill="#7c4dff" stroke="currentColor" stroke-width="3"/><circle cx="24" cy="38" r="2" fill="#fff"/>`,
  wasser: `<path d="M18 4h12v6l4 6v26H14V16l4-6z" fill="#7cc8ff" stroke="currentColor" stroke-width="3"/>`,
  salat: `<path d="M4 24h40c0 10-8 16-20 16S4 34 4 24z" fill="#fff" stroke="currentColor" stroke-width="3"/><circle cx="16" cy="20" r="6" fill="#4cd97b"/><circle cx="26" cy="18" r="7" fill="#4cd97b"/><circle cx="34" cy="21" r="4" fill="#e2474b"/>`,
  bett: `<rect x="4" y="22" width="40" height="12" rx="3" fill="#5b8fe0" stroke="currentColor" stroke-width="3"/><rect x="6" y="16" width="12" height="8" rx="3" fill="#fff" stroke="currentColor" stroke-width="3"/><path d="M4 34v8M44 34v8" stroke="currentColor" stroke-width="4"/>`,
  rasierer: `<rect x="10" y="6" width="28" height="10" rx="3" fill="#cfd3dd" stroke="currentColor" stroke-width="3"/><path d="M24 16v26" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>`,
  blume: `<circle cx="24" cy="16" r="6" fill="#ffd43b" stroke="currentColor" stroke-width="2"/>${[0, 72, 144, 216, 288].map((a) => `<circle cx="${n(24 + Math.cos((a * Math.PI) / 180) * 10)}" cy="${n(16 + Math.sin((a * Math.PI) / 180) * 10)}" r="6" fill="#ff4d6d"/>`).join('')}<path d="M24 24v20" stroke="#2fbf63" stroke-width="4"/>`,
  zahnbuerste: `<path d="M8 40L38 10" stroke="#7cc8ff" stroke-width="7" stroke-linecap="round"/><rect x="32" y="4" width="12" height="10" rx="2" fill="#fff" stroke="currentColor" stroke-width="2"/>`,
  kamera: `<rect x="4" y="14" width="40" height="26" rx="5" fill="#3d3f4c" stroke="currentColor" stroke-width="3"/><circle cx="24" cy="27" r="8" fill="#7cc8ff" stroke="#fff" stroke-width="3"/><rect x="16" y="8" width="16" height="8" rx="2" fill="#3d3f4c"/>`,
  flugzeug: `<path d="M4 26l40-14-6 8 6 2-6 4 6 8-40-8z" fill="#fff" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/>`,
  burger: `<path d="M8 22c0-10 32-10 32 0z" fill="#e8a24a" stroke="currentColor" stroke-width="3"/><rect x="6" y="24" width="36" height="6" rx="3" fill="#7a3e1d"/><rect x="8" y="32" width="32" height="7" rx="3" fill="#e8a24a" stroke="currentColor" stroke-width="3"/>`,
  flasche: `<path d="M20 4h8v8c0 3 6 6 6 12v18c0 2-2 3-3 3H17c-1 0-3-1-3-3V24c0-6 6-9 6-12z" fill="#7fd99a" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><rect x="14" y="26" width="20" height="10" fill="#fff" opacity=".85"/><path d="M19 14v24" stroke="#fff" stroke-width="3" opacity=".6"/>`,
  pc: `<rect x="4" y="6" width="28" height="22" rx="3" fill="#3d3f4c" stroke="currentColor" stroke-width="3"/><rect x="8" y="10" width="20" height="14" fill="#7c4dff"/><path d="M18 28v6M10 36h16" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><rect x="34" y="8" width="11" height="32" rx="2" fill="#3d3f4c" stroke="currentColor" stroke-width="3"/><circle cx="39.5" cy="16" r="3" fill="#39ff88"/><circle cx="39.5" cy="27" r="3" fill="#ff4d86"/>`,
  kreuz: `<rect x="4" y="4" width="40" height="40" rx="8" fill="#fff" stroke="currentColor" stroke-width="3"/><path d="M19 10h10v9h9v10h-9v9H19v-9h-9V19h9z" fill="#ef4444" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>`,
  spende: `<path d="M8 18h32l-3 24H11z" fill="#ffd43b" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><rect x="18" y="16" width="12" height="4" rx="2" fill="currentColor"/><path d="M24 36c-7-4-7-10-3-10 1 0 2 1 3 2 1-1 2-2 3-2 4 0 4 6-3 10z" fill="#ff4d6d"/><circle cx="24" cy="9" r="6" fill="#ffd43b" stroke="currentColor" stroke-width="3"/>`,
};

export const iconSVG = (name, farbe = L) =>
  `<svg viewBox="0 0 48 48" style="color:${farbe}" xmlns="http://www.w3.org/2000/svg">${ICONS[name] || ICONS.herz}</svg>`;

// Gemeinsame Hülle: Position außen (CSS), Rotation in der Mitte, Animation innen (GSAP).
const huelle = (id, x, y, inner, { rot = 0, z = 20, w } = {}) =>
  `<div class="el" style="left:${x}px;top:${y}px;z-index:${z};${w ? `width:${w}px;` : ''}"><div style="transform:rotate(${rot}deg)"><div class="an" id="${id}">${inner}</div></div></div>`;

export const pop = (id, t, staerke = 2.2) =>
  `tl.fromTo("#${id}",{scale:0,opacity:0},{scale:1,opacity:1,duration:.32,ease:"back.out(${staerke})"},${n(t)});`;
const raus = (id, t) => `tl.to("#${id}",{scale:.6,opacity:0,duration:.18,ease:"power2.in"},${n(t)});`;

// --- Element-Typen ------------------------------------------------------------

function pill(el, c) {
  const html = huelle(c.id, posX(el.x), posY(el.y, 330), `<div class="pill">${esc(el.text)}</div>`, { rot: el.rot || 0 });
  return { html, tl: [pop(c.id, c.zeit(el.bei))] };
}

const SFX_FARBEN = {
  weiss: ['#ffffff', L], gelb: ['#ffd43b', L], orange: ['#ff8a1f', '#fff'], rot: ['#ef4444', '#fff'], pink: ['#ff6b9a', '#fff'],
};

function sfx(el, c) {
  const gr = el.groesse || 1;
  const [bg, txt] = SFX_FARBEN[el.farbe || 'weiss'] || SFX_FARBEN.weiss;
  // Stern wächst mit dem Wort, damit der Text im gefüllten Teil bleibt und lesbar ist
  const zeichen = String(el.text).length;
  const w = Math.min(1000, Math.max(360, zeichen * 80) * gr), h = Math.max(240 * gr, w * 0.42);
  const schrift = Math.min(76 * gr, (w * 0.62) / (zeichen * 0.66));
  let inner = '';
  if (el.stern !== false) {
    inner += `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="position:absolute;left:0;top:0"><path d="${burstPath(w / 2, h / 2, w / 2 - 6, w / 2.9, 14, el.text.length)}" fill="${bg}" stroke="${L}" stroke-width="8" stroke-linejoin="round" transform="scale(1 ${n(h / w)}) translate(0 ${n((w - h) / 2)})"/></svg>`;
  }
  const textFarbe = el.stern === false ? bg : txt;
  inner += `<div class="sfx-text" style="width:${w}px;height:${h}px;font-size:${n(schrift)}px;color:${textFarbe};-webkit-text-stroke:${textFarbe === L ? 0 : 12}px ${L}">${esc(el.text)}</div>`;
  const html = huelle(c.id, posX(el.x), posY(el.y, 700), `<div style="position:relative;width:${w}px;height:${h}px">${inner}</div>`, { rot: el.rot ?? -8, z: 40 });
  const t = c.zeit(el.bei);
  return { html, tl: [pop(c.id, t, 3), `tl.to("#${c.id}",{rotation:3,duration:.08,yoyo:true,repeat:3},${n(t + 0.32)});`] };
}

function schrift(el, c) {
  const farben = { gelb: F.gelb, gruen: '#4cd97b', rot: '#ff4d4d', weiss: '#fff', pink: '#ff6b9a', blau: '#5aa9ff', orange: '#ff9a1f' };
  const farbe = farben[el.farbe || 'gelb'] || el.farbe;
  const gr = el.groesse || 1;
  const html = huelle(c.id, posX(el.x), posY(el.y, 520),
    `<div class="schrift" style="color:${farbe};font-size:${110 * gr}px">${esc(el.text).replace(/\n/g, '<br>')}</div>`, { rot: el.rot ?? -6, z: 40 });
  return { html, tl: [pop(c.id, c.zeit(el.bei), 2.6)] };
}

function zahl(el, c) {
  const stil = el.stil || 'box';
  const t = c.zeit(el.bei);
  const txt = (v) => esc(v);
  let inner, tl = [pop(c.id, t)];
  const zweit = el.dann ? `<div class="zahl-dann" id="${c.id}-b">${txt(el.dann.text)}</div>` : '';
  switch (stil) {
    case 'lineal':
      inner = `<div class="zahl lineal"><div class="ticks"></div><span class="z1" id="${c.id}-a">${txt(el.text)}</span>${zweit}</div>`; break;
    case 'kalender':
      inner = `<div class="zahl kalender"><div class="kal-kopf">${txt(el.oben || 'SPÄTER')}</div><div class="kal-body"><span class="z1" id="${c.id}-a">${txt(el.text)}</span>${zweit}${el.unten ? `<div class="kal-unten">${txt(el.unten)}</div>` : ''}</div></div>`; break;
    case 'waage':
      inner = `<div class="zahl waage"><span class="z1" id="${c.id}-a">${txt(el.text)}</span>${zweit}</div>`; break;
    case 'geld':
      inner = `<div class="zahl geld"><span class="z1" id="${c.id}-a">${txt(el.text)}</span>${zweit}</div>`; break;
    case 'app':
      inner = `<div class="zahl app"><div class="app-titel">${txt(el.oben || 'JOGGING')}</div><svg viewBox="0 0 300 120" class="app-graph"><path d="M20 100 Q80 110 120 70 T200 60 T280 20" fill="none" stroke="#4cd97b" stroke-width="8" stroke-linecap="round"/><circle cx="20" cy="100" r="9" fill="#fff"/><circle cx="280" cy="20" r="9" fill="#ff4d6d"/></svg><span class="z1" id="${c.id}-a">${txt(el.text)}</span>${zweit}</div>`; break;
    default:
      inner = `<div class="zahl box">${el.oben ? `<div class="box-oben">${txt(el.oben)}</div>` : ''}<span class="z1" id="${c.id}-a">${txt(el.text)}</span>${zweit}</div>`;
  }
  if (el.dann) {
    const t2 = c.zeit(el.dann.bei);
    tl.push(`tl.to("#${c.id}-a",{opacity:0,duration:.15},${n(t2)});`);
    tl.push(`tl.fromTo("#${c.id}-b",{opacity:0,scale:.4},{opacity:1,scale:1,duration:.3,ease:"back.out(3)"},${n(t2)});`);
    if (el.dann.farbe) tl.push(`tl.set("#${c.id} .zahl",{backgroundColor:"${el.dann.farbe}"},${n(t2)});`);
  }
  return { html: huelle(c.id, posX(el.x), posY(el.y, 420), inner, { rot: el.rot || 0, z: 30 }), tl };
}

function banner(el, c) {
  const farben = { gruen: '#22c55e', rot: '#f43f5e', blau: '#3b82f6', lila: '#7c4dff', gelb: '#ffd43b', orange: '#f97316' };
  const bg = farben[el.farbe || 'rot'] || el.farbe;
  const inner = `<div class="banner" style="background:${bg};${el.farbe === 'gelb' ? `color:${L}` : ''}"><div class="b-titel">${esc(el.titel).replace(/\n/g, '<br>')}</div>${el.untertitel ? `<div class="b-unter">${esc(el.untertitel)}</div>` : ''}</div>`;
  return { html: huelle(c.id, posX(el.x), posY(el.y, 380), inner, { rot: el.rot || 0, z: 35 }), tl: [pop(c.id, c.zeit(el.bei))] };
}

function callout(el, c) {
  const x = posX(el.x), y = posY(el.y), zx = posX(el.zielX ?? el.x), zy = posY(el.zielY ?? el.y);
  const t = c.zeit(el.bei);
  // Weiße Linie mit dunkler Kontur, damit sie auf hellen und dunklen Hintergründen sichtbar ist
  const html = `<svg class="callout-linie" viewBox="0 0 1080 1920" style="z-index:24"><path id="${c.id}-k" d="M${x} ${y} L${zx} ${zy}" stroke="${L}" stroke-width="11" stroke-linecap="round" fill="none"/><path id="${c.id}-l" d="M${x} ${y} L${zx} ${zy}" stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none"/><circle id="${c.id}-p" cx="${zx}" cy="${zy}" r="11" fill="#fff" stroke="${L}" stroke-width="4"/></svg>` +
    huelle(c.id, x, y, `<div class="label">${esc(el.text)}</div>`, { z: 25 });
  const len = Math.hypot(zx - x, zy - y);
  const linie = (id) => `tl.fromTo("#${id}",{strokeDasharray:${n(len)},strokeDashoffset:${n(len)}},{strokeDashoffset:0,duration:.3},${n(t)});`;
  return {
    html,
    tl: [linie(`${c.id}-k`), linie(`${c.id}-l`),
      `tl.fromTo("#${c.id}-p",{opacity:0},{opacity:1,duration:.1},${n(t)});`, pop(c.id, t + 0.15)],
  };
}

function chat(el, c) {
  const nachrichten = el.nachrichten || [];
  let y = 0;
  const slots = [];
  let vorher = null;
  for (const m of nachrichten) {
    const typ = m.typ || 'text';
    const h = typ === 'sprache' ? 96 : typ === 'tippt' ? 76 : typ === 'foto' ? 300 : 44 + Math.ceil(String(m.text || '').length / 22) * 42;
    if (vorher && vorher.typ === 'tippt') y = vorher.y; // Tipp-Blase wird ersetzt
    slots.push({ ...m, typ, y, h });
    vorher = { typ, y };
    y += h + 22;
  }
  let msgs = '';
  const tl = [pop(c.id, c.zeit(el.bei), 1.6)];
  slots.forEach((m, i) => {
    const mid = `${c.id}-m${i}`;
    const seite = m.von === 'er' ? 'rechts' : 'links';
    let body;
    if (m.typ === 'sprache') {
      body = `<div class="blase sprache"><span class="play">▶</span><span class="welle">${Array.from({ length: 18 }, (_, k) => `<i style="height:${10 + ((k * 7) % 26)}px"></i>`).join('')}</span><span class="dauer">${esc(m.text || '0:03')}</span></div>`;
    } else if (m.typ === 'tippt') {
      body = `<div class="blase tippt"><i></i><i></i><i></i></div>`;
    } else if (m.typ === 'foto') {
      body = `<div class="blase foto"><div class="foto-rahmen">${fakeFotoSVG(3)}<div class="fragen">???</div></div></div>`;
    } else {
      body = `<div class="blase">${esc(m.text)}</div>`;
    }
    msgs += `<div class="msg ${seite}" style="top:${m.y}px"><div class="an" id="${mid}">${body}</div></div>`;
    const t = c.zeit(m.bei);
    tl.push(pop(mid, t, 2));
    if (m.typ === 'tippt' && slots[i + 1]) tl.push(`tl.set("#${mid}",{opacity:0},${n(c.zeit(slots[i + 1].bei) - 0.01)});`);
  });
  const inner = `<div class="handy"><div class="notch"></div><div class="h-kopf"><span class="zurueck">‹</span><span class="avatar">❤</span><div><div class="h-name">${esc(el.name || 'Schatz')}</div><div class="h-online">● online</div></div></div><div class="h-msgs">${msgs}</div><div class="h-eingabe"><span>Nachricht</span><i>➤</i></div></div>`;
  return { html: huelle(c.id, posX(el.x), posY(el.y, 760), inner, { z: 30 }), tl };
}

function umfrage(el, c) {
  const t = c.zeit(el.bei);
  const titel = el.titel || ['LETZTE FOLGE', 'HABT IHR ENTSCHIEDEN'];
  const opts = el.optionen || [];
  const gewinner = el.gewinner ?? opts.reduce((b, o, i) => (o.prozent > opts[b].prozent ? i : b), 0);
  const farben = [F.blau, F.orange, '#22c55e', '#a855f7'];
  const tl = [pop(c.id, t, 1.6)];
  let karten = '';
  opts.forEach((o, i) => {
    const kid = `${c.id}-o${i}`;
    const schritte = 8;
    const zahlen = Array.from({ length: schritte + 1 }, (_, k) => `<b id="${kid}-z${k}" style="opacity:${k ? 0 : 1}">${Math.round((o.prozent * k) / schritte)}%</b>`).join('');
    const farbe = o.farbe || farben[i % 4]; // o.farbe: z. B. Rot für Option C, passend zur Abstimmungskarte
    karten += `<div class="u-karte ${i === gewinner ? 'sieg' : ''}" id="${kid}"><div class="u-icon" style="background:${farbe}">${iconSVG(o.icon || 'herz', '#fff')}</div><div class="u-mitte"><div class="u-text">${esc(o.text)}</div><div class="u-bar"><div class="u-fill" id="${kid}-f" style="background:${farbe}"></div></div></div><div class="u-zahl">${zahlen}</div>${i === gewinner ? `<div class="gewonnen" id="${kid}-g">GEWONNEN!</div>` : ''}</div>`;
    const tb = t + 0.6;
    tl.push(`tl.fromTo("#${kid}-f",{scaleX:0},{scaleX:${o.prozent / 100},duration:1.1,ease:"power2.out"},${n(tb)});`);
    for (let k = 1; k <= schritte; k++) {
      tl.push(`tl.set("#${kid}-z${k - 1}",{opacity:0},${n(tb + (1.1 * k) / schritte)});tl.set("#${kid}-z${k}",{opacity:1},${n(tb + (1.1 * k) / schritte)});`);
    }
    if (i === gewinner) {
      tl.push(`tl.fromTo("#${kid}-g",{scale:0,opacity:0},{scale:1,opacity:1,duration:.35,ease:"back.out(3)"},${n(tb + 1.25)});`);
      tl.push(`tl.to("#${kid}",{scale:1.04,duration:.2,yoyo:true,repeat:1},${n(tb + 1.25)});`);
    }
  });
  const inner = `<div class="umfrage"><div class="u-titel">${esc(titel[0])}<br><span>${esc(titel[1])}</span></div>${karten}</div>`;
  return { html: huelle(c.id, 540, posY(el.y, 560), inner, { z: 30 }), tl };
}

function fakefoto(el, c) {
  const w = el.breite || 420;
  const t = c.zeit(el.bei);
  const tl = [pop(c.id, t)];
  let haken = '';
  (el.haken || []).forEach((h, i) => {
    const hid = `${c.id}-h${i}`;
    haken += `<div class="haken" id="${hid}" style="top:${i * 110}px"><span>✔</span>${esc(h.text || h)}</div>`;
    tl.push(pop(hid, h.bei != null ? c.zeit(h.bei) : t + 0.6 + i * 0.6));
  });
  const inner = `<div class="fakefoto" style="width:${w}px">${el.label ? `<div class="ff-label ${el.labelFarbe || ''}">${esc(el.label)}</div>` : ''}<div class="ff-bild">${fakeFotoSVG(5)}<div class="fragen">???</div></div>${haken ? `<div class="haken-liste">${haken}</div>` : ''}</div>`;
  return { html: huelle(c.id, posX(el.x), posY(el.y, 900), inner, { rot: el.rot || 0, z: 28 }), tl };
}

function folgen(el, c) {
  const t = c.zeit(el.bei);
  const inner = `<div class="folgen"><div class="f-knopf">+ FOLGEN</div>${el.frage !== false ? `<div class="f-frage">${esc(el.frage || 'SCHAFFT ER ES?')}</div>` : ''}</div>`;
  return {
    html: huelle(c.id, 540, posY(el.y, 380), inner, { z: 45 }),
    tl: [pop(c.id, t, 2.6), `tl.to("#${c.id} .f-knopf",{scale:1.08,duration:.35,yoyo:true,repeat:${Math.max(1, Math.floor((c.ende - t - 0.4) / 0.35))},ease:"sine.inOut"},${n(t + 0.4)});`],
  };
}

function icon(el, c) {
  const gr = el.groesse || 160;
  return { html: huelle(c.id, posX(el.x), posY(el.y), `<div style="width:${gr}px;height:${gr}px">${iconSVG(el.icon, L)}</div>`, { rot: el.rot || 0, z: 26 }), tl: [pop(c.id, c.zeit(el.bei))] };
}

function hund(el, c) {
  const w = el.breite || 320;
  const t = c.zeit(el.bei);
  const spiegel = el.richtung === 'links' ? 'scaleX(-1)' : '';
  const tl = [pop(c.id, t)];
  if (el.laufen !== false) tl.push(`tl.to("#${c.id}",{y:-14,duration:.16,yoyo:true,repeat:${Math.max(1, Math.floor((c.ende - t) / 0.16))},ease:"sine.inOut"},${n(t + 0.3)});`);
  return { html: huelle(c.id, posX(el.x, 820), posY(el.y, 1620), `<div style="width:${w}px;transform:${spiegel}">${hundSVG()}</div>`, { z: 22 }), tl };
}

// Schaf (hüpft wie der Hund, "rein": "seite" läuft ins Bild)
function schaf(el, c) {
  const w = el.breite || 300;
  const t = c.zeit(el.bei);
  const spiegel = el.richtung === 'links' ? 'scaleX(-1)' : '';
  const tl = [el.rein === 'seite'
    ? `tl.fromTo("#${c.id}",{x:${posX(el.x) > 540 ? 700 : -700}},{x:0,duration:.6,ease:"power2.out"},${n(t)});`
    : pop(c.id, t)];
  if (el.laufen !== false) tl.push(`tl.to("#${c.id} .schaf-hop",{y:-16,duration:.17,yoyo:true,repeat:${Math.max(1, Math.floor((c.ende - t) / 0.17))},ease:"sine.inOut"},${n(t + 0.1)});`);
  return { html: huelle(c.id, posX(el.x, 820), posY(el.y, 1560), `<div class="schaf-hop" style="width:${w}px;transform:${spiegel}">${schafSVG()}</div>`, { z: el.z || 22 }), tl };
}

// Weitere Figur (Oma, Trainer, Security, Freundin ...) mit beliebigen Figur-Optionen
function nebenfigur(el, c) {
  const w = el.breite || 520;
  const svgFig = figurSVG({ fliegen: false, pickel: false, flecken: false, bauch: false, ...el.figur }, el.ausdruck || 'neutral', el.pose || 'stehen', c.id);
  const inner = `<div style="width:${w}px;${el.spiegeln ? 'transform:scaleX(-1)' : ''}">${svgFig}</div>${el.sprechblase ? `<div class="sprechblase" id="${c.id}-sb">${esc(el.sprechblase)}</div>` : ''}`;
  const t = c.zeit(el.bei);
  const tl = [el.rein === 'seite'
    ? `tl.fromTo("#${c.id}",{x:${posX(el.x) > 540 ? 700 : -700}},{x:0,duration:.5,ease:"power3.out"},${n(t)});`
    : pop(c.id, t, 1.8)];
  if (el.sprechblase) tl.push(pop(`${c.id}-sb`, el.sprechblaseBei != null ? c.zeit(el.sprechblaseBei) : t + 0.5));
  return { html: huelle(c.id, posX(el.x, 800), posY(el.y, 1200), inner, { z: el.z || 18 }), tl };
}

// Porträtkarte, z. B. "Karla, 21"
function karte(el, c) {
  const svgFig = figurSVG({ fliegen: false, pickel: false, flecken: false, bauch: false, gewicht: 0.1, weiblich: true, haare: 'lang', haarFarbe: '#7a3b1e', shirt: '#9fd3ff', ...el.figur }, el.ausdruck || 'gluecklich', 'stehen', c.id);
  const inner = `<div class="karte" style="zoom:${el.groesse || 1}"><div class="k-bild"><div class="k-fig">${svgFig}</div></div><div class="k-name">${esc(el.name || '')}</div></div>`;
  return { html: huelle(c.id, posX(el.x), posY(el.y, 820), inner, { rot: el.rot ?? -3, z: 28 }), tl: [pop(c.id, c.zeit(el.bei), 1.8)] };
}

function bild(el, c) {
  return { html: huelle(c.id, posX(el.x), posY(el.y), `<img src="${esc(el.src)}" style="width:${el.breite || 500}px;display:block">`, { rot: el.rot || 0, z: el.z || 26 }), tl: [pop(c.id, c.zeit(el.bei))] };
}

function sprechblase(el, c) {
  return { html: huelle(c.id, posX(el.x), posY(el.y, 600), `<div class="sprechblase gross">${esc(el.text)}</div>`, { rot: el.rot || 0, z: 38 }), tl: [pop(c.id, c.zeit(el.bei))] };
}

// Info-Zettel wie "Zuletzt benutzt: vor 14 Tagen" (zweite Zeile rot)
function notiz(el, c) {
  const inner = `<div class="notiz"><div class="n-oben">${esc(el.titel || 'Zuletzt benutzt:')}</div><div class="n-text">${esc(el.text)}</div></div>`;
  return { html: huelle(c.id, posX(el.x, 270), posY(el.y, 520), inner, { rot: el.rot ?? -4, z: 34 }), tl: [pop(c.id, c.zeit(el.bei), 2.6)] };
}

// Sperrbildschirm mit Uhrzeit + Benachrichtigung (Hook)
function sperrbildschirm(el, c) {
  const t = c.zeit(el.bei);
  const nid = `${c.id}-n`;
  const inner = `<div class="handy sperr"><div class="notch"></div><div class="s-zeit">${esc(el.uhr || '21:47')}</div><div class="s-tag">${esc(el.tag || 'Donnerstag')}</div><div class="s-noti" id="${nid}"><span class="s-av">${esc((el.name || 'L')[0])}</span><div><b>${esc(el.name || 'Lea')}</b><div>${esc(el.text || '')}</div></div></div></div>`;
  return { html: huelle(c.id, 540, posY(el.y, 860), inner, { z: 30 }), tl: [pop(c.id, t, 1.6), `tl.fromTo("#${nid}",{y:-80,opacity:0},{y:0,opacity:1,duration:.35,ease:"back.out(2)"},${n(c.zeit(el.nachrichtBei ?? el.bei) + (el.nachrichtBei ? 0 : 0.5))});`] };
}

// Kartenterminal "KARTE ABGELEHNT"
function terminal(el, c) {
  const t = c.zeit(el.bei);
  const tasten = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '✕', '0', 'OK'].map((k, i) => `<i class="${i === 9 ? 'rot' : i === 11 ? 'gruen' : ''}">${k}</i>`).join('');
  const inner = `<div class="terminal"><div class="t-screen"><div class="t-x" id="${c.id}-x">✕</div><div class="t-text" id="${c.id}-t">${esc(el.text || 'KARTE').replace(/\n/g, '<br>')}<br><span>${esc(el.rot || 'ABGELEHNT')}</span></div></div><div class="t-tasten">${tasten}</div></div>`;
  const tl = [pop(c.id, t, 1.6), `tl.fromTo("#${c.id}-x",{scale:0},{scale:1,duration:.3,ease:"back.out(3)"},${n(c.zeit(el.ablehnenBei ?? el.bei) + (el.ablehnenBei ? 0 : 0.35))});`];
  tl.push(`tl.to("#${c.id}",{x:14,duration:.05,yoyo:true,repeat:7},${n(c.zeit(el.ablehnenBei ?? el.bei) + (el.ablehnenBei ? 0 : 0.35))});`);
  return { html: huelle(c.id, posX(el.x, 540), posY(el.y, 900), inner, { rot: el.rot ?? -6, z: 30 }), tl };
}

// Straßenschild mit Pfeil, z. B. "SUPERMARKT 300 m →"
function schild(el, c) {
  const inner = `<div class="schild"><div class="sch-tafel"><b>${esc(el.text)}</b>${el.unter ? `<span>${esc(el.unter)}</span>` : ''}</div><div class="sch-pfahl"></div></div>`;
  return { html: huelle(c.id, posX(el.x, 860), posY(el.y, 900), inner, { rot: el.rot || 0, z: 12 }), tl: [pop(c.id, c.zeit(el.bei), 1.8)] };
}

// Herzen, die aufsteigen (Verliebt-Moment, Chat)
function herzen(el, c) {
  const t = c.zeit(el.bei);
  const anzahl = el.anzahl || 9;
  let html = '';
  const tl = [];
  for (let i = 0; i < anzahl; i++) {
    const hid = `${c.id}-h${i}`;
    const x = 140 + ((i * 97) % 800), y = 1250 + ((i * 53) % 300), gr = 50 + ((i * 29) % 50);
    html += huelle(hid, x, y, `<div class="herz-fl" style="font-size:${gr}px">❤</div>`, { z: 44 });
    const t0 = t + i * 0.12, dauer = 1.6 + (i % 4) * 0.25;
    // Steigen (y/scale) und Ein-/Ausblenden (opacity) getrennt, damit sich keine Tweens überlappen
    tl.push(`tl.fromTo("#${hid}",{y:0,scale:.3},{y:-${700 + (i % 3) * 200},scale:1,duration:${n(dauer)},ease:"power1.out"},${n(t0)});`);
    tl.push(`tl.fromTo("#${hid}",{opacity:0},{opacity:1,duration:.2},${n(t0)});tl.to("#${hid}",{opacity:0,duration:.35},${n(t0 + dauer - 0.35)});`);
  }
  return { html, tl };
}

// Runder Stempel/Sticker mit gestrichelter Innenlinie: „TARNUNG“, „47 €“, „+3 LOLLIS“, „BESSERE IDEE?“
const STEMPEL_FARBEN = {
  gelb: ['#ffd43b', L], rot: ['#ef4444', '#fff'], gruen: ['#22c55e', '#fff'], orange: ['#ff9a1f', L],
  blau: ['#3b82f6', '#fff'], weiss: ['#ffffff', L], lila: ['#7c4dff', '#fff'], pink: ['#ff6b9a', '#fff'],
};
function stempel(el, c) {
  const d = el.groesse || 220;
  const [bg, fg] = STEMPEL_FARBEN[el.farbe || 'gelb'] || STEMPEL_FARBEN.gelb;
  const zeilen = String(el.text).split('\n');
  const laengste = Math.max(...zeilen.map((z) => z.length));
  const fs = Math.min(d * 0.32, (d * 1.15) / Math.max(4, laengste), (d * 0.66) / zeilen.length);
  const inner = `<div class="stempel" style="width:${d}px;height:${d}px;background:${bg};color:${fg}"><div class="st-ring" style="border-color:${fg}"></div><div class="st-text" style="font-size:${n(fs)}px">${esc(el.text).replace(/\n/g, '<br>')}</div></div>`;
  const t = c.zeit(el.bei);
  return {
    html: huelle(c.id, posX(el.x), posY(el.y, 600), inner, { rot: el.rot ?? -10, z: 36 }),
    tl: [`tl.fromTo("#${c.id}",{scale:2.2,opacity:0,rotation:-25},{scale:1,opacity:1,rotation:0,duration:.28,ease:"back.out(2)"},${n(t)});`],
  };
}

// Handy mit App-Liste (Verkaufs-App, Trade-App, Kontoauszug): Zeilen poppen nacheinander auf, optional Knopf
function liste(el, c) {
  const t = c.zeit(el.bei);
  const tl = [pop(c.id, t, 1.6)];
  let rows = '';
  (el.zeilen || []).forEach((z, i) => {
    const rid = `${c.id}-z${i}`;
    rows += `<div class="l-zeile${z.markiert ? ' mark' : ''}" style="top:${i * 118}px"><div class="an" id="${rid}"><span class="l-text">${esc(z.text)}</span><span class="l-wert" style="color:${{ gruen: '#16a34a', rot: '#e11d48' }[z.farbe] || z.farbe || '#16a34a'}">${esc(z.wert ?? '')}</span></div></div>`;
    tl.push(pop(rid, z.bei != null ? c.zeit(z.bei) : t + 0.4 + i * 0.35, 2));
  });
  let knopf = '';
  if (el.knopf) {
    knopf = `<div class="l-knopf"><div class="an" id="${c.id}-k">${esc(el.knopf.text || el.knopf)}</div></div>`;
    const tk = el.knopf.bei != null ? c.zeit(el.knopf.bei) : t + 0.5;
    tl.push(pop(`${c.id}-k`, tk, 2.4), `tl.to("#${c.id}-k",{scale:.9,duration:.08,yoyo:true,repeat:1},${n(tk + 0.5)});`);
  }
  const inner = `<div class="handy liste"><div class="notch"></div><div class="l-kopf">${esc(el.titel || 'APP')}</div><div class="l-zeilen">${rows}</div>${knopf}</div>`;
  return { html: huelle(c.id, posX(el.x), posY(el.y, 900), inner, { z: 30 }), tl };
}

// Konfetti-Regen (Erfolg, Gewinn) – deterministisch
function konfetti(el, c) {
  const r = rng(el.seed || 7);
  const t = c.zeit(el.bei);
  const farben = ['#ffd43b', '#ff4d86', '#39ff88', '#5aa9ff', '#ff9a1f', '#a855f7'];
  let html = '';
  const tl = [];
  for (let i = 0; i < (el.anzahl || 46); i++) {
    const pid = `${c.id}-k${i}`;
    const x = Math.round(r() * 1080), w = 14 + Math.round(r() * 14);
    html += `<div id="${pid}" style="position:absolute;left:${x}px;top:-60px;width:${w}px;height:${Math.round(w * 0.55)}px;background:${farben[i % farben.length]};border-radius:3px;z-index:44;opacity:0"></div>`;
    const dauer = 1.6 + r() * 1.2, start = t + r() * 0.5;
    tl.push(`tl.fromTo("#${pid}",{opacity:1,y:0,x:0,rotation:0},{opacity:1,y:${1700 + Math.round(r() * 300)},x:${Math.round((r() - 0.5) * 240)},rotation:${Math.round(r() * 720)},duration:${n(dauer)},ease:"power1.in"},${n(start)});`);
  }
  return { html, tl };
}

// Steckbrief-Chip neben der Figur: „22 Jahre“, „Job: keiner“ (farbige Pille, poppt seitlich rein)
const INFO_FARBEN = { blau: ['#3b82f6', '#fff'], grau: ['#e5e7eb', L], rot: ['#ef4444', '#fff'], gelb: ['#ffd43b', L], gruen: ['#22c55e', '#fff'], lila: ['#7c4dff', '#fff'], dunkel: ['#2a2140', '#ffd43b'] };
function info(el, c) {
  const [bg, fg] = INFO_FARBEN[el.farbe || 'blau'] || INFO_FARBEN.blau;
  const inner = `<div class="info-chip" style="background:${bg};color:${fg};font-size:${el.groesse || 44}px">${el.icon ? `<i>${esc(el.icon)}</i>` : ''}${esc(el.text)}</div>`;
  const t = c.zeit(el.bei);
  return {
    html: huelle(c.id, posX(el.x), posY(el.y, 500), inner, { rot: el.rot ?? -3, z: 34 }),
    tl: [`tl.fromTo("#${c.id}",{x:${posX(el.x) > 540 ? 120 : -120},opacity:0,scale:.6},{x:0,opacity:1,scale:1,duration:.3,ease:"back.out(2.4)"},${n(t)});`],
  };
}

// Namensschild mit Zipfel zur Figur: gelbe Sprechblase „MO“
function namensschild(el, c) {
  const zipfel = el.zipfel || 'unten-rechts';
  const inner = `<div class="namensschild ${zipfel}"><span>${esc(el.text)}</span></div>`;
  return { html: huelle(c.id, posX(el.x), posY(el.y, 420), inner, { rot: el.rot ?? -4, z: 35 }), tl: [pop(c.id, c.zeit(el.bei), 3)] };
}

// Gestrichelter roter Kreis, der langsam rotiert und eine Problemzone markiert (Kopf, Bauch)
function kreis(el, c) {
  const d = (el.radius || 240) * 2, t = c.zeit(el.bei);
  const svg = `<svg width="${d + 20}" height="${d + 20}" viewBox="0 0 ${d + 20} ${d + 20}" style="display:block;overflow:visible"><g id="${c.id}-r"><circle cx="${d / 2 + 10}" cy="${d / 2 + 10}" r="${d / 2}" fill="rgba(239,68,68,.08)" stroke="${L}" stroke-width="16" stroke-dasharray="46 26"/><circle cx="${d / 2 + 10}" cy="${d / 2 + 10}" r="${d / 2}" fill="none" stroke="${el.farbe || '#ef4444'}" stroke-width="9" stroke-dasharray="46 26"/></g></svg>`;
  return {
    html: huelle(c.id, posX(el.x), posY(el.y), svg, { z: 22 }),
    tl: [pop(c.id, t, 2.4), `tl.fromTo("#${c.id}-r",{rotation:0},{rotation:${Math.round((c.ende - t) * 24)},svgOrigin:"${d / 2 + 10} ${d / 2 + 10}",duration:${n(Math.max(0.2, c.ende - t))},ease:"none"},${n(t)});`],
  };
}

// Handy mit laufendem Kurzvideo und Aufrufzähler: zeigt eine Figur (figur, ausdruck) und optional ein Icon im Bild
function handyvideo(el, c) {
  const t = c.zeit(el.bei);
  const tl = [pop(c.id, t, 1.6)];
  let zahl = `<b id="${c.id}-a">${esc(el.aufrufe ?? '0')}</b>`;
  if (el.dann) {
    const t2 = c.zeit(el.dann.bei);
    zahl += `<b id="${c.id}-b" style="opacity:0">${esc(el.dann.text)}</b>`;
    tl.push(`tl.set("#${c.id}-a",{opacity:0},${n(t2)});tl.fromTo("#${c.id}-b",{opacity:0,scale:.3},{opacity:1,scale:1,duration:.3,ease:"back.out(3)"},${n(t2)});`);
  }
  const fig = el.figur ? `<div class="v-fig">${figurSVG({ fliegen: false, pickel: false, flecken: false, bauch: false, ...el.figur }, el.ausdruck || 'gluecklich', el.pose || 'stehen', `${c.id}-f`)}</div>` : '';
  const motiv = el.icon ? `<div class="v-icon-bild">${iconSVG(el.icon, L)}</div>` : '';
  const inner = `<div class="handy video" style="background:${el.farbe || '#bfe3da'}"><div class="notch"></div>${fig}${motiv}<div class="v-name">${esc(el.name || 'Video')}</div><div class="v-aufrufe">${el.live ? '<span class="v-live">● LIVE</span>' : '<span>▶</span>'}<span class="v-zahl">${zahl}</span><span>${esc(el.zaehler || 'Aufrufe')}</span></div></div>`;
  return { html: huelle(c.id, posX(el.x), posY(el.y, 900), inner, { rot: el.rot || 0, z: 30 }), tl };
}

// ---------- Job-Serie ----------------------------------------------------------
// Wahl mit Countdown direkt im Video: Frage, Karten A (blau) / B (orange), Countdown-Kreis
// (Ziffern an die gesprochenen Wörter "Drei", "zwei", "eins" geankert), dann Auflösung:
// richtige Karte grün mit „✓ RICHTIG“, falsche abgedunkelt mit rotem ✗.
// { typ:"wahl", frage, a:{text,icon,bei}, b:{...}, richtig:"a"|"b", zaehlen:["Drei","zwei","eins"], aufloesungBei, y }
export function wahlZeiten(el, c) {
  const t = c.zeit(el.bei);
  const zaehlen = (el.zaehlen || ['Drei', 'zwei', 'eins']).map((a) => c.zeit(a));
  const ta = el.aufloesungBei != null ? c.zeit(el.aufloesungBei) : (zaehlen[zaehlen.length - 1] ?? t + 3) + 0.7;
  return { t, zaehlen, ta };
}
function wahl(el, c) {
  const { t, zaehlen, ta } = wahlZeiten(el, c);
  const id = c.id;
  const y0 = posY(el.y, 560); // Oberkante Karte A
  const richtig = el.richtig || 'a';
  const tl = [];
  let html = '';
  if (el.frage) {
    html += `<div class="w-frage" style="top:${y0 - 190}px"><div class="an" id="${id}-f">${esc(el.frage).replace(/\n/g, '<br>')}</div></div>`;
    tl.push(pop(`${id}-f`, t, 2));
  }
  ['a', 'b'].forEach((k, j) => {
    const o = el[k] || {};
    const top = y0 + j * 230;
    const ok = k === richtig;
    html += `<div class="v-karte ${k} w-karte" style="top:${top}px"><div class="w-huelle" id="${id}-${k}h"><div class="an v-inhalt" id="${id}-${k}"><div class="v-buchst">${k.toUpperCase()}</div><div class="v-text">${esc(o.text).replace(/\n/g, '<br>')}</div><div class="v-icon">${iconSVG(o.icon || 'herz', '#fff')}</div></div></div>` +
      (ok ? `<div class="w-richtig" id="${id}-${k}-ok">✓ RICHTIG</div>` : `<div class="w-x" id="${id}-${k}-x">✗</div>`) + `</div>`;
    const tk = o.bei != null ? c.zeit(o.bei) : t + 0.3 + j * 0.35;
    tl.push(`tl.fromTo("#${id}-${k}",{x:${j % 2 ? 1100 : -1100}},{x:0,duration:.4,ease:"back.out(1.4)"},${n(tk)});`);
    if (ok) {
      tl.push(`tl.to("#${id}-${k}",{backgroundColor:"#22c55e",duration:.15},${n(ta)});`);
      tl.push(`tl.set("#${id}-${k} .v-buchst",{color:"#16a34a"},${n(ta)});`);
      tl.push(`tl.to("#${id}-${k}h",{scale:1.07,duration:.18,yoyo:true,repeat:3,ease:"sine.inOut"},${n(ta)});`);
      tl.push(`tl.fromTo("#${id}-${k}-ok",{scale:2.2,opacity:0,rotation:-20},{scale:1,opacity:1,rotation:8,duration:.3,ease:"back.out(2)"},${n(ta + 0.1)});`);
    } else {
      tl.push(`tl.to("#${id}-${k}h",{opacity:.45,scale:.94,duration:.25},${n(ta)});`);
      tl.push(`tl.fromTo("#${id}-${k}-x",{scale:3,opacity:0},{scale:1,opacity:1,duration:.25,ease:"back.out(2)"},${n(ta + 0.15)});`);
    }
  });
  // Countdown-Kreis unter den Karten
  if (zaehlen.length) {
    const yU = el.uhrY ?? y0 + 2 * 230 + 130;
    const U = 2 * Math.PI * 86;
    const ziffern = zaehlen.map((_, i) => `<div class="w-ziffer" id="${id}-z${i}" style="opacity:0">${zaehlen.length - i}</div>`).join('');
    html += `<div class="el" style="left:540px;top:${yU}px;z-index:32"><div class="an w-uhr" id="${id}-u"><svg viewBox="0 0 220 220"><circle cx="110" cy="110" r="102" fill="#2a2140" stroke="#fff" stroke-width="8"/><circle id="${id}-ring" cx="110" cy="110" r="86" fill="none" stroke="#22c55e" stroke-width="18" stroke-linecap="round" stroke-dasharray="${n(U)}" stroke-dashoffset="0" transform="rotate(-90 110 110)"/></svg>${ziffern}</div></div>`;
    const farben = ['#22c55e', '#ffd43b', '#ef4444'];
    tl.push(pop(`${id}-u`, zaehlen[0] - 0.15, 2.4));
    zaehlen.forEach((tz, i) => {
      if (i) tl.push(`tl.set("#${id}-z${i - 1}",{opacity:0},${n(tz)});`);
      tl.push(`tl.set("#${id}-z${i}",{opacity:1},${n(tz)});tl.fromTo("#${id}-z${i}",{scale:1.8},{scale:1,duration:.3,ease:"back.out(3)"},${n(tz)});`);
      tl.push(`tl.set("#${id}-ring",{attr:{stroke:"${farben[Math.min(farben.length - 1, Math.round((i * (farben.length - 1)) / Math.max(1, zaehlen.length - 1)))]}"}},${n(tz)});`);
      tl.push(`tl.fromTo("#${id}-u",{scale:1.12},{scale:1,duration:.25,ease:"power2.out"},${n(tz)});`);
    });
    tl.push(`tl.fromTo("#${id}-ring",{attr:{"stroke-dashoffset":0}},{attr:{"stroke-dashoffset":${n(U)}},duration:${n(Math.max(0.3, ta - zaehlen[0]))},ease:"none"},${n(zaehlen[0])});`);
    tl.push(`tl.to("#${id}-u",{scale:0,opacity:0,duration:.2,ease:"power2.in"},${n(ta)});`);
  }
  return { html, tl };
}

// Wertung am Ende: Zeilen poppen nacheinander ein. { typ:"wertung", titel, zeilen:[{punkte:"3/3", text, farbe, bei}] }
const WERTUNG_FARBEN = { gruen: '#22c55e', gelb: '#ffd43b', orange: '#f97316', rot: '#ef4444', blau: '#3b82f6', lila: '#7c4dff' };
function wertung(el, c) {
  const t = c.zeit(el.bei);
  const tl = [pop(c.id, t, 1.8)];
  const std = ['gruen', 'gelb', 'orange', 'rot'];
  let zeilen = '';
  (el.zeilen || []).forEach((z, i) => {
    const zid = `${c.id}-r${i}`;
    const farbe = WERTUNG_FARBEN[z.farbe || std[i % 4]] || z.farbe;
    zeilen += `<div class="wt-zeile" id="${zid}"><div class="wt-punkte" style="background:${farbe}">${esc(z.punkte)}</div><div class="wt-text">${esc(z.text)}</div></div>`;
    tl.push(`tl.fromTo("#${zid}",{x:${i % 2 ? 900 : -900},opacity:0},{x:0,opacity:1,duration:.32,ease:"back.out(1.6)"},${n(z.bei != null ? c.zeit(z.bei) : t + 0.35 + i * 0.45)});`);
  });
  const titel = el.titel === false ? '' : `<div class="wt-titel">${esc(el.titel || 'DEINE PUNKTE?')}</div>`;
  return { html: huelle(c.id, 540, posY(el.y, 820), `<div class="wertung">${titel}${zeilen}</div>`, { z: 34 }), tl };
}

export const ELEMENTE = { pill, sfx, schrift, zahl, banner, callout, chat, umfrage, fakefoto, folgen, icon, hund, nebenfigur, karte, bild, sprechblase, notiz, sperrbildschirm, terminal, schild, herzen, stempel, liste, konfetti, info, namensschild, kreis, handyvideo, schaf, wahl, wertung };

export function element(el, ctx) {
  const fn = ELEMENTE[el.typ];
  if (!fn) throw new Error(`Unbekannter Element-Typ: ${el.typ}`);
  const res = fn(el, ctx);
  // "sofort": true = steht schon im allerersten Bild komplett (Hook), ohne Einblend-Animation
  if (el.sofort) res.tl = res.tl.filter((x) => !x.startsWith(`tl.fromTo("#${ctx.id}",`));
  if (el.weg != null) res.tl.push(raus(ctx.id, ctx.zeit(el.weg)));
  return res;
}
