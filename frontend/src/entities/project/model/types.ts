export type ProjectStatus = 'in_progress' | 'completed' | 'accepted' | 'closed';

export interface ProjectBase {
    title: string;
    journal: string;
    deadline: string;
}

export interface ProjectUpdate {
    title?: string;
    journal?: string;
    deadline?: string;
    status?: ProjectStatus;
}

export interface Project extends ProjectBase {
    id: number;
    status: ProjectStatus;
    created_at: string;
}

export interface ProjectPreview extends Project {
    isHidden: boolean;
    total_tasks_count: number;
    completed_tasks_count: number;
}

export interface Member {
    user_id: number;
    project_id: number;
    role: number;
    username: string;
}

export type MemberModalType = 'add' | 'edit' | 'remove' | 'leave' | null;

export const PROJECT_ROLE_LABELS: Record<number, string> = {
    1: 'Автор',
    2: 'Соавтор',
    3: 'Редактор',
    4: 'Админ',
};

export const STATUS_MAP: Record<number, ProjectStatus> = {
    1: 'in_progress',
    2: 'completed',
    3: 'accepted',
    4: 'closed'
};

export type SortField = 'created_at' | 'title' | 'deadline';
export type SortDirection = 'asc' | 'desc';