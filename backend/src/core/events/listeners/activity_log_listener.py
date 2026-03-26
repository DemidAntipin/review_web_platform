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
        EventType.MEMBER_REMOVED.value: "Из команды удалён пользователь с id {target_user_id}, роль {role})",
        EventType.REVIEWER_ADDED.value: "В проект добавлена рецензия от {reveiwer_id}",
        EventType.COMMENT_ADDED.value: "Выделено новое замечание из рецензии с id {reviewer_id}",
        EventType.COMMENT_UPDATED.value: "Обновлено замечание с id {comment_id}. Обновлены поля: {changed_fields}",
        EventType.TASK_UPDATED.value: "Обновлена задача с id {task_id}. Обновлены поля: {changed_fields}",
        EventType.TASK_DELETED.value: "Удалена задача с id {task_id}",
        EventType.COMMENT_DECOMPOSED.value: "Созданы задачи на основе замечания {comment_id}",
        EventType.TASK_COMMENT_ADDED.value: "Новое сообщение в обсуждении задачи {task_id}",
        EventType.ATTACHMENT_UPLOADED.value: "Новое вложение к задаче {task_id}"
    }
    async def handle(self, event: BaseEvent):
        await super().handle(event)
        template = self.__templates.get(event.action_type)
        if template:
            exclude_fields = {'user_id', 'project_id', 'action_type', 'payload'}
            context = event.model_dump(exclude=exclude_fields)
            description = template.format(**context)
        async with DBSession() as db:
            log = ActivityLog(user_id=event.user_id, project_id=event.project_id, action_type=event.action_type, description=description)
            db.add(log)
            await db.commit()