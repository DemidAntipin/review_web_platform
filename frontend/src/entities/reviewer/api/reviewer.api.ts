import { $api } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { CreateCommentDto, Reviewer, ReviewerComment, UpdateCommentDto } from '../model/types';
import { Task } from '@/entities/task/model/types';

export const reviewerApi = {
    getByProject: (projectId: number) => 
        $api.get<{ reviewers: Reviewer[] }>(ENDPOINTS.REVIEWERS.LIST(projectId)),

    add: (projectId: number, data: { name: string; general_comment: string }) => 
        $api.post<Reviewer>(ENDPOINTS.REVIEWERS.ADD(projectId), data),
    update: (projectId: number, reviewerId: number, data: { name: string; general_comment: string }) => 
        $api.patch<Reviewer>(ENDPOINTS.REVIEWERS.BY_ID(projectId, reviewerId), data),
    delete: (projectId: number, reviewerId: number) => 
        $api.delete(ENDPOINTS.REVIEWERS.BY_ID(projectId, reviewerId)),

    addComment: (projectId: number, reviewerId: number, data: CreateCommentDto) => 
        $api.post<ReviewerComment>(ENDPOINTS.REVIEWERS.COMMENTS.ADD(projectId, reviewerId), data),
    
    updateComment: (projectId: number, reviewerId: number, commentId: number, data: UpdateCommentDto) => 
        $api.patch<ReviewerComment>(ENDPOINTS.REVIEWERS.COMMENTS.BY_ID(projectId, reviewerId, commentId), data),
    
    deleteComment: (projectId: number, reviewerId: number, commentId: number) => 
        $api.delete(ENDPOINTS.REVIEWERS.COMMENTS.BY_ID(projectId, reviewerId, commentId)),

    decompose: (projectId: number, reviewerId: number, comment_id: number, tasks: Partial<Task>[]) =>
        $api.post<Task[]>(ENDPOINTS.REVIEWERS.COMMENTS.DECOMPOSE(projectId, reviewerId, comment_id), tasks),
};