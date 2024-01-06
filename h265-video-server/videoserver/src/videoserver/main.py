import asyncio
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import uvicorn


app = FastAPI()


@app.get("/users/{username}")
async def read_user(username: str):
    return {"message": f"Hello {username}"}

@app.get("/video")
async def video_endpoint():
    def iterfile():
        with open("/workspaces/vite-video-streaming-app/h265-video-server/videoserver/example.mp4", mode="rb") as file_like:
            yield from file_like
    return StreamingResponse(iterfile(), media_type="video/mp4")

async def uvicorn_server():
    server = uvicorn.Server(
        uvicorn.Config("videoserver.main:app", port=7000, log_level="debug", reload=True)
    )
    await server.serve()

def run_server():
    asyncio.run(uvicorn_server())

if __name__ == "__main__":
    run_server()
