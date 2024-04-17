#!/bin/bash

# Generate a random video using FFmpeg
ffmpeg -f lavfi -i testsrc=size=1280x720:rate=30 -t 30 -c:v libx265 -preset ultrafast -tune zerolatency -pix_fmt yuv420p -crf 23 -g 30 random_video.mp4

# Stream the generated video to the FastAPI server using RTP

