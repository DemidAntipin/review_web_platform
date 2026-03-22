import { DragEndEvent, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/entities/task/model/types';

export const useKanbanDnd = (tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>) => {
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeTask = tasks.find(t => t.id === active.id);
        if (!activeTask) return;

        const overTask = tasks.find(t => t.id === over.id);
        let targetStatus: TaskStatus;
        let targetTaskId: string | null = null;

        if (overTask) {
            targetStatus = overTask.status;
            targetTaskId = overTask.id;
        } else {
            targetStatus = over.id as TaskStatus;
            targetTaskId = null;
        }

        if (activeTask.status === targetStatus && targetTaskId) {
            setTasks(prev => {
                const oldIndex = prev.findIndex(t => t.id === active.id);
                const newIndex = prev.findIndex(t => t.id === targetTaskId);
                if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                    return arrayMove(prev, oldIndex, newIndex);
                }
                return prev;
            });
            return;
        }

        setTasks(prev => {
            const withoutActive = prev.filter(t => t.id !== active.id);

            let insertIndex: number;

            if (targetTaskId) {
                const targetIndex = withoutActive.findIndex(t => t.id === targetTaskId);
                insertIndex = targetIndex;
            } else {
                const lastIndexInColumn = withoutActive.reduce((lastIdx, t, idx) => {
                    return t.status === targetStatus ? idx : lastIdx;
                }, -1);
                insertIndex = lastIndexInColumn + 1;
            }

            const updated = [...withoutActive];
            updated.splice(insertIndex, 0, { ...activeTask, status: targetStatus });
            return updated;
        });
    };

    return { sensors, handleDragEnd };
};