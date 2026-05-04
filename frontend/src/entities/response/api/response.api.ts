import { $api } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { ReviewerResponse, ResponseSaveDto, ResponseApproveDto, ExportFormat } from '../model/types';

export const responseApi = {
    get: (projectId: number, reviewerId: number, commentId: number) =>
        $api.get<ReviewerResponse>(ENDPOINTS.RESPONSES(projectId, reviewerId, commentId)),

    save: (projectId: number, reviewerId: number, commentId: number, data: ResponseSaveDto) =>
        $api.post<ReviewerResponse>(ENDPOINTS.RESPONSES(projectId, reviewerId, commentId), data),

    approve: (projectId: number, reviewerId: number, commentId: number, responseId: number, data: ResponseApproveDto) =>
        $api.patch<ReviewerResponse>(ENDPOINTS.RESPONSES.BY_ID(projectId, reviewerId, commentId, responseId), data),

    export: async (projectId: number, reviewerId: number, commentId: number, responseId: number, format: ExportFormat) => {
        const response = await $api.post(
            ENDPOINTS.RESPONSES.EXPORT(projectId, reviewerId, commentId, responseId),
            { format },
            { responseType: 'blob' }
        );
        return response.data;
    }
};