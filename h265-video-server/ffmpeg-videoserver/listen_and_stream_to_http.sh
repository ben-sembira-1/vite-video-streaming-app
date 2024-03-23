#!/bin/bash

ffmpeg -protocol_whitelist file,udp,rtp -i session.sdp -payload_type 96 -c:v copy -f rawvideo - | \
while IFS= read -r -d '' frame_data; do
    echo "----------------------------------------"
    echo "frame_data: $frame_data"
    echo "$frame_data" | ffmpeg -loglevel quiet -f rawvideo -r:v 30 -i - -c:v libx265 -crf 28 -f mpegts - | \
    curl -X POST -H "Content-Type: multipart/form-data" -F "file=@-" http://localhost:8080/stream/ <<< "$frame_data"
    echo "----------------------------------------"
done


