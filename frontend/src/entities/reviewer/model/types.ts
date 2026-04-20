export type CommentPriority = 'Низкий' | 'Средний' | 'Высокий';
export type CommentType = 'Правка текста' | 'Эксперимент' | 'Анализ' | 'Источник' | 'Вопрос';

export const COMMENT_PRIORITY_MAP: Record<number, CommentPriority> = {
    1: 'Низкий',
    2: 'Средний',
    3: 'Высокий'
};

export const COMMENT_TYPE_MAP: Record<number, CommentType> = {
    1: 'Правка текста',
    2: 'Эксперимент',
    3: 'Анализ',
    4: 'Источник',
    5: 'Вопрос'
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