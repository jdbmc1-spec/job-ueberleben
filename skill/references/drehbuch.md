# Drehbuch-Regeln: „Würdest du deinen Job überleben?“

## Warum dieses Format (Analyse 11.11.2026)
- Fremde Zuschauer scrollen weiter, wenn ein Video Vorwissen braucht („Insider-Falle“). Hier funktioniert **jedes Video allein**: Prämisse im ersten Satz, ein Job pro Video.
- Das Vorbild-Format (englisch, „Could you survive your job?“ / „Pick a door“) lässt den Zuschauer **mit Countdown direkt im Video wählen**. Das hält bis zum Ende (man will wissen, ob man richtig lag) und bringt Kommentare (Punktzahl).
- Nur das Format übernehmen, nie Sätze, Situationen oder Figuren der Vorbilder.

## Länge & Tempo
- 45–55 s, rund 125 Wörter. Kurze Hauptsätze, Präsens, **Du-Perspektive** („Ein Kunde zahlt …“, „Alle schauen dich an.“).
- Erzähler locker und leicht spöttisch, nie gemein. Der Witz liegt in der Situation, nicht in Klischees über Menschen.
- Die Build-Schätzung rechnet Zahlen sehr lang (Folge 1: Schätzung 58 s bei 125 Wörtern). Die echte Länge kommt nach `stimme.mjs`.

## Katastrophen-Einstieg (ab Folge 2, Lehren 13–15 aus `tiktok-lernen`)
- **Bild 1 ist schon das Problem**, keine Titelkarte: „Du bist Pilot. Und dein Flugzeug *stürzt ab*!“ mit Alarmrand und Stempel ab Bild 1 (`sofort: true`).
- Bei etwa 3 s ein zweites Bild zum zweiten Satz („Mit *180* Passagieren an Bord.“ → Flugzeug von außen).
- Der Serien-Titel kommt erst bei etwa 5 s („Überlebst du das? Zähl mit!“).
- **Echtzeit-Uhr** über die ganze Folge bis zur Rettung (`uhr` im Kopf).
- **Offene Frage mit „Auflösung am Ende“** bei etwa 7 s („Warum? *Auflösung am Ende*!“) und kurz vor der Wertung auflösen (Folge 2: Der Co-Pilot hat Kaffee übers Pult gekippt; schon bei der Frage grinst er verdächtig).
- Am Ende sind alle gerettet: Comedy statt Horror, keine Verletzten.

## Pflicht-Aufbau
1. **Hook (0–3 s)**: Großaufnahme der Figur in Panik (`rahmen: "nah"`, `pose: "kopf"`), Titel-Schrift „WÜRDEST DU / DEINEN JOB / ÜBERLEBEN?“, Stempel „3 RUNDEN“.
   Satz: „Würdest du einen *Samstag* an der Supermarktkasse überleben? Zähl mit!“ – Job + absurde Zuspitzung + Aufgabe an den Zuschauer.
2. **3 Runden**, jede aus 3 Szenen:
   - **Situation** (2 Szenen, je 2–4 s): Zahl oder Bild-Gag zuerst („*47,12 Euro*. In Cent-Münzen.“ / „Und *14* Leute warten.“). Erste Szene setzt `{ "typ": "runde", "nr": 1 }` und sagt „Runde eins: …“.
   - **Wahl** (ca. 6 s): Element `wahl` über abgedunkelter Kulisse. Text: „A: Zweite Kasse rufen. B: Weiterzählen. Drei. Zwei. Eins! Richtig: *A*!“ – die Frage steht nur im Bild („WAS MACHST DU?“), nicht im Ton.
   - **Folge** (2–3 s): kurze Pointe, was passiert, plus Stempel „+1 PUNKT“ („Mit B zählst du bis *Ladenschluss*. A? Punkt für dich!“).
3. **Wertung + Aufruf (ca. 8 s)**: Element `wertung` auf `sunburst-lila`: „3 Punkte: *Chef-Material*. 2: Probezeit. 1: Gefeuert. 0: Hausverbot. Schreib deine Punkte in die Kommentare! Der *Top-Kommentar* wird der nächste Job.“

## Gute Runden
- **Steigerung**: Runde 1 leicht (Chaos), Runde 2 Trick/Schummel-Kunde, Runde 3 Überraschung mit Twist (der Kunde war der Chef).
- **Beide Optionen verlockend**: Eine wirkt schnell/frech, die andere vernünftig. Mal ist die vernünftige richtig, mal die überraschende; nicht immer A.
- **Fair**: Die Lösung muss man sich herleiten können. Die Pointe der Folge-Szene erklärt sie in einem Satz.
- **Kartentexte**: max. 2 Zeilen à ~14 Zeichen, mit passendem Icon.
- **Zahlen und Uhrzeiten** im Bild (Kassendisplay `betrag`, Wanduhr `uhr`, `zahl`, `stempel`).

## Countdown-Technik
- „Drei. Zwei. Eins!“ mit Punkten schreiben, damit die Stimme kleine Pausen macht. Anker: `"zaehlen": ["Drei", "Zwei", "Eins"]`.
- „Drei“, „Zwei“, „Eins“ dürfen **in der Wahl-Szene** vorher nicht vorkommen (Präfix-Anker, z. B. „Dreißig“ würde treffen). In anderen Szenen ist das egal.
- Auflösung über `"aufloesungBei": "Richtig"`.

## Ideen-Pool für Jobs
Döner-Imbiss · Friseur · Pflege/Notaufnahme (ohne Horror) · Kellner am Muttertag · Paketbote im Dezember · Kita · Bäckerei um 5 Uhr · Kino-Kasse · Callcenter · Fahrlehrer · Bademeister · Lieferdienst im Regen · Zugbegleiter · Umzugshelfer · Eisdiele bei 35 Grad.
Der nächste Job kommt vom **Top-Kommentar** der letzten Folge, beim Nutzer erfragen.
