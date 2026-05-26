import { $api } from '@/shared/api/client';
import { ActivityLog, LogFilters, LogsResponse } from '../model/types';
import { ENDPOINTS } from '@/shared/api/endpoints';

export const logsApi = {
    getLogs: async (filters: LogFilters) => {
        const response = await $api.post<LogsResponse>(ENDPOINTS.LOGS, filters);
        return response.data;
    }
};