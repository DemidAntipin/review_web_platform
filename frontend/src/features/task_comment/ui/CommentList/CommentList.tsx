import React, { useRef, useEffect } from 'react';
import { TaskComment } from '@/entities/task/model/types';
import { useAuthStore } from '@/features/auth/model/auth.store';
import clsx from 'clsx';
import s from './CommentList.module.scss';
import { ROLE_MAP } from '@/shared/config/roles';

interface CommentListProps {
    comments: TaskComment[];
}

export const CommentList: React.FC<CommentListProps> = ({ comments }) => {
    const currentUser = useAuthStore(state => state.user);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments]);

    return (
        <div className={s.list} ref={scrollRef}>
            {comments.map((comment, index) => {
                const isMe = comment.username === currentUser?.username;
                const isNewAuthor = comments[index - 1]?.username !== comment.username;

                return (
                    <div key={comment.id} className={clsx(s.messageGroup, isMe ? s.right : s.left)}>
                        {isNewAuthor && (
                            <div className={s.authorBadge}>
                                <span className={s.name}>{comment.username}</span>
                                <span className={s.role}>{ROLE_MAP[comment.role]}</span>
                            </div>
                        )}
                        <div className={s.bubble}>{comment.message}</div>
                    </div>
                );
            })}
        </div>
    );
};