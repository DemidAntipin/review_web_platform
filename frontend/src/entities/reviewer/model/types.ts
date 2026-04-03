export type CommentPriority = 'low' | 'medium' | 'high';
export type CommentType = 'text_change' | 'experiment' | 'analysis' | 'source' | 'question';

export const COMMENT_PRIORITY_MAP: Record<number, CommentPriority> = {
    1: 'low',
    2: 'medium',
    3: 'high'
};

export const COMMENT_TYPE_MAP: Record<number, CommentType> = {
    1: 'text_change',
    2: 'experiment',
    3: 'analysis',
    4: 'source',
    5: 'question'
};

export const transformComment = (comment: any): ReviewerComment => {
    return {
        ...comment,
        priority: COMMENT_PRIORITY_MAP[comment.priority as number] || comment.priority,
        type: COMMENT_TYPE_MAP[comment.type as number] || comment.type
    };
};

export interface ReviewerComment {
    id: number;
    reviewer_id: number;
    priority: CommentPriority;
    type: CommentType;
    content_md: string;
    status: string;
    tasks_count: number;
    completed_tasks_count: number;
}

export interface Reviewer {
    id: number;
    name: string;
    general_comment: string;
    comments: ReviewerComment[];
}