import { useEffect } from 'react';
import { WebsocketService } from '@/shared/api/websocket';
import { Attachment } from '@/entities/task/model/types';

interface UseAttachmentSocketProps {
    taskId: number;
    onAttachmentAdded: (attachment: Attachment) => void;
}

export const useAttachmentsSocket = ({ taskId, onAttachmentAdded }: UseAttachmentSocketProps) => {
    useEffect(() => {
        if (!taskId) return;

        const handleNewAttachment = (payload: any) => {
            if (Number(payload.task_id) === taskId) {
                onAttachmentAdded(payload);
            }
        };

        const unsubscribe = WebsocketService.on('ATTACHMENT_UPLOADED', handleNewAttachment);

        return () => {
            unsubscribe();
        };
    }, [taskId, onAttachmentAdded]);
};