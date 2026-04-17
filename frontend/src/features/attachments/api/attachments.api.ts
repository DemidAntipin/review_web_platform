import { $api } from '@/shared/api/client';
import { Attachment } from '@/entities/task/model/types';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const attachmentApi = {
    getAttachments: (projectId: number, taskId: number) =>
        $api.get<Attachment[]>(ENDPOINTS.TASKS.ATTACHMENTS(projectId, taskId)),

    upload: (projectId: number, taskId: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        return $api.post<Attachment>(
            ENDPOINTS.TASKS.ATTACHMENTS(projectId, taskId), 
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' }
            }
        );
    },
    getPreview: (projectId: number, taskId: number, attachmentId: number) =>
        $api.get(ENDPOINTS.TASKS.ATTACHMENT_PREVIEW(projectId, taskId, attachmentId), {
            responseType: 'blob'
        }),

    download: (projectId: number, taskId: number, attachmentId: number) =>
        $api.get(ENDPOINTS.TASKS.ATTACHMENT_DOWNLOAD(projectId, taskId, attachmentId), {
            responseType: 'blob'
        })
};