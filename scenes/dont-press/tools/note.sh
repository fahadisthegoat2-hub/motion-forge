#!/bin/bash
# note.sh N → rN/audio_notes.txt from this round's av.json (measured, not typed)
cd /home/user/motion-forge/scenes/dont-press/dont-press_qa
{ echo "round $1 audio measurements $(date +%s)"; python3 -c "import json;print(json.dumps(json.load(open('av.json')),indent=1)[:1500])"; } > r$1/audio_notes.txt
