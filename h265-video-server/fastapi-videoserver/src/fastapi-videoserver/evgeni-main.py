from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, WebSocket
import subprocess
import shlex
import logging
import traceback
import asyncio

app = FastAPI()

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logging.basicConfig(level=logging.ERROR, format='%(asctime)s - %(levelname)s - %(message)s')

# Allow CORS for all origins for development purposes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

@app.get("/video")
async def get_video():
    return FileResponse("random_video.mp4")

# WebSocket endpoint for WebRTC signaling
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    logging.info("here!")
    await websocket.accept() 

    # Start ffmpeg to stream video
    logging.info("running ffmpeg")
    ffmpeg_cmd = "ffmpeg -re -i random_video.mp4 -an -vcodec libx264 -pix_fmt yuv420p -f rtp rtp://localhost:5000"
    ffmpeg_process = subprocess.Popen(shlex.split(ffmpeg_cmd), stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    logging.info(f"process opened, pid: {ffmpeg_process}")
    while True:
        logging.info(f"inside while")

        try:
            await asyncio.sleep(5)  # Wait for 5 seconds
            message = "Hello from FastAPI!"
            # Read video stream from ffmpeg
            await websocket.send_text("Hello from FastAPI!")
            logging.info(f"before read")
            data = ffmpeg_process.stdout.read(65536)
            logging.info(f"data from process: {data}")
            if not data:
                logging.info("break")
                await websocket.send_text("No data!")
                break
            # Relay video stream to the client
            logging.info(f"sending data: {data}")
            await websocket.send_bytes(data)
            logging.info("data sent successfully!")
        except Exception as e:
            traceback.print_exc()
            error_message = str(e)  # Convert exception object to string
            print(error_message)  # Print the error message to console
            logging.error(f"Error sending data: {error_message}")  # Log the error message
            break

    # Terminate ffmpeg process
    ffmpeg_process.terminate()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, access_log=False)
