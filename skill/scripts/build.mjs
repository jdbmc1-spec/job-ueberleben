#!/usr/bin/env node
// Baut aus folge.json (+ voice.mp3/alignment.json) ein fertiges Hyperframes-Projekt.
// Aufruf: node build.mjs <folgen-ordner> [--entwurf] [--nur-sounds]
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { esc, n, posX } from '../lib/util.mjs';
import { figurSVG, STANDARD_FIGUR, OUTFITS } from '../lib/figur.mjs';
import { hintergrund } from '../lib/hintergrund.mjs';
import { element, iconSVG, pop, wahlZeiten } from '../lib/elemente.mjs';
import { zerlege, wortZeiten, norm, ladeFolge } from '../lib/text.mjs';

const HF_VERSION = '0.8.223';
const SKILL = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const ordner = path.resolve(process.argv[2] || '.');
const entwurf = process.argv.includes('--entwurf');
const nurSounds = process.argv.includes('--nur-sounds');
const folge = ladeFolge(ordner);
const projekt = path.join(ordner, 'projekt');
if (!nurSounds) fs.mkdirSync(path.join(projekt, 'assets'), { recursive: true });

// ---------- Timing ----------
const zer = zerlege(folge);
const alignPfad = path.join(ordner, 'alignment.json');
const voicePfad = path.join(ordner, 'voice.mp3');
const hatStimme = !entwurf && !process.argv.includes('--stumm') && fs.existsSync(alignPfad) && fs.existsSync(voicePfad);
const alignment = hatStimme ? JSON.parse(fs.readFileSync(alignPfad, 'utf8')).alignment : null;
if (!hatStimme && !entwurf) console.warn('⚠ Keine voice.mp3/alignment.json gefunden → Entwurf mit geschätzten Zeiten, ohne Ton.');
const { dauer: sprechDauer } = wortZeiten(zer, alignment);
const W = zer.woerter;
const NACHLAUF = folge.nachlauf ?? 1.6;
const GESAMT = n(Math.max(sprechDauer, W.length ? W[W.length - 1].end : 0) + NACHLAUF);

const szenen = folge.szenen.map((s, i) => ({ ...s, i, w0: zer.ersteWort[i], w1: i + 1 < folge.szenen.length ? zer.ersteWort[i + 1] : W.length }));
szenen.forEach((s, i) => {
  s.start = i === 0 ? 0 : n(Math.max(0, (W[s.w0]?.start ?? 0) - 0.06));
});
szenen.forEach((s, i) => { s.ende = i + 1 < szenen.length ? szenen[i + 1].start : GESAMT; });

function zeitIn(s) {
  return (anker) => {
    if (anker == null) return s.start + (s.i === 0 ? 0.05 : 0.02);
    if (typeof anker === 'number') return s.start + anker;
    const teile = String(anker).split(/\s+/).map(norm).filter(Boolean);
    for (let k = s.w0; k < s.w1; k++) {
      if (teile.every((t, j) => W[k + j] && norm(W[k + j].text).startsWith(t))) return W[k].start;
    }
    throw new Error(`Szene ${s.i + 1}: Anker "${anker}" kommt im Text nicht vor: "${s.text}"`);
  };
}

// ---------- Figur ----------
const RAHMEN = {
  ganz: { w: 720, kopfOben: 640 },
  klein: { w: 520, kopfOben: 860 },
  halbnah: { w: 1000, kopfOben: 520 },
  nah: { w: 1400, kopfOben: 560 },
  kopf: { w: 1100, kopfOben: 600 },
};
const tl = [];
const audio = [];
const glowupSchritte = [];
const kasseSchritte = [];
const risikoSchritte = [];
const rundenSchritte = []; // Job-Serie: { typ: "runde", nr: 2, bei } → „RUNDE 2/3“ im HUD

// ---------- Sounds: Sammler + automatische Zuordnung (wie in den Referenzvideos) ----------
const KATALOG = JSON.parse(fs.readFileSync(path.join(SKILL, 'sounds', 'katalog.json'), 'utf8'));
const SOUND_ORDNER = path.join(process.env.USERPROFILE || process.env.HOME || '.', 'GlowUp', '_sounds');
// --stumm: Video ganz ohne Ton (keine Stimme, Sounds, Musik) – z. B. Vorschau ohne ElevenLabs-Guthaben
const stumm = process.argv.includes('--stumm');
const autoSounds = folge.sounds !== false && !stumm;
const toene = []; // { key, t, prio, laut }
function ton(key, t, prio = 1, laut) {
  if (!stumm && key && t != null && Number.isFinite(t)) toene.push({ key, t: Math.max(0, t), prio, laut });
}
const normWort = (s) => String(s).toUpperCase().replace(/[^\p{L}\p{N}!?€❤ -]/gu, '');
// Comic-Wort im Bild -> Katalog-Sound über die Schlagworte (längstes passendes Schlagwort gewinnt)
function soundFuerText(text) {
  const t = normWort(text);
  let best = null, len = 0;
  for (const [k, v] of Object.entries(KATALOG)) {
    for (const w of v.schlagworte || []) if (t.includes(w) && w.length > len) { best = k; len = w.length; }
  }
  return best;
}
function autoTon(el, t, zeit) {
  if (!autoSounds || el.ton === false) return;
  if (typeof el.ton === 'string') return ton(el.ton.replace(/\.mp3$/, ''), t, 3, el.tonLautstaerke);
  switch (el.typ) {
    case 'sfx': return ton(soundFuerText(el.text) || 'zack', t, 2);
    case 'schrift': return ton(soundFuerText(el.text) || (/!/.test(el.text) ? 'schock' : 'pop'), t, 2);
    case 'banner': return ton(el.farbe === 'rot' || !el.farbe ? 'schock' : el.farbe === 'gruen' ? 'erfolg' : 'pop', t, 2);
    case 'karte': return ton('herz', t, 1);
    case 'hund': return ton('bellen', t + 0.25, 2);
    case 'nebenfigur': return ton(el.rein === 'seite' ? 'whoosh' : 'pop', t, 1);
    case 'zahl':
      ton('pop', t, 1);
      if (el.dann) {
        const t2 = zeit(el.dann.bei);
        const gut = /^[-+]/.test(el.dann.text) || /gr(ü|ue)n|#22c55e|#39ff88/i.test(el.dann.farbe || '');
        ton(gut ? 'erfolg' : 'pop', t2, gut ? 2 : 1);
      }
      return;
    case 'fakefoto':
      ton('pop', t, 1);
      (el.haken || []).forEach((h, i) => ton('haken', h.bei != null ? zeit(h.bei) : t + 0.6 + i * 0.6, 1));
      return;
    case 'chat':
      ton('pop', t, 1);
      (el.nachrichten || []).forEach((m) => { if (m.typ !== 'tippt') ton(m.von === 'er' ? 'nachricht-senden' : 'nachricht-ping', zeit(m.bei), 2); });
      return;
    case 'umfrage': ton('zaehler', t + 0.6, 1); ton('erfolg', t + 1.85, 2); return;
    case 'sperrbildschirm': ton('nachricht-ping', zeit(el.nachrichtBei ?? el.bei) + (el.nachrichtBei ? 0 : 0.5), 2); return;
    case 'terminal': ton('pop', t, 1); ton('fehler', zeit(el.ablehnenBei ?? el.bei) + (el.ablehnenBei ? 0 : 0.35), 3); return;
    case 'wahl': {
      // Karten rein, Ticken pro Countdown-Ziffer, Auflösung: Fanfare für die richtige Karte, leiser Fail-Sound für die falsche
      const { zaehlen, ta } = wahlZeiten(el, { zeit });
      ton('spannung-hit', t, 1);
      ['a', 'b'].forEach((k, j) => ton('whoosh-karte', el[k]?.bei != null ? zeit(el[k].bei) : t + 0.3 + j * 0.35, 1));
      zaehlen.forEach((tz) => ton('zaehler', tz, 2));
      ton('erfolg', ta, 3);
      ton('fail', ta + 0.45, 1, 0.35);
      return;
    }
    case 'wertung':
      ton('pop', t, 1);
      (el.zeilen || []).forEach((z, i) => ton('haken', z.bei != null ? zeit(z.bei) : t + 0.35 + i * 0.45, 1));
      return;
    case 'herzen': return ton('herz', t, 1);
    case 'schaf': return ton('schaf', t + 0.3, 2);
    case 'notiz': return ton('haken', t, 1);
    default: return ton('pop', t, 1);
  }
}

function figurBlock(s, id) {
  const f = s.figur;
  if (!f || f === false) return '';
  const opts = { ...STANDARD_FIGUR, ...folge.figur, ...(OUTFITS[f.outfit] || {}), ...(f.optionen || {}) };
  const r = RAHMEN[f.rahmen || 'ganz'] || RAHMEN.ganz;
  const w = f.breite || r.w;
  const scale = w / 600;
  const top = (f.kopfOben ?? r.kopfOben) - 100 * scale;
  const x = posX(f.x, 540);
  const zustaende = [{ ausdruck: f.ausdruck || 'neutral', pose: f.pose || 'stehen' }, ...(f.wechsel || [])];
  let inner = '';
  zustaende.forEach((z, k) => {
    const o = { ...opts, ...(z.optionen || {}) };
    inner += `<div class="zustand" id="${id}-z${k}" style="opacity:${k ? 0 : 1}">${figurSVG(o, z.ausdruck || zustaende[k - 1]?.ausdruck, z.pose || f.pose || 'stehen', `${id}-z${k}`)}</div>`;
    if (k) {
      const t = s.zeit(z.bei);
      tl.push(`tl.set("#${id}-z${k - 1}",{opacity:0},${n(t)});tl.set("#${id}-z${k}",{opacity:1},${n(t)});`);
      tl.push(`tl.fromTo("#${id}-z${k}",{scale:1.05},{scale:1,duration:.2,ease:"back.out(3)"},${n(t)});`);
      if (autoSounds && z.ton !== false) ton(typeof z.ton === 'string' ? z.ton : ['schock', 'panik'].includes(z.ausdruck) ? 'schock' : z.ausdruck === 'erschoepft' ? 'hecheln' : z.ausdruck === 'anstrengung' ? 'anstrengung' : null, t, 1);
    }
  });
  const dauer = s.ende - s.start;
  // Atmen + Fliegen (endliche Wiederholungen, deterministisch)
  tl.push(`tl.to("#${id} .fig-in",{scaleY:1.018,scaleX:0.992,duration:.9,yoyo:true,repeat:${Math.max(1, Math.floor(dauer / 0.9))},ease:"sine.inOut"},${n(s.start)});`);
  if (opts.fliegen) {
    tl.push(`gsap.utils.toArray("#${id} .fliege").forEach((el,k)=>{tl.to(el,{x:"+="+(k%2?28:-26),y:"-="+(14+k*4),rotation:k%2?20:-20,duration:.28+k*.04,yoyo:true,repeat:${Math.max(1, Math.floor(dauer / 0.3))},ease:"sine.inOut"},${n(s.start)});});`);
  }
  if (f.huepfen) {
    const t = s.zeit(f.huepfen === true ? null : f.huepfen);
    tl.push(`tl.to("#${id} .fig-hop",{y:-60,duration:.22,yoyo:true,repeat:3,ease:"power1.out"},${n(t)});`);
    if (autoSounds) ton('boing', t, 1);
  }
  if (f.rein) {
    const von = { links: '{x:-900}', rechts: '{x:900}', unten: '{y:900}', pop: '{scale:.3,opacity:0}' }[f.rein] || '{scale:.3,opacity:0}';
    tl.push(`tl.from("#${id} .fig-hop",${von.replace('}', ',duration:.45,ease:"back.out(1.6)"}')},${n(s.zeit(f.reinBei))});`);
    if (autoSounds) ton(f.rein === 'pop' ? 'pop' : 'whoosh', s.zeit(f.reinBei), 1);
  }
  if (autoSounds && f.ton) ton(f.ton, s.start + 0.05, 2); // Sound beim Szenenstart, z. B. "schnarchen"
  if (f.zittern) tl.push(`tl.to("#${id} .fig-hop",{x:8,duration:.05,yoyo:true,repeat:11},${n(s.zeit(f.zittern))});`);
  // Gehen: Beine abwechselnd heben, Körper wippt; "wandern" schiebt die Figur durchs Bild (x von → nach)
  if (f.gehen) {
    const tg = s.zeit(f.gehen === true ? null : f.gehen);
    const schritte = Math.max(2, Math.floor((s.ende - tg) / 0.28));
    tl.push(`tl.to("#${id} .bein-l",{y:-26,duration:.14,yoyo:true,repeat:${schritte},ease:"sine.inOut"},${n(tg)});`);
    tl.push(`tl.to("#${id} .bein-r",{y:-26,duration:.14,yoyo:true,repeat:${schritte},ease:"sine.inOut"},${n(tg + 0.14)});`);
    tl.push(`tl.to("#${id} .fig-in",{y:-10,duration:.14,yoyo:true,repeat:${schritte * 2},ease:"sine.inOut"},${n(tg)});`);
  }
  if (f.wandern) {
    const von = posX(f.wandern.von ?? f.x, 540) - x, nach = posX(f.wandern.nach, 540) - x;
    tl.push(`tl.fromTo("#${id} .fig-hop",{x:${von}},{x:${nach},duration:${n(s.ende - s.start)},ease:"none"},${n(s.start)});`);
  }
  // Kontaktschatten unter den Füßen (Füße liegen bei y≈918 von 940 im viewBox der Figur)
  const schattenY = n(w * (918 / 600));
  return `<div class="figur" id="${id}" style="left:${x}px;top:${n(top)}px;width:${w}px;${f.spiegeln ? 'transform:translate(-50%,0) scaleX(-1);' : ''}"><div class="fig-schatten" style="top:${schattenY}px"></div><div class="fig-hop"><div class="fig-in">${inner}</div></div></div>`;
}

// ---------- Szenen ----------
let szenenHTML = '';
let wischHTML = '';
const WISCH = { gelb: '#ffd23f', pink: '#ff4d86', lila: '#7c4dff', rot: '#ef4444', blau: '#3b82f6', weiss: '#ffffff' };

for (const s of szenen) {
  s.zeit = zeitIn(s);
  const sid = `s${s.i + 1}`;
  let inner = '';
  const typ = s.typ || 'szene';
  if (typ === 'abstimmung') {
    s.hintergrund = s.hintergrund || 'sunburst-lila';
    s.figur = s.figur === false ? false : { rahmen: 'nah', ausdruck: 'neutral', ...(s.figur || {}) };
    s.abdunkeln = s.abdunkeln ?? true;
  }
  const bg = hintergrund(s.hintergrund || 'zimmer', s.hintergrundOptionen || {});
  inner += bg.hinten;
  inner += figurBlock(s, `${sid}-fig`);
  if (bg.vorne) inner += `<div class="vorne-ebene">${bg.vorne}</div>`;
  if (s.abdunkeln) inner += `<div class="abdunkeln"></div>`;

  if (typ === 'abstimmung') {
    const name = (s.name || folge.name || 'ER').toUpperCase();
    const frage = s.frage || ['WAS SOLL', `${name} TUN?`];
    inner += `<div class="v-titel"><div class="an" id="${sid}-titel">${esc(frage[0])}<br><span>${esc(frage[1])}</span></div></div>`;
    tl.push(pop(`${sid}-titel`, s.zeit(s.frageBei), 2));
    if (autoSounds) ton('spannung-hit', s.zeit(s.frageBei), 2);
    // 2 oder 3 Optionen (A blau, B orange, C rot); "unter" = kleine Teaser-Zeile („schnell reich – oder pleite“)
    const drei = !!s.c;
    const kartenH = drei ? 180 : 190, abstand = drei ? 205 : 230;
    ['a', 'b', 'c'].forEach((k, j) => {
      const o = s[k];
      if (!o) return;
      const unter = o.unter ? `<small>${esc(o.unter)}</small>` : '';
      inner += `<div class="v-karte ${k}" style="top:${560 + j * abstand}px;height:${kartenH}px"><div class="an v-inhalt" id="${sid}-${k}"><div class="v-buchst">${k.toUpperCase()}</div><div class="v-text">${esc(o.text).replace(/\n/g, '<br>')}${unter}</div><div class="v-icon">${iconSVG(o.icon || 'herz', '#fff')}</div></div></div>`;
      tl.push(`tl.fromTo("#${sid}-${k}",{x:${j % 2 ? 1100 : -1100}},{x:0,duration:.4,ease:"back.out(1.4)"},${n(s.zeit(o.bei))});`);
      if (autoSounds) ton('whoosh-karte', s.zeit(o.bei), 2);
    });
    const komY = drei ? 1190 : 1060;
    inner += `<div class="v-kommentar" style="top:${komY}px"><div class="an" id="${sid}-kom"><div class="pill" style="font-size:36px">${esc(s.kommentarText || (drei ? 'Schreib A, B oder C in die Kommentare! 👇' : 'Schreib A oder B in die Kommentare! 👇'))}</div></div></div>`;
    const letzte = s.c || s.b;
    const tKom = s.zeit(s.kommentarBei ?? (letzte?.bei)) + (s.kommentarBei ? 0 : 0.8);
    tl.push(pop(`${sid}-kom`, tKom));
    if (autoSounds) ton('pop', tKom, 1);
    // Zusatz-Weg: "topKommentar": { "likes": 500, "bei": "Top" } – der Top-Kommentar gewinnt ab X Likes
    if (s.topKommentar) {
      const tk = s.topKommentar;
      inner += `<div class="v-kommentar" style="top:${komY + 95}px"><div class="an" id="${sid}-top"><div class="v-top">ODER: TOP-KOMMENTAR MIT ${esc(tk.likes ?? 500)} <span>❤</span> GEWINNT</div></div></div>`;
      const tTop = s.zeit(tk.bei);
      tl.push(pop(`${sid}-top`, tTop, 2.6));
      if (autoSounds) ton('haken', tTop, 2);
    }
    if (s.folgenBei !== false) {
      const r = element({ typ: 'folgen', frage: false, y: (drei ? 1400 : 1250) + (s.topKommentar ? 55 : 0), bei: s.folgenBei }, { id: `${sid}-folgen`, zeit: s.zeit, ende: s.ende });
      inner += r.html; tl.push(...r.tl);
    }
    // „BESSERE IDEE?“-Stempel: lädt zu eigenen Ideen in den Kommentaren ein (mehr Kommentare)
    if (s.bessereIdee) {
      const b = typeof s.bessereIdee === 'object' ? s.bessereIdee : {};
      const r = element({ typ: 'stempel', text: b.text || 'BESSERE\nIDEE?', farbe: b.farbe || 'gelb', groesse: 180, x: 170, y: drei ? 1430 : 1260, rot: -12, bei: b.bei ?? s.kommentarBei }, { id: `${sid}-idee`, zeit: s.zeit, ende: s.ende });
      inner += r.html; tl.push(...r.tl);
      if (autoSounds) ton('pop', s.zeit(b.bei ?? s.kommentarBei) + 0.4, 1);
    }
    s.musikWechsel = true;
  }

  (s.elemente || []).forEach((el, k) => {
    const eid = `${sid}-e${k + 1}`;
    const t = s.zeit(el.bei);
    if (el.typ === 'risiko') {
      risikoSchritte.push({ t, plus: el.plus ?? 0 });
      if (autoSounds && el.ton !== false) ton(typeof el.ton === 'string' ? el.ton : (el.plus ?? 0) > 0 ? 'schock' : 'erfolg', t, 2);
      return;
    }
    if (el.typ === 'runde') {
      rundenSchritte.push({ t, nr: el.nr ?? rundenSchritte.length + 1 });
      if (autoSounds && el.ton !== false) ton(typeof el.ton === 'string' ? el.ton : 'whoosh-karte', t, 2);
      return;
    }
    if (el.typ === 'wertung') s.musikWechsel = true;
    if (el.typ === 'kasse') {
      kasseSchritte.push({ t, plus: el.plus ?? 0 });
      if (autoSounds && el.ton !== false) ton(typeof el.ton === 'string' ? el.ton : 'geld', t, 2);
      return;
    }
    if (el.typ === 'glowup' || el.typ === 'geld') {
      glowupSchritte.push({ t, plus: el.plus ?? 1 });
      if (autoSounds && el.ton !== false) ton(typeof el.ton === 'string' ? el.ton : (el.plus ?? 1) < 0 ? 'schock' : 'erfolg', t, 2);
      return;
    }
    if (el.typ === 'wackeln') {
      tl.push(`tl.to("#${sid}-kam",{x:18,y:-10,duration:.05,yoyo:true,repeat:9},${n(t)});`);
      if (autoSounds && el.ton !== false) ton(typeof el.ton === 'string' ? el.ton : 'bass-hit', t, 2);
      return;
    }
    if (el.typ === 'ton') { ton((el.datei || el.sound || '').replace(/\.mp3$/, ''), t, 3, el.lautstaerke); return; }
    const r = element(el, { id: eid, zeit: s.zeit, ende: s.ende });
    inner += r.html;
    tl.push(...r.tl);
    autoTon(el, t, s.zeit);
  });

  // Kamera: kurzer Punch beim Schnitt, optional langsamer Zoom
  const kam = s.kamera || 'punch';
  if (kam === 'punch' && s.i > 0) tl.push(`tl.fromTo("#${sid}-kam",{scale:1.07},{scale:1,duration:.35,ease:"power2.out"},${n(s.start)});`);
  if (kam === 'zoom') tl.push(`tl.fromTo("#${sid}-kam",{scale:1},{scale:1.12,duration:${n(s.ende - s.start)},ease:"none"},${n(s.start)});`);
  // Hook: startet weit und springt in unter einer Sekunde aufs Gesicht, danach langsames Weiterzoomen
  if (kam === 'hook') {
    const z = s.hookZoom ?? 1.9;
    tl.push(`tl.fromTo("#${sid}-kam",{scale:1},{scale:${z},duration:.6,ease:"power3.out"},${n(s.start)});`);
    tl.push(`tl.to("#${sid}-kam",{scale:${n(z + 0.12)},duration:${n(Math.max(0.2, s.ende - s.start - 0.65))},ease:"none"},${n(s.start + 0.65)});`);
  }
  if (kam === 'zoom-raus') tl.push(`tl.fromTo("#${sid}-kam",{scale:1.18},{scale:1,duration:${n(s.ende - s.start)},ease:"power1.out"},${n(s.start)});`);

  // Lebendiger Hintergrund: Klassen aus lib/hintergrund.mjs (endliche Wiederholungen, deterministisch)
  const d = n(s.ende - s.start), t0 = n(s.start);
  const hat = (k) => inner.includes(k);
  if (hat('anim-puls')) tl.push(`gsap.utils.toArray("#${sid} .anim-puls").forEach((el,k)=>tl.to(el,{opacity:.55,duration:.9+k*.25,yoyo:true,repeat:${Math.max(1, Math.floor(d / 0.9))},ease:"sine.inOut"},${t0}));`);
  if (hat('anim-hue')) tl.push(`gsap.utils.toArray("#${sid} .anim-hue").forEach((el)=>tl.fromTo(el,{filter:"hue-rotate(0deg)"},{filter:"hue-rotate(${Math.round(d * 40)}deg)",duration:${d},ease:"none"},${t0}));`);
  if (hat('anim-dreh')) tl.push(`gsap.utils.toArray("#${sid} .anim-dreh").forEach((el)=>tl.fromTo(el,{rotation:0},{rotation:${Math.round(d * 540)},svgOrigin:el.dataset.cx+" "+el.dataset.cy,duration:${d},ease:"none"},${t0}));`);
  if (hat('anim-schweben')) tl.push(`gsap.utils.toArray("#${sid} .anim-schweben").forEach((el,k)=>tl.to(el,{x:"+="+(${n(d * 9)}+k*6),duration:${d},ease:"none"},${t0}));`);
  if (hat('anim-flacker')) for (const [dt, op] of [[0.6, 0.35], [0.66, 1], [0.8, 0.5], [0.86, 1], [2.4, 0.3], [2.48, 1]]) {
    if (dt < d) tl.push(`tl.set("#${sid} .anim-flacker",{opacity:${op}},${n(s.start + dt)});`);
  }

  // Stimmung "traurig": entsättigt + dunkler (Tiefpunkt vor der Abstimmung) mit traurigem Sound
  const stimmung = s.stimmung ? ` stimmung-${s.stimmung}` : '';
  if (s.stimmung === 'traurig' && autoSounds && s.stimmungTon !== false) ton('traurig', s.start + 0.05, 2);
  let bild = `<div class="kamera${stimmung}" id="${sid}-kam">${inner}</div>`;
  // Layout "karte" (wie Einstiege erfolgreicher Serien): Szene als abgerundete Karte auf Sternenhimmel,
  // Kapitel-Titel darüber, Untertitel darunter. "karteFokus" = welche Bildhöhe (y im 1080×1920-Bild) in der Kartenmitte liegt.
  if (s.layout === 'karte') {
    const K = { x: 50, y: 330, w: 980, h: 900 };
    const sc = K.w / 1080;
    const ty = n(K.h / 2 - (s.karteFokus ?? 1120) * sc);
    const vorher = szenen[s.i - 1];
    const neuesKapitel = s.i > 0 && s.kapitel && !(vorher?.layout === 'karte' && vorher.kapitel === s.kapitel);
    const kap = s.kapitel ? `<div class="kapitel"><div class="an" id="${sid}-kap">${esc(s.kapitel)}</div></div>` : '';
    if (neuesKapitel) tl.push(`tl.fromTo("#${sid}-kap",{y:-30,opacity:0},{y:0,opacity:1,duration:.3,ease:"back.out(2)"},${n(s.start)});`);
    // Karte nur beim Wechsel aus dem Vollbild einfliegen lassen
    // (nicht in Szene 1: das allererste Bild muss sofort komplett stehen – Hook)
    if (s.i > 0 && vorher?.layout !== 'karte') tl.push(`tl.fromTo("#${sid}-karte",{scale:.85,opacity:0},{scale:1,opacity:1,duration:.4,ease:"back.out(1.6)"},${n(s.start)});`);
    bild = `<div class="karte-bg"></div>${kap}<div class="karte-rahmen" id="${sid}-karte" style="left:${K.x}px;top:${K.y}px;width:${K.w}px;height:${K.h}px"><div class="karte-inhalt" style="transform:translate(0px,${ty}px) scale(${n(sc)})">${bild}</div></div>`;
  }
  szenenHTML += `<div id="${sid}" class="clip szene" data-start="${s.start}" data-duration="${n(s.ende - s.start)}" data-track-index="1" style="z-index:${s.i + 1}">${bild}</div>\n`;

  if (s.uebergang && s.uebergang.startsWith('wisch') && s.i > 0) {
    const farbe = WISCH[s.uebergang.split('-')[1] || 'gelb'] || WISCH.gelb;
    const wid = `w${s.i + 1}`;
    const t0 = Math.max(0, s.start - 0.22);
    wischHTML += `<div id="${wid}" class="clip" data-start="${n(t0)}" data-duration="0.5" data-track-index="3" style="z-index:90;pointer-events:none"><div class="wisch" id="${wid}-p" style="background:${farbe}"></div></div>\n`;
    tl.push(`tl.fromTo("#${wid}-p",{xPercent:-110},{xPercent:0,duration:.22,ease:"power2.in"},${n(t0)});tl.to("#${wid}-p",{xPercent:110,duration:.26,ease:"power2.out"},${n(t0 + 0.25)});`);
    if (autoSounds) ton('whoosh', t0, 2);
  }
}

// ---------- Töne auflösen ----------
// Reihenfolge der Quellen: eigener Ordner der Folge (sfx/), Serien-Bibliothek (_sounds), Skill (sounds/)
const soundDatei = (key) => [path.join(ordner, 'sfx', `${key}.mp3`), path.join(SOUND_ORDNER, `${key}.mp3`), path.join(SKILL, 'sounds', `${key}.mp3`)].find((p) => fs.existsSync(p));
// Gleichzeitige Sounds ausdünnen: innerhalb 120 ms gewinnt die höhere Priorität, gleicher Sound nicht öfter als alle 300 ms
toene.sort((a, b) => a.t - b.t || b.prio - a.prio);
const gemischt = [];
for (const e of toene) {
  const nah = gemischt.find((g) => Math.abs(g.t - e.t) < 0.12);
  if (nah) { if (e.prio > nah.prio) Object.assign(nah, e); continue; }
  if (gemischt.some((g) => g.key === e.key && Math.abs(g.t - e.t) < 0.3)) continue;
  gemischt.push({ ...e });
}
const vote = szenen.find((s) => s.musikWechsel);
const eigeneMusik = ['musik.mp3', 'musik.wav'].map((d) => path.join(ordner, d)).find((p) => fs.existsSync(p));
const musikPlan = folge.musik === false || stumm ? [] : [
  { key: 'musik-hintergrund', von: 0, bis: vote && soundDatei('musik-abstimmung') ? vote.start : GESAMT, quelle: eigeneMusik },
  ...(vote ? [{ key: 'musik-abstimmung', von: vote.start, bis: GESAMT }] : []),
];
const benoetigt = new Set([...gemischt.map((g) => g.key), ...musikPlan.filter((m) => !m.quelle).map((m) => m.key)]);
if (nurSounds) {
  console.log(JSON.stringify([...benoetigt].filter((k) => KATALOG[k])));
  process.exit(0);
}
const fehlend = [...benoetigt].filter((k) => !soundDatei(k) && !(k === 'musik-hintergrund' && eigeneMusik));
if (fehlend.length) console.warn(`⚠ ${fehlend.length} Sounds fehlen (${fehlend.join(', ')}) → node "${path.join(SKILL, 'scripts', 'sfx.mjs')}" --fuer "${ordner}"`);
fs.mkdirSync(path.join(projekt, 'assets', 'sfx'), { recursive: true });
const laengen = {};
const laenge = (datei) => (laengen[datei] ??= Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', datei], { encoding: 'utf8' }).trim()));
const spurEnde = []; // überlappende Sounds auf eigene Spuren (Track 10, 11, 12 …) verteilen
gemischt.forEach((g, i) => {
  const q = soundDatei(g.key);
  if (!q) return;
  fs.copyFileSync(q, path.join(projekt, 'assets', 'sfx', `${g.key}.mp3`));
  const d = n(Math.min(laenge(q), GESAMT - g.t));
  if (d <= 0.05) return;
  let spur = spurEnde.findIndex((ende) => ende <= g.t);
  if (spur < 0) spur = spurEnde.push(0) - 1;
  spurEnde[spur] = g.t + d;
  audio.push(`<audio id="ton${i}" src="assets/sfx/${esc(g.key)}.mp3" data-start="${n(g.t)}" data-duration="${d}" data-track-index="${10 + spur}" data-volume="${g.laut ?? KATALOG[g.key]?.lautstaerke ?? 0.6}"></audio>`);
});
// Musik: Loop per ffmpeg auf die nötige Länge bringen (mit Aus-Blende)
for (const m of musikPlan) {
  const q = m.quelle || soundDatei(m.key);
  const dauer = n(m.bis - m.von);
  if (!q || dauer <= 0.2) continue;
  const ziel = path.join(projekt, 'assets', `${m.key}.mp3`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-stream_loop', '-1', '-i', q, '-t', String(dauer), '-af', `afade=t=out:st=${Math.max(0, dauer - 0.4)}:d=0.4`, ziel]);
  const laut = (m.key === 'musik-hintergrund' ? folge.musikLautstaerke : folge.musikAbstimmungLautstaerke) ?? KATALOG[m.key].lautstaerke;
  audio.push(`<audio id="${m.key}" src="assets/${m.key}.mp3" data-start="${n(m.von)}" data-duration="${dauer}" data-track-index="${m.von > 0 ? 7 : 6}" data-volume="${laut}"${m.von > 0 ? ' data-fade-in="0.3"' : ''}></audio>`);
}

// ---------- HUD ----------
// Fortschrittsbalken: Standard Glow-Up in %, per "balken" (serie.json/folge.json) z. B. Geld bis zum Ziel:
// "balken": { "label": "OP-GELD", "format": "euro", "ziel": 1000000 }  · Startwert: "stand" (sonst "glowup")
const balken = { label: '✦GLOW-UP', format: 'prozent', ziel: 100, ...(folge.balken || {}) };
const istEuro = balken.format === 'euro';
const fmtWert = (v) => istEuro ? `${v.toLocaleString('de-DE', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 })} €` : `${v}%`;
const fmtPlus = (p) => `${p < 0 ? '−' : '+'}${fmtWert(Math.abs(p))}`;
// Bei großen Zielen (1 Mio.) wäre der Balken sonst unsichtbar – ab dem ersten Euro ein kleines Stück zeigen
const anteil = (v) => Math.max(0.0001, v / balken.ziel, v > 0 && istEuro ? 0.02 : 0);
const zeigeBar = folge.glowupAnzeigen ?? (folge.balken ? true : folge.job ? false : folge.folge > 1);
// Job-Serie: "job": "Kasse" → „JOB #1 · KASSE“ statt „FOLGE 1 · NOCH X TAGE“
let hud = folge.job
  ? `<div class="hud-zeile"><span class="hud-folge">JOB #${esc(folge.folge)}</span><span class="hud-job">${esc(folge.job)}</span></div>`
  : `<div class="hud-zeile"><span class="hud-folge">FOLGE ${esc(folge.folge)}</span><span class="hud-tage"><span class="herz">♥</span>NOCH ${esc(folge.tage)} TAGE</span></div>`;
// „RUNDE x/3“ unter der Kopfzeile, erscheint mit dem ersten runde-Element und wechselt bei jedem weiteren
if (rundenSchritte.length) {
  const gesamt = folge.runden ?? Math.max(...rundenSchritte.map((r) => r.nr));
  rundenSchritte.sort((a, b) => a.t - b.t);
  hud += `<div class="hud-runde">${rundenSchritte.map((r, k) => `<b id="runde-${k}" style="opacity:0">RUNDE ${esc(r.nr)}/${esc(gesamt)}</b>`).join('')}</div>`;
  rundenSchritte.forEach((r, k) => {
    if (k) tl.push(`tl.set("#runde-${k - 1}",{opacity:0},${n(r.t)});`);
    tl.push(`tl.set("#runde-${k}",{opacity:1},${n(r.t)});tl.fromTo("#runde-${k}",{scale:1.6},{scale:1,duration:.3,ease:"back.out(3)"},${n(r.t)});`);
  });
  if (folge.rundeEnde) { // z. B. in der Wertung ausblenden: "rundeEnde": { "szene": 12 }
    const sz = szenen[(folge.rundeEnde.szene || 1) - 1];
    tl.push(`tl.to("#runde-${rundenSchritte.length - 1}",{opacity:0,duration:.2},${n(sz.zeit(folge.rundeEnde.bei))});`);
  }
}
if (zeigeBar) {
  let wert = folge.stand ?? folge.glowup ?? 0;
  const werte = [wert];
  glowupSchritte.sort((a, b) => a.t - b.t).forEach((g) => { wert = Math.round(Math.min(balken.ziel, Math.max(0, wert + g.plus)) * 100) / 100; werte.push(wert); });
  hud += `<div class="hud-bar${istEuro ? ' euro' : ''}"><span class="lbl">${esc(balken.label)}</span><div class="spur"><div class="fill" id="hud-fill"></div></div><span class="pz">${werte.map((v, k) => `<b id="hud-pz${k}" style="opacity:${k ? 0 : 1}">${esc(fmtWert(v))}</b>`).join('')}</span></div>`;
  if (istEuro && balken.zielText !== false) hud += `<div class="hud-ziel">ZIEL: ${esc(balken.zielText || fmtWert(balken.ziel))}</div>`;
  tl.push(`tl.set("#hud-fill",{scaleX:${anteil(werte[0])}},0);`);
  glowupSchritte.forEach((g, k) => {
    hud += `<div class="hud-plus${g.plus < 0 ? ' minus' : ''}" id="hud-plus${k}">${esc(fmtPlus(g.plus))}</div>`;
    tl.push(`tl.to("#hud-fill",{scaleX:${anteil(werte[k + 1])},duration:.5,ease:"power2.out"},${n(g.t)});`);
    tl.push(`tl.set("#hud-pz${k}",{opacity:0},${n(g.t + 0.25)});tl.set("#hud-pz${k + 1}",{opacity:1},${n(g.t + 0.25)});`);
    tl.push(`tl.fromTo("#hud-plus${k}",{opacity:0,y:20,scale:.5},{opacity:1,y:0,scale:1,duration:.3,ease:"back.out(3)"},${n(g.t)});tl.to("#hud-plus${k}",{opacity:0,y:-30,duration:.4},${n(g.t + 1.4)});`);
  });
}
// Geld-Leiste unter dem Balken: "kasse": { "label": "KAIS KASSE", "stand": 0 }, Änderungen mit { "typ": "kasse", "plus": 12, "bei": "..." }
if (folge.kasse) {
  const fmtEuro = (v) => `${v.toLocaleString('de-DE', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 })} €`;
  let wert = folge.kasse.stand ?? 0;
  const werte = [wert];
  kasseSchritte.sort((a, b) => a.t - b.t).forEach((g) => { wert = Math.round((wert + g.plus) * 100) / 100; werte.push(wert); });
  hud += `<div class="hud-kasse"><span class="k-muenze">€</span><span class="k-label">${esc(folge.kasse.label || 'KASSE')}</span><span class="k-wert">${werte.map((v, k) => `<b id="kasse-w${k}" style="opacity:${k ? 0 : 1}">${esc(fmtEuro(v))}</b>`).join('')}</span></div>`;
  kasseSchritte.forEach((g, k) => {
    hud += `<div class="hud-plus kasse${g.plus < 0 ? ' minus' : ''}" id="kasse-plus${k}">${g.plus < 0 ? '−' : '+'}${esc(fmtEuro(Math.abs(g.plus)))}</div>`;
    tl.push(`tl.set("#kasse-w${k}",{opacity:0},${n(g.t + 0.2)});tl.set("#kasse-w${k + 1}",{opacity:1},${n(g.t + 0.2)});tl.fromTo("#kasse-w${k + 1}",{scale:1.5},{scale:1,duration:.3,ease:"back.out(3)"},${n(g.t + 0.2)});`);
    tl.push(`tl.fromTo("#kasse-plus${k}",{opacity:0,y:20,scale:.5},{opacity:1,y:0,scale:1,duration:.3,ease:"back.out(3)"},${n(g.t)});tl.to("#kasse-plus${k}",{opacity:0,y:-30,duration:.4},${n(g.t + 1.4)});`);
  });
}
// Zweite Anzeige als Gegenspieler zum Geld (Risiko in %, bei 100 % passiert etwas Schlimmes):
// "risiko": { "label": "🚨 KLINIK-ÄRGER", "stand": 30 }, Änderungen mit { "typ": "risiko", "plus": 20, "bei": "..." }
if (folge.risiko) {
  let wert = folge.risiko.stand ?? 0;
  const werte = [wert];
  risikoSchritte.sort((a, b) => a.t - b.t).forEach((g) => { wert = Math.min(100, Math.max(0, wert + g.plus)); werte.push(wert); });
  const oben = folge.kasse ? 284 : istEuro && balken.zielText !== false ? 274 : 228;
  hud += `<div class="hud-risiko" style="top:${oben}px"><span class="r-label">${esc(folge.risiko.label || '🚨 RISIKO')}</span><div class="spur"><div class="fill" id="risiko-fill"></div></div><span class="r-wert">${werte.map((v, k) => `<b id="risiko-w${k}" style="opacity:${k ? 0 : 1}">${v} %</b>`).join('')}</span></div>`;
  tl.push(`tl.set("#risiko-fill",{scaleX:${Math.max(0.0001, werte[0] / 100)}},0);`);
  risikoSchritte.forEach((g, k) => {
    hud += `<div class="hud-plus risiko${g.plus > 0 ? ' minus' : ''}" id="risiko-plus${k}" style="top:${oben + 50}px">${g.plus > 0 ? '+' : '−'}${Math.abs(g.plus)} %</div>`;
    tl.push(`tl.to("#risiko-fill",{scaleX:${Math.max(0.0001, werte[k + 1] / 100)},duration:.5,ease:"power2.out"},${n(g.t)});`);
    tl.push(`tl.set("#risiko-w${k}",{opacity:0},${n(g.t + 0.25)});tl.set("#risiko-w${k + 1}",{opacity:1},${n(g.t + 0.25)});`);
    tl.push(`tl.fromTo("#risiko-plus${k}",{opacity:0,y:20,scale:.5},{opacity:1,y:0,scale:1,duration:.3,ease:"back.out(3)"},${n(g.t)});tl.to("#risiko-plus${k}",{opacity:0,y:-30,duration:.4},${n(g.t + 1.4)});`);
    if (werte[k + 1] >= 100) tl.push(`tl.to("#hud-in .hud-risiko",{scale:1.08,duration:.15,yoyo:true,repeat:5},${n(g.t + 0.3)});`);
  });
}
// HUD erst später einblenden (z. B. wenn die Mission feststeht): "hudBei": { "szene": 4, "bei": "30" }
hud = `<div id="hud-in">${hud}</div>`;
if (folge.hudBei) {
  const sz = szenen[(folge.hudBei.szene || 1) - 1];
  const t = sz.zeit(folge.hudBei.bei);
  tl.push(`tl.set("#hud-in",{opacity:0},0);tl.fromTo("#hud-in",{opacity:0,y:-90,scale:.85},{opacity:1,y:0,scale:1,duration:.45,ease:"back.out(2)"},${n(t)});`);
  ton('whoosh', t, 2);
}
// Video-Fortschrittsbalken am oberen Rand (hält Zuschauer: „wie lange noch?“)
if (folge.fortschritt !== false) {
  hud += `<div class="video-fortschritt" id="vfs"></div>`;
  tl.push(`tl.fromTo("#vfs",{scaleX:0},{scaleX:1,duration:${GESAMT},ease:"none"},0);`);
}

// ---------- Untertitel ----------
let caps = '';
const chunks = [];
let akt = [];
const flush = () => { if (akt.length) chunks.push(akt); akt = []; };
W.forEach((w, k) => {
  const neueSzene = akt.length && akt[0].szene !== w.szene;
  const zuLang = akt.length && [...akt, w].reduce((a, x) => a + x.text.length + 1, 0) > 19;
  if (neueSzene || zuLang || akt.length >= 3) flush();
  akt.push({ ...w, k });
  if (/[.!?…,:;]$/.test(w.text)) flush();
});
flush();
chunks.forEach((c, ci) => {
  const sz = szenen[c[0].szene];
  if (sz.untertitel === false) return;
  const cid = `cap${ci}`;
  const t0 = c[0].start;
  const naechste = chunks[ci + 1] ? chunks[ci + 1][0].start : GESAMT;
  const t1 = Math.min(naechste, c[c.length - 1].end + 0.45);
  const y = sz.untertitelY ?? (sz.typ === 'abstimmung' ? 1560 : sz.layout === 'karte' ? 1300 : folge.untertitelY ?? 1380);
  caps += `<div class="cap" id="${cid}" style="top:${y}px">${c.map((w) => `<span class="w${w.key ? ' key' : ''}" id="${cid}-${w.k}">${esc(w.text)}</span>`).join(' ')}</div>`;
  tl.push(`tl.set("#${cid}",{opacity:1},${n(t0)});tl.fromTo("#${cid}",{scale:.82},{scale:1,duration:.14,ease:"back.out(3)"},${n(t0)});tl.set("#${cid}",{opacity:0},${n(t1)});`);
  for (const w of c) {
    tl.push(`tl.set("#${cid}-${w.k}",{color:"#ffe14d",scale:1.12},${n(w.start)});`);
    tl.push(`tl.set("#${cid}-${w.k}",{${w.key ? '' : 'color:"#ffffff",'}scale:1},${n(Math.max(w.start + 0.05, w.end))});`);
  }
});

// ---------- Audio ----------
if (hatStimme) {
  fs.copyFileSync(voicePfad, path.join(projekt, 'assets', 'voice.mp3'));
  audio.unshift(`<audio id="voice" src="assets/voice.mp3" data-start="0" data-duration="${n(Math.min(laenge(voicePfad), GESAMT))}" data-track-index="8" data-volume="1"></audio>`);
}

// ---------- Ausgabe ----------
const css = fs.readFileSync(path.join(SKILL, 'lib', 'stil.css'), 'utf8');
const html = `<!doctype html>
<html lang="de" data-resolution="portrait">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<title>${esc(folge.titel || `${folge.name} – Folge ${folge.folge}`)}</title>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
${css}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${GESAMT}" data-width="1080" data-height="1920" data-fps="30">
${szenenHTML}${wischHTML}<div id="hud" class="clip" data-start="0" data-duration="${GESAMT}" data-track-index="2" data-track-kind="graphics">${hud}</div>
<div id="untertitel" class="clip" data-start="0" data-duration="${GESAMT}" data-track-index="4" data-track-kind="captions">${caps}</div>
${audio.join('\n')}
</div>
<script>
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
${tl.join('\n')}
tl.set({}, {}, ${GESAMT});
window.__timelines["main"] = tl;
tl.seek(0);
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(projekt, 'index.html'), html);
const slug = path.basename(ordner).toLowerCase().replace(/[^a-z0-9-]+/g, '-');
fs.writeFileSync(path.join(projekt, 'package.json'), JSON.stringify({
  name: slug, private: true, type: 'module',
  scripts: {
    dev: `npx --yes hyperframes@${HF_VERSION} preview`,
    check: `npx --yes hyperframes@${HF_VERSION} check`,
    render: `npx --yes hyperframes@${HF_VERSION} render`,
  },
}, null, 2));
fs.writeFileSync(path.join(projekt, 'hyperframes.json'), JSON.stringify({
  $schema: 'https://hyperframes.heygen.com/schema/hyperframes.json',
  paths: { blocks: 'compositions', components: 'compositions/components', assets: 'assets' },
  media: { autoProxy: true },
}, null, 2));
if (!fs.existsSync(path.join(projekt, 'meta.json'))) fs.writeFileSync(path.join(projekt, 'meta.json'), JSON.stringify({ id: slug, name: folge.titel || slug }, null, 2));

console.log(`✔ Projekt gebaut: ${projekt}`);
console.log(`  Dauer ${GESAMT}s · ${szenen.length} Szenen · ${chunks.length} Untertitel · Stimme: ${hatStimme ? 'ja' : 'nein (Entwurf)'} · Sounds: ${gemischt.filter((g) => soundDatei(g.key)).length}/${gemischt.length} · Musik: ${musikPlan.filter((m) => m.quelle || soundDatei(m.key)).length ? 'ja' : 'nein'}`);
console.log('  Szenen-Start:', szenen.map((s) => `${s.i + 1}@${s.start}s`).join('  '));
