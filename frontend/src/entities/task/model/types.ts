export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'new' | 'in_progress' | 'completed' | 'ready';

export interface Task {
    id: string;
    label: string;
    priority: TaskPriority;
    title: string;
    type: string;
    username: string;
    attachments: number;
    comments: number;
    status: TaskStatus;
}

export interface Column {
    id: TaskStatus;
    title: string;
}