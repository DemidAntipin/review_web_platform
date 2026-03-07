from fastapi import FastAPI
from src.routers import auth, project_manager

app = FastAPI()
app.include_router(auth.router)
app.include_router(project_manager.router)

@app.get("/")
def foo():
    return {"message": "Hello World!"}
