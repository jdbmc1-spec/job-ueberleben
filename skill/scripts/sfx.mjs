#!/usr/bin/env node
// Sound-Bibliothek der Glow-Up-Serie: erzeugt fehlende Sounds aus sounds/katalog.json mit dem
// ElevenLabs-Soundeffekt-Generator und legt sie in %USERPROFILE%\GlowUp\_sounds\ ab (für alle Serien wiederverwendbar).
//   node sfx.mjs --liste                         Katalog + was schon da ist
//   node sfx.mjs --fuer <folgen-ordner>          nur die Sounds erzeugen, die diese Folge braucht
//   node sfx.mjs --alle                          alle fehlenden Katalog-Sounds erzeugen
//   node sfx.mjs --neu pop,whoosh                diese Sounds neu erzeugen (andere Variante)
// Eigene Dateien gehen vor: liegt z. B. _sounds\pop.mp3 schon da, wird nichts erzeugt.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SKILL = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const SOUND_ORDNER = path.join(process.env.USERPROFILE || '.', 'GlowUp', '_sounds');
const katalog = JSON.parse(fs.readFileSync(path.join(SKILL, 'sounds', 'katalog.json'), 'utf8'));
delete katalog._info;
const da = (k) => fs.existsSync(path.join(SOUND_ORDNER, `${k}.mp3`));

const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null; };
let ziel = [];
if (process.argv.includes('--liste')) {
  for (const [k, v] of Object.entries(katalog)) console.log(`${da(k) ? '✔' : '·'} ${k.padEnd(18)} ${String(v.dauer).padStart(4)}s  ${(v.schlagworte || []).join(', ')}`);
  console.log(`\nOrdner: ${SOUND_ORDNER}`);
  process.exit(0);
} else if (arg('--fuer')) {
  // Build im Prüfmodus fragt ab, welche Sounds die Folge braucht
  const out = execFileSync(process.execPath, [path.join(SKILL, 'scripts', 'build.mjs'), arg('--fuer'), '--entwurf', '--nur-sounds'], { encoding: 'utf8' });
  ziel = JSON.parse(out.trim().split('\n').pop()).filter((k) => !da(k));
} else if (process.argv.includes('--alle')) {
  ziel = Object.keys(katalog).filter((k) => !da(k));
} else if (arg('--neu')) {
  ziel = arg('--neu').split(',');
} else {
  console.log('Optionen: --liste | --fuer <folgen-ordner> | --alle | --neu key1,key2');
  process.exit(0);
}

if (!ziel.length) { console.log('✔ Alle benötigten Sounds sind schon da.'); process.exit(0); }
const key = process.env.ELEVENLABS_API_KEY;
if (!key) { console.error('✖ ELEVENLABS_API_KEY ist nicht gesetzt.'); process.exit(2); }
fs.mkdirSync(SOUND_ORDNER, { recursive: true });

const sekunden = ziel.reduce((s, k) => s + (katalog[k]?.dauer || 0), 0);
console.log(`→ Erzeuge ${ziel.length} Sounds (${sekunden.toFixed(1)} s gesamt): ${ziel.join(', ')}`);
for (const k of ziel) {
  const s = katalog[k];
  if (!s) { console.warn(`  ⚠ ${k} steht nicht im Katalog`); continue; }
  const res = await fetch('https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128', {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: s.prompt, duration_seconds: s.dauer, prompt_influence: s.musik ? 0.4 : 0.6, loop: !!s.loop }),
  });
  if (!res.ok) { console.error(`  ✖ ${k}: ${res.status} ${await res.text()}`); continue; }
  const roh = path.join(SOUND_ORDNER, `${k}.roh.mp3`);
  fs.writeFileSync(roh, Buffer.from(await res.arrayBuffer()));
  // Stille am Anfang abschneiden (Sound soll exakt auf dem Bild-Ereignis sitzen), Lautheit angleichen
  const filter = s.musik ? 'loudnorm=I=-16:TP=-1.5' : 'silenceremove=start_periods=1:start_threshold=-45dB,loudnorm=I=-16:TP=-1.5';
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', roh, '-af', filter, '-ar', '44100', path.join(SOUND_ORDNER, `${k}.mp3`)]);
  fs.unlinkSync(roh);
  console.log(`  ✔ ${k}`);
}
