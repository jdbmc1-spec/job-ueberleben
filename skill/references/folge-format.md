# folge.json – Referenz

Koordinaten: Bild ist 1080 × 1920. `x`/`y` in Pixeln (Mittelpunkt des Elements) oder als Anteil 0–1, oder `"links" | "mitte" | "rechts"` bzw. `"oben" | "mitte" | "unten"`.
Zeitanker `bei`: **Wort(e) aus dem Text derselben Szene** (Präfix reicht, Groß/Klein egal, z. B. `"200"`, `"Ich mich"`) oder **Sekunden ab Szenenstart** (Zahl). Ohne `bei` = Szenenstart.
Der HUD-Bereich oben (y < 260) und die Untertitelzone (y ≈ 1380–1500) möglichst freihalten.

## Kopf
```json
{
  "titel": "Kai – Folge 3",
  "name": "Kai",              // erscheint in "WAS SOLL KAI TUN?"
  "folge": 3,
  "tage": 27,                 // "NOCH 27 TAGE"
  "glowup": 4,                // Start-% des Glow-Up-Balkens
  "glowupAnzeigen": true,     // Standard: ab Folge 2
  "figur": { ... },           // überschreibt serie.json → figur
  "stimme": { "voiceId": "...", "modell": "eleven_multilingual_v2", "tempo": 1.05, "stabilitaet": 0.4, "stil": 0.35 },
  "untertitelY": 1380,        // Standardhöhe der Untertitel
  "musikLautstaerke": 0.12,
  "nachlauf": 1.6,            // Sekunden nach dem letzten Wort
  "szenen": [ ... ]
}
```

## Szene
```json
{
  "text": "Er drückt die Stange und … *nichts* passiert.",   // Sprechertext, *x* = gelbes Schlüsselwort
  "hintergrund": "gym",
  "hintergrundOptionen": { },
  "uebergang": "wisch-gelb",      // optional: wisch-gelb | wisch-pink | wisch-lila | wisch-rot | wisch-blau | wisch-weiss (sonst harter Schnitt mit kurzem Zoom-Punch)
  "kamera": "punch",              // punch (Standard) | zoom (langsam rein) | zoom-raus | hook (Sprung aufs Gesicht in 0,6 s, für die erste Szene; Stärke mit "hookZoom", Standard 1.9) | keine
  "figur": { ... } | false,       // false = keine Hauptfigur in dieser Szene
  "abdunkeln": false,             // dunkler Schleier über Hintergrund+Figur
  "stimmung": "traurig",          // optional: entsättigt + dunkler + trauriger Klavier-Sound (Tiefpunkt vor der Abstimmung)
  "untertitel": true,             // false = keine Untertitel in dieser Szene
  "untertitelY": 1380,
  "elemente": [ ... ]
}
```

### Hintergründe
| Name | Beschreibung | Optionen |
|---|---|---|
| `zimmer` | unordentliches Gamer-Zimmer bei Nacht: LED-Leiste (Farbwechsel), Neon-Schild, Fenster mit Skyline & Mond, Poster „99 LEVEL“, Regal mit Dosen & Pokal, Monitor + RGB-PC mit drehenden Lüftern, Pizzaturm, Müllsack, Klamotten, Teppich | `schreibtisch: true` → Tisch mit RGB-Tastatur im Vordergrund; `stuhl: true` → rot-schwarzer Gaming-Stuhl hinter der Figur (mit `schreibtisch` = Figur sitzt am Setup); `neon: "LOL"` → anderer Neon-Text (Standard „GG“) |
| `couch` | Zimmer + rote Couch & Tisch mit Müll im Vordergrund (Figur sitzt) | `neon` |
| `strasse` | bunte Häuserreihe, Gehweg, Straße | `tageszeit: "morgen"` (Pfirsich-Himmel) / sonst blau |
| `park` | Wiese, Bäume, Weg, Bank | – |
| `gym` | Spinde/Spiegel, rote Linie, Hantelablage | – |
| `bad` | Fliesen, Spiegel, Handtuch | – |
| `bett` | Schlafzimmer mit Nachttisch, Lampe, Wecker, Poster, Decke im Vordergrund (Figur mit `rahmen: "kopf"`) | `tageszeit: "nacht"` (Mond, Lampenlicht) / sonst Morgen mit Sonnenstrahlen |
| `kueche` | Fliesen, Fenster, Arbeitsplatte vorne mit Pfanne | – |
| `theke` | Laden-Theke vorne, Schild hinten | `schild: "BÄCKEREI"` |
| `laden` | Supermarkt-Fassade | `schild: "FRISCHMARKT"` |
| `himmel` | Himmel mit Wolken (Flughafen/Reise) | – |
| `krankenhaus` | Patientenzimmer: Herzmonitor (pulsiert), Infusionsständer, Fenster mit Jalousie, Rotes-Kreuz-Schild, Uhr | `bett: true` → Krankenbett mit Decke + Gitter vorne (Figur mit `rahmen: "kopf"`, z. B. `breite: 900, kopfOben: 760`) |
| `kasse` | Supermarkt-Kasse: bunte Regale, Kassenband mit Einkauf + Kassendisplay vorne. Job-Serie: Kassierer-Figur `rahmen: "ganz"`, `x: 260` (hinter dem Display), Kunde als `nebenfigur` rechts (`x: 800, y: 1130, breite: 480, spiegeln: true`) | `einkauf: ["pizza","chips","energy","cola","burger","salat","wasser","creme","maske","gurke","muenzen","wagen"]`, `betrag: "23,47 €"`, `uhr: "19:59"` (Digitaluhr an der Wand, `uhrFarbe`) |
| `imbiss` | Döner-Laden: zwei Drehspieße mit glühendem Grill, Preisschild, Zutaten-Theke vorne (Figur `rahmen: "halbnah"`, `kopfOben: 720`) | `schild: "DÖNER"`, `preis: "7,50 €"` |
| `laufstrecke` | rote Tartanbahn in die Tiefe, Fluss mit Steinbrücke, Stadt im Dunst, Bäume, Bank, Schild „10 KM“ | `tageszeit: "morgen"` (Sonnenaufgang) / sonst Tag |
| `waschbecken` | **Detailaufnahme**: Waschbecken mit brauner Brühe und Schaum | – |
| `berg` | steiler Bergpfad mit Schneegipfeln, Steinhaus, Felsen, Wegweiser „GIPFEL 3 KM“ | `tageszeit: "morgen"` |
| `gipfel` | Felsgipfel über dem Wolkenmeer mit Fahne „TOP“ (Figur `rahmen: "ganz"`) | – |
| `ringplatz` | Dorfplatz in den Bergen: Ringermatte, Holzzaun, Zuschauerreihe, Banner | `banner: "FINALE"` (Standard „DORF-TURNIER“) |
| `friseur` | Friseursalon: Schild oben, großer Spiegel mit Glühbirnen, Regal mit Flaschen links, Preistafel rechts, drehende Friseurstange, Ablage mit Schere/Kamm, Schachbrett-Boden mit Haarschnipseln (Figur `ganz` oder `halbnah`, `kopfOben: 720`) | `schild: "SALON"`, `preis: "25 €"`, `preisText: "HERREN-\nSCHNITT"`, `haare: 60` (Anzahl Schnipsel) |
| `kuehlschrank` | **Detailaufnahme** (ohne Figur): offener, fast leerer Kühlschrank mit Ketchup und vergammeltem Salat | – |
| `zahnbuerste` | **Detailaufnahme**: verdreckte Zahnbürste im Becher, Spiegel mit Spinnweben, Waschbecken | – |
| `dusche` | **Detailaufnahme**: verschimmelte Dusche mit Spinne | – |
| `haus` | Haus am Abend (Heimkehr), Lichter, Sterne | `polizei: true` → Polizeiauto mit Blaulicht vorne |
| `sunburst-<farbe>` | Lichtstrahlen-Fläche: `lila` (Story/CTA/Abstimmung), `gelb` (Rückblende), `orange`, `rot` (Drama), `pink`, `blau`, `gruen` | – |
| `chat` | = `sunburst-lila`, für Handy-Szenen | – |

### Figur (Hauptfigur der Szene)
```json
"figur": {
  "ausdruck": "schock",
  "pose": "stehen",            // stehen | jubeln (Arme hoch) | zeigen (rechter Arm) | kopf (Hände am Kopf) | handy (zockt am Handy)
  "gehen": true,               // Beine laufen, Körper wippt (oder Wort-Anker: ab wann)
  "wandern": { "von": 240, "nach": 560 },   // schiebt die Figur während der Szene durchs Bild
  "rahmen": "ganz",            // ganz | klein | halbnah | nah | kopf
  "x": 540, "kopfOben": 640,   // Feinjustierung (Pixel der Kopfoberkante), "breite": 720
  "spiegeln": false,
  "outfit": "lauf",            // fertiges Outfit: lauf = Trikot mit Startnummer, kurze Hose, Neon-Schuhe, Schweißband, kein Headset; ringer = rotes Ringer-Trikot
  "optionen": { "schweissband": true },   // Aussehen nur für diese Szene ändern (auch einzeln: shorts, socken, startnummer, sportstreifen)
  "wechsel": [ { "bei": "plötzlich", "ausdruck": "panik", "pose": "kopf" } ],   // Ausdruck/Pose wechseln
  "huepfen": "Ja",             // hüpft bei diesem Wort (true = Szenenstart)
  "zittern": "100",            // zittert bei diesem Wort
  "rein": "links",             // links | rechts | unten | pop  (+ "reinBei")
}
```
**Ausdrücke**: `neutral, gelangweilt, gluecklich, jubel, grinsen, schock, panik, traurig, weinen, erschoepft, anstrengung, wuetend, schlafen, schwindelig, verliebt, verlegen`

**Aussehen** (`serie.json` → `figur`, oder `optionen`):
```json
{
  "haut": "#f2b98f", "haare": "locken | kurz | strubbel | glatze | lang | dutt", "haarFarbe": "#2b1f1a",
  "bart": "keiner | stoppeln | voll", "shirt": "#f4f1ea", "hose": "#5b6170", "schuhe": "#3b6fd8",
  "flagge": "keine | tr | de | at | ch | pl | it | fr | ru | ma | al",
  "flecken": true, "pickel": true, "headset": true, "schweissband": false, "bauch": true,
  "gewicht": 0.8, "fliegen": true, "muetze": null, "weiblich": false
}
```
Glow-Up über die Folgen sichtbar machen: `pickel`, `flecken`, `fliegen` aus; `gewicht` senken; `bart` von `voll` → `stoppeln` → `keiner`; neues `shirt`.

### Abstimmungs-Szene (immer letzte Szene)
```json
{
  "typ": "abstimmung",
  "text": "Was soll Kai tun? A: Jeden Tag ins *Fitnessstudio*. Oder B: Junkfood weg und *kochen lernen*. Schreib A oder B in die Kommentare!",
  "figur": { "ausdruck": "verlegen" },          // wird automatisch groß + abgedunkelt
  "a": { "text": "Jeden Tag\nFitnessstudio", "icon": "hantel", "bei": "Jeden" },
  "b": { "text": "Junkfood weg,\nkochen lernen", "icon": "pfanne", "bei": "Junkfood" },
  "kommentarBei": "Schreib",
  "frage": ["WAS SOLL", "KAI TUN?"]               // optional
}
```

## Elemente (`elemente: [...]`)
Alle Elemente: `bei` (Erscheinen), optional `weg` (Verschwinden), `sofort: true` (steht ohne Einblenden schon im ersten Bild – für den Hook), `x`, `y`, `rot` (Grad), `ton` (Katalog-Sound oder eigene Datei `sfx/<name>.mp3`; `false` = stumm; Standard = automatisch passend, siehe `sound-design.md`), `tonLautstaerke`.
Folgen-Kopf zusätzlich: `"sounds": false` (keine Auto-Sounds), `"musik": false`.

| `typ` | Felder | Aussehen |
|---|---|---|
| `pill` | `text` | weiße Pille mit dunklem Rand – Orte/Zeiten: „FITNESSSTUDIO“, „AM NÄCHSTEN MORGEN“, „10 MIN SPÄTER“ |
| `sfx` | `text`, `farbe` (weiss/gelb/orange/rot/pink), `stern` (false = nur Text), `groesse` | Comic-Explosion: „RUMMS!“, „ZACK!“, „KLONK!“, „HECHEL…“ |
| `schrift` | `text` (`\n` erlaubt), `farbe` (gelb/gruen/rot/weiss/pink/blau/orange), `groesse` | große schräge Comic-Schrift: „MINUS 2 KILO!“, „PLEITE!“, „TURBO!“, „!!!“ |
| `zahl` | `text`, `stil` (box/lineal/kalender/waage/geld/app), `oben` (Zusatzzeile), `unten` (nur kalender, z. B. „TAGEN“), `dann: {text, bei, farbe}` | Zahlen-Display; `dann` wechselt die Zahl (Waage 100,5 → -2 kg) |
| `kasse` | `plus` (auch negativ) | ändert die Geld-Leiste unter dem Balken, mit „+X €“-Pop und Kassen-Sound. Leiste einschalten im Folgen-Kopf: `"kasse": { "label": "KAIS KASSE", "stand": 0 }`, `stand` aus der letzten Folge übernehmen |
| `schaf` | `x`, `y`, `breite`, `richtung`, `rein: "seite"`, `laufen` | Schaf, hüpft, läuft ins Bild |
| `kreis` | `x`, `y`, `radius`, `farbe` | gestrichelter roter Kreis, rotiert langsam, markiert Problemzonen (Kopf, Bauch) |
| `banner` | `titel`, `untertitel`, `farbe` (gruen/rot/blau/lila/gelb/orange) | große Karte: „WILLKOMMEN ZURÜCK!“, „NOCH 21 TAGE?!“ |
| `callout` | `text`, `zielX`, `zielY` | Label mit Linie auf ein Detail: „Headset (klar)“, „LÜGE“ |
| `chat` | `name`, `nachrichten: [{von: "sie"/"er", typ: text/tippt/sprache/foto, text, bei}]` | Handy mit Chat; `tippt` = Tipp-Punkte (verschwinden bei nächster Nachricht), `sprache` = Sprachnachricht (`text` = Dauer „0:03“), `foto` = verpixeltes Foto |
| `umfrage` | `optionen: [{text, icon, prozent, farbe}]`, `gewinner` (Index, sonst höchster), `titel: [z1, z2]` | „LETZTE FOLGE HABT IHR ENTSCHIEDEN“ mit laufenden Balken + GEWONNEN!-Sticker |
| `fakefoto` | `label`, `labelFarbe` (''=grün, rot, weiss), `haken: [{text, bei}]`, `breite` | verpixelter Typ im Anzug mit „???“, optional Häkchen-Liste daneben |
| `folgen` | `frage` (Standard „SCHAFFT ER ES?“, false = ohne) | pinker pulsierender „+ FOLGEN“-Button |
| `glowup` / `geld` | `plus` (auch negativ) | Fortschrittsbalken steigt/fällt um `plus` mit „+X“-Pop (bei Minus rot + Schock-Sound) |
| `icon` | `icon`, `groesse` (Pixel, Standard 160) | einzelnes Icon (siehe Liste) |
| `hund` | `richtung` (links/rechts), `laufen`, `breite` | Dackel (hüpft) |
| `nebenfigur` | `figur` (Aussehen), `ausdruck`, `pose`, `breite`, `spiegeln`, `sprechblase`, `sprechblaseBei`, `rein: "seite"` | weitere Person: Oma (`haare: "dutt", haarFarbe: "#d9d9d9", shirt: "#8e5bd8"`), Trainer, Security (`muetze: "#1f2937", shirt: "#1f2937"`), Kumpel … |
| `karte` | `name`, `figur`, `ausdruck`, `groesse` | Porträtkarte der Partnerin („Lea, 22“) |
| `sprechblase` | `text` | große weiße Sprechblase |
| `bild` | `src` (Datei in `projekt/assets`) | eigenes Bild |
| `wackeln` | – | Kamera-Wackler (Aufprall, Schock) |
| `ton` | `sound` (Katalog-Name, z. B. `magen`, `schnarchen`) oder `datei`, `lautstaerke` | nur Sound, kein Bild |
| `notiz` | `titel` („Zuletzt benutzt:“), `text` („vor 14 Tagen“, rot) | Info-Zettel für Gags in Detailaufnahmen |
| `sperrbildschirm` | `uhr`, `tag`, `name`, `text`, `nachrichtBei` | Handy-Sperrbildschirm, Benachrichtigung rutscht rein (+ Ping) – starker Hook |
| `terminal` | `text`, `rot` („ABGELEHNT“), `ablehnenBei` | Kartenterminal, rotes X + Wackeln + Fehler-Piepen |
| `schild` | `text`, `unter` („300 m →“) | grünes Straßenschild auf Pfahl |
| `herzen` | `anzahl` | aufsteigende Herzen (Verliebt-Moment) |

**Icons**: `doener, kochtopf, paket, hantel, pfanne, dusche, koffer, herz, schuh, besen, pizza, geld, buch, handy, wasser, salat, bett, rasierer, blume, zahnbuerste, kamera, flugzeug, burger, flasche, pc, kreuz, spende`

**Andere Serien-Ziele statt Glow-Up** (z. B. Serie „1 Million in 30 Tagen“, `GlowUp\million\`): in `serie.json`
`"balken": { "label": "OP-GELD", "format": "euro", "ziel": 1000000 }` → Balken zeigt Euro-Beträge + Pill „ZIEL: 1.000.000 €“, ab Folge 1 sichtbar. Startwert pro Folge mit `"stand"` (aus der letzten Folge übernehmen), Änderungen mit `{ "typ": "geld", "plus": 8.5 }` bzw. `"plus": -200`.
Weitere Bausteine (aus der Analyse von @30tagebis1million):
- `{ "typ": "stempel", "text": "47,12 €", "farbe": "gruen|rot|gelb|orange|blau|lila|weiss|pink", "groesse": 220 }` – runder Sticker, stempelt sich rein.
- `{ "typ": "liste", "titel": "VERKAUFS-APP", "zeilen": [{ "text": "🎮 Konsole", "wert": "+180 €", "bei": "Konsole", "markiert": false }], "knopf": { "text": "ALLES KAUFEN", "bei": "..." } }` – Handy mit App-Liste.
- `{ "typ": "handyvideo", "figur": { ... }, "ausdruck": "jubel", "icon": "doener", "farbe": "#bfe3da", "name": "Mamas Video", "aufrufe": "3", "dann": { "text": "40.000", "bei": "40.000" } }` – Handy mit Kurzvideo und Aufrufzähler.
- `{ "typ": "konfetti", "bei": "..." }` – Konfetti-Regen.
- Hintergrund `spirale-<rot|orange|gruen|lila|blau|pink|gelb>` – Hypnose-Ringe für Gefühls-Momente.
- Abstimmung mit Zusatz-Weg: `"topKommentar": { "likes": 500, "bei": "Top" }` zeigt die gelbe Zeile „ODER: TOP-KOMMENTAR MIT 500 ❤ GEWINNT“ (Sprechertext dazu: „Oder der *Top-Kommentar* mit 500 Likes gewinnt.“).
- Abstimmung mit 3 Optionen: zusätzlich `"c": {...}`; jede Option kann `"unter": "schnell – aber gefährlich"` haben; `"bessereIdee": { "bei": "bessere" }` zeigt den Stempel „BESSERE IDEE?“.
- Einstieg im Karten-Stil: Szene mit `"layout": "karte", "kapitel": "MAMA", "karteFokus": 1080` → Szene als Karte auf Sternenhimmel, gelber Kapitel-Titel darüber, Untertitel darunter (y 1300). Mehrere Karten-Szenen hintereinander = Karte bleibt stehen, nur Inhalt/Kapitel wechselt.
- Steckbrief: `{ "typ": "namensschild", "text": "MO", "zipfel": "unten-rechts|unten-links" }` und `{ "typ": "info", "text": "22 Jahre", "farbe": "blau|grau|rot|gelb|gruen|lila|dunkel" }`.
- Folgen-Kopf: `"hudBei": { "szene": 4, "bei": "30" }` blendet Folge/Tage/Geld-Balken erst ein, wenn die Mission feststeht; `"fortschritt": false` schaltet den gelben Video-Fortschrittsbalken oben aus (Standard: an).
- `build.mjs <ordner> --entwurf --stumm` → Vorschau ganz ohne Ton (kein ElevenLabs-Guthaben, keine neuen Sounds).

Mama (Nebenfigur der Serie Kai): `{ "weiblich": true, "haare": "dutt", "haarFarbe": "#7a6a5a", "shirt": "#e76f9a", "schuerze": "#f6e27a", "gewicht": 0.5, "haut": "#f5c7a9" }`.

Figur-Extras: `haare: "topf"` (Topfschnitt), `haare: "tolle"` (frischer Friseurschnitt ab Folge 11: kurze Seiten, Volumen oben), `topf: true` (Kochtopf auf dem Kopf), `schuerze: "#f6e27a"`, `maske: "#7ed957"` (Gesichtsmaske in dieser Farbe, deckt Pickel und Stoppeln ab), `maskeRisse: true` (eingetrocknet), `pickel: 4` (statt `true`: Anzahl, zeigt den Fortschritt über die Folgen), rotes Gesicht mit `haut: "#f0806a", hautSchatten: "#d96a56"`, `fliegen: "viele"` (Fliegen auch im Gesicht), `sonnenbrille: true`, `goldkette: true` (Bösewicht), `kittel: true` (Arztkittel), `stethoskop: true` – Ärztin z. B. `{ weiblich: true, haare: "dutt", shirt: "#ffffff", kittel: true, stethoskop: true, hose: "#7cb7f0" }`.

Alle Hintergründe haben eigenes Licht (Vignette, Leuchtflächen), die Figur bekommt automatisch einen Bodenschatten, und Details bewegen sich leicht (LED-Farbwechsel, Neon-Flackern, PC-Lüfter, ziehende Wolken).

## Tipps für gutes Layout
- Figur `ganz` steht unten mittig (Kopf ~y 640, Füße ~y 1700). Elemente daneben: x ≈ 820–880 oder 200–260, y ≈ 450–900.
- `halbnah` füllt die untere Hälfte – Elemente dann oben (y 330–600).
- Handy-`chat` steht mittig (y 900) – Szene ohne Figur oder mit `figur: false`.
- `umfrage` füllt die Mitte – Figur dahinter mit `abdunkeln: true` oder Sunburst ohne Figur.
- Nach jedem Entwurf Snapshots ansehen und nachjustieren.

## Job-Serie („Würdest du deinen Job überleben?“)
Folgen-Kopf:
```json
{ "folge": 1, "job": "Kasse", "runden": 3, "rundeEnde": { "szene": 14 } }
```
- `job` gesetzt → HUD zeigt „JOB #1 · KASSE“ statt „FOLGE 1 · NOCH X TAGE“, der Glow-Up-Balken ist aus.
- `runden` = Gesamtzahl für „RUNDE x/3“. `rundeEnde` blendet die Runden-Pill in dieser Szene (optional `bei`) aus, z. B. bei der Wertung.

Elemente:
| `typ` | Felder | Aussehen |
|---|---|---|
| `runde` | `nr`, `bei` | kein Bild in der Szene: setzt die gelbe Pill „RUNDE nr/3“ unter der HUD-Zeile (Whoosh) |
| `wahl` | `frage` („WAS MACHST DU?“), `a: {text, icon, bei}`, `b: {…}`, `richtig: "a"\|"b"`, `zaehlen: ["Drei","Zwei","Eins"]` (Wort-Anker je Ziffer), `aufloesungBei` (Anker, sonst 0,7 s nach der letzten Ziffer), `y` (Oberkante Karte A, Standard 560), `uhrY` | Frage oben, Karten A (blau) / B (orange) fliegen rein, darunter Countdown-Kreis: Ziffer 3 → 2 → 1 springt auf das gesprochene Wort, Ring läuft ab (grün → gelb → rot). Auflösung: richtige Karte wird grün, pulsiert, Stempel „✓ RICHTIG“; falsche Karte abgedunkelt mit rotem ✗. Sounds: Whoosh je Karte, `zaehler` je Ziffer, `erfolg` + leises `fail` |
| `wertung` | `titel` (Standard „DEINE PUNKTE?“), `zeilen: [{punkte: "3/3", text, farbe: gruen\|gelb\|orange\|rot, bei}]`, `y` | dunkle Tafel, Zeilen fliegen nacheinander rein (Haken-Sound), schaltet die Abstimmungs-Musik ein |

Figur-Extra: `namensschild: "AZUBI"` (weißes Schild auf der Brust, `schildFarbe: "#ffd43b"` z. B. für „CHEF“). Nicht mit `spiegeln: true` kombinieren (Schrift wäre spiegelverkehrt).

Wahl-Szene (Muster):
```json
{
  "text": "A: Zweite Kasse rufen. B: Weiterzählen. Drei. Zwei. Eins! Richtig: *A*!",
  "hintergrund": "kasse", "abdunkeln": true,
  "figur": { "ausdruck": "panik", "rahmen": "ganz", "x": 260 },
  "elemente": [{ "typ": "wahl", "frage": "WAS MACHST DU?",
    "a": { "text": "Zweite Kasse\nrufen", "icon": "handy", "bei": "A: Zweite" },
    "b": { "text": "Ruhig\nweiterzählen", "icon": "geld", "bei": "B: Weiter" },
    "richtig": "a", "zaehlen": ["Drei", "Zwei", "Eins"], "aufloesungBei": "Richtig" }]
}
```
Achtung: `schrift.groesse` ist ein **Faktor** (0.9), keine Pixelzahl.
