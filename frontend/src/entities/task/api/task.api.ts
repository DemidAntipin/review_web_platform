import { $api } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { TaskPreview } from '../model/types';

export const taskApi = {
    getByProject: (projectId: number) => 
        $api.get<TaskPreview[]>(ENDPOINTS.TASKS.LIST(projectId)),
    
    update: (projectId: number, taskId: number, dto: any) => 
        $api.patch(ENDPOINTS.TASKS.BY_ID(projectId, taskId), dto),
};