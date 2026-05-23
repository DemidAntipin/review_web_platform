import { create } from 'zustand';
import { COMMENT_PRIORITY_MAP, COMMENT_TYPE_MAP, CreateCommentDto, Reviewer, ReviewerComment, transformComment, UpdateCommentDto } from '../model/types';
import { reviewerApi } from '../api/reviewer.api';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Section } from 'lucide-react';

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
    setReviewerState: (reviewer: Reviewer) => void;
    deleteReviewerState: (id: number) => void;
    addComment: (projectId: number, reviewerId: number, comment: CreateCommentDto) => Promise<void>;
    updateComment: (projectId: number, reviewerId: number, commentId: number, updates: UpdateCommentDto) => Promise<void>;
    removeComment: (projectId: number, reviewerId: number, commentId: number) => Promise<void>;
    setDetailedComment: (projectId: number, reviewerId: number, commentId: number) => Promise<void>;
    setComment: (reviewerId: number, comment: ReviewerComment) => void;
    deleteComment: (reviewerId: number, commentId: number) => void;
    

    setSearchQuery: (query: string) => void;
    
    toggleType: (type: string) => void;
    togglePriority: (priority: string) => void;
    resetFilters: () => void;
    setShowHidden: (show: boolean) => void;
}

export const useReviewerStore = create<ReviewerState>()(
    persist(
        (set, get) => ({
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

            setReviewerState: (reviewer) => {
                set((state) => {
                    const exists = state.reviewers.find(r => r.id === reviewer.id);
                    const nextReviewers = exists
                        ? state.reviewers.map(r => r.id === reviewer.id ? { ...r, ...reviewer } : r)
                        : [...state.reviewers, { ...reviewer, comments: reviewer.comments || [] }];

                    const nextState = { ...state, reviewers: nextReviewers };
                    return { ...nextState, filteredReviewers: applyFilters(nextState) };
                });
            },

            deleteReviewerState: (id) => {
                set((state) => {
                    const nextReviewers = state.reviewers.filter(r => r.id !== id);
                    const nextState = { ...state, reviewers: nextReviewers };
                    return { ...nextState, filteredReviewers: applyFilters(nextState) };
                });
            },

            addComment: async (projectId, reviewerId, comment) => {
                try {
                    const { data } = await reviewerApi.addComment(projectId, reviewerId, comment);
                    get().setComment(reviewerId, data);
                } catch (e) {
                    console.error("Failed to add comment:", e);
                    throw e;
                }
            },

            updateComment: async (projectId, reviewerId, commentId, updates) => {
                try {
                    const { data } = await reviewerApi.updateComment(projectId, reviewerId, commentId, updates);

                    get().setComment(reviewerId, data);
                } catch (e) {
                    console.error("Failed to update comment:", e);
                    throw e;
                }
            },

            removeComment: async (projectId, reviewerId, commentId) => {
                try {
                    await reviewerApi.deleteComment(projectId, reviewerId, commentId);
                    
                    get().deleteComment(reviewerId, commentId);
                } catch (e) {
                    console.error("Failed to delete comment:", e);
                    throw e;
                }
            },
            setComment: (reviewerId, comment) => {
                const transformed = transformComment(comment);
                set((state) => {
                    const nextReviewers = state.reviewers.map(r => {
                        if (r.id !== reviewerId) return r;
                        
                        const exists = r.comments.find(c => c.id === comment.id);
                        const nextComments = exists 
                            ? r.comments.map(c => c.id === comment.id ? transformed : c)
                            : [...r.comments, transformed];

                        return { ...r, comments: nextComments };
                    });
                    
                    const nextState = { ...state, reviewers: nextReviewers };
                    return { ...nextState, filteredReviewers: applyFilters(nextState) };
                });
            },
            setDetailedComment: async (projectId, reviewerId, commentId) => {
                try {
                    const { data } = await reviewerApi.getComment(projectId, reviewerId, commentId);
                    get().setComment(reviewerId, data)
                } catch (e) {
                    console.error("Failed to delete comment:", e);
                    throw e;
                }
            },
            deleteComment: (reviewerId, commentId) => {
                set((state) => {
                    const nextReviewers = state.reviewers.map(r => 
                        r.id === reviewerId 
                            ? { ...r, comments: r.comments.filter(c => c.id !== commentId) } 
                            : r
                    );
                    const nextState = { ...state, reviewers: nextReviewers };
                    return { ...nextState, filteredReviewers: applyFilters(nextState) };
                });
            },

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
        }),
        {
            name: 'reviewer-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                searchQuery: state.searchQuery,
                selectedTypes: state.selectedTypes,
                selectedPriorities: state.selectedPriorities,
                showHidden: state.showHidden,
                selectedReviewerIds: state.selectedReviewerIds,
            }),
        }
    )
);