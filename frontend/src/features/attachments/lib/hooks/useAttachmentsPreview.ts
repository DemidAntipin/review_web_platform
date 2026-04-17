import { useState } from 'react';
import { attachmentApi } from '../../api/attachments.api';

export const useAttachmentPreview = (projectId: number, taskId: number) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadPreview = async (attachmentId: number) => {
        setIsLoading(true);
        try {
            const { data } = await attachmentApi.getPreview(projectId, taskId, attachmentId);
            console.log( data );
            const url = URL.createObjectURL(data);
            setPreviewUrl(url);
        } catch (e) {
            console.error('Failed to load preview', e);
        } finally {
            setIsLoading(false);
        }
    };

    const clearPreview = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    return { previewUrl, isLoading, loadPreview, clearPreview };
};