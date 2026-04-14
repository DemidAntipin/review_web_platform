import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '../../api/chat.api';
import { TaskComment } from '@/entities/task/model/types';
import { useTaskCommentsSocket } from './useTaskCommentsSocket';

export const useTaskComments = (projectId: number, taskId: number) => {
    const [comments, setComments] = useState<TaskComment[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const pushComment = useCallback((newComment: TaskComment) => {
        setComments(prev => {
            if (prev.some(c => c.id === newComment.id)) return prev;
            return [...prev, newComment];
        });
    }, []);

    useTaskCommentsSocket({ 
        taskId, 
        onCommentAdded: pushComment 
    });

    const fetchComments = async () => {
        try {
            const { data } = await chatApi.getComments(projectId, taskId);
            setComments(data);
        } catch (e) {
            console.error('Failed to fetch comments', e);
        }
    };

    const addComment = async (text: string) => {
        setIsLoading(true);
        try {
            const { data } = await chatApi.addComment(projectId, taskId, text);
            pushComment(data);
            return true;
        } catch (e) {
            console.error('Failed to send comment', e);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [taskId]);

    return { comments, addComment, isLoading };
};