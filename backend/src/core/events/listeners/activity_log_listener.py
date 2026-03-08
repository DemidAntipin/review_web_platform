from src.core.events.listeners.event_listener import EventListener
from src.models.activity_log import ActivityLog
from src.core.database import DBSession
from src.dtos.events import BaseEvent, EventType

class ActivityLogListener(EventListener):
    __templates = {
        EventType.PROJECT_CREATED.value: "Создан проект '{title}' в журнале '{journal}'",
        EventType.PROJECT_UPDATED.value: "Обновлены поля проекта: {changed_fields}",
        EventType.PROJECT_ARCHIVED.value: "Проект перемещён в архив",
        EventType.MEMBER_ADDED.value: "В команду добавлен пользователь с id {target_user_id}, роль {role})",
        EventType.MEMBER_REMOVED.value: "Из команды удалён пользователь с id {target_user_id}, роль {role})"
    }
    async def handle(self, event: BaseEvent):
        await super().handle(event)
        template = self.__templates.get(event.action_type)
        if template:
            exclude_fields = {'user_id', 'project_id', 'action_type'}
            context = event.model_dump(exclude=exclude_fields)
            description = template.format(**context)
        async with DBSession() as db:
            log = ActivityLog(user_id=event.user_id, project_id=event.project_id, action_type=event.action_type, description=description)
            db.add(log)
            await db.commit()