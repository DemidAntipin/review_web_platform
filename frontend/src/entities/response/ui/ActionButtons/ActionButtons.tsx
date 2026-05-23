import { useAuthStore } from '@/features/auth/model/auth.store';
import { useResponseStore } from '../../model/response.store';
import s from './ActionButtons.module.scss';
import clsx from 'clsx';
import { useProjectMembers } from '@/features/project/lib/hooks/useProjectMembers';
import { useMemo, useState } from 'react';
import { ROLE_MAP } from '@/shared/config/roles';
import { Check, Download, FileText, Save, X } from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { useParams } from 'react-router-dom';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { ExportForm } from '../ExportForm/ExportForm';
import { ExportDTO } from '../../model/types';
import { Loader } from '@/shared/ui/loader/Loader';

export const ResponseActionButtons: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>(); 
    const project_id = Number(projectId);

    const { currentResponse, saveResponse, approveResponse, exportResponse, generateResponse, selectedReviewerId, selectedCommentId, isGenerating} = useResponseStore();
    const isDirty = useResponseStore(state => state.currentContent !== state.initialContent);

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const { user: currentUser } = useAuthStore();
    const { members } = useProjectMembers(project_id);

    const permissions = useMemo(() => {
        const currentMember = members.find(m => m.user_id === currentUser?.id);
        const role = currentUser?.role === 'Админ' ? currentUser.role : currentMember?.role;
        
        const isAuthor = role === 'Админ' || ROLE_MAP[role as keyof typeof ROLE_MAP] === "Автор";
        const isEditor = role === 'Админ' || ROLE_MAP[role as keyof typeof ROLE_MAP] === 'Редактор';

        return {
            canSave: isAuthor,
            canGenerate: isAuthor,
            canApprove: isEditor,
            canExport: true,
        };
    }, [members, currentUser]);

    const buttons = useMemo(() => [
        { 
            show: permissions.canSave, 
            label: 'Сохранить', 
            icon: <Save size={16} />, 
            handler: () => saveResponse(project_id),
            disabled: !isDirty
        },
        { 
            show: permissions.canGenerate, 
            label: isGenerating ? 'Генерация...' : 'Шаблон',
            icon: isGenerating ? <Loader noWrapper size={16} /> : <FileText size={16} />,
            handler: () => generateResponse(project_id, selectedReviewerId!, selectedCommentId!),
            disabled: !selectedCommentId || isGenerating
        },
        { 
            show: permissions.canApprove, 
            label: currentResponse?.approved ? 'Отозвать' : 'Одобрить',
            icon:  currentResponse?.approved ? <X size={16} /> : <Check size={16} />, 
            handler: () => approveResponse(project_id, !currentResponse?.approved),
            disabled: !currentResponse
        },
        { 
            show: permissions.canExport, 
            label: 'Экспорт', 
            icon: <Download size={16} />, 
            handler: () => setIsExportModalOpen(true),
            disabled: false
        }
    ], [permissions, currentResponse, isDirty, project_id, exportResponse, isGenerating, selectedCommentId]);

    const handleExportSubmit = async (data: ExportDTO) => {
        await exportResponse(project_id, data.format, data.reviewerId, data.commentId);
        setIsExportModalOpen(false);
    };

    return (
        <>
            <div className={clsx(s.actionsList)}>
                {buttons.filter(btn => btn.show).map(btn => (
                    <Button 
                        key={btn.label} 
                        onClick={btn.handler} 
                        className={s.actionButton}
                        disabled={btn.disabled}
                    >
                        {btn.icon}
                        <span>{btn.label}</span>
                    </Button>
                ))}
            </div>

            <Dialog 
                    isOpen={isExportModalOpen} 
                    onClose={() => setIsExportModalOpen(false)}
                    title="Экспорт ответа"
                >
                    <ExportForm 
                        projectId={project_id} 
                        onSubmit={handleExportSubmit} 
                        onClose={() => setIsExportModalOpen(false)} 
                    />
            </Dialog>
        </>
    );
};