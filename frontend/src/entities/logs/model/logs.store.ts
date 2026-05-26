import { create } from "zustand";
import { ActivityLog, LogFilterState, SortOrder } from "./types";
import { logsApi } from "../api/logs.api";

const PAGE_LIMIT = 20;

interface ActivityLogStore {
    logs: ActivityLog[];
    isLoading: boolean;
    filters: LogFilterState;
    sort: { field: string; order: SortOrder };
    page: number;
    totalCount: number;
    
    setFilters: (filters: Partial<LogFilterState>) => void;
    setSort: (field: string) => void;
    setPage: (page: number) => void;
    fetchLogs: () => Promise<void>;
    getTotalPages: () => number;
}

const initialFilters: LogFilterState = {
    user_ids: [],
    project_ids: [],
    start_period: '',
    end_period: '',
};

export const useActivityLogStore = create<ActivityLogStore>((set, get) => ({
    logs: [],
    isLoading: false,
    totalCount: 0,
    page: 1,
    sort: { field: 'created_at', order: 'desc' },
    filters: initialFilters,

    setFilters: (newFilters) => set({ filters: { ...get().filters, ...newFilters }, page: 1 }),
    
    setPage: (page) => set({ page }),

    getTotalPages: () => {
        return Math.ceil(get().totalCount / PAGE_LIMIT);
    },

    setSort: (field) => {
        const currentSort = get().sort;
        const order = (currentSort.field === field && currentSort.order === 'desc') ? 'asc' : 'desc';
        set({ sort: { field, order } });
    },

    fetchLogs: async () => {
        const { filters, sort, page } = get();
        set({ isLoading: true });

        try {
            const data = await logsApi.getLogs({
                ...filters,
                limit: PAGE_LIMIT,
                offset: (page - 1) * PAGE_LIMIT,
                sort_field: sort.field,
                sort_order: sort.order,
                user_ids: filters.user_ids!.length ? filters.user_ids : undefined,
                project_ids: filters.project_ids!.length ? filters.project_ids : undefined,
                start_period: filters.start_period || undefined,
                end_period: filters.end_period || undefined,
            });
            set({ 
                logs: data.items, 
                totalCount: data.total, 
                isLoading: false 
            });
        } catch (e) {
            set({ isLoading: false });
        }
    }
}));