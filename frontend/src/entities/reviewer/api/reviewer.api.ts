import { $api } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { Reviewer } from '../model/types';

export const reviewerApi = {
    getByProject: (projectId: number) => 
        $api.get<{ reviewers: Reviewer[] }>(ENDPOINTS.REVIEWERS.LIST(projectId)),
};