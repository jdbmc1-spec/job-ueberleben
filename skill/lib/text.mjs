// Zerlegt die Szenen-Texte in Wörter (mit *Schlüsselwort*-Markierung) und berechnet Wort-Zeiten.
import fs from 'node:fs';
import path from 'node:path';

// Lädt folge.json und ergänzt sie um ../serie.json (Figur, Name, Stimme gelten für alle Folgen).
export function ladeFolge(ordner) {
  const folge = JSON.parse(fs.readFileSync(path.join(ordner, 'folge.json'), 'utf8'));
  const seriePfad = path.join(ordner, '..', 'serie.json');
  if (!fs.existsSync(seriePfad)) return folge;
  const serie = JSON.parse(fs.readFileSync(seriePfad, 'utf8'));
  // Leere Werte in der Folge ("voiceId": "") sollen die Serie nicht überschreiben
  const gefuellt = (o = {}) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v != null));
  return {
    ...serie,
    ...folge,
    figur: { ...(serie.figur || {}), ...gefuellt(folge.figur) },
    stimme: { ...(serie.stimme || {}), ...gefuellt(folge.stimme) },
  };
}

export function sprechText(folge) {
  return folge.szenen.map((s) => String(s.text || '').replace(/\*/g, '').trim()).filter(Boolean).join(' ');
}

export function zerlege(folge) {
  const woerter = [];
  let voll = '';
  const ersteWort = [];
  folge.szenen.forEach((s, si) => {
    const roh = String(s.text || '').trim();
    ersteWort[si] = woerter.length;
    if (!roh) return;
    if (voll) voll += ' ';
    let inStern = false;
    for (const tok of roh.split(/\s+/)) {
      // *Wort* oder *mehrere Wörter* = gelbes Schlüsselwort in den Untertiteln
      const startStern = /^[^\p{L}\p{N}]*\*/u.test(tok);
      if (startStern) inStern = true;
      const key = inStern;
      const schliesst = tok.lastIndexOf('*') > (startStern ? tok.indexOf('*') : -1);
      if (schliesst) inStern = false;
      const clean = tok.replace(/\*/g, '');
      if (!clean) continue;
      if (voll && !voll.endsWith(' ')) voll += ' ';
      const charStart = voll.length;
      voll += clean;
      woerter.push({ text: clean, key, szene: si, charStart, charEnd: voll.length });
    }
  });
  return { voll, woerter, ersteWort };
}

export const norm = (s) => String(s).toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}]/gu, '');

// Wort-Zeiten aus ElevenLabs-Alignment (Zeichen-genau) oder geschätzt (Entwurf).
export function wortZeiten(zer, alignment) {
  const { voll, woerter } = zer;
  if (alignment && alignment.characters) {
    const al = alignment.characters.join('');
    const st = alignment.character_start_times_seconds;
    const en = alignment.character_end_times_seconds;
    const gleich = al === voll;
    const map = (i) => (gleich ? i : Math.min(al.length - 1, Math.round((i * al.length) / voll.length)));
    for (const w of woerter) {
      w.start = st[map(w.charStart)];
      w.end = en[map(w.charEnd - 1)];
    }
    return { dauer: en[en.length - 1] };
  }
  // Schätzung ohne Stimme, geeicht an Jantoschs Aufnahme von Folge 1 (etwa 17 Zeichen/s inkl. Pausen)
  let t = 0.3;
  for (const w of woerter) {
    // Ziffern werden lang gesprochen ("340" = dreihundertvierzig), deshalb zählt jede wie 4 Buchstaben
    const d = 0.067 + w.text.replace(/\d/g, 'xxxx').length * 0.041;
    w.start = t;
    w.end = t + d;
    t += d + 0.03;
    if (/[.!?…]$/.test(w.text)) t += 0.28;
    else if (/[,:;–-]$/.test(w.text)) t += 0.12;
  }
  return { dauer: t };
}
