#!/bin/bash
# one review round: gates + render + snapshot + proof files.  usage: tools/round.sh N [full]
cd "$(dirname "$0")/.."; N=$1; M=../../scripts
node build.js 2>/dev/null
node $M/qa_check.js great-impostor.html --target 29.09 > /tmp/claude-0/qa.log 2>&1; tail -1 /tmp/claude-0/qa.log
node $M/render_video.js great-impostor.html prev.mp4 --fast --width 270 --height 480 --fps 12 > /tmp/claude-0/rv.log 2>&1
node $M/av_check.js prev.mp4 --out great-impostor_qa 2>&1 | grep -v '^\[' | tail -4
node $M/review_log.js great-impostor.html --round 2>&1 | tail -2
node tools/proof.js $N prev.mp4 > /dev/null
R=great-impostor_qa/r$N
for f in tools/notes/*.txt; do { cat $f; echo "# round $N · $(date -Is)"; } > $R/$(basename $f); done
if [ "$2" = full ]; then node tools/fullres.js $N 0.5 > /dev/null 2>&1; FF=$(node -e "console.log(require('/home/user/motion-forge/scripts/lib/deps').ffmpeg())"); $FF -loglevel error -y -pattern_type glob -i "$R/full_*.jpg" -vf "scale=216:-1,tile=8x2" -frames:v 1 $R/full_sheet.jpg; fi
echo ROUND $N READY
