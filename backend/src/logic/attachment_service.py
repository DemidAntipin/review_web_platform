import re
import os
from fastapi import UploadFile
from src.models.attachment import Attachment
from src.core.storage.LocalStorage import LocalStorage
from sqlalchemy.ext.asyncio import AsyncSession

class AttachmentService:
    storage = LocalStorage 

    @staticmethod
    def __prepare_safe_name(filename: str, task_id: int, attachment_id: int) -> str:
        name, ext = os.path.splitext(filename)
        name = name.replace(" ", "_")
        name = re.sub(r'[^\w\d\-_]', '', name)
        name = name[:100]
        clean_ext = re.sub(r'[^\w\d.]', '', ext).lower()
        
        return f"t{task_id}_a{attachment_id}_{name}{clean_ext}"

    @staticmethod
    async def upload_file(db: AsyncSession, task_id: int, file: UploadFile) -> Attachment:
        attachment = Attachment(
            task_id=task_id,
            file_url="pending",
            file_type=file.content_type or "application/octet-stream"
        )
        db.add(attachment)
        await db.flush() 
        final_filename = AttachmentService.__prepare_safe_name(file.filename, task_id, attachment.id)
        file_url = await AttachmentService.storage.save(file, final_filename)       
        attachment.file_url = file_url
        return attachment
