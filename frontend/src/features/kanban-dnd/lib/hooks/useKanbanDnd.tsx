import { DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useKanbanStore } from '../../model/kanban.store';
import { TaskStatus, STATUS_MAP } from '@/entities/task/model/types';

export const useKanbanDnd = (projectId: number) => {
    const { moveTask, updateTaskStatus, tasks } = useKanbanStore();
    
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as number;
        const overId = over.id; // string | number

        const activeTask = tasks.find(t => t.id === activeId);
        if (!activeTask) return;

        let targetStatus: TaskStatus;
        let targetOverTaskId: number | string;

        if (typeof overId === 'string') {
            // Если это строка, значит мы попали на саму колонку (её ID = статус)
            targetStatus = overId as TaskStatus;
            targetOverTaskId = 'END'; 
        } else {
            // Если это число, значит мы попали на другую карточку
            const overTask = tasks.find(t => t.id === overId);
            if (!overTask) return;
            targetStatus = overTask.status;
            targetOverTaskId = overTask.id;
        }

        moveTask(activeId, targetOverTaskId, targetStatus);

        if (targetStatus !== activeTask.status) {
            updateTaskStatus(projectId, activeId, targetStatus);
        }
    };

    return { sensors, handleDragEnd };
};