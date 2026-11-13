# Würdest du deinen Job überleben? – Hinweise für Claude

TikTok-Mitmach-Serie (Deutsch): ein Job pro Video, Du-Perspektive, 3 Runden mit A/B-Wahl und Countdown direkt im Bild, am Ende Wertung (3/3 Chef-Material · 2/3 Probezeit verlängert · 1/3 Gefeuert · 0/3 Hausverbot) und Aufruf: Punktzahl in die Kommentare, Top-Kommentar = nächster Job.
Kanalname **„Überlebst du deinen Job?“** (TikTok erlaubt max. 30 Zeichen, „Würdest du deinen Job überleben?“ hat 32; im Video bleibt der Titel „WÜRDEST DU DEINEN JOB ÜBERLEBEN?“), Handle-Vorschlag @jobueberleben. Name, Bio und Profilbilder: `kanal/kanal.txt`.

Vor jeder Folge und jedem Render den **Hook-Check** aus `.claude/skills/tiktok-lernen/SKILL.md` im Chat abhaken (gemeinsames TikTok-Wissen aller Serien, Kopie aus kais-glowup Commit eb5f69e, nicht hier verändern; Updates per `verteilen.sh`).
Für jede neue Folge gilt der Skill in `skill/` (zuerst `SKILL.md`, dann `references/drehbuch.md`, `references/folge-format.md`). Alles ist **Deutsch**.
Entstanden am 11.11.2026 aus dem Skill der Serie „Kais GlowUp“ (Repo `jdbmc1-spec/kais-glowup`). Dort nichts für diese Serie committen.

## Aufbau
| Pfad | Inhalt |
|---|---|
| `skill/` | Skill `job-ueberleben`: `scripts/` (build, stimme, sfx, stimmen-suche), `lib/` (Figur, Hintergründe, Elemente inkl. `wahl`/`wertung`), `references/`, `vorlagen/` |
| `serie/serie.json` | Figur (Azubi mit Namensschild) und Stimme (Jonas Falk) |
| `serie/folge-XX/folge.json` | Drehbuch je Folge |
| `serie/renders/folge-XX.txt` | TikTok-Titel, Beschreibung, Hashtags (Pflicht je Folge; `-stumm.txt` für die Fassung ohne Ton) |
| `.claude/skills/tiktok-lernen/` | gemeinsamer Skill: Kernlehren, Hook-Check, Benchmarks, Mess-Skripte |
| `kanal/` | `kanal.txt` (Name, Handle, Bio), `profilbild.mjs` (Generator, 3 Varianten 1080×1080 im Kreis-Zuschnitt) und `profilbild-*.png` |

Nicht im Repository (per `.gitignore`): MP4, MP3, `projekt/`, `sfx/`. Neue Dateien im Wurzelordner in `.gitignore` freigeben (`!/datei`).

## Stand (11.11.2026)
- **Folge 1 – Job #1 Kasse** (Samstag an der Supermarktkasse) gebaut, Hook-Check bestanden (Satz 1 mit Zahl „8 Stunden“, Titel und Pill stehen ab Bild 1 mit `"sofort": true`) und **mit Ton** gerendert (`serie/renders/folge-01.mp4`, 58,8 s, Stimme „Jonas Falk“ `GpMEuRGYD0oLjmn4ptQZ`, Tempo 1.2).
  R1 47,12 € in Cent-Münzen + 14 Leute → A Zweite Kasse rufen ✓ · R2 Gurke ohne Preis, Kunde sagt „Angebot, 10 Cent“ → B Am Regal nachsehen ✓ (1,49 €) · R3 19:59 Uhr, randvoller Wagen → B Lächeln und kassieren ✓ (Testkauf vom Chef).
- Stimme: Jonas Falk spricht ruhiger als die Schätzung (erster Versuch bei Tempo 1.1: 62,5 s). Tempo 1.2 ist das Maximum, also eher Text kürzen (Ziel ≤ 125 Wörter, ≤ 750 Zeichen).
- Der ElevenLabs-Key ist in der Umgebung „job-ueberleben“ gespeichert (Proxy setzt ihn ein, `ELEVENLABS_API_KEY=proxy-injected NODE_USE_ENV_PROXY=1`).
- Profilbild in 3 Varianten erstellt (12.11.2026, Empfehlung: `profilbild-1-panik-countdown.png`). Offen: welche der Nutzer nimmt, Handle bestätigen.

## Regeln (Kurzfassung)
- Jedes Video funktioniert allein (kein Vorwissen), Prämisse im ersten Satz, Comedy statt Horror.
- Keine echten Marken, Ketten, Personen oder Logos; keine Klischees; keine Sex-, Drogen- oder Glücksspiel-Witze.
- Format der englischen Vorbilder übernehmen, aber keine Inhalte, Sätze oder Figuren kopieren.
- Immer zuerst stumm rendern und zeigen, Ton (ElevenLabs, kostet Guthaben) nur auf ausdrückliche Ansage.
- Hashtags: `#jobueberleben #duentscheidest #arbeitsalltag #storytime #comic`.
- Hinweis „KI-generierte Inhalte“ nur bei Fassungen mit KI-Stimme.

## Bauen (Cloud, Linux)
```bash
export USERPROFILE=$HOME
node skill/scripts/build.mjs serie/folge-XX --entwurf --stumm
cd serie/folge-XX/projekt && npx --yes hyperframes@0.8.223 lint
npx --yes hyperframes@0.8.223 snapshot --at 2,10,20 --no-end -o <scratch>
npx --yes hyperframes@0.8.223 render -o ../../renders/folge-XX-stumm.mp4
```
In der Umgebung „job-ueberleben“ ist `cdn.jsdelivr.net` freigegeben, `render` läuft direkt. Der ElevenLabs-Key ist dort hinterlegt; Befehle mit `ELEVENLABS_API_KEY=proxy-injected NODE_USE_ENV_PROXY=1` starten.
Windows-PC: Skill nach `%USERPROFILE%\.claude\skills\job-ueberleben` kopieren, Serie nach `%USERPROFILE%\GlowUp\job`. Sounds werden mit den anderen Serien in `%USERPROFILE%\GlowUp\_sounds` geteilt.
