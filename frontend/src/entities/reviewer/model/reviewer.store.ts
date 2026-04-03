import { create } from 'zustand';
import { Reviewer, ReviewerComment, transformComment } from '../model/types';
import { reviewerApi } from '../api/reviewer.api';

interface ReviewerState {
    reviewers: Reviewer[];
    isLoading: boolean;
    error: string | null;
    
    setReviewers: (projectId: number) => Promise<void>;
    
    updateReviewer: (reviewerId: number, updates: Partial<Reviewer>) => void;
    addComment: (reviewerId: number, comment: ReviewerComment) => void;
    updateComment: (reviewerId: number, commentId: number, updates: Partial<ReviewerComment>) => void;
    removeComment: (reviewerId: number, commentId: number) => void;
}

export const useReviewerStore = create<ReviewerState>((set) => ({
    reviewers: [],
    isLoading: false,
    error: null,

    setReviewers: async (projectId) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await reviewerApi.getByProject(projectId);
            
            const transformed = data.reviewers.map(reviewer => ({
                ...reviewer,
                comments: reviewer.comments.map(transformComment)
            }));
            
            set({ reviewers: transformed });
        } catch (e) {
            set({ error: 'Не удалось загрузить рецензентов' });
        } finally {
            set({ isLoading: false });
        }
    },

    updateReviewer: (reviewerId, updates) => set((state) => ({
        reviewers: state.reviewers.map(r => 
            r.id === reviewerId ? { ...r, ...updates } : r
        )
    })),

    addComment: (reviewerId, comment) => set((state) => ({
        reviewers: state.reviewers.map(r => 
            r.id === reviewerId 
                ? { ...r, comments: [...r.comments, transformComment(comment)] } 
                : r
        )
    })),

    updateComment: (reviewerId, commentId, updates) => set((state) => ({
        reviewers: state.reviewers.map(r => {
            if (r.id !== reviewerId) return r;
            return {
                ...r,
                comments: r.comments.map(c => 
                    c.id === commentId ? transformComment({ ...c, ...updates }) : c
                )
            };
        })
    })),

    removeComment: (reviewerId, commentId) => set((state) => ({
        reviewers: state.reviewers.map(r => 
            r.id === reviewerId 
                ? { ...r, comments: r.comments.filter(c => c.id !== commentId) } 
                : r
        )
    }))
}));