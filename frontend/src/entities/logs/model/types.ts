export type SortOrder = 'asc' | 'desc';

export interface ActivityLog {
    id: number;
    user_id: number;
    project_id: number;
    action_type: string;
    description: string;
    created_at: string;
}

export interface LogFilterState {
    user_ids?: number[];
    project_ids?: number[];
    start_period?: string;
    end_period?: string;
}

export interface LogFilters extends LogFilterState {
    limit: number;
    offset: number;
    sort_field?: string;
    sort_order?: SortOrder;
}

export interface LogsResponse {
    items: ActivityLog[];
    total: number;
}