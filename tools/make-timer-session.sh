#!/usr/bin/env bash
# Rebuilds timer-session.mp3 (one ~55-minute media file) from the three cue files, so the timer voices can keep playing
# when the iPhone is locked or another app is open. Timeline: start cue at 0:00, "5 minutes left" at 50:00, "finished" at 55:00.
# Needs ffmpeg with libmp3lame. Usage: tools/make-timer-session.sh   (run from the repository root)
set -euo pipefail
ffmpeg -y -loglevel error -f lavfi -i anullsrc=r=22050:cl=mono -i timer-start.mp3 -i timer-warning.mp3 -i timer-end.mp3 \
  -filter_complex "[1]aresample=22050,adelay=0|0[a];[2]aresample=22050,adelay=3000000|3000000[b];[3]aresample=22050,adelay=3300000|3300000[c];[0][a][b][c]amix=inputs=4:normalize=0:duration=first" \
  -t 3303.5 -ac 1 -ar 22050 -c:a libmp3lame -q:a 6 -map_metadata -1 -id3v2_version 0 -write_xing 1 timer-session.mp3
ffprobe -v error -show_entries format=duration,size -of default=nw=1 timer-session.mp3
