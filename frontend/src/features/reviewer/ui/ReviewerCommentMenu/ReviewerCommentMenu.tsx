import React, { useMemo, useState } from 'react';
import { MoreVertical, Edit2, Trash2, EyeOff, Eye } from 'lucide-react';
import { Dropdown } from '@/shared/ui/dropdown/Dropdown';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { useReviewerStore } from '@/entities/reviewer/model/reviewer.store';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { useProjectMembers } from '@/features/project/lib/hooks/useProjectMembers';
import { ROLE_MAP } from '@/shared/config/roles';
import { Button } from '@/shared/ui/button/Button';
import { ReviewerComment } from '@/entities/reviewer/model/types';
import s from './ReviewerCommentMenu.module.scss';
import clsx from 'clsx';

interface ReviewerCommentMenuProps {
    comment: ReviewerComment;
    projectId: number;
}

export const ReviewerCommentMenu: React.FC<ReviewerCommentMenuProps> = ({ comment, projectId }) => {
    const [activeModal, setActiveModal] = useState<'edit' | 'delete' | null>(null);
    const { toggleCommentHide, hiddenCommentIds, removeComment } = useReviewerStore();

    const { user: currentUser } = useAuthStore();
    const { members } = useProjectMembers(projectId);
    
    const isHidden = hiddenCommentIds.has(comment.id);

    const isPrivileged = useMemo(() => {
        const currentMember = members.find(m => m.user_id === currentUser?.id);
        return currentUser?.role === 'Админ' || ROLE_MAP[currentMember?.role as keyof typeof ROLE_MAP] === "Автор";
    }, [members, currentUser]);

    return (
        <div onClick={e => e.stopPropagation()}>
            <Dropdown trigger={
                <IconButton size="sm">
                    <MoreVertical size={16} />
                </IconButton>
            }>
                <div className={s.menuList}>
                    <button className={s.menuItem} onClick={() => toggleCommentHide(comment.id)}>
                        {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
                        {isHidden ? 'Показать' : 'Скрыть'}
                    </button>

                    {isPrivileged && (
                        <>
                            <button className={s.menuItem} onClick={() => setActiveModal('edit')}>
                                <Edit2 size={14} /> Редактировать
                            </button>
                            <button className={clsx(s.menuItem, s.danger)} onClick={() => setActiveModal('delete')}>
                                <Trash2 size={14} /> Удалить
                            </button>
                        </>
                    )}
                </div>
            </Dropdown>

            <Dialog isOpen={activeModal === 'delete'} onClose={() => setActiveModal(null)} title="Удалить замечание">
                <div className={s.confirmContent}>
                    <p>Вы действительно хотите удалить это замечание?</p>
                    <div className={s.actions}>
                        <Button variant="secondary" onClick={() => setActiveModal(null)}>Отмена</Button>
                        <Button variant="danger" onClick={() => removeComment(comment.reviewer_id, comment.id)}>
                            Удалить
                        </Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};