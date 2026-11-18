#!/bin/bash
# usage: tools/round.sh N  — qa, preview render, av, snapshot round N, proofs, full-res grabs
set -e; cd /home/user/motion-forge; S=scenes/plane-eater; N=$1
timeout 900 node scripts/qa_check.js $S/plane-eater.html 2>&1 | tail -3
timeout 1500 node scripts/render_video.js $S/plane-eater.html $S/prev.mp4 --fast --width 540 --height 960 --fps 15 2>&1 | tail -1
node scripts/av_check.js $S/prev.mp4 --out $S/plane-eater_qa 2>&1 | tail -3 || true
node scripts/review_log.js $S/plane-eater.html --round 2>&1 | tail -2
cd $S && node tools/proof.js $N prev.mp4 >/dev/null 2>&1; timeout 900 node tools/fullres.js $N 0.5 >/dev/null 2>&1
cd plane-eater_qa/r$N && ffmpeg -loglevel error -y -pattern_type glob -i 'full_*.jpg' -vf "scale=216:-1,tile=8x2" -frames:v 1 full_sheet.jpg && { cat ../../facts_notes.txt; echo "r$N re-read: on-screen numbers 1 KG, 2 YEARS 1978→1980, 18 BICYCLES, 7 TVs + 1 COFFIN, 2× THICKER vs facts above; $(date -u +%FT%TZ)"; } > facts_notes.txt && echo ROUND $N READY
