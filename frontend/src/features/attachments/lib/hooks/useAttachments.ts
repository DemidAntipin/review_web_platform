import { useState, useEffect } from 'react';
import { attachmentApi } from '../../api/attachments.api';
import { Attachment } from '@/entities/task/model/types';

export const useAttachments = (projectId: number, taskId: number) => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const fetchAttachments = async () => {
        try {
            const { data } = await attachmentApi.getAttachments(projectId, taskId);
            setAttachments(data);
        } catch (e) {
            console.error("Ошибка при получении вложений", e);
        }
    };

    const uploadFile = async (file: File) => {
        setIsUploading(true);
        try {
            const { data } = await attachmentApi.upload(projectId, taskId, file);
            setAttachments(prev => [...prev, data]);
        } catch (e: any) {
            console.error("DEBUG UPLOAD ERROR:", e.response?.data || e.message);
            alert("Ошибка при загрузке: " + (e.response?.data?.detail || "неизвестная ошибка"));
        } finally {
            setIsUploading(false);
        }
    };

    useEffect(() => {
        if (taskId) fetchAttachments();
    }, [taskId]);

    return { attachments, uploadFile, isUploading, refresh: fetchAttachments };
};