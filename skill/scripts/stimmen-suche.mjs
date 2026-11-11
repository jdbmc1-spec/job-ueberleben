#!/usr/bin/env node
// Sucht deutsche Erzählerstimmen in der ElevenLabs-Stimmen-Bibliothek, lädt die Hörproben,
// misst sie und sortiert sie nach Ähnlichkeit zum Referenz-Erzähler.
//   node stimmen-suche.mjs [--anzahl 8] [--frau] [--suche "erzähler"]
//   node stimmen-suche.mjs --hinzufuegen <public_owner_id> <voice_id> [<serie-ordner>]
// Braucht ELEVENLABS_API_KEY.
import fs from 'node:fs';
import path from 'node:path';
import { ladePCM, analysiere, abstand, REFERENZ } from '../lib/stimmanalyse.mjs';

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error('✖ ELEVENLABS_API_KEY ist nicht gesetzt (setx ELEVENLABS_API_KEY "…", danach App neu starten).');
  process.exit(2);
}
const arg = (name, def) => { const i = process.argv.indexOf(name); return i > -1 ? process.argv[i + 1] : def; };
const api = async (url, opt = {}) => {
  const res = await fetch(`https://api.elevenlabs.io${url}`, { ...opt, headers: { 'xi-api-key': key, 'Content-Type': 'application/json', ...(opt.headers || {}) } });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return res.json();
};

// --- Stimme in "Meine Stimmen" übernehmen und in serie.json eintragen ---
if (process.argv.includes('--hinzufuegen')) {
  const i = process.argv.indexOf('--hinzufuegen');
  const [owner, voice, serie] = process.argv.slice(i + 1);
  const name = arg('--name', 'Glow-Up Erzähler');
  const r = await api(`/v1/voices/add/${owner}/${voice}`, { method: 'POST', body: JSON.stringify({ new_name: name }) });
  console.log(`✔ Stimme hinzugefügt. voice_id: ${r.voice_id}`);
  if (serie) {
    const p = path.join(path.resolve(serie), 'serie.json');
    const s = JSON.parse(fs.readFileSync(p, 'utf8'));
    s.stimme = { ...(s.stimme || {}), voiceId: r.voice_id };
    fs.writeFileSync(p, JSON.stringify(s, null, 2));
    console.log(`✔ In ${p} eingetragen.`);
  }
  process.exit(0);
}

// --- Suche ---
const anzahl = Number(arg('--anzahl', 8));
const gender = process.argv.includes('--frau') ? 'female' : 'male';
const suche = arg('--suche');
const ziel = path.join(process.env.USERPROFILE || '.', 'GlowUp', '_stimmen');
fs.mkdirSync(ziel, { recursive: true });

const gesehen = new Map();
for (const use of ['narrative_story', 'social_media', 'characters_animation', null]) {
  const q = new URLSearchParams({ page_size: '100', language: 'de', gender });
  if (use) q.set('use_cases', use);
  if (suche) q.set('search', suche);
  const r = await api(`/v1/shared-voices?${q}`);
  for (const v of r.voices || []) if (v.preview_url && !gesehen.has(v.voice_id)) gesehen.set(v.voice_id, v);
}
let kandidaten = [...gesehen.values()]
  .filter((v) => !v.age || v.age !== 'old')
  .sort((a, b) => (b.usage_character_count_7d || 0) - (a.usage_character_count_7d || 0))
  .slice(0, 40);
console.log(`→ ${gesehen.size} deutsche Stimmen gefunden, prüfe die ${kandidaten.length} meistgenutzten …`);

const ergebnis = [];
for (const v of kandidaten) {
  try {
    const mp3 = Buffer.from(await (await fetch(v.preview_url)).arrayBuffer());
    const datei = path.join(ziel, `${v.voice_id}.mp3`);
    fs.writeFileSync(datei, mp3);
    const m = analysiere(ladePCM(datei));
    ergebnis.push({ name: v.name, voice_id: v.voice_id, public_owner_id: v.public_owner_id, alter: v.age, akzent: v.accent, stil: v.descriptive, einsatz: v.use_case, beschreibung: (v.description || '').slice(0, 140), messung: m, abstand: abstand(m), datei });
  } catch (e) { console.warn(`  ⚠ ${v.name}: ${e.message}`); }
}
ergebnis.sort((a, b) => a.abstand - b.abstand);
const top = ergebnis.slice(0, anzahl);
top.forEach((e, i) => {
  const neu = path.join(ziel, `${String(i + 1).padStart(2, '0')}-${e.name.replace(/[^\p{L}\p{N}]+/gu, '_')}.mp3`);
  fs.copyFileSync(e.datei, neu);
  e.datei = neu;
});
fs.writeFileSync(path.join(ziel, 'kandidaten.json'), JSON.stringify({ referenz: REFERENZ, kandidaten: top }, null, 2));
console.log(`\nReferenz: ${REFERENZ.f0_median_hz} Hz · ${REFERENZ.melodie_halbtoene} Halbtöne Melodie · ${REFERENZ.silben_pro_s} Silben/s\n`);
top.forEach((e, i) => console.log(`${i + 1}. ${e.name}  (Abstand ${e.abstand})  ${e.messung.f0_median_hz} Hz · ${e.messung.melodie_halbtoene} HT · ${e.messung.silben_pro_s} S/s · ${e.alter || '?'} · ${e.stil || ''} · ${e.einsatz || ''}\n   ${e.datei}`));
console.log(`\nHörproben + kandidaten.json in ${ziel}`);
