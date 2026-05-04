import { create } from 'zustand';
import { TaskPreview, TaskStatus, STATUS_MAP, PRIORITY_MAP, STATUS_TO_ID, transformTask, TaskSortField, Task, TYPE_TO_ID, TaskType, TaskPriority, PRIORITY_TO_ID } from '@/entities/task/model/types';
import { taskApi } from '@/entities/task/api/task.api';
import { SortDirection } from '@/entities/project/model/types';
import { reviewerApi } from '@/entities/reviewer/api/reviewer.api';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useProjectMembers } from '@/features/project/lib/hooks/useProjectMembers';


const applyFilters = (state: KanbanState): TaskPreview[] => {
    const { 
        tasks, searchQuery, selectedTypes, 
        selectedPriorities, selectedReviewers, 
        selectedComments, sortField, sortDirection,
        showHidden, hiddenTasksIds, selectedAssignees
    } = state;

    const query = searchQuery.toLowerCase();

    const filteredTasks = tasks.filter(task => {
        if (!showHidden && hiddenTasksIds.has(task.id)) {
            return false;
        }
        const matchesSearch = task.title.toLowerCase().includes(query);
        const matchesType = selectedTypes.length === 0 || selectedTypes.includes(task.type);
        const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(task.priority);
        const matchesReviewer = selectedReviewers.length === 0 || selectedReviewers.includes(task.reviewer_id);
        const matchesComment = selectedComments.length === 0 || (task.comment_id && selectedComments.includes(task.comment_id));
        const matchesAssignee = selectedAssignees.length === 0 || (task.assignee_id === undefined || task.assignee_id === null ? selectedAssignees.includes(null) : selectedAssignees.includes(task.assignee_id));
        return matchesSearch && matchesType && matchesPriority && matchesReviewer && matchesComment && matchesAssignee;
    });

    return filteredTasks.sort((a, b) => {
        const aVal = a[sortField] ?? '';
        const bVal = b[sortField] ?? '';
        
        const comparison = typeof aVal === 'string' 
            ? aVal.localeCompare(bVal as string)
            : (aVal as any) - (bVal as any);

        return sortDirection === 'asc' ? comparison : -comparison;
    });
};


interface KanbanState {
    tasks: TaskPreview[];
    filteredTasks: TaskPreview[];
    taskDetails: Record<number, Task>;
    isLoading: boolean;
    error: string | null;
    sortField: TaskSortField;
    hiddenTasksIds: Set<number>,
    sortDirection: SortDirection;
    showHidden: boolean;
    setShowHidden: (show: boolean) => void;
    
    setTasks: (projectId: number) => Promise<void>;
    
    addTask: (task: TaskPreview) => void;
    addTasks: (tasks: TaskPreview[]) => void;
    updateTask: (taskId: number, updates: Partial<TaskPreview|Task>) => void;
    removeTask: (taskId: number) => void;

    moveTask: (activeId: number, overId: number | string, targetStatus?: TaskStatus) => void;
    updateTaskStatus: (projectId: number, taskId: number, status: TaskStatus) => Promise<void>;
    taskCommentsInc: (taskId: number) => void;
    attachmentInc: (taskId: number) => void;

    searchQuery: string;
    setSearchQuery: (query: string) => void;

    selectedTypes: string[];
    selectedPriorities: string[];
    selectedReviewers: number[];
    selectedComments: number[];
    selectedAssignees: (number | null)[];
    toggleAssignee: (assigneeId: number | null) => void;

    toggleType: (type: string) => void;
    togglePriority: (priority: string) => void;
    toggleReviewer: (reviewerId: number) => void;
    toggleComment: (commentId: number, reviewerId: number) => void;
    toggleTaskHide: (id: number) => void; 
    resetFilters: () => void;

    setSort: (field: TaskSortField, direction: SortDirection) => void;
    toggleSortDirection: () => void;

    decomposeComment: (projectId: number, reviewerId: number, commentId: number, tasks: Partial<Task>[]) => Promise<void>;
    fetchTaskDetails: (projectId: number, taskId: number) => Promise<Task>;
    invalidateTask: (taskId: number) => void;
}

export const useKanbanStore = create<KanbanState>()(
    persist(
        (set, get) => ({
            tasks: [],
            taskDetails: {},
            isLoading: false,
            error: null,
            filteredTasks: [],
            hiddenTasksIds: new Set<number>(),
            showHidden: false,

            searchQuery: '',
            setSearchQuery: (searchQuery) => set((state) => {
                const newState = { ...state, searchQuery };
                return { ...newState, filteredTasks: applyFilters(newState) };
            }),

            selectedTypes: [],
            selectedPriorities: [],
            selectedReviewers: [],
            selectedComments: [],
            selectedAssignees: [],

            sortField: 'created_at',
            sortDirection: 'desc',

            setSort: (sortField, sortDirection) => set((state) => {
                const newState = { ...state, sortField, sortDirection };
                return { ...newState, filteredTasks: applyFilters(newState) };
            }),
                
            toggleSortDirection: () => set((state) => {
                const nextDirection: SortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
                const updated = { ...state, sortDirection: nextDirection };
                return { ...updated, filteredTasks: applyFilters(updated) };
            }),

            setTasks: async (projectId) => {
                set({ isLoading: true, error: null });
                try {
                    const { data } = await taskApi.getByProject(projectId);
                    const transformedTasks = data.map(transformTask);
                    set((state) => {
                        const newState = { ...state, tasks: transformedTasks };
                        return { ...newState, filteredTasks: applyFilters(newState) };
                    });
                } catch (e) {
                    set({ error: 'Не удалось загрузить задачи' });
                } finally {
                    set({ isLoading: false });
                }
            },

            addTask: (task) => set((state) => {
                const transformed = transformTask(task);
                const newState = { ...state, tasks: [transformed, ...state.tasks] };
                return { ...newState, filteredTasks: applyFilters(newState) };
            }),
            

            addTasks: (newTasks) => set((state) => {
                const newState = { ...state, tasks: [...newTasks.map(transformTask), ...state.tasks] };
                return { ...newState, filteredTasks: applyFilters(newState) };
            }),

            updateTask: (taskId, updates) => set((state) => {
                const nextTasks = state.tasks.map(t => 
                    Number(t.id) === Number(taskId) ? transformTask({ ...t, ...updates }) : t
                );
                const newState = { ...state, tasks: nextTasks };
                return { ...newState, filteredTasks: applyFilters(newState) };
            }),

            taskCommentsInc: (taskId) => set((state) => {
                const nextTasks = state.tasks.map((task) =>
                    task.id === taskId ? { ...task, comments_count: (task.comments_count ?? 0) + 1 } : task
                );
                const newState = { ...state, tasks: nextTasks };
                return { ...newState, filteredTasks: applyFilters(newState) };
            }),

            attachmentInc: (taskId) => set((state) => {
                const nextTasks = state.tasks.map((task) =>
                    task.id === taskId ? { ...task, attachments_count: (task.attachments_count ?? 0) + 1 } : task
                );
                const newState = { ...state, tasks: nextTasks };
                return { ...newState, filteredTasks: applyFilters(newState) };
            }),

            removeTask: (taskId) => set((state) => {
                const nextTasks = state.tasks.filter(t => t.id !== taskId);
                const newState = { ...state, tasks: nextTasks };
                return { ...newState, filteredTasks: applyFilters(newState) };
            }),

            setShowHidden: (show) => set((state) => {
                const nextState = { ...state, showHidden: show };
                return { ...nextState, filteredTasks: applyFilters(nextState) };
            }),

            moveTask: (activeId, overId, targetStatus) => set(state => {
                const tasks = [...state.tasks];
                const activeIdx = tasks.findIndex(t => t.id === activeId);
                if (activeIdx === -1) return state;

                const movedTask = { ...tasks[activeIdx] };
                if (targetStatus) movedTask.status = targetStatus;

                const withoutActive = tasks.filter(t => t.id !== activeId);
                let insertIdx = overId === 'END' ? withoutActive.length : withoutActive.findIndex(t => t.id === overId);
                if (insertIdx === -1) insertIdx = withoutActive.length;

                withoutActive.splice(insertIdx, 0, movedTask);
                const newState = { ...state, tasks: withoutActive };
                return { ...newState, filteredTasks: applyFilters(newState) };
            }),

            updateTaskStatus: async (projectId, taskId, status) => {
                try {
                    const statusId = STATUS_TO_ID[status];
                    await taskApi.update(projectId, taskId, { status: statusId });
                } catch (e) {
                    get().setTasks(projectId);
                }
            },

            toggleType: (type) => set((state) => {
                const selectedTypes = state.selectedTypes.includes(type) 
                    ? state.selectedTypes.filter(t => t !== type) 
                    : [...state.selectedTypes, type];
                const newState = { ...state, selectedTypes };
                return { ...newState, filteredTasks: applyFilters(newState) };
            }),

            togglePriority: (priority) => set((state) => {
                const selectedPriorities = state.selectedPriorities.includes(priority)
                    ? state.selectedPriorities.filter(p => p !== priority)
                    : [...state.selectedPriorities, priority];
                const newState = { ...state, selectedPriorities };
                return { ...newState, filteredTasks: applyFilters(newState) };
            }),

            toggleReviewer: (reviewerId) => set((state) => {
                const isSelected = state.selectedReviewers.includes(reviewerId);
                const relatedCommentIds = state.tasks
                    .filter(t => t.reviewer_id === reviewerId && t.comment_id)
                    .map(t => t.comment_id as number);

                let newState = { ...state };
                if (isSelected) {
                    newState.selectedReviewers = state.selectedReviewers.filter(id => id !== reviewerId);
                    newState.selectedComments = state.selectedComments.filter(id => !relatedCommentIds.includes(id));
                } else {
                    newState.selectedReviewers = [...state.selectedReviewers, reviewerId];
                }
                return { ...newState, filteredTasks: applyFilters(newState) };
            }),

            toggleComment: (commentId, reviewerId) => set((state) => {
                const isSelected = state.selectedComments.includes(commentId);
                let nextState = { ...state };
                
                if (!isSelected) {
                    nextState.selectedComments = [...state.selectedComments, commentId];
                    if (!state.selectedReviewers.includes(reviewerId)) {
                        nextState.selectedReviewers = [...state.selectedReviewers, reviewerId];
                    }
                } else {
                    nextState.selectedComments = state.selectedComments.filter(id => id !== commentId);
                }
                return { ...nextState, filteredTasks: applyFilters(nextState) };
            }),

            toggleTaskHide: (id) => set((state) => {
                const nextIds = new Set(state.hiddenTasksIds);
                nextIds.has(id) ? nextIds.delete(id) : nextIds.add(id);
                const nextState = { ...state, hiddenTasksIds: nextIds };
                return { ...nextState, filteredTasks: applyFilters(nextState) };
            }),

            toggleAssignee: (assigneeId) => set((state) => {
                const isSelected = state.selectedAssignees.includes(assigneeId);

                let newState = { ...state };
                if (isSelected) {
                    newState.selectedAssignees = state.selectedAssignees.filter(id => id !== assigneeId);
                } else {
                    newState.selectedAssignees = [...state.selectedAssignees, assigneeId];
                }
                return { ...newState, filteredTasks: applyFilters(newState) };
            }),

            resetFilters: () => set((state) => {
                const updated: KanbanState = {
                    ...state,
                    searchQuery: '',
                    selectedTypes: [],
                    selectedPriorities: [],
                    selectedReviewers: [],
                    selectedComments: [],
                    sortField: 'created_at',
                    sortDirection: 'desc',
                    showHidden: false,
                    selectedAssignees: [],
                    hiddenTasksIds: new Set<number>()
                };
                return { ...updated, filteredTasks: applyFilters(updated) };
            }),

            decomposeComment: async (projectId: number, reviewerId: number, commentId: number, tasks: Partial<Task>[]) => {
                try {
                    await reviewerApi.decompose(projectId, reviewerId, commentId, tasks)
                } catch (e) {
                    console.error("Decomposition failed:", e);
                    throw e;
                }
            },

            fetchTaskDetails: async (projectId, taskId) => {
                const state = get();
                
                if (state.taskDetails[taskId]) {
                    return state.taskDetails[taskId];
                }

                try {
                    const { data } = await taskApi.getDetailed(projectId, taskId);
                    
                    set((s) => ({
                        taskDetails: { ...s.taskDetails, [taskId]: data }
                    }));
                    
                    return data;
                } catch (e) {
                    console.error("Ошибка при загрузке деталей задачи:", e);
                    throw e;
                }
            },

            invalidateTask: (taskId) => set((s) => {
                const newDetails = { ...s.taskDetails };
                delete newDetails[taskId];
                return { taskDetails: newDetails };
            })
        }),
        {
            name: 'kanban-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                searchQuery: state.searchQuery,
                selectedTypes: state.selectedTypes,
                selectedPriorities: state.selectedPriorities,
                selectedReviewers: state.selectedReviewers,
                sortField: state.sortField,
                sortDirection: state.sortDirection,
                selectedAssignees: state.selectedAssignees,
            }),
        }
    )
);