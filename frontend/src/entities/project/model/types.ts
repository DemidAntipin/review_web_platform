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
}

export interface ProjectPreview extends Project {
    total_tasks_count: number;
    completed_tasks_count: number;
}

export interface Member {
    user_id: number;
    project_id: number;
    role: string;
    username: string;
}

export const STATUS_MAP: Record<number, ProjectStatus> = {
    1: 'in_progress',
    2: 'completed',
    3: 'accepted',
    4: 'closed'
};