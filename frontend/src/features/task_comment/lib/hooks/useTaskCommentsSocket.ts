import { useEffect } from 'react';
import { WebsocketService } from '@/shared/api/websocket';
import { TaskComment } from '@/entities/task/model/types';

interface UseTaskCommentsSocketProps {
    taskId: number;
    onCommentAdded: (comment: TaskComment) => void;
}

export const useTaskCommentsSocket = ({ taskId, onCommentAdded }: UseTaskCommentsSocketProps) => {
    useEffect(() => {
        if (!taskId) return;

        const handleNewComment = (payload: any) => {
            if (Number(payload.task_id) === taskId) {
                onCommentAdded(payload);
            }
        };

        const unsubscribe = WebsocketService.on('TASK_COMMENT_ADDED', handleNewComment);

        return () => {
            unsubscribe();
        };
    }, [taskId, onCommentAdded]);
};