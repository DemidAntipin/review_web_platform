import { useEffect } from 'react';
import { WebsocketService } from '@/shared/api/websocket';
import { useKanbanStore } from '../../model/kanban.store';
import { TaskPreview } from '../../../../entities/task/model/types';
import { TaskComments } from '@/features/task_comment/ui/TaskComment';

export const useKanbanSocket = (projectId: number) => {
    const { updateTask, removeTask, addTasks, taskCommentsInc } = useKanbanStore();

    useEffect(() => {
        if (!projectId) return;
        const unsubUpdate = WebsocketService.on('TASK_UPDATED', (data) => {
            if (data.id) {
                if (performance.getEntriesByName('ws-roundtrip-start').length > 0) {
                    performance.mark('ws-roundtrip-end');
                    performance.measure(
                        'Full-Cycle-Latency', 
                        'ws-roundtrip-start', 
                        'ws-roundtrip-end'
                    );
                    
                    const measure = performance.getEntriesByName('Full-Cycle-Latency').pop();
                    console.log(`Полный цикл обновления (API + WS): ${measure?.duration.toFixed(2)} ms`);
                    
                    performance.clearMarks('ws-roundtrip-start');
                    performance.clearMarks('ws-roundtrip-end');
                }
                updateTask(data.id, data); 
            }
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

        return () => {
            unsubUpdate();
            unsubDelete();
            unsubDecompose();
            unsubChatMessage();
        };
    }, []);
};