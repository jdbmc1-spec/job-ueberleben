#!/usr/bin/env node
// Erzeugt die deutsche Erzählerstimme mit ElevenLabs (inkl. Zeichen-Zeitstempeln für die Untertitel).
// Aufruf: node stimme.mjs <folgen-ordner> [--neu]
// Braucht die Umgebungsvariable ELEVENLABS_API_KEY. Stimme: folge.stimme.voiceId oder ELEVENLABS_VOICE_ID.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { sprechText, ladeFolge } from '../lib/text.mjs';

const ordner = path.resolve(process.argv[2] || '.');
const neu = process.argv.includes('--neu');
const folge = ladeFolge(ordner);
const st = folge.stimme || {};

const key = process.env.ELEVENLABS_API_KEY;
if (!key) {
  console.error('✖ ELEVENLABS_API_KEY ist nicht gesetzt. Einmalig in PowerShell: setx ELEVENLABS_API_KEY "dein-key"  (danach Terminal neu öffnen)');
  process.exit(2);
}
const voiceId = st.voiceId || process.env.ELEVENLABS_VOICE_ID;
if (!voiceId) {
  console.error('✖ Keine Stimme gewählt. Setze "stimme.voiceId" in folge.json oder ELEVENLABS_VOICE_ID.');
  process.exit(2);
}
const modell = st.modell || process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
const text = sprechText(folge);
const settings = {
  // Referenz-Erzähler ist schnell (~6 Silben/s) und sehr melodisch (~14 Halbtöne) → wenig Stabilität, viel Stil
  stability: st.stabilitaet ?? 0.35,
  similarity_boost: st.aehnlichkeit ?? 0.8,
  style: st.stil ?? 0.45,
  use_speaker_boost: true,
  speed: st.tempo ?? 1.1,
};
const hash = crypto.createHash('sha1').update(JSON.stringify({ text, voiceId, modell, settings })).digest('hex');

const alignPfad = path.join(ordner, 'alignment.json');
if (!neu && fs.existsSync(alignPfad) && fs.existsSync(path.join(ordner, 'voice.mp3'))) {
  const alt = JSON.parse(fs.readFileSync(alignPfad, 'utf8'));
  if (alt.hash === hash) {
    console.log('✔ Stimme ist aktuell (Text unverändert) – nichts zu tun.');
    process.exit(0);
  }
}

console.log(`→ ElevenLabs: ${text.length} Zeichen, Stimme ${voiceId}, Modell ${modell}`);
const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps?output_format=mp3_44100_128`, {
  method: 'POST',
  headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ text, model_id: modell, voice_settings: settings }),
});
if (!res.ok) {
  console.error(`✖ ElevenLabs-Fehler ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const data = await res.json();
const roh = path.join(ordner, 'voice-roh.mp3');
fs.writeFileSync(roh, Buffer.from(data.audio_base64, 'base64'));
// Lautheit auf TikTok-Niveau (-14 LUFS) bringen; Länge bleibt gleich, Zeitstempel stimmen weiter
execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', roh, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', '44100', '-b:a', '192k', path.join(ordner, 'voice.mp3')]);
fs.writeFileSync(alignPfad, JSON.stringify({ hash, text, alignment: data.alignment }, null, 1));
const ende = data.alignment.character_end_times_seconds.at(-1);
console.log(`✔ voice.mp3 + alignment.json gespeichert (${ende.toFixed(1)} s)`);
