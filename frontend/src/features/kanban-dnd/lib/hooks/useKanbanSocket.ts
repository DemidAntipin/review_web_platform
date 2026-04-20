import { useEffect } from 'react';
import { WebsocketService } from '@/shared/api/websocket';
import { useKanbanStore } from '../../model/kanban.store';
import { TaskPreview } from '../../../../entities/task/model/types';
import { TaskComments } from '@/features/task_comment/ui/TaskComment';

export const useKanbanSocket = (projectId: number) => {
    const { updateTask, removeTask, addTasks, taskCommentsInc, attachmentInc } = useKanbanStore();

    useEffect(() => {
        if (!projectId) return;
        const unsubUpdate = WebsocketService.on('TASK_UPDATED', (data) => {
            updateTask(data.id, data); 
        });
        const unsubDelete = WebsocketService.on('TASK_DELETED', (payload: { task_id: number }) => {
            removeTask(payload.task_id);
        });

        const unsubDecompose = WebsocketService.on('COMMENT_DECOMPOSED', (payload: { tasks: TaskPreview[] }) => {
            addTasks(payload.tasks);
        });
        const unsubChatMessage = WebsocketService.on('TASK_COMMENT_ADDED', (payload) => {
            if (!payload.task_id) return;
            taskCommentsInc(payload.task_id);
        })
        const unsubAttachment = WebsocketService.on('ATTACHMENT_UPLOADED', (payload) => {
            if (!payload.task_id) return;
            attachmentInc(payload.task_id);
        })

        return () => {
            unsubUpdate();
            unsubDelete();
            unsubDecompose();
            unsubChatMessage();
            unsubAttachment();
        };
    }, []);
};