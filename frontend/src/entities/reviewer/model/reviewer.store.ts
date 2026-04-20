import { create } from 'zustand';
import { CommentPriority, CommentType, Reviewer, ReviewerComment, transformComment } from '../model/types';
import { reviewerApi } from '../api/reviewer.api';

const applyFilters = (state: ReviewerState): Reviewer[] => {
    const { 
        reviewers, 
        searchQuery, 
        selectedTypes, 
        selectedPriorities, 
        showHidden, 
        hiddenReviewerIds,
        hiddenCommentIds,
        selectedReviewerIds
    } = state;

    const query = searchQuery.toLowerCase();

    return reviewers
        .filter(r => showHidden || !hiddenReviewerIds.has(r.id))
        .filter(r => selectedReviewerIds.length === 0 || selectedReviewerIds.includes(r.id))
        .map(reviewer => ({
            ...reviewer,
            comments: reviewer.comments.filter(comment => {
                const isItemHidden = hiddenCommentIds.has(comment.id);
                const matchesHidden = showHidden || !isItemHidden;
                const matchesSearch = comment.content_md.toLowerCase().includes(query);
                const matchesType = selectedTypes.length === 0 || selectedTypes.includes(comment.type);
                const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(comment.priority);
                
                return matchesHidden && matchesSearch && matchesType && matchesPriority;
            })
        }))
        .filter(r => r.comments.length > 0 || !query);
};

interface ReviewerState {
    reviewers: Reviewer[];
    filteredReviewers: Reviewer[];
    isLoading: boolean;
    error: string | null;
    showHidden: boolean;

    hiddenReviewerIds: Set<number>;
    hiddenCommentIds: Set<number>;
    toggleReviewerHide: (id: number) => void;
    toggleCommentHide: (id: number) => void;

    selectedReviewerIds: number[];
    toggleReviewerSelection: (id: number) => void;
    
    searchQuery: string,
    selectedPriorities: string[],
    selectedTypes: string[],
    
    setReviewers: (projectId: number) => Promise<void>;
    setFilteredReviewers: (filteredReviewers: Reviewer[]) => void;
    
    addReviewer: (projectId: number, data: { name: string; general_comment: string }) => Promise<void>;
    updateReviewer: (projectId: number, id: number, data: { name: string; general_comment: string }) => Promise<void>;
    removeReviewer: (projectId: number, id: number) => Promise<void>;
    addComment: (reviewerId: number, comment: ReviewerComment) => void;
    updateComment: (reviewerId: number, commentId: number, updates: Partial<ReviewerComment>) => void;
    removeComment: (reviewerId: number, commentId: number) => void;

    setSearchQuery: (query: string) => void;
    
    toggleType: (type: string) => void;
    togglePriority: (priority: string) => void;
    resetFilters: () => void;
    setShowHidden: (show: boolean) => void;
}

export const useReviewerStore = create<ReviewerState>((set) => ({
    reviewers: [],
    filteredReviewers: [],
    isLoading: false,
    error: null,
    searchQuery: '',
    selectedPriorities: [],
    selectedTypes: [],
    showHidden: false,
    hiddenReviewerIds: new Set<number>(),
    hiddenCommentIds: new Set<number>(),
    selectedReviewerIds: [],

    setReviewers: async (projectId) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await reviewerApi.getByProject(projectId);
            const transformed = data.reviewers.map(reviewer => ({
                ...reviewer,
                comments: reviewer.comments.map(transformComment)
            }));
            
            set((state) => {
                const newState = { ...state, reviewers: transformed };
                return { 
                    ...newState, 
                    filteredReviewers: applyFilters(newState) 
                };
            });
        } catch (e) {
            set({ error: 'Не удалось загрузить рецензентов' });
        } finally {
            set({ isLoading: false });
        }
    },

    setFilteredReviewers: (filteredReviewers) => set({ filteredReviewers }),

    addReviewer: async (projectId, data) => {
        try {
            console.log(data);
            const response = await reviewerApi.add(projectId, data);
            const newReviewer = response.data;

            set((state) => {
                const nextReviewers = [...state.reviewers, { ...newReviewer, comments: [] }];
                const nextState = { ...state, reviewers: nextReviewers };
                return { ...nextState, filteredReviewers: applyFilters(nextState) };
            });
        } catch (error) {
            console.error("Failed to add reviewer:", error);
            throw error;
        }
    },

    updateReviewer: async (projectId, id, data) => {
        try {
            const response = await reviewerApi.update(projectId, id, data);
            const updatedReviewer = response.data;

            set((state) => {
                const nextReviewers = state.reviewers.map(r => 
                    r.id === id ? { ...r, ...updatedReviewer } : r
                );
                const nextState = { ...state, reviewers: nextReviewers };
                return { ...nextState, filteredReviewers: applyFilters(nextState) };
            });
        } catch (error) {
            console.error("Failed to update reviewer:", error);
            throw error;
        }
    },

    removeReviewer: async (projectId, id) => {
        try {
            await reviewerApi.delete(projectId, id);
            
            set((state) => {
                const nextReviewers = state.reviewers.filter(r => r.id !== id);
                const nextState = { ...state, reviewers: nextReviewers };
                return { ...nextState, filteredReviewers: applyFilters(nextState) };
            });
        } catch (error) {
            console.error("Failed to delete reviewer:", error);
            throw error;
        }
    },

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
    })),

    setSearchQuery: (query) => set((state) => {
        const newState = { ...state, searchQuery: query };
        return { ...newState, filteredReviewers: applyFilters(newState) };
    }),

    toggleType: (type) => set((state) => {
        const selectedTypes = state.selectedTypes.includes(type)
            ? state.selectedTypes.filter(t => t !== type)
            : [...state.selectedTypes, type];
        const nextState = { ...state, selectedTypes };
        return { ...nextState, filteredReviewers: applyFilters(nextState) };
    }),

    togglePriority: (priority) => set((state) => {
        const selectedPriorities = state.selectedPriorities.includes(priority)
            ? state.selectedPriorities.filter(p => p !== priority)
            : [...state.selectedPriorities, priority];
        const nextState = { ...state, selectedPriorities };
        return { ...nextState, filteredReviewers: applyFilters(nextState) };
    }),

    setShowHidden: (show) => set((state) => {
        const nextState = { ...state, showHidden: show };
        return { ...nextState, filteredReviewers: applyFilters(nextState) };
    }),

    toggleReviewerHide: (id) => set((state) => {
        const nextIds = new Set(state.hiddenReviewerIds);
        nextIds.has(id) ? nextIds.delete(id) : nextIds.add(id);
        const nextState = { ...state, hiddenReviewerIds: nextIds };
        return { ...nextState, filteredReviewers: applyFilters(nextState) };
    }),

    toggleCommentHide: (id) => set((state) => {
        const nextIds = new Set(state.hiddenCommentIds);
        nextIds.has(id) ? nextIds.delete(id) : nextIds.add(id);
        const nextState = { ...state, hiddenCommentIds: nextIds };
        return { ...nextState, filteredReviewers: applyFilters(nextState) };
    }),

    toggleReviewerSelection: (id) => set((state) => {
        const nextIds = state.selectedReviewerIds.includes(id)
            ? state.selectedReviewerIds.filter(itemId => itemId !== id)
            : [...state.selectedReviewerIds, id];
        
        const nextState = { ...state, selectedReviewerIds: nextIds };
        return { ...nextState, filteredReviewers: applyFilters(nextState) };
    }),

    resetFilters: () => set((state) => {
        const nextState = { 
            ...state, 
            searchQuery: '', 
            selectedPriorities: [], 
            selectedTypes: [], 
            showHidden: false,
            selectedReviewerIds: [],
            hiddenReviewerIds: new Set<number>(),
            hiddenCommentIds: new Set<number>()
        };
        return { ...nextState, filteredReviewers: applyFilters(nextState) };
    }),
}));