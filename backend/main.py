from fastapi import FastAPI
from src.routers import auth, project_manager
from contextlib import asynccontextmanager
from src.core.events.event_dispatcher import EventDispatcher
from src.core.events.listeners.activity_log_listener import ActivityLogListener

@asynccontextmanager
async def lifespan(app: FastAPI):
    EventDispatcher.add(ActivityLogListener())
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(auth.router)
app.include_router(project_manager.router)

@app.get("/")
def foo():
    return {"message": "Hello World!"}
