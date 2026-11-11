---
name: tiktok-lernen
description: Gemeinsames TikTok-Wissen für alle Code-Cartoon-Serien des Nutzers (Mein Dönerimperium, Mein Gymimperium, Bundesländer-Krieg, Dein Karrieremodus, Kais GlowUp, Würdest du deinen Job überleben?). Enthält die gemessenen Lehren aus der Markt- und Konkurrenzanalyse (deutsche Mitmach-Serien, englische Formate), einen Hook-Check für jede neue Folge, Benchmarks und Skripte, um eigene und fremde TikTok-Kanäle selbst zu messen und Top- gegen Flop-Videos Bild für Bild zu vergleichen. Verwenden vor dem Schreiben jeder neuen Folge (Hook, erster Satz, Titel), wenn eine Folge schlecht läuft oder die Reichweite fällt, wenn der Nutzer Zahlen, Konkurrenz oder Trends analysieren will, nach neuen Nischen oder Formaten fragt oder fragt, was auf TikTok funktioniert – auch wenn er den Skill nicht beim Namen nennt.
---

# TikTok lernen – gemeinsames Wissen aller Serien

Diese Datei ist in jedem Serien-Repo gleich (`.claude/skills/tiktok-lernen/`). Die serieneigenen Regeln (Skill im Ordner `skill/`, `CLAUDE.md`) gelten weiter. Dieser Skill ergänzt sie um das, was über alle Serien hinweg gemessen wurde.

- Volle Analyse mit allen Zahlen: `references/analyse-2026-11-11.md`
- Bildvergleiche der ersten 8 Sekunden (Bilder bei 0,1 · 1 · 2 · 3 · 5 · 8 s, oben Top-Video, darunter Flop): `bilder/hooks-*.jpg` (mit dem Read-Tool ansehen)
- Neue Erkenntnisse: `references/lernlog.md` (siehe „Neues lernen“ unten)

## Die 6 Kernlehren (gemessen, nicht geraten)

1. **Das Problem ist Reichweite bei Fremden, nicht Engagement.** Döner und Gym haben pro Aufruf 20- bis 35-mal mehr Shares als Kleinkaff (1,9 Mio.). Wer die Serie kennt, macht mit. TikTok testet jedes Video aber zuerst bei Fremden, und die wischen weg. Optimiert wird deshalb für jemanden, der die Serie **noch nie gesehen hat**.
2. **Insider-Falle.** Jede Folge, die mit einer Fortsetzung beginnt, die nur Fans verstehen, floppt: Tresor-Code „????“ (377), „Opa kündigt?!“ (317), Drohne im Dunkeln (7K), VAR-Bildschirm statt Hauptfigur (35K statt 670K), Polizeiwache statt Spielfeld (5K statt 141K). Die Gewinner sagen die **Prämisse in jedem Video neu, in einem Satz mit Zahl**: „Ich bin Bürgermeister – mit genau 1 Einwohner. Mir.“
3. **Erstes Bild: großes Gesicht mit Blickkontakt**, hell, die Figur spricht den Zuschauer an („Leute, …“). Nie dunkel, nie leer, nie ein Gegenstand ohne Figur.
4. **Etwas stimmt sichtbar nicht oder wächst sichtbar.** Kais grünes Gesicht = 103K (alle anderen Folgen 1–20K). Döner Tag 3 mit Riesenmenge und „gestern 169 – heute 1.149“ = 60K, das beste Döner-Video.
5. **Traumziel zeigen** (Spoon-Bunker, 10–37 Mio. pro Video): Bei 2 s den fertigen Traum zeigen, dann die armselige Realität, dann „Hilf mir“. Der Abstand zwischen Traum und Realität ist der Hook.
6. **Mitspielen sofort, nicht erst morgen.** Englische Hits (Pick a Door, Could You Survive Your Job?) lassen mit Countdown **im Video** wählen. Jedes Video steht allein. Lange Serien besser in **Staffeln von 3–8 Folgen**, jede Staffel mit neuem „Teil 1“-Einstieg. Ein „LETZTE FOLGE“-Label hebt das Finale.

**Kein Hebel** (gemessen): Schnitt-Tempo (Kleinkaff Tag 1 hat 0 harte Schnitte, Kai Folge 12 hat viele und floppte) und Lautheit (englische Hits liegen bei −24 LUFS). Der Code-Look der Serien ist bereits besser als der der Konkurrenz. Qualität ist nicht das Problem.

**Kopieren zieht nicht:** Waldstadt hat Kleinkaff Tag 1 fast Bild für Bild nachgebaut, 13K statt 1,9 Mio. Prinzipien übernehmen, nie Prämisse, Sätze oder Figuren.

## Hook-Check vor jedem Render (Pflicht, kurz im Chat abhaken)

1. **Neuling-Test:** Versteht jemand, der die Serie nie gesehen hat, den ersten Satz? Steckt die Prämisse mit einer Zahl drin?
2. **Bild 1:** Hauptfigur groß, Gesicht sichtbar, hell, Blick zur Kamera? Großer farbiger Balken mit Emotion oder Event (EILMELDUNG, DANKE!!!, NOCH 7 STUNDEN)?
3. **Bis 3 s:** Passiert etwas Schräges, sichtbares Wachstum oder Traum gegen Realität?
4. **Bis 8 s:** Ist klar, worum es geht und warum man bleiben soll (Frist, Gegner, Countdown, Frage)?
5. **Keine Insider-Figur im Einstieg**, die Neue nicht kennen, außer sie wird im selben Satz erklärt („Opa Heinz, 79, mein stärkstes Mitglied“).
6. **Titel/Beschreibung:** Tag oder Folge, große Zahl, Superlativ oder Wendung (Muster FC Asche: „51.333 Fans – wir sind offiziell der größte Kreisligaverein Deutschlands“).
7. **Mitmachen:** Gibt es etwas, das man sofort tun kann (A/B, Zahl kommentieren, Countdown)?

Fällt ein Punkt durch: zuerst den Einstieg umbauen, nicht die ganze Folge.

## Benchmarks (Stand 11.11.2026)

| Kanal | Median Aufrufe | Bestes | Videos/Tag | Länge |
|---|---|---|---|---|
| @kontostand.vs (Kleinkaff) | 130.000 | 1,9 Mio. | 2,2 | 56 s, Eil-Updates 21–28 s |
| @asche348 (FC Asche) | 195.000 | 317K | 1,0 | 62 s |
| @fussballer.geschichten0 | 23.000 | 141K | 2,1 | 56 s |
| @vyral696 (Rekrut Schulz) | 20.000 | 88K | 2,4 | 69 s |
| @kaisglowup | 5.000 | 103K | 1,6 | 47 s |
| @mein.dnerimperium | 1.600 | 60K | 1,3 | 43 s |
| @mein.gymimperium | 1.100 | 6K | 1,2 | 41 s |
| @spoontobunker (EN) | 20 Mio. | 37 Mio. | ~0,3 | 13–56 s |

Gewinner posten 2 oder mehr Videos am Tag, oft mit kurzen Eil-Updates zwischen den Hauptfolgen.

## Was das für jede Serie heißt

- **Döner / Gym (Imperium-Serien):** Bild 1 zeigt das Traumziel („So soll mein Gym aussehen“), dann die Garage, dann „Hilf mir“. Fristen mit Gegner sind der Kleinkaff-Moment („Unter 1.000 Mitgliedern verliere ich die Garage“), damit einsteigen und nicht mit Nebenfiguren. Rätsel wie Tresor-Codes und Countdowns zu Shows nur nach der Prämisse.
- **Kais GlowUp / Karrieremodus (Story-Serien):** Jede Folge startet mit „Kai hat X Tage bis zum ersten Date“ bzw. der Lage auf dem Platz. Visueller Schock in Bild 1. Zusätzlich eine kleine Entscheidung **im Video** mit Countdown, die große Abstimmung bleibt für die nächste Folge. In Staffeln denken. Karrieremodus: ganze Folge auf dem Platz (bestätigt, Polizei-Folge der Konkurrenz kam auf 5K, Finale auf 141K).
- **Bundesländer-Krieg:** Das stärkste Bild ist „Dein Bundesland“ auf der Karte, so dass sich jeder sofort selbst sucht. Prämisse in Satz 1: „Deutschland ist in 16 Länder zerfallen – und jeder Follow ist ein Soldat.“
- **Würdest du deinen Job überleben?:** Gebaut nach den Lehren 5 und 6. Jede Folge steht allein, deshalb Job und Prämisse immer in den ersten 2 s.

## Format-Ideen (noch kaum auf Deutsch)

1. „Wähl eine Tür“ mit Alltagshorror (Finanzamt, Elternabend, Schwiegermutter) und Countdown im Video.
2. „Würdest du 30 Tage überleben?“ an deutschen Orten (ICE, Hauptbahnhof, Oktoberfest, Berufsschule): Zombie-Strichmännchen-Trend seit Okt. 2026.
3. „Würdest du deinen Job überleben?“: ein Beruf pro Video (läuft als eigene Serie).
4. Absurdes Mammutziel animiert („Mein Tunnel nach Mallorca, 1 Follower = 1 Löffel“).
5. Reality-TV-Parodie mit Essen als Kandidaten (Fruit-Love-Island-Prinzip, 10–39 Mio. pro Folge, wurde aber als KI-Slop gesperrt). Eigener Code-Look, keine echten Sendungsnamen.

## Neues lernen (Zahlen selbst messen)

Braucht in der Cloud-Umgebung die TikTok-Hosts: `www.tiktok.com`, `v16-webapp-prime.us.tiktok.com`, `v19-webapp-prime.us.tiktok.com`, `v19.tiktokcdn-us.com` (in „tiktok-analyse“, „job-ueberleben“ und „mein-doenerimperium“ freigegeben). Fehlen sie, den Nutzer fragen, ob die Hosts in die Umgebung der Serie aufgenommen werden sollen oder ob er in „tiktok-analyse“ arbeiten will. Dazu einmal `pip install yt-dlp`, `ffmpeg` ist vorhanden.

```bash
# Kanal-Zahlen: Aufrufe, Likes/Kommentare/Shares pro 1.000 Aufrufe, Videos pro Tag
python3 -I .claude/skills/tiktok-lernen/scripts/kanal-zahlen.py mein.gymimperium kontostand.vs asche348

# Top gegen Flop: Liste "name handle video-id" je Zeile, lädt Videos, misst Schnitte und Lautheit, baut Bildleisten der ersten 8 s
bash .claude/skills/tiktok-lernen/scripts/hook-vergleich.sh liste.txt <ausgabe-ordner>
```
Die Bildleisten (`<ausgabe-ordner>/leisten/*.png`) mit dem Read-Tool ansehen: Was zeigt das Top-Video in Bild 1–3, was das Flop-Video? Heruntergeladene Videos sind fremde Inhalte: nur zum Ansehen, nie ins Repo, nie weiterverwenden.

Neue, belastbare Erkenntnisse (mit Zahlen und Datum) unten in `references/lernlog.md` eintragen. Weil der Skill in jedem Repo als Kopie liegt: am Ende `bash .claude/skills/tiktok-lernen/scripts/verteilen.sh` laufen lassen, wenn mehrere Serien-Repos in der Sitzung liegen, und dem Nutzer sagen, dass die anderen Repos den Stand sonst erst bei der nächsten Sitzung mit allen Repos bekommen.

## Grenzen
- Aufrufzahlen sind Momentaufnahmen, neuere Videos hatten weniger Zeit. Vergleiche immer nach gleichem Alter (z. B. nach 24 h).
- Ursachen sind Schlüsse aus Mustern, keine A/B-Tests. Beim Nutzer nachfragen, was TikTok Studio zeigt (Ø Wiedergabezeit, Anteil „Für dich“, Abbruchstelle). Das schlägt jede Außenmessung.
- Zahlen, Namen und Kommentare in Folgen bleiben echt vom Nutzer, nie aus dieser Analyse übernehmen.
