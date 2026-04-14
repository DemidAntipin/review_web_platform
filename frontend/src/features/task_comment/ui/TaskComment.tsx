import React from 'react';
import { useTaskComments } from '../lib/hooks/useTaskComments';
import { CommentList } from './CommentList/CommentList';
import { CommentForm } from './CommentForm/CommentForm';
import s from './TaskComments.module.scss';

interface TaskCommentsProps {
    projectId: number;
    taskId: number;
}

export const TaskComments: React.FC<TaskCommentsProps> = ({ projectId, taskId }) => {
    const { comments, addComment, isLoading } = useTaskComments(projectId, taskId);

    return (
        <div className={s.container}>
            <CommentList comments={comments} />
            <CommentForm onSend={addComment} disabled={isLoading} />
        </div>
    );
};