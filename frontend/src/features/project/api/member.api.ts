import { $api } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { Member } from '@/entities/project/model/types';

export interface UserSuggestion {
    id: number;
    username: string;
}

export const searchUsers = async (query: string): Promise<UserSuggestion[]> => {
    const { data } = await $api.get<UserSuggestion[]>(ENDPOINTS.AUTH.SEARCH(query));
    return data;
};

export const projectMemberApi = {
    list: (projectId: number) => 
        $api.get<Member[]>(ENDPOINTS.PROJECTS.MEMBERS(projectId)),
    
    add: (projectId: number, dto: { user_id: number, role: number }) =>
        $api.post(ENDPOINTS.PROJECTS.ADD(projectId), dto),

    update: (projectId: number, userId: number, role: number) =>
        $api.patch(ENDPOINTS.PROJECTS.MEMBER_BY_ID(projectId, userId), { role }),
    
    leave: (projectId: number) => 
        $api.delete(ENDPOINTS.PROJECTS.LEAVE(projectId)),
    
    remove: (projectId: number, userId: number) => 
        $api.delete(ENDPOINTS.PROJECTS.MEMBER_BY_ID(projectId, userId)),
};