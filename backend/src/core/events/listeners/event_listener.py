from src.dtos.events import EventType, BaseEvent
from abc import ABC, abstractmethod

class EventListener(ABC):
    """
    Обработка события
    """
    @abstractmethod
    async def handle(self, event: BaseEvent) -> None:
        events =  EventType.events()
        if event.action_type not in events:
            raise ValueError(f"Тип события '{event.action_type}' не зарегистрирован в системе!")