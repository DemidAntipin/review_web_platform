import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from src.routers import auth, project_manager, logger, websocket_router
from contextlib import asynccontextmanager
from src.core.events.event_dispatcher import EventDispatcher
from src.core.events.listeners.activity_log_listener import ActivityLogListener
from src.core.events.listeners.websocket_listener import WebSocketListener

@asynccontextmanager
async def lifespan(app: FastAPI):
    os.makedirs("uploads", exist_ok=True)
    app.mount("/static-files", StaticFiles(directory="uploads"), name="static")
    EventDispatcher.add(ActivityLogListener())
    EventDispatcher.add(WebSocketListener())
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(websocket_router.router, prefix="/api")
app.include_router(auth.router, prefix="/api")
app.include_router(project_manager.router, prefix="/api")
app.include_router(logger.router, prefix="/api")

@app.get("/")
def foo():
    return {"message": "Hello World!"}
