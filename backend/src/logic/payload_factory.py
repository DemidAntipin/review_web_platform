from typing import Any, Dict, Union
from src.core.events.event_type import EventType
from src.dtos.events import *
from src.core.utils import dtos_builder

class EventPayloadFactory:
    @staticmethod
    async def get_payload(event: BaseEvent) -> Dict[str, Any]:
        handlers = {
            EventType.PROJECT_CREATED.value: EventPayloadFactory.__project_preview,
            EventType.PROJECT_UPDATED.value: EventPayloadFactory.__project_preview,
            EventType.PROJECT_ARCHIVED.value: EventPayloadFactory.__project_archieved,
            EventType.MEMBER_ADDED.value: EventPayloadFactory.__member_preview,
            EventType.MEMBER_UPDATED.value: EventPayloadFactory.__member_preview,
            EventType.MEMBER_REMOVED.value: EventPayloadFactory.__member_removed_payload,
            EventType.TASK_UPDATED.value: EventPayloadFactory.__task_preview,
            EventType.TASK_COMMENT_ADDED.value: EventPayloadFactory.__task_comment_preview,
            EventType.ATTACHMENT_UPLOADED.value: EventPayloadFactory.__attachment_preview,
            EventType.COMMENT_DECOMPOSED.value: EventPayloadFactory.__tasks_list_preview,
            EventType.REVIEWER_ADDED.value: EventPayloadFactory.__reviewer_preview,
            EventType.REVIEWER_UPDATED.value: EventPayloadFactory.__reviewer_preview,
            EventType.REVIEWER_REMOVED.value: EventPayloadFactory.__reviewer_removed,
            EventType.COMMENT_DELETED.value: EventPayloadFactory.__comment_removed,
            EventType.COMMENT_UPDATED.value: EventPayloadFactory.__comment_preview,
            EventType.COMMENT_ADDED.value: EventPayloadFactory.__comment_preview,
            EventType.RESPONSE_SAVED.value: EventPayloadFactory.__response_preview,
            EventType.RESPONSE_APPROVED.value: EventPayloadFactory.__response_preview,
        }

        handler = handlers.get(event.action_type)
        if not handler:
            return event.payload

        return await handler(event)

    @staticmethod
    async def __project_preview(event: ProjectUpdatedEvent) -> Dict[str, Any]:
        dto = await dtos_builder.get_project_preview(event.project_id)
        return dto.model_dump() if dto else {}

    @staticmethod
    async def __task_preview(event: TaskUpdatedEvent) -> Dict[str, Any]:
        dto = await dtos_builder.get_task_preview(event.task_id)
        return dto.model_dump() if dto else {}

    @staticmethod
    async def __task_comment_preview(event: TaskCommentAddedEvent) -> Dict[str, Any]:
        dto = await dtos_builder.get_task_comment_preview(event.chat_message_id)
        return dto.model_dump() if dto else {}

    @staticmethod
    async def __attachment_preview(event: AttachmentUploadedEvent) -> Dict[str, Any]:
        dto = await dtos_builder.get_attachment_dto(event.attachment_id)
        return dto.model_dump() if dto else {}

    @staticmethod
    async def __tasks_list_preview(event: CommentDecomposedEvent) -> Dict[str, Any]:
        tasks = await dtos_builder.get_tasks_by_comment(event.comment_id)
        created = []
        updated = []
        for t in tasks:
            if t.id in event.created:
                created.append(t.model_dump())
            elif t.id in event.updated:
                updated.append(t.model_dump())
        comment_dto = await dtos_builder.get_comment_preview_dto(event.comment_id)
        return {"comment": comment_dto,
                "created": created,
                "updated": updated,
                "deleted": event.deleted}
    
    @staticmethod
    async def __comment_preview(event: Union[CommentUpdatedEvent, CommentAddedEvent]) -> Dict[str, Any]:
        dto = await dtos_builder.get_comment_preview_dto(event.comment_id)
        return dto.model_dump() if dto else {}

    @staticmethod
    async def __reviewer_preview(event: ReviewerAddedEvent) -> Dict[str, Any]:
        dto = await dtos_builder.get_reviewer_dto(event.reviewer_id)
        return dto.model_dump() if dto else {}
    
    @staticmethod
    async def __member_preview(event: Union[MemberAddedEvent, MemberUpdatedEvent]) -> Dict[str, Any]:
        dto = await dtos_builder.get_member_preview(event.project_id, event.target_user_id)
        return dto.model_dump() if dto else {}
    
    @staticmethod
    async def __member_removed_payload(event: MemberRemovedEvent) -> Dict[str, Any]:
        return {
            "user_id": event.target_user_id,
            "project_id": event.project_id
        }
    
    @staticmethod
    async def __project_archieved(event: ProjectArchivedEvent) -> Dict[str, Any]:
        return {"project_id": event.project_id}
    
    @staticmethod
    async def __reviewer_removed(event: ReviewerRemovedEvent) -> Dict[str, Any]:
        return {
            "reviewer_id": event.reviewer_id,
            "project_id": event.project_id
        }
    
    @staticmethod
    async def __comment_removed(event: CommentDeletedEvent) -> Dict[str, Any]:
        return {
            "project_id": event.project_id,
            "comment_id": event.comment_id
        }
    
    @staticmethod
    async def __response_preview(event: Union[ResponseSavedEvent, ResponseApprovedEvent]) -> Dict[str, Any]:
        dto = await dtos_builder.get_response_preview(event.comment_id)
        return dto.model_dump() if dto else {}