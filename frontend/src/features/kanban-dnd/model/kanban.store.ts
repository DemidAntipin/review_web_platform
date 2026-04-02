import { create } from 'zustand';
import { TaskPreview, TaskStatus, STATUS_MAP, PRIORITY_MAP, STATUS_TO_ID, transformTask } from '@/entities/task/model/types';
import { taskApi } from '@/entities/task/api/task.api';

interface KanbanState {
    tasks: TaskPreview[];
    isLoading: boolean;
    error: string | null;
    
    setTasks: (projectId: number) => Promise<void>;
    
    addTask: (task: TaskPreview) => void;
    addTasks: (tasks: TaskPreview[]) => void;
    updateTask: (taskId: number, updates: Partial<TaskPreview>) => void;
    removeTask: (taskId: number) => void;

    moveTask: (activeId: number, overId: number | string, targetStatus?: TaskStatus) => void;
    updateTaskStatus: (projectId: number, taskId: number, status: TaskStatus) => Promise<void>;
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,

    setTasks: async (projectId) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await taskApi.getByProject(projectId);
            const transformedTasks = data.map(transformTask);
            set({ tasks: transformedTasks });
        } catch (e) {
            set({ error: 'Не удалось загрузить задачи' });
        } finally {
            set({ isLoading: false });
        }
    },

    addTask: (task) => {
        const transformed = transformTask(task);
        set((s) => ({ tasks: [transformed, ...s.tasks] }));
    },
    
    addTasks: (newTasks) => set((s) => ({ 
        tasks: [...newTasks.map(transformTask), ...s.tasks] 
    })),

    updateTask: (taskId, updates) => {
        set((s) => ({
            tasks: s.tasks.map(t => {
                if (Number(t.id) === Number(taskId)) {
                    return transformTask({ ...t, ...updates });
                }
                return t;
            })
        }));
    },

    removeTask: (taskId) => set((s) => ({
        tasks: s.tasks.filter(t => t.id !== taskId)
    })),

    moveTask: (activeId, overId, targetStatus) => {
        set(state => {
            const tasks = [...state.tasks];
            const activeIdx = tasks.findIndex(t => t.id === activeId);
            if (activeIdx === -1) return state;

            const movedTask = { ...tasks[activeIdx] };
            if (targetStatus) movedTask.status = targetStatus;

            const withoutActive = tasks.filter(t => t.id !== activeId);
            
            let insertIdx = -1;
            
            if (overId === 'END') {
                insertIdx = withoutActive.length;
            } else {
                const overIdx = withoutActive.findIndex(t => t.id === overId);
                insertIdx = overIdx === -1 ? withoutActive.length : overIdx;
            }

            withoutActive.splice(insertIdx, 0, movedTask);

            return { tasks: withoutActive };
        });
    },

    updateTaskStatus: async (projectId, taskId, status) => {
        try {
            const statusId = STATUS_TO_ID[status];
            await taskApi.update(projectId, taskId, { status: statusId });
        } catch (e) {
            get().setTasks(projectId);
        }
    }
}));