#!/usr/bin/env bash
# Top- gegen Flop-Videos vergleichen: lädt Videos, misst Schnitte und Lautheit, baut Bildleisten der ersten 8 Sekunden.
# Aufruf: bash hook-vergleich.sh <liste.txt> <ausgabe-ordner>
# liste.txt: je Zeile "name handle video-id", z. B. "gym_tag1_6k mein.gymimperium 7705479782271667489"
#            (Name frei wählbar, Aufrufe im Namen helfen beim Lesen; IDs liefert kanal-zahlen.py --videos)
# Ergebnis: <ausgabe>/leisten/<name>.png (6 Bilder: 0,1 · 1 · 2 · 3 · 5 · 8 s), <ausgabe>/vergleich.png (alle untereinander), Messwerte im Terminal.
# Die Videos sind fremde Inhalte: nur zum Ansehen, nie ins Repo legen.
set -u
liste=$1; aus=${2:-./hook-vergleich}
mkdir -p "$aus/videos" "$aus/leisten"
namen=()
while read -r name handle id <&3; do
  [ -z "${name:-}" ] && continue
  case "$name" in \#*) continue;; esac
  f="$aus/videos/$name.mp4"
  if [ ! -f "$f" ]; then
    # Nur h264-Formate (ffmpeg liest sie sicher); zuerst Server aus der Allowlist
    timeout 150 yt-dlp -q --no-warnings -f "b[vcodec^=h264]/b" -S "vcodec:h264,res:540" -o "$f" \
      "https://www.tiktok.com/@$handle/video/$id" 2>&1 | tail -1
  fi
  [ -f "$f" ] || { echo "$name: Download fehlgeschlagen (Host gesperrt? siehe SKILL.md)"; continue; }
  namen+=("$name")
  dauer=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  schnitte=$(ffmpeg -hide_banner -i "$f" -vf "select='gt(scene,0.3)',showinfo" -an -f null - 2>&1 | grep -o "pts_time:[0-9.]*" | cut -d: -f2 | tr '\n' ' ')
  lufs=$(ffmpeg -hide_banner -i "$f" -af ebur128 -vn -f null - 2>&1 | grep -A1 "Integrated loudness" | grep -o "\-[0-9.]*" | head -1)
  python3 -I -c "
d=float('$dauer'); c=[float(x) for x in '$schnitte'.split()]
print(f'$name | {d:.0f} s | Schnitte {len(c)} ({len(c)/d*10:.1f} pro 10 s, {len([x for x in c if x<8])} in den ersten 8 s) | ${lufs:-?} LUFS')"
  tmp=$(mktemp -d)
  for t in 0.1 1 2 3 5 8; do ffmpeg -v error -y -ss $t -i "$f" -frames:v 1 -vf scale=180:-2 "$tmp/$t.png"; done
  ffmpeg -v error -y $(for t in 0.1 1 2 3 5 8; do echo -i "$tmp/$t.png"; done) -filter_complex "hstack=inputs=6" "$aus/leisten/$name.png"
  rm -rf "$tmp"
done 3< "$liste"
if [ ${#namen[@]} -gt 1 ]; then
  ein=""; fil=""; i=0
  for nme in "${namen[@]}"; do ein="$ein -i $aus/leisten/$nme.png"; fil="$fil[$i]scale=1080:-2[s$i];"; i=$((i+1)); done
  for j in $(seq 0 $((i-1))); do fil="$fil[s$j]"; done
  ffmpeg -v error -y $ein -filter_complex "${fil}vstack=inputs=$i" "$aus/vergleich.png" && echo "Vergleichsbild: $aus/vergleich.png (Reihenfolge wie in der Liste)"
fi
