from fastapi import FastAPI
from src.routers import auth, project_manager, logger
from contextlib import asynccontextmanager
from src.core.events.event_dispatcher import EventDispatcher
from src.core.events.listeners.activity_log_listener import ActivityLogListener

@asynccontextmanager
async def lifespan(app: FastAPI):
    EventDispatcher.add(ActivityLogListener())
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(auth.router, prefix="/api")
app.include_router(project_manager.router, prefix="/api")
app.include_router(logger.router, prefix="/api")

@app.get("/")
def foo():
    return {"message": "Hello World!"}
