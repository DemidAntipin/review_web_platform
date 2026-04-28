import { CreateCommentDto, Reviewer } from '@/entities/reviewer/model/types';
import { BoardGrid } from '@/shared/ui/board/BoardGrid';
import { BoardColumn } from '@/shared/ui/board/BoardColumn';
import { StatusStrip } from '@/shared/ui/board/StatusStrip';
import { ReviewerCommentCard } from '@/entities/reviewer/ui/ReviewerCommentCard';
import { useBoardNavigation } from '@/shared/lib/hooks/useBoardNavigation';
import { Button } from '@/shared/ui/button/Button';
import { Plus } from 'lucide-react';
import s from './ReviewersBoard.module.scss';
import { useMemo, useState } from 'react';
import { ReviewerMenu } from '@/features/reviewer/ui/ReviewerMenu/ReviewerMenu';
import { useParams } from 'react-router-dom';
import { ReviewerCommentMenu } from '@/features/reviewer/ui/ReviewerCommentMenu/ReviewerCommentMenu';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { ReviewerCommentForm } from '@/features/reviewer/ui/ReviewerCommentForm/ReviewerCommentForm';
import { useReviewerStore } from '../model/reviewer.store';

interface ContentProps {
    reviewers: Reviewer[];
    onAddClick: () => void;
}

const BoardContent = ({ reviewers, onAddClick }: ContentProps) => {
    const navItems = useMemo(() => 
        reviewers.map(r => ({ id: r.id, label: r.name })), 
    [reviewers]);

    const { projectId } = useParams<{ projectId: string }>();
    const project_id = Number(projectId);

    const { activeTab, scrollToColumn, scrollContainerRef, columnsRef } = useBoardNavigation(navItems);
    const [selectedReviewer, setSelectedReviewer] = useState<Reviewer | null>(null);

    const { addComment, isLoading } = useReviewerStore();

    const handleCommentSubmit = (reviewerId: number, data: CreateCommentDto) => {
        addComment(project_id, reviewerId, data);
        setSelectedReviewer(null);
    };

    return (
        <>
            <StatusStrip columns={navItems} activeTab={activeTab} onTabClick={scrollToColumn} />
            <BoardGrid columnsCount={reviewers.length + 1} ref={scrollContainerRef} className={s.boardGridFixed}>
                {reviewers.map((reviewer, idx) => (
                    <BoardColumn 
                        key={reviewer.id}
                        data-id={reviewer.id} 
                        label={reviewer.name}
                        actionMenu={<ReviewerMenu reviewer={reviewer} projectId={project_id} />}
                        ref={(el) => { if (columnsRef.current) columnsRef.current[idx] = el; }}
                    >
                        <div className={s.columnContent}>
                            {reviewer.comments.map(comment => (
                                <ReviewerCommentCard key={comment.id} comment={comment} actionMenu={<ReviewerCommentMenu comment={comment} projectId={project_id} />} />
                            ))}
                            <Button variant='dashed' fullWidth onClick={() => setSelectedReviewer(reviewer)}>
                                <Plus size={18} /> <span>Добавить замечание</span>
                            </Button>
                        </div>
                    </BoardColumn>
                ))}
                <div className={s.desktopOnly}>
                    <BoardColumn label="">
                        <Button variant="dashed" onClick={onAddClick}>
                            <Plus size={24} /> <span>Новый рецензент</span>
                        </Button>
                    </BoardColumn>
                </div>
            </BoardGrid>

            <Dialog 
                isOpen={!!selectedReviewer} 
                onClose={() => setSelectedReviewer(null)}
                title="Новое замечание"
            >
                {selectedReviewer && (
                    <ReviewerCommentForm 
                        reviewer={selectedReviewer}
                        onSubmit={(data) => handleCommentSubmit(selectedReviewer.id, data)}
                        onClose={() => setSelectedReviewer(null)} />
                )}
            </Dialog>
        </>
    );
};

export const ReviewersBoard = ({ reviewers = [], onAddClick }: ContentProps) => {
    return (
        <div className={s.container}>
            <Button variant='dashed' fullWidth className={s.mobileOnly} onClick={onAddClick}>
                <Plus size={18} /> <span>Новый рецензент</span>
            </Button>

            {reviewers.length > 0 ? (
                <BoardContent reviewers={reviewers} onAddClick={onAddClick} />
            ) : (
                <BoardGrid columnsCount={1} className={s.boardGridFixed}>
                    {[1].map(i => (
                        <div key={i} className={s.desktopOnly}>
                            <BoardColumn label="">
                                <Button variant="dashed" onClick={onAddClick}>
                                    <Plus size={24} /> <span>Новый рецензент</span>
                                </Button>
                            </BoardColumn>
                        </div>
                    ))}
                </BoardGrid>
            )}
        </div>
    );
};