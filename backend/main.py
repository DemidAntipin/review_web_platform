from fastapi import FastAPI
from src.routers import auth

app = FastAPI()
app.include_router(auth.router)

@app.get("/")
def foo():
    return {"message": "Hello World!"}
