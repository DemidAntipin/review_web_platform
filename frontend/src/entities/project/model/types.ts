export type ProjectStatus = 'in_progress' | 'completed' | 'accepted' | 'closed';

export interface Project {
    id: string;
    title: string;
    journal: string;
    deadlineDays: number;
    status: ProjectStatus;
    tasksCount: number;
    completedTasks: number;
    authorId: number;
}