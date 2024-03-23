# sudo apt-get update && sudo apt-get install -y ffmpeg


# -f lavfi -i testsrc=size=1920x1080:rate=30: This part generates a test video source using the lavfi filtergraph, 
#       specifically the testsrc filter with a size of 1920x1080 and a frame rate of 30 frames per second.
# -c:v libx265: This sets the video codec to libx265, 
#      which is an HEVC (High Efficiency Video Coding) encoder.
# -crf 28: This sets the Constant Rate Factor (CRF) for the video encoding. 
#      Lower values mean higher quality and larger file sizes, 
#      while higher values mean lower quality and smaller file sizes. 28 is a moderate quality setting.
# -f rtp rtp://localhost:8080: This sets the output format to RTP (Real-time Transport Protocol) and streams the output to localhost on port 8080.

# ffmpeg -i rtp://localhost:7000 -c:v copy -f rawvideo - | \
# ffmpeg -f rawvideo -pixel_format yuv420p -video_size 1920x1080 -framerate 30 -i - -c:v libx265 -crf 28 -f hevc http://localhost:8080/stream

# ffmpeg -loglevel debug -protocol_whitelist file,udp,rtp -i session.sdp -max_muxing_queue_size 1024 -c:v libx265 -crf 28 -f rtp - | \
# ffmpeg -i - -c:v copy -f mpegts - | \
# curl -X POST -H "Content-Type: application/octet-stream" --data-binary @- http://localhost:8080/stream/

# ffmpeg -protocol_whitelist file,udp,rtp -i session.sdp -c:v libx265 -crf 28 -f rtp output.mp4

# ffmpeg -loglevel debug -protocol_whitelist file,udp,rtp -i session.sdp -c:v copy -f rawvideo - | \
# ffmpeg -loglevel debug -f rawvideo -pix_fmt yuv420p -s:v 1920x1080 -r:v 30 -i - -c:v libx265 -crf 28 -f mpegts - | \
# curl -X POST -H "Content-Type: application/octet-stream" --data-binary @- http://localhost:8080/stream/

# ffmpeg -protocol_whitelist file,udp,rtp -i session.sdp -c:v copy -f rawvideo - | \
# ffmpeg  -f rawvideo -pix_fmt yuv420p -s:v 1920x1080 -r:v 30 -i - -c:v libx265 -crf 28 -f mpegts - | \
# curl -v -X POST -H "Content-Type: application/octet-stream" --data-binary @- http://localhost:8080/stream/

ffmpeg -protocol_whitelist file,udp,rtp -i session.sdp -payload_type 96 -c:v copy -f rawvideo - | \
while IFS= read -r -d '' frame_data; do
    echo "----------------------------------------"
    echo "frame_data: $frame_data"
    echo "$frame_data" | ffmpeg -loglevel quiet -f rawvideo -r:v 30 -i - -c:v libx265 -crf 28 -f mpegts - | \
    curl -X POST -H "Content-Type: multipart/form-data" -F "file=@-" http://localhost:8080/stream/ <<< "$frame_data"
    echo "----------------------------------------"
done


