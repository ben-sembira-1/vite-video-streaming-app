from typing import Any
from fastapi.responses import JSONResponse
from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket
import base64
import os
import time
from urllib import response
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from fastapi import FastAPI, BackgroundTasks, UploadFile
from pydantic import BaseModel
import socket

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


websockets = []


@app.websocket("/camera-video")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websockets.append(websocket)
    try:
        while True:
            # Get frame data from all clients
            frame_data = await websocket.receive_text()
            # Broadcast frame data to all clients
            for ws in websockets:
                await ws.send_text(frame_data)
    except Exception as e:
        print(f"WebSocket connection error: {e}")
        websockets.remove(websocket)


@app.post("/stream/")
async def stream_video(file: UploadFile = File(...)):
    if file:
        content = await file.read()
        chunk = base64.b64encode(content).decode('utf-8')
        for ws in websockets:
            print(chunk)
            await ws.send_text(chunk)
        return JSONResponse(
            content={"base64_data": chunk},
            media_type="video/mp4"
        )
    else:
        raise HTTPException(status_code=400, detail="No file received")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
