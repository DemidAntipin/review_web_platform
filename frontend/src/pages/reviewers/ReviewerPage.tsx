import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { Loader } from '@/shared/ui/loader/Loader';
import { ArrowLeft, Plus } from 'lucide-react';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { Dialog } from '@/shared/ui/dialog/Dialog';

import { useReviewerStore } from '@/entities/reviewer/model/reviewer.store';
import { useProjectStore } from '@/entities/project/model/project.store';
import { ReviewersBoard } from '@/entities/reviewer/ui/ReviewersBoard';
import { ReviewerForm } from '@/features/reviewer/ui/ReviewerForm/ReviewerForm';
import { ReviewerControls } from '@/features/reviewer/ui/ReviewersControls';
import { useReviewerSocket } from '@/features/reviewer/lib/hooks/useReviewerSocket';


export const ReviewersPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const project_id = Number(projectId);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const { setPageTitle, setHeaderActions, setHeaderSearch } = useOutletContext<any>();
    const { filteredReviewers, isLoading, setReviewers, addReviewer } = useReviewerStore();
    const { projects } = useProjectStore();
    const currentProject = projects.find(p => p.id === project_id);

    useEffect(() => {
        setPageTitle(
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IconButton size="sm">
                    <ArrowLeft size={20} />
                </IconButton>
                <span>{currentProject?.title || 'Загрузка...'}</span>
            </div>
        );
        setHeaderSearch(<ReviewerControls />);
        setHeaderActions(null);
        return () => {
            setHeaderSearch(null);
            setHeaderActions(null);
        };
    }, [currentProject, setPageTitle]);

    useReviewerSocket(project_id);

    useEffect(() => {
        if (!project_id) return;
        setReviewers(project_id);
    }, []);

    const handleCreate = (data: { name: string; general_comment: string }) => {
        addReviewer(project_id, data);
        setIsModalOpen(false);
    };

    if (isLoading) return <Loader />;

    return (
        <>
            <ReviewersBoard 
                reviewers={filteredReviewers} 
                onAddClick={() => setIsModalOpen(true)} 
            />

            <Dialog 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title="Новый рецензент"
            >
                <ReviewerForm 
                    onSubmit={handleCreate} 
                    onCancel={() => setIsModalOpen(false)} 
                />
            </Dialog>
        </>
    );
};

