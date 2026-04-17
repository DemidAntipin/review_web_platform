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

    const downloadFile = async (attachmentId: number, fileName: string) => {
        try {
            const { data } = await attachmentApi.download(projectId, taskId, attachmentId);
            
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Ошибка при скачивании файла", e);
        }
    };

    useEffect(() => {
        if (taskId) fetchAttachments();
    }, [taskId]);

    return { attachments, uploadFile, isUploading, downloadFile, refresh: fetchAttachments };
};