from src.dtos.events import BaseEvent
from src.core.events.listeners.event_listener import EventListener
from typing import List
from fastapi import BackgroundTasks

class EventDispatcher:
    __listeners: List[EventListener] = []

    @staticmethod
    def add(instance):
        """ Добавить в прослушку событий """
        if instance is None: return
        if not isinstance( instance, EventListener ): return
        if instance not in  EventDispatcher.__listeners:
            EventDispatcher.__listeners.append(instance)

    @staticmethod
    def delete(instance):
        """ Прекратить прослушку событий """
        if instance is None: return
        if not isinstance( instance, EventListener ): return
        if instance in  EventDispatcher.__listeners:
            EventDispatcher.__listeners.remove( instance )

    @staticmethod
    def create_event(background_tasks: BackgroundTasks, event: BaseEvent):
        """ Вызвать событие """
        for handler in EventDispatcher.__listeners:
            background_tasks.add_task(EventDispatcher.__safe_handle, handler, event)

    @staticmethod
    async def __safe_handle(handler: EventListener, event: BaseEvent) -> None:
        try:
            await handler.handle(event)
        except Exception as e:
            print(e)