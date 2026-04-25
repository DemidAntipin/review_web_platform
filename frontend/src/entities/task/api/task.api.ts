import { $api } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { Task, TaskPreview } from '../model/types';

export const taskApi = {
    getByProject: (projectId: number) => 
        $api.get<TaskPreview[]>(ENDPOINTS.TASKS.LIST(projectId)),
    
    update: (projectId: number, taskId: number, dto: any) => 
        $api.patch(ENDPOINTS.TASKS.BY_ID(projectId, taskId), dto),

    delete: (projectId: number, taskId: number) =>
        $api.delete(ENDPOINTS.TASKS.BY_ID(projectId, taskId)),

    getDetailed: (projectId: number, taskId: number) =>
        $api.get<Task>(ENDPOINTS.TASKS.BY_ID(projectId, taskId)),
};