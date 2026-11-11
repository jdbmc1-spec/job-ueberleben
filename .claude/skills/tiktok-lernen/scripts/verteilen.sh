#!/usr/bin/env bash
# Kopiert diesen Skill in alle Serien-Repos, die in der aktuellen Sitzung nebeneinander liegen
# (z. B. /home/user/mein-gymimperium, /home/user/kais-glowup, …). Committet nichts.
# Aufruf: bash verteilen.sh [basis-ordner]   (Standard: Ordner über dem aktuellen Repo)
set -eu
quelle=$(cd "$(dirname "$0")/.." && pwd)
basis=${1:-$(cd "$quelle/../../../.." && pwd)}
for repo in mein-doenerimperium mein-gymimperium bundeslaender-krieg dein-karrieremodus kais-glowup job-ueberleben; do
  ziel="$basis/$repo/.claude/skills/tiktok-lernen"
  [ -d "$basis/$repo/.git" ] || continue
  [ "$(cd "$basis/$repo" && pwd)/.claude/skills/tiktok-lernen" = "$quelle" ] && continue
  mkdir -p "$ziel"
  cp -r "$quelle/." "$ziel/"
  echo "→ $repo"
done
echo "Fertig. Jetzt in jedem Repo prüfen (git status) und committen."
