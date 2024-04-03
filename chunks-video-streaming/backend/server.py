from fastapi import FastAPI, Response, File
from fastapi.responses import StreamingResponse
import os

app = FastAPI()

videoFileMap = {
    'ffmpeg': 'videos/random_video.mp4',
    'vikings': 'videos/vikings_short.mp4 (360p).mp4'
}

@app.get('/videos/{filename}')
async def stream_video(filename: str, response: Response):
    filePath = videoFileMap.get(filename)
    if not filePath or not os.path.exists(filePath):
        response.status_code = 404
        return {"error": "File not found"}

    stat = os.stat(filePath)
    fileSize = stat.st_size
    range_header = response.headers.get("range")

    if range_header:
        start, end = range_header.replace("bytes=", "").split("-")
        start = int(start)
        end = int(end) if end else fileSize - 1

        chunksize = end - start + 1
        file = open(filePath, "rb")
        file.seek(start)
        content_range = f"bytes {start}-{end}/{fileSize}"

        headers = {
            'Content-Range': content_range,
            'Accept-Ranges': 'bytes',
            'Content-Length': str(chunksize),  # Convert to string
            'Content-Type': 'video/mp4'
        }

        return StreamingResponse(iter(lambda: file.read(chunksize), b''), headers=headers, status_code=206)
    else:
        headers = {
            'Content-Length': str(fileSize),  # Convert to string
            'Content-Type': 'video/mp4'
        }
        return StreamingResponse(open(filePath, "rb"), headers=headers)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=3000)
