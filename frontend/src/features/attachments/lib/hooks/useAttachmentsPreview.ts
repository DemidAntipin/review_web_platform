import { useState } from 'react';
import { attachmentApi } from '../../api/attachments.api';

export const useAttachmentPreview = (projectId: number, taskId: number) => {
    const [preview, setPreview] = useState<{ url: string, type: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadPreview = async (attachmentId: number) => {
        setIsLoading(true);
        try {
            const { data } = await attachmentApi.getPreview(projectId, taskId, attachmentId);
            const type = data.type;
            const url = URL.createObjectURL(data);
            setPreview({ url, type });
        } catch (e) {
            console.error('Failed to load preview', e);
        } finally {
            setIsLoading(false);
        }
    };

    const clearPreview = () => {
        if (preview?.url) URL.revokeObjectURL(preview.url);
        setPreview(null);
    };

    return { preview, isLoading, loadPreview, clearPreview };
};