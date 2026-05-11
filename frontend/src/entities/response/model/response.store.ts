import { create } from 'zustand';
import { responseApi } from '../api/response.api';
import { ReviewerResponse, ExportFormat } from './types';

interface ResponseState {
    selectedReviewerId: number | null;
    selectedCommentId: number | null;
    currentResponse: ReviewerResponse | null;
    initialContent: string;
    currentContent: string;
    isLoading: boolean;
    isGenerating: boolean;

    setReviewer: (id: number | null) => void;
    setComment: (id: number | null, text?: string) => void;
    setCurrentContent: (text: string) => void;
    
    fetchResponse: (projectId: number, rId: number, cId: number) => Promise<void>;
    saveResponse: (projectId: number) => Promise<void>;
    approveResponse: (projectId: number, approved: boolean) => Promise<void>;
    exportResponse: (projectId: number, format: ExportFormat, targetReviewerId:number, targetCommentId:number) => Promise<void>;

    applyExternalUpdate: (data: ReviewerResponse) => void;

    generateResponse: (projectId: number, reviewerId: number, commentId: number) => void;

    getIsDirty: () => boolean;
}

export const useResponseStore = create<ResponseState>((set, get) => ({
    isLoading: false,
    isGenerating: false,
    selectedReviewerId: null,
    selectedCommentId: null,
    currentResponse: null,
    initialContent: '',
    currentContent: '',

    setReviewer: (id) => set({ 
        selectedReviewerId: id, 
        selectedCommentId: null,
        currentResponse: null,
        currentContent: '', 
        initialContent: '' 
    }),

    setComment: (id, text = '') => set({ 
        selectedCommentId: id, 
        currentContent: text, 
        initialContent: text,
        currentResponse: null
    }),

    setCurrentContent: (text) => set({ currentContent: text }),

    fetchResponse: async (projectId, rId, cId) => {
        set({ isLoading: true });
        try {
            const { data } = await responseApi.get(projectId, rId, cId);
            set({ 
                currentResponse: data,
                initialContent: data.response_md,
                currentContent: data.response_md
            });
        } finally {
            set({ isLoading: false });
        }
    },

    saveResponse: async (projectId) => {
        const { selectedReviewerId, selectedCommentId, currentContent, getIsDirty } = get();
        if (!getIsDirty() || !selectedReviewerId || !selectedCommentId) return;
        await responseApi.save(projectId, selectedReviewerId, selectedCommentId, { 
            response_md: currentContent 
        });
    },

    approveResponse: async (projectId, approved) => {
        const { selectedReviewerId, selectedCommentId, currentResponse } = get();
        if (!currentResponse) return;

        await responseApi.approve(
            projectId, 
            selectedReviewerId!, 
            selectedCommentId!, 
            currentResponse.id, 
            { approved }
        );
    },

    exportResponse: async (projectId, format, targetReviewerId, targetCommentId) => {
        const { saveResponse, fetchResponse, getIsDirty, selectedReviewerId, selectedCommentId } = get();

        if (getIsDirty()) {
            await saveResponse(projectId);
        }

        const rId = targetReviewerId ?? selectedReviewerId;
        const cId = targetCommentId ?? selectedCommentId;

        if (!rId || !cId) return;

        await fetchResponse(projectId, rId, cId);

        const { currentResponse } = get();
        if (!currentResponse) return;

        try {
            const blob = await responseApi.export(projectId, rId, cId, currentResponse.id, format);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Response_${currentResponse.id}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Ошибка при экспорте:", error);
        }
    },

    applyExternalUpdate: (data) => {
        const state = get();
        if (state.selectedCommentId !== data.comment_id) return;

        const isDirty = state.getIsDirty();
        
        set({
            currentResponse: data,
            initialContent: data.response_md,
            currentContent: isDirty ? state.currentContent : data.response_md
        });
    },

    generateResponse: async (projectId, reviewerId, commentId) => {
        set ({isGenerating: true});
        try {
            const { data } = await responseApi.generate_template(projectId, reviewerId, commentId);
            set({currentContent: data.response });
        }
        catch (error) {
            console.error("Ошибка при генерации черновика:", error);
        }
        finally {
            set({isGenerating: false})
        }
    },

    getIsDirty: () => get().currentContent !== get().initialContent,
}));