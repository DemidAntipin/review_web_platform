export type TaskPriority = 'Низкий' | 'Средний' | 'Высокий';
export type TaskStatus = 'Новые' | "В работе" | "Завершено" | "Готово к ответу" | "Закрыто"

export const ALL_TASK_STATUSES: TaskStatus[] = ["Новые", "В работе", "Завершено", "Готово к ответу", "Закрыто"];

export const STATUS_MAP: Record<number, TaskStatus> = {
    1: "Новые",
    2: 'В работе',
    3: 'Завершено',
    4: 'Готово к ответу',
    5: 'Закрыто'
};

export type TaskType = 'Правка текста' | 'Эксперимент' | 'Анализ' | 'Источник' | 'Вопрос';

export const TYPE_MAP: Record<number, TaskType> = {
    1: 'Правка текста',
    2: 'Эксперимент',
    3: 'Анализ',
    4: 'Источник',
    5: 'Вопрос'
};

export const TYPE_TO_ID: Record<TaskType, number> = {
    'Правка текста': 1,
    'Эксперимент': 2,
    'Анализ': 3,
    'Источник': 4,
    'Вопрос': 5
};

export const transformTask = (task: any) => {
  return { 
        ...task,
        status: STATUS_MAP[task.status] || task.status,
        priority: PRIORITY_MAP[task.priority] || task.priority,
        type: TYPE_MAP[task.type] || task.type
    };
};

export const PRIORITY_MAP: Record<number, TaskPriority> = {
    1: "Низкий",
    2: 'Средний',
    3: 'Высокий'
};

export const PRIORITY_TO_ID: Record<TaskPriority, number> = {
    "Низкий": 1,
    'Средний': 2,
    'Высокий': 3
};

export const STATUS_TO_ID: Record<TaskStatus, number> = {
    Новые: 1,
    "В работе": 2,
    Завершено: 3,
    "Готово к ответу": 4,
    Закрыто: 5
};

export interface Column {
    id: TaskStatus;
    title: string;
}

export interface Task {
    id: number;
    title: string;
    type: number;
    assignee_id?: number;
    description_md: string;
}

export interface TaskPreview {
    id: number;
    reviewer_id: number;
    comment_id: number;
    title: string;
    type: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignee_id?: number;
    assignee?: string;
    created_at: string;
    deadline: string;
    comments_count: number;
    attachments_count: number;
}

export interface TaskComment {
    id: number;
    task_id: number;
    user_id: number;
    username: string;
    role: number;
    message: string;
    created_at: string;
}

export interface Attachment {
    id: number;
    task_id: number;
    file_url: string;
    file_type: string;
    uploaded_at: string;
}

export type TaskSortField = 'created_at' | 'title';
export type SortDirection = 'asc' | 'desc';