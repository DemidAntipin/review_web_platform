import re
import os
import shutil
from fastapi import Response, UploadFile
from fastapi.responses import FileResponse
from src.logic.document_converter import DocumentConverter
from src.models.attachment import Attachment
from src.core.storage.local_storage import LocalStorage
from sqlalchemy.ext.asyncio import AsyncSession
from slugify import slugify

class AttachmentService:
    storage = LocalStorage 

    @staticmethod
    def __prepare_safe_name(filename: str, task_id: int, attachment_id: int) -> str:
        name, ext = os.path.splitext(filename)
        name = slugify(name)
        
        return f"t{task_id}_a{attachment_id}_{name}{ext}"

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

    @staticmethod
    async def get_file_preview(attachment: Attachment) -> Response:
        file_path = AttachmentService.storage.get_path(attachment.file_url)
        ext = os.path.splitext(file_path)[1].lower()

        if ext == ".txt" or ext in DocumentConverter.CODE_FORMATS:
            content = DocumentConverter.ensure_utf8_encoding(file_path)
            return Response(
                content=content, 
                media_type="text/plain; charset=utf-8"
            )

        if ext in DocumentConverter.BROWSER_SUPPORTED_FORMATS:
            return FileResponse(file_path, media_type=attachment.file_type)

        cache_dir = os.path.join(LocalStorage.UPLOAD_DIR, "cache")
        os.makedirs(cache_dir, exist_ok=True)
        pdf_cache_path = os.path.join(cache_dir, f"attach_{attachment.id}.pdf")

        if not os.path.exists(pdf_cache_path):
            tmp_path = DocumentConverter.convert(file_path, to_format="pdf", is_file=True)
            shutil.move(tmp_path, pdf_cache_path)

        return FileResponse(pdf_cache_path, media_type="application/pdf")

    @staticmethod
    async def download_file(attachment: Attachment) -> FileResponse:
        file_path = AttachmentService.storage.get_path(attachment.file_url)
        
        filename = attachment.file_url.split("_", 2)[-1]
        return FileResponse(path=file_path, filename=filename, media_type='application/octet-stream')