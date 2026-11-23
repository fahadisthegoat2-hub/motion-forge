#!/bin/bash
# usage: prep.sh  → qa + render + av check on the current scene (no round yet)
cd /home/user/motion-forge
S=scenes/dont-press/dont-press.html
node scripts/qa_check.js $S 2>&1 | tail -4 | cut -c1-200
node scripts/render_video.js $S scenes/dont-press/prev.mp4 --fast --width 404 --height 720 --fps 12 >/dev/null 2>&1
node scripts/av_check.js scenes/dont-press/prev.mp4 --out scenes/dont-press/dont-press_qa --scene $S 2>&1 | tail -6 | cut -c1-200
