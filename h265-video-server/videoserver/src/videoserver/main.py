from fastapi import FastAPI

app = FastAPI()


@app.get("/users/{username}")
async def read_user(username: str):
    return {"message": f"Hello {username}"}