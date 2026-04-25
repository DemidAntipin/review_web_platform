import { useEffect } from 'react';
import { WebsocketService } from '@/shared/api/websocket';
import { useReviewerStore } from '@/entities/reviewer/model/reviewer.store';

export const useReviewerSocket = (projectId: number) => {
    const { 
        setReviewerState,
        deleteReviewerState,
        setComment,
        deleteComment, 
    } = useReviewerStore();

    useEffect(() => {
        if (!projectId) return;

        const unsubAdded = WebsocketService.on('REVIEWER_ADDED', (data) => {
            setReviewerState(data);
        });

        const unsubUpdated = WebsocketService.on('REVIEWER_UPDATED', (data) => {
            setReviewerState(data);
        });

        const unsubRemoved = WebsocketService.on('REVIEWER_REMOVED', (payload) => {
            deleteReviewerState(payload.reviewer_id);
        });

        const unsubCommentAdded = WebsocketService.on('COMMENT_ADDED', (data) => {
            setComment(data.reviewer_id, data);
        });

        const unsubCommentUpdated = WebsocketService.on('COMMENT_UPDATED', (data) => {
            setComment(data.reviewer_id, data);
        });

        const unsubCommentDecomposed = WebsocketService.on('COMMENT_DECOMPOSED', (data) => {
            setComment(data.comment.reviewer_id, data.comment)
        })

        const unsubCommentRemoved = WebsocketService.on('COMMENT_DELETED', (payload) => {
            deleteComment(payload.reviewer_id, payload.comment_id);
        });

        return () => {
            unsubAdded();
            unsubUpdated();
            unsubRemoved();
            unsubCommentAdded();
            unsubCommentUpdated();
            unsubCommentDecomposed();
            unsubCommentRemoved();
        };
    }, [projectId]);
};