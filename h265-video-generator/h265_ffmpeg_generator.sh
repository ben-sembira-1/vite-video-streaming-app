#!/bin/bash

# random data
# ffmpeg -f lavfi -i testsrc=size=1920x1080:rate=30 -c:v libx265 -crf 28 -f rtp rtp://localhost:7000


# ffmpeg -re -i input.mp4 -map 0:v:0 -c:v libx265 -crf 28 -f rtp rtp://localhost:7000

# file 
#while true; do
#    ffmpeg -t 10 -f lavfi -i testsrc=size=1920x1080:rate=30 -map 0:v:0 -c:v libx265 -crf 28 -f rtp rtp://localhost:7000?pkt_size=1316
#done
ffmpeg -f lavfi -i testsrc=size=1920x1080:rate=30 -vf "drawtext=fontfile=/Library/Fonts/Arial.ttf:text='%{pts\:hms}':x=10:y=10:fontsize=24:fontcolor=white" -c:v libx265 -crf 28 -f mpegts - | ffmpeg -i - -vf "drawtext=fontfile=/Library/Fonts/Arial.ttf:text='%{pts\:hms}':x=10:y=10:fontsize=24:fontcolor=white" -c:v libx264 -f mpegts udp://localhost:1234
