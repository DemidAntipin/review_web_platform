from fastapi import WebSocket
from fastapi.encoders import jsonable_encoder
from collections import defaultdict

class WebsocketManager:
    __active_users: dict[str, set[WebSocket]] = defaultdict(set)

    @staticmethod
    async def connect(websocket: WebSocket, user_id: str):
        await websocket.accept()
        WebsocketManager.__active_users[user_id].add(websocket)

    @staticmethod
    def disconnect(websocket: WebSocket, user_id: str):
        if user_id in WebsocketManager.__active_users:
            WebsocketManager.__active_users[user_id].discard(websocket)
            if not WebsocketManager.__active_users[user_id]:
                del WebsocketManager.__active_users[user_id]

    @staticmethod
    async def send_to_user(user_id: str, message: dict):
        sockets = WebsocketManager.__active_users.get(user_id)
        if sockets:
            message = jsonable_encoder(message)
            for connection in sockets:
                try:
                    await connection.send_json(message)
                except Exception as e:
                    print(e)