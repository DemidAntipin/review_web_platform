import React from 'react';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { Button } from '@/shared/ui/button/Button';
import { MemberForm } from './MemberForm/MemberForm';
import { Member } from '@/entities/project/model/types';
import s from './ProjectTeam.module.scss';

interface TeamModalsProps {
    activeModal: string | null;
    selectedMember: Member | null;
    actions: any;
}

export const TeamModals: React.FC<TeamModalsProps> = ({ activeModal, selectedMember, actions }) => {
    const isConfirmModal = activeModal === 'remove' || activeModal === 'leave';

    return (
        <>
            <Dialog 
                isOpen={activeModal === 'add'} 
                onClose={actions.closeModal} 
                title="Добавить участника"
            >
                <MemberForm 
                    onSubmit={(data) => actions.addMember(data)} 
                    onCancel={actions.closeModal}
                />
            </Dialog>

            <Dialog 
                isOpen={activeModal === 'edit'} 
                onClose={actions.closeModal} 
                title="Редактирование роли"
            >
                <MemberForm 
                    isEdit 
                    initialValues={{ 
                        user_id: selectedMember?.user_id || 0, 
                        role: String(selectedMember?.role || '') 
                    }} 
                    onSubmit={(data) => actions.updateMember(Number(data.role))}
                    onCancel={actions.closeModal}
                />
            </Dialog>

            <Dialog 
                isOpen={isConfirmModal} 
                onClose={actions.closeModal} 
                title={activeModal === 'leave' ? 'Выход из проекта' : 'Удаление участника'}
            >
                <div className={s.confirmContent}>
                    <p>
                        {activeModal === 'leave' 
                            ? 'Вы действительно хотите покинуть проект?' 
                            : `Вы действительно хотите удалить участника ${selectedMember?.username} из команды?`}
                    </p>
                    <div className={s.confirmActions}>
                        <Button variant="secondary" onClick={actions.closeModal}>Отмена</Button>
                        <Button 
                            variant='danger'
                            onClick={activeModal === 'leave' ? actions.leaveProject : actions.removeMember}
                        >
                            {activeModal === 'leave' ? 'Покинуть' : 'Удалить'}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    );
};