import { create } from 'zustand';
import { TaskPreview, TaskStatus, STATUS_MAP, PRIORITY_MAP, STATUS_TO_ID, transformTask, TaskSortField } from '@/entities/task/model/types';
import { taskApi } from '@/entities/task/api/task.api';
import { SortDirection } from '@/entities/project/model/types';

interface KanbanState {
    tasks: TaskPreview[];
    isLoading: boolean;
    error: string | null;
    sortField: TaskSortField;
    sortDirection: SortDirection;
    
    setTasks: (projectId: number) => Promise<void>;
    
    addTask: (task: TaskPreview) => void;
    addTasks: (tasks: TaskPreview[]) => void;
    updateTask: (taskId: number, updates: Partial<TaskPreview>) => void;
    removeTask: (taskId: number) => void;

    moveTask: (activeId: number, overId: number | string, targetStatus?: TaskStatus) => void;
    updateTaskStatus: (projectId: number, taskId: number, status: TaskStatus) => Promise<void>;

    searchQuery: string;
    setSearchQuery: (query: string) => void;

    selectedTypes: string[];
    selectedPriorities: string[];
    selectedReviewers: number[];
    selectedComments: number[];

    toggleType: (type: string) => void;
    togglePriority: (priority: string) => void;
    toggleReviewer: (reviewerId: number) => void;
    toggleComment: (commentId: number, reviewerId: number) => void;
    resetFilters: () => void;

    setSort: (field: TaskSortField, direction: SortDirection) => void;
    toggleSortDirection: () => void;
}

export const useKanbanStore = create<KanbanState>((set, get) => ({
    tasks: [],
    isLoading: false,
    error: null,

    searchQuery: '',
    setSearchQuery: (searchQuery) => set({ searchQuery }),

    selectedTypes: [],
    selectedPriorities: [],
    selectedReviewers: [],
    selectedComments: [],

    sortField: 'created_at',
    sortDirection: 'desc',

    setSort: (sortField, sortDirection) => set({ sortField, sortDirection }),
        
    toggleSortDirection: () => set((state) => ({ 
        sortDirection: state.sortDirection === 'asc' ? 'desc' : 'asc' 
    })),

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
    },

    toggleType: (type) => set((s) => ({
        selectedTypes: s.selectedTypes.includes(type) 
            ? s.selectedTypes.filter(t => t !== type) 
            : [...s.selectedTypes, type]
    })),

    togglePriority: (priority) => set((s) => ({
        selectedPriorities: s.selectedPriorities.includes(priority)
            ? s.selectedPriorities.filter(p => p !== priority)
            : [...s.selectedPriorities, priority]
    })),

    toggleReviewer: (reviewerId) => set((s) => {
        const isSelected = s.selectedReviewers.includes(reviewerId);
        const relatedCommentIds = s.tasks
            .filter(t => t.reviewer_id === reviewerId && t.comment_id)
            .map(t => t.comment_id as number);

        if (isSelected) {
            return {
                selectedReviewers: s.selectedReviewers.filter(id => id !== reviewerId),
                selectedComments: s.selectedComments.filter(id => !relatedCommentIds.includes(id))
            };
        } else {
            return {
                selectedReviewers: [...s.selectedReviewers, reviewerId]
            };
        }
    }),

    toggleComment: (commentId, reviewerId) => set((s) => {
        const isSelected = s.selectedComments.includes(commentId);
        
        if (!isSelected) {
            return {
                selectedComments: [...s.selectedComments, commentId],
                selectedReviewers: s.selectedReviewers.includes(reviewerId) 
                    ? s.selectedReviewers 
                    : [...s.selectedReviewers, reviewerId]
            };
        } else {
            return {
                selectedComments: s.selectedComments.filter(id => id !== commentId)
            };
        }
    }),

    resetFilters: () => set({
        searchQuery: '',
        selectedTypes: [],
        selectedPriorities: [],
        selectedReviewers: [],
        selectedComments: [],
        sortField: 'created_at',
        sortDirection: 'desc'
    }),
}));