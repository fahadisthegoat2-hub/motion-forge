#!/bin/bash
# one full review round: qa gate → preview render → av forensics → snapshot → proof files
set -e; cd "$(dirname "$0")/.."; S=../../scripts
node build.js
node $S/qa_check.js okene.html > qa.log 2>&1 || true; grep -v "^\[" qa.log | head -12
node $S/render_video.js okene.html prev.mp4 --fast --width 540 --height 960 > render.log 2>&1; tail -2 render.log
node $S/av_check.js prev.mp4 --out okene_qa > av.log 2>&1 || true; tail -6 av.log
node $S/review_log.js okene.html --round 2>&1 | tail -3
N=$(node $S/review_log.js okene.html --status 2>&1 | grep -o "round [0-9]*" | tail -1 | grep -o "[0-9]*")
node tools/proof.js $N prev.mp4 > /dev/null && node tools/fullres.js $N 0.5 && echo "proof r$N"
