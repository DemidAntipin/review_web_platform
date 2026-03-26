from src.core.events.listeners.event_listener import EventListener
from src.core.websocket import WebsocketManager
from src.dtos.events import BaseEvent
from src.core.database import DBSession
from sqlalchemy import select
from src.models.project_member import ProjectMember
from src.logic.payload_factory import EventPayloadFactory
import asyncio

class WebSocketListener(EventListener):
    async def handle(self, event: BaseEvent) -> None:
        await super().handle(event)
        event.payload = await EventPayloadFactory.get_payload(event)
        message = { "event_type": event.action_type,
                   "project_id": str(event.project_id),
                    "payload": event.payload
        }
        async with DBSession() as db:
            result = await db.execute(
                select(ProjectMember.user_id).where(ProjectMember.project_id == event.project_id)
            )
        members = result.scalars().all()
        tasks = [WebsocketManager.send_to_user(str(m), message) for m in members]
        await asyncio.gather(*tasks)