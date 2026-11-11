# Sound-Design (abgeleitet aus Kevin Folge 2, Emre Folge 1+2)

## Was in den Referenzvideos zu hören ist (Spektrogramm-Analyse 2026-10-31)
- **Durchgehendes Musikbett** unter der Stimme: leiser, gleichmäßiger Loop (tiefe Töne ~200–500 Hz), nie lauter als die Stimme.
- **Musikwechsel bei der Abstimmung**: ab „Was soll … tun?“ dichterer, rhythmischer Spannungs-Loop.
- **Kurze Totenstille (0,05–0,15 s) an vielen Schnitten** – Comedy-Pause vor der Pointe. Entsteht bei uns durch die Sprechpausen der Stimme + harte Schnitte.
- **Jedes Comic-Wort im Bild hat einen Sound**: KLONK (Wecker schlagen), Wecker-Klingeln, RUMMS (Aufprall), WAU (Hund), GRRR (Knurren), HECHEL/ÄCHZ (Keuchen), TURBO (Rennen), ZZZ (Schnarchen).
- **Handy**: Vibrieren/Nachrichtenton, wenn ein Chat erscheint.
- **Erfolg** (MINUS 2 KILO, +2 %): heller Erfolgs-Jingle. **Schock** (!!!, PLEITE): dramatischer Stinger / Bass-Hit.
- **Grafiken**: kurze Pops beim Erscheinen, Whoosh bei Wischblenden und einfliegenden Karten.

## So setzt der Skill das um
`build.mjs` vergibt Sounds **automatisch** nach diesen Regeln (Katalog: `sounds/katalog.json`):

| Ereignis im Bild | Sound |
|---|---|
| `sfx` / `schrift` | über die **Schlagworte** im Katalog (z. B. „RUMMS“ → `aufprall`, „WAU“ → `bellen`, „HNNNGH“ → `anstrengung`); sonst `zack` bzw. `schock` |
| `pill`, `callout`, `icon`, `folgen`, `sprechblase`, `bild` | `pop` |
| `banner` rot / grün | `schock` / `erfolg` |
| `zahl` (+ `dann` mit „-“/„+“ oder grün) | `pop` (+ `erfolg`) |
| `fakefoto` Häkchen | `haken` |
| `chat` Nachricht von ihr / von ihm | `nachricht-ping` / `nachricht-senden` |
| `umfrage` | `zaehler` + `erfolg` beim GEWONNEN-Sticker |
| `glowup` | `erfolg` |
| `wackeln` | `bass-hit` |
| `hund` | `bellen` |
| `karte` | `herz` |
| `nebenfigur` (rein von der Seite) | `whoosh` |
| Wischblende (`uebergang: wisch-*`) | `whoosh` |
| Figur-Wechsel zu schock/panik, erschoepft, anstrengung | `schock`, `hecheln`, `anstrengung` |
| Figur `huepfen` / `rein` | `boing` / `whoosh` |
| Abstimmung: Titel, Karten, Kommentar-Pill | `spannung-hit`, `whoosh-karte`, `pop` |
| Musik | `musik-hintergrund` bis zur Abstimmung, dann `musik-abstimmung` |

Gleichzeitige Sounds werden ausgedünnt (innerhalb 120 ms gewinnt der wichtigere), damit es nicht matscht.

## Steuern in folge.json
- Pro Element: `"ton": "wecker"` (anderer Katalog-Sound oder eigene Datei `sfx/<name>.mp3`), `"ton": false` (stumm), `"tonLautstaerke": 0.8`.
- Pro Figur: `"ton": "schnarchen"` spielt beim Szenenstart; im `wechsel`-Eintrag ebenso `"ton"`.
- Reiner Sound ohne Bild: `{ "typ": "ton", "sound": "magen", "bei": "Hunger" }`.
- Ganze Folge: `"sounds": false` (keine Auto-Sounds), `"musik": false`, `"musikLautstaerke": 0.13`, `"musikAbstimmungLautstaerke": 0.16`.
- Eigene Musik: `musik.mp3` in den Folgenordner legen (ersetzt `musik-hintergrund`).

## Sound-Bibliothek
Liegt in `%USERPROFILE%\GlowUp\_sounds\` und wird für alle Serien wiederverwendet. Fehlende Sounds erzeugt
```powershell
node "$env:USERPROFILE\.claude\skills\glowup-serie\scripts\sfx.mjs" --fuer <folgen-ordner>
```
mit dem ElevenLabs-Soundeffekt-Generator (Stille am Anfang wird abgeschnitten, Lautheit angeglichen). `--liste` zeigt den Katalog, `--neu pop,whoosh` erzeugt eine neue Variante, wenn einer nicht gefällt. Eigene Dateien (gleicher Name, z. B. `_sounds\pop.mp3`) haben Vorrang.
Neue Geräusche: Eintrag in `sounds/katalog.json` ergänzen (`prompt` englisch, `dauer`, `lautstaerke`, deutsche `schlagworte`) und `sfx.mjs --fuer` laufen lassen.

**Hinweis Musik:** Bekannte Songs/Charts nicht ins Video rendern (Urheberrecht). Wer einen Trend-Sound will, legt ihn in der TikTok-App über das Video und setzt `"musik": false`.
