import React, { useEffect, useMemo, useState } from 'react';
import { MoreVertical, Edit2, Trash2, EyeOff, Eye } from 'lucide-react';
import { Dropdown } from '@/shared/ui/dropdown/Dropdown';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { useReviewerStore } from '@/entities/reviewer/model/reviewer.store';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { useProjectMembers } from '@/features/project/lib/hooks/useProjectMembers';
import { ROLE_MAP } from '@/shared/config/roles';
import { Reviewer } from '@/entities/reviewer/model/types';
import s from './ReviewerMenu.module.scss';
import clsx from 'clsx';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { ReviewerForm } from '../ReviewerForm/ReviewerForm';
import { Button } from '@/shared/ui/button/Button';

interface ReviewerMenuProps {
    reviewer: Reviewer;
    projectId: number;
}

export const ReviewerMenu: React.FC<ReviewerMenuProps> = ({ reviewer, projectId }) => {
    const [activeModal, setActiveModal] = useState<'edit' | 'delete' | null>(null);
    const { toggleReviewerHide, hiddenReviewerIds, updateReviewer, removeReviewer } = useReviewerStore();
    const { user: currentUser } = useAuthStore();
    const { members, fetchMembers } = useProjectMembers(projectId);
   
    useEffect(() => {
        if (!projectId) return;
        fetchMembers();
    }, [projectId, fetchMembers]);
    
    const isHidden = hiddenReviewerIds.has(reviewer.id);

    const isPrivileged = useMemo(() => {
        const currentMember = members.find(m => m.user_id === currentUser?.id);
        return currentUser?.role === 'Админ' || ROLE_MAP[currentMember?.role as keyof typeof ROLE_MAP] === "Автор";
    }, [members, currentUser]);

    const handleUpdate = async (values: { name: string; general_comment: string }) => {
        await updateReviewer(projectId, reviewer.id, values);
        setActiveModal(null);
    };

    const handleDelete = async () => {
        await removeReviewer(projectId, reviewer.id);
        setActiveModal(null);
    };

    return (
        <div onClick={e => e.stopPropagation()}>
            <Dropdown trigger={
                <IconButton size="sm">
                    <MoreVertical size={18} />
                </IconButton>
            }>
                <div className={s.menuList}>
                    <button className={s.menuItem} onClick={() => toggleReviewerHide(reviewer.id)}>
                        {isHidden ? <Eye size={16} /> : <EyeOff size={16} />}
                        {isHidden ? 'Показать' : 'Скрыть'}
                    </button>

                    {isPrivileged && (
                        <>
                            <button className={s.menuItem} onClick={() => setActiveModal('edit')}>
                                <Edit2 size={16} /> Редактировать
                            </button>
                            <button className={clsx(s.menuItem, s.danger)} onClick={() => setActiveModal('delete')}>
                                <Trash2 size={16} /> Удалить
                            </button>
                        </>
                    )}
                </div>
            </Dropdown>

            <Dialog 
                isOpen={activeModal === 'edit'} 
                onClose={() => setActiveModal(null)} 
                title="Редактировать рецензента"
            >
                <ReviewerForm 
                    initialValues={{
                        name: reviewer.name,
                        general_comment: reviewer.general_comment
                    }}
                    onSubmit={handleUpdate}
                    onCancel={() => setActiveModal(null)}
                    submitText="Сохранить изменения"
                />
            </Dialog>

            <Dialog 
                isOpen={activeModal === 'delete'} 
                onClose={() => setActiveModal(null)} 
                title="Удалить рецензента"
            >
                <div className={s.confirmContent}>
                    <p>Вы действительно хотите удалить рецензента <strong>{reviewer.name}</strong> и все его замечания?</p>
                    <div className={s.actions}>
                        <Button variant="secondary" onClick={() => setActiveModal(null)}>Отмена</Button>
                        <Button variant="danger" onClick={handleDelete}>Удалить</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};