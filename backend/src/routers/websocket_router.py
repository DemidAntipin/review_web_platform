from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from src.core.websocket import WebsocketManager

router = APIRouter(tags=["websocket"])

@router.websocket("/ws/{user_id}")
async def setup_websocket(websocket: WebSocket, user_id: str):
    await WebsocketManager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()          
    except WebSocketDisconnect:
        WebsocketManager.disconnect(websocket, user_id)