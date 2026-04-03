import { useEffect, useState } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { Board } from '@/shared/ui/board/Board';
import { BoardGrid } from '@/shared/ui/board/BoardGrid';
import { BoardColumn } from '@/shared/ui/board/BoardColumn';
import { StatusStrip } from '@/shared/ui/board/StatusStrip';
import { ReviewerCommentCard } from '@/entities/reviewer/ui/ReviewerCommentCard';
import { reviewerApi } from '@/entities/reviewer/api/reviewer.api';
import { Reviewer, transformComment } from '@/entities/reviewer/model/types';
import { useBoardNavigation } from '@/shared/lib/hooks/useBoardNavigation';
import { Loader } from '@/shared/ui/loader/Loader';
import { ArrowLeft, Plus } from 'lucide-react';
import s from './reviewers.module.scss';
import { Button } from '@/shared/ui/button/Button';
import { useProjectStore } from '@/entities/project/model/project.store';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { useReviewerStore } from '@/entities/reviewer/model/reviewer.store';

const ReviewersBoardContent = ({ reviewers }: { reviewers: Reviewer[] }) => {
    const navItems = reviewers.map(r => ({ id: r.id, label: r.name }));
    const { activeTab, scrollToColumn, scrollContainerRef, columnsRef } = useBoardNavigation(navItems);

    return (
        <Board>
            <div className={s.mobileAddReviewer}>
                <Button variant='dashed' fullWidth>
                    <Plus size={18} /> <span>Новый рецензент</span>
                </Button>
            </div>

            <StatusStrip 
                columns={navItems} 
                activeTab={activeTab} 
                onTabClick={scrollToColumn} 
            />

            <BoardGrid ref={scrollContainerRef} columnsCount={reviewers.length + 1}>
                {reviewers.map(reviewer => (
                    <BoardColumn 
                        key={reviewer.id} 
                        label={reviewer.name}
                        data-id={reviewer.id}
                        ref={(el) => { columnsRef.current[reviewer.id] = el; }}
                    >
                        <div className={s.columnContent}>
                            {reviewer.comments.map(comment => (
                                <ReviewerCommentCard key={comment.id} comment={comment} />
                            ))}
                            <Button variant='dashed' fullWidth className={s.mt12}>
                                <Plus size={18} /> <span>Добавить замечание</span>
                            </Button>
                        </div>
                    </BoardColumn>
                ))}

                <BoardColumn label='' className={s.desktopOnlyColumn}>
                    <Button variant='dashed' fullWidth>
                        <Plus size={18} /> <span>Новый рецензент</span>
                    </Button>
                </BoardColumn>
            </BoardGrid>
        </Board>
    );
};

export const ReviewersPage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const project_id = Number(projectId);
    const { setPageTitle, setHeaderActions } = useOutletContext<any>();
    
    const { reviewers, isLoading, setReviewers } = useReviewerStore();
    const { projects } = useProjectStore();
    const currentProject = projects.find(p => p.id === project_id);

    useEffect(() => {
        if (project_id) setReviewers(project_id);
        
        setPageTitle(
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <IconButton size="sm" onClick={() => window.history.back()}>
                    <ArrowLeft size={20} />
                </IconButton>
                <span>{currentProject?.title || 'Загрузка...'}</span>
            </div>
        );

        return () => {
            setPageTitle('');
        };
    }, [project_id, currentProject]);

    if (isLoading) return <Loader />;
    
    if (reviewers.length === 0) {
        return (
            <Board>
                 <div style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-tertiary)', marginBottom: '20px' }}>Рецензентов пока нет</p>
                    <Button variant='dashed'>Добавить первого рецензента</Button>
                 </div>
            </Board>
        );
    }

    return <ReviewersBoardContent reviewers={reviewers} />;
};