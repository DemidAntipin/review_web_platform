import { $api } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { TaskComment } from '@/entities/task/model/types';

export const chatApi = {
    getComments: (projectId: number, taskId: number) =>
        $api.get<TaskComment[]>(ENDPOINTS.TASKS.CHAT(projectId, taskId)),

    addComment: (projectId: number, taskId: number, text: string) =>
        $api.post<TaskComment>(ENDPOINTS.TASKS.CHAT(projectId, taskId), { message: text }),
};