---
name: job-ueberleben
description: Erstellt deutschsprachige TikTok-Folgen der Mitmach-Serie „Würdest du deinen Job überleben?“ – ein Beruf pro Video, 3 Runden mit A/B-Wahl und Countdown direkt im Bild, Auflösung, Punkte-Wertung am Ende. Drehbuch, ElevenLabs-Erzählerstimme und fertiges 9:16-MP4 per Code mit HyperFrames. Verwenden, wenn der Nutzer eine neue Job-Folge, einen neuen Beruf, ein Skript oder ein Re-Render dieser Serie will.
---

# Würdest du deinen Job überleben? (TikTok, Deutsch, HyperFrames)

Kanal: **„Würdest du deinen Job überleben?“** (Handle-Vorschlag @jobueberleben, beim Nutzer bestätigen). Alles **auf Deutsch**.
Ablauf: `folge.json` → `scripts/stimme.mjs` (ElevenLabs) → `scripts/build.mjs` (HyperFrames-Projekt) → `hyperframes render` (MP4).

Skill-Ordner: `~/.claude/skills/job-ueberleben/` (im Folgenden `$SKILL`). Technik und Bibliothek stammen aus dem Glow-Up-Skill (Figur, Hintergründe, Elemente, Sounds), ergänzt um `wahl`, `wertung`, `runde` und das Job-HUD.

## Vor dem Start lesen
- `references/drehbuch.md` – Format, Aufbau und Tonfall einer Job-Folge (Pflicht).
- `references/folge-format.md` – Referenz für `folge.json`: Hintergründe, Figur, alle Elemente; die Job-Bausteine stehen im Abschnitt „Job-Serie“.
- `references/stil-guide.md`, `references/sound-design.md` – Bildsprache und Sounds (aus der Glow-Up-Serie, gelten weiter).
- `vorlagen/job-01-kasse.json` – **Maßstab**: Folge 1 (Supermarktkasse), 14 Szenen, 3 Runden.

## Format in einem Satz
Jede Folge = ein Job, Du-Perspektive, 45–55 s: Hook mit Titel und Prämisse → 3 Runden (Situation → Wahl A/B mit Countdown „Drei. Zwei. Eins!“ → Auflösung im selben Bild → kurze lustige Folge) → Wertung „3/3 … 0/3“ → „Schreib deine Punkte in die Kommentare! Der Top-Kommentar wird der nächste Job.“
Jedes Video funktioniert allein, ohne Vorwissen. Comedy, kein Horror.

## Ablage
```
GlowUp\job\serie.json            ← Figur (Azubi mit Namensschild), Stimme
GlowUp\job\folge-01\folge.json   ← Szenen dieser Folge ("job": "Kasse", "folge": 1)
GlowUp\job\folge-01\voice.mp3 + alignment.json   (von stimme.mjs)
GlowUp\job\folge-01\projekt\     (generiert, nie von Hand ändern)
GlowUp\job\renders\folge-01.mp4 + folge-01.txt
```
Im Repository heißt `GlowUp\job\` einfach `serie/`. Sounds liegen wie bei den anderen Serien in `%USERPROFILE%\GlowUp\_sounds\` und werden geteilt.

## Ablauf einer neuen Folge
1. **Job klären**: Welcher Beruf (Top-Kommentar der letzten Folge, beim Nutzer erfragen, nichts erfinden)? Passende Kulisse wählen (`kasse`, `imbiss`, `friseur`, `krankenhaus`, `kueche`, `theke`, `laden`, …) oder in `lib/hintergrund.mjs` ergänzen.
2. **Drehbuch** nach `references/drehbuch.md` (rund 125 Wörter). Dem Nutzer die 3 Situationen mit A/B und richtiger Antwort kurz zeigen.
3. **`folge.json`** nach `references/folge-format.md` schreiben.
4. **Entwurf ohne Ton bauen und prüfen**:
   ```bash
   node $SKILL/scripts/build.mjs <folgen-ordner> --entwurf --stumm
   cd <folgen-ordner>/projekt
   npx --yes hyperframes@0.8.223 lint
   npx --yes hyperframes@0.8.223 snapshot --at <Zeiten> --no-end -o <ordner>
   ```
   Contact-Sheets ansehen: Karten lesbar, Countdown sichtbar, Auflösung (grün ✓ / rot ✗), Untertitel frei, nichts abgeschnitten. Warnungen `nested_structure_needs_subcomposition`, `timeline_track_too_dense`, `composition_file_too_large` sind normal; nur **Fehler** beheben.
5. **Stumm rendern und dem Nutzer zeigen** (`npx --yes hyperframes@0.8.223 render -o <serie>/renders/folge-XX-stumm.mp4`). **Ton erst nach ausdrücklicher Freigabe.**
6. **Ton** (kostet ElevenLabs-Guthaben): `node $SKILL/scripts/stimme.mjs <folgen-ordner>`, dann `node $SKILL/scripts/sfx.mjs --fuer <folgen-ordner>`, dann `build.mjs <folgen-ordner>` und rendern. Die echte Länge steht erst nach `stimme.mjs` fest.
   Stimme einmal pro Serie mit `scripts/stimmen-suche.mjs` vorauswählen, der Nutzer hört und wählt selbst. Key nur als Umgebungsvariable `ELEVENLABS_API_KEY`, nie in Dateien oder im Chat.
7. **TikTok-Text (Pflicht)** neben die MP4 als `.txt` und vollständig im Chat:
   ```
   TITEL
   Würdest du <Situation> überleben? <Emoji> | Job #<N>

   BESCHREIBUNG
   3 Situationen, 3 Sekunden pro Entscheidung ⏱️ Zähl deine Punkte!
   3/3 Chef-Material · 2/3 Probezeit verlängert · 1/3 Gefeuert · 0/3 Hausverbot

   Schreib deine Punktzahl in die Kommentare 👇
   Welcher Job als Nächstes? Der Top-Kommentar wird die nächste Folge! 🗳️

   #jobueberleben #duentscheidest #arbeitsalltag #storytime #comic

   HINWEIS
   Beim Hochladen „KI-generierte Inhalte“ aktivieren (nur sobald die KI-Stimme drin ist).
   ```

## Regeln
- Deutsch, Umlaute korrekt. Gebeugte Eins ausschreiben („eine Minute“).
- Keine echten Marken, Ketten, Personen oder Logos. Keine Klischees über Berufsgruppen, Herkunft oder Geschlecht; der Witz liegt in der Situation.
- Keine Sex-, Drogen- oder Glücksspiel-Witze, kein Horror und keine echte Gewalt.
- Die richtige Antwort muss nachvollziehbar sein (fair, kein Zufall). Mindestens eine Runde, in der die freundliche/geduldige Option überraschend richtig ist, und eine, in der die naheliegende falsch ist.
- Inhalte, Sätze und Figuren fremder Kanäle (z. B. englische Vorbilder) nicht kopieren, nur das Format.
- Wort-Anker müssen im Text derselben Szene vorkommen. Countdown-Wörter („Drei“) dürfen in der Wahl-Szene nicht vorher schon vorkommen.
- Fehlende Motive in `lib/` im selben SVG-Stil ergänzen und in `references/folge-format.md` dokumentieren.
- Node.js/FFmpeg unter Windows per winget; in neuer Shell den PATH auffrischen:
  `$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')`
