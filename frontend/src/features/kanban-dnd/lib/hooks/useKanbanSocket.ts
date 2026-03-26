import { useEffect } from 'react';
import { WebsocketService } from '@/shared/api/websocket';
import { useKanbanStore } from '../../model/kanban.store';
import { TaskPreview } from '../../../../entities/task/model/types';

export const useKanbanSocket = (projectId: number) => {
    const { updateTask, removeTask, addTasks } = useKanbanStore();

    useEffect(() => {
        if (!projectId) return;
        const unsubUpdate = WebsocketService.on('TASK_UPDATED', (data) => {
            if (data.id) {
                updateTask(data.id, data); 
            }
        });
        const unsubDelete = WebsocketService.on('TASK_DELETED', (payload: { task_id: number }) => {
            removeTask(payload.task_id);
        });

        const unsubDecompose = WebsocketService.on('COMMENT_DECOMPOSED', (payload: { tasks: TaskPreview[] }) => {
            addTasks(payload.tasks);
        });

        return () => {
            unsubUpdate();
            unsubDelete();
            unsubDecompose();
        };
    }, []);
};