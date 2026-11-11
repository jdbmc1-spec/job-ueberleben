#!/usr/bin/env python3
"""Kanal-Zahlen von TikTok holen und vergleichen.

Aufruf: python3 -I kanal-zahlen.py <handle> [<handle> ...] [--anzahl 30] [--videos]
Braucht yt-dlp (pip install yt-dlp) und die TikTok-Hosts im Netzwerk der Umgebung.
--videos listet zusätzlich jedes Video (ID, Datum, Aufrufe, Likes, Kommentare, Shares, Länge, Titel).
"""
import datetime
import json
import statistics as st
import subprocess
import sys

args = [a for a in sys.argv[1:] if not a.startswith("--")]
anzahl = 30
if "--anzahl" in sys.argv:
    anzahl = int(sys.argv[sys.argv.index("--anzahl") + 1])
    args = [a for a in args if a != str(anzahl)]
einzeln = "--videos" in sys.argv
if not args:
    sys.exit(__doc__)

zeilen = []
for handle in args:
    handle = handle.lstrip("@")
    try:
        roh = subprocess.run(
            ["yt-dlp", "--flat-playlist", "--playlist-end", str(anzahl), "-J", f"https://www.tiktok.com/@{handle}"],
            capture_output=True, text=True, timeout=180,
        )
        e = json.loads(roh.stdout)["entries"]
    except Exception:
        print(f"@{handle}: nicht lesbar (privat, keine Videos oder Host gesperrt)")
        continue
    if not e:
        print(f"@{handle}: keine Videos")
        continue
    v = [x["view_count"] or 0 for x in e]
    ts = [x.get("timestamp") or 0 for x in e]
    tage = max((max(ts) - min(ts)) / 86400, 1)
    V = sum(v) or 1
    s = lambda k: sum(x.get(k) or 0 for x in e) / V * 1000
    zeilen.append((handle, len(e), len(e) / tage, st.median(v), max(v), v[0], s("like_count"), s("comment_count"), s("repost_count"), st.mean([x.get("duration") or 0 for x in e])))
    if einzeln:
        print(f"\n@{handle}")
        for x in e:
            d = datetime.datetime.fromtimestamp(x.get("timestamp") or 0).strftime("%Y-%m-%d %H:%M")
            print(f"  {x['id']}  {d}  {x['view_count']:>9}  ❤{x['like_count']:>7}  💬{x['comment_count']:>5}  ↗{x['repost_count']:>5}  {x.get('duration')}s  {(x.get('title') or '')[:70]}")

print(f"\n{'Kanal':26}{'Videos':>7}{'/Tag':>6}{'Median':>10}{'Max':>10}{'Letztes':>9}{'Likes/1k':>9}{'Komm/1k':>8}{'Shares/1k':>10}{'Ø Länge':>8}")
for z in zeilen:
    print(f"@{z[0]:25}{z[1]:>7}{z[2]:>6.1f}{z[3]:>10.0f}{z[4]:>10}{z[5]:>9}{z[6]:>9.0f}{z[7]:>8.1f}{z[8]:>10.1f}{z[9]:>7.0f}s")
