export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | "in_progress" | "completed" | "ready_for_review" | "closed"

export const ALL_TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "completed", "ready_for_review", "closed"];

export const STATUS_MAP: Record<number, TaskStatus> = {
    1: "todo",
    2: 'in_progress',
    3: 'completed',
    4: 'ready_for_review',
    5: 'closed'
};

export type TaskType = 'text_change' | 'experiment' | 'analysis' | 'source' | 'question';

export const TYPE_MAP: Record<number, TaskType> = {
    1: 'text_change',
    2: 'experiment',
    3: 'analysis',
    4: 'source',
    5: 'question'
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
    1: "low",
    2: 'medium',
    3: 'high'
};

export const STATUS_TO_ID: Record<TaskStatus, number> = {
    todo: 1,
    in_progress: 2,
    completed: 3,
    ready_for_review: 4,
    closed: 5
};

export interface Column {
    id: TaskStatus;
    title: string;
}

export interface TaskPreview {
    id: number;
    reviewer_id: number;
    comment_id: number;
    title: string;
    type: string;
    priority: TaskPriority;
    status: TaskStatus;
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

export type TaskSortField = 'created_at' | 'title' | 'deadline';
export type SortDirection = 'asc' | 'desc';