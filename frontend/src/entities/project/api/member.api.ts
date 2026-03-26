import { $api } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { Member } from '../model/types';

export const projectMemberApi = {
    list: (projectId: number) => 
        $api.get<Member[]>(ENDPOINTS.PROJECTS.MEMBERS(projectId)),
    
    leave: (projectId: number) => 
        $api.delete(ENDPOINTS.PROJECTS.LEAVE(projectId)),
    
    remove: (projectId: number, userId: number) => 
        $api.delete(ENDPOINTS.PROJECTS.MEMBER_BY_ID(projectId, userId)),
};