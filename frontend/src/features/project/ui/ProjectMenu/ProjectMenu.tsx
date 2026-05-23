import React, { useEffect, useMemo, useState } from 'react';
import { MoreVertical, Edit2, Trash2, EyeOff, Eye } from 'lucide-react';
import { Dropdown } from '@/shared/ui/dropdown/Dropdown';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { ProjectForm } from '../ProjectForm/ProjectForm';
import { useProjectStore } from '@/entities/project/model/project.store';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { ProjectPreview } from '@/entities/project/model/types';
import s from './ProjectMenu.module.scss';
import { useProjectMembers } from '../../lib/hooks/useProjectMembers';
import { ROLE_MAP } from '@/shared/config/roles';
import { Button } from '@/shared/ui/button/Button';
import clsx from 'clsx';

interface ProjectMenuProps {
    project: ProjectPreview;
    isHidden: boolean;
    onToggleHide: () => void;
}

export const ProjectMenu: React.FC<ProjectMenuProps> = ({ project, isHidden, onToggleHide }) => {
    const [activeModal, setActiveModal] = useState<'edit' | 'delete' | null>(null);
    const { updateProject, deleteProject } = useProjectStore();

    const { user: currentUser } = useAuthStore();
    const { members, fetchMembers } = useProjectMembers(project.id);
       
    useEffect(() => {
        if (!project.id) return;
        fetchMembers();
    }, [project, fetchMembers]);
    
    const isPrivileged = useMemo(() => {
        const currentMember = members.find(m => m.user_id === currentUser?.id);
        return currentUser?.role === 'Админ' || ROLE_MAP[currentMember?.role as keyof typeof ROLE_MAP] === "Автор";
    }, [members, currentUser]);


    const handleUpdate = async (values: any) => {
        await updateProject(project.id, values);
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
                    <button className={s.menuItem} onClick={onToggleHide}>
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
                title="Редактировать проект"
            >
                <ProjectForm 
                    initialValues={{
                        title: project.title,
                        journal: project.journal,
                        deadline: project.deadline
                    }}
                    onSubmit={handleUpdate}
                    onCancel={() => setActiveModal(null)}
                    submitText="Сохранить изменения"
                />
            </Dialog>

            <Dialog 
                isOpen={activeModal === 'delete'} 
                onClose={() => setActiveModal(null)} 
                title="Удаление проекта"
            >
                <div className={s.confirmContent}>
                    <p>Вы действительно хотите удалить проект <strong>{project.title}</strong>?</p>
                    <div className={s.actions}>
                        <Button variant="secondary" onClick={() => setActiveModal(null)}>Отмена</Button>
                        <Button variant="danger" onClick={() => deleteProject(project.id)}>Удалить</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
};