import { useResponseSocket } from '@/entities/response/lib/hooks/useResponseSocket';
import s from './ResponsePage.module.scss';
import { useOutletContext, useParams } from 'react-router-dom';
import { useResponseStore } from '@/entities/response/model/response.store';
import { ResponseActionButtons } from '@/entities/response/ui/ActionButtons/ActionButtons';
import { Dropdown } from '@/shared/ui/dropdown/Dropdown';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { AlertCircle, ArrowLeft, CheckCircle2, MoreVertical, MousePointer2, Plus } from 'lucide-react';
import { useProjectStore } from '@/entities/project/model/project.store';
import { useEffect, useMemo, useState } from 'react';
import { useKanbanStore } from '@/features/kanban-dnd/model/kanban.store';
import { ResponseHeader } from '@/entities/response/ui/ResponseHeader/ResponseHeader';
import { SideOverlay } from '@/shared/ui/sideoverlay/SideOverlay';
import { MarkdownPreview } from '@/shared/widgets/MarkdownEditor/ui/MarkdownPreview';
import { MarkdownEditor } from '@/shared/widgets/MarkdownEditor/ui/MarkdownEditor';
import clsx from 'clsx';
import { useMediaQuery } from '@/shared/lib/hooks/useMediaQuery';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { TaskCard } from '@/entities/task/ui/TaskCard';
import { Loader } from '@/shared/ui/loader/Loader';
import { Task } from '@/entities/task/model/types';
import { MobileFab } from '@/shared/ui/mobile_actions/MobileFab';
import { useAuthStore } from '@/features/auth/model/auth.store';
import { useProjectMembers } from '@/features/project/lib/hooks/useProjectMembers';
import { ROLE_MAP } from '@/shared/config/roles';
import { useReviewerStore } from '@/entities/reviewer/model/reviewer.store';
import { ReviewerCommentCard } from '@/entities/reviewer/ui/ReviewerCommentCard';
import { ReviewerComment } from '@/entities/reviewer/model/types';
import { SelectedCommentHeader } from '@/entities/response/ui/HeaderComment/HeaderComment';

export const ResponsePage = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const project_id = Number(projectId);

    const { setPageTitle } = useOutletContext<any>();

    const { projects } = useProjectStore();
    const currentProject = projects.find(p => p.id === project_id);

    useEffect(() => {
        setPageTitle(
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <IconButton size="sm">
                    <ArrowLeft size={20} />
                </IconButton>
                <span>{currentProject?.title || 'Загрузка...'}</span>
            </div>
        );
        return () => {
            setPageTitle(null)
        };
    }, [currentProject, setPageTitle]);
    
    const { reviewers } = useReviewerStore();

    const { selectedCommentId, selectedReviewerId, currentContent, setCurrentContent, isLoading, isGenerating } = useResponseStore();

    const selectedComment = useMemo(() => {
        const reviewer = reviewers.find(r => r.id === selectedReviewerId);
        return reviewer?.comments.find(c => c.id === selectedCommentId);
    }, [selectedCommentId, selectedReviewerId, reviewers]);

    const [showTasks, setShowTasks] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    const isMobile = useMediaQuery('(max-width: 768px)');

    const EmptySelection = ({ message }: { message: string }) => (
        <div className={s.emptyPlaceholder}>
            <MousePointer2 size={40} strokeWidth={1.5} />
            <p>{message}</p>
        </div>
    );

    const { tasks, setTasks, fetchTaskDetails } = useKanbanStore();
    const [previewContent, setPreviewContent] = useState<string | null>(null);

    useResponseSocket(selectedCommentId);

    const readyTasks = tasks.filter(task => 
        selectedCommentId && 
        task.comment_id === selectedCommentId && 
        task.status === "Готово к ответу"
    );

    const { user: currentUser } = useAuthStore();
    const { members, fetchMembers } = useProjectMembers(project_id);

    useEffect(() => {
        if (!project_id) return;
        setTasks(project_id);
        fetchMembers();
    }, [project_id, setTasks, fetchMembers]);

    const isPrivileged = useMemo(() => {
        const currentMember = members.find(m => m.user_id === currentUser?.id);
        return currentUser?.role === 'Админ' || ROLE_MAP[currentMember?.role as keyof typeof ROLE_MAP] === 'Автор';
    }, [members, currentUser]);

    const handleSelectItem = async (taskId: number) => {
        setShowPreview(true);
        try {
            const data = await fetchTaskDetails(project_id, taskId);
            setPreviewContent(data.description_md);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className={s.pageWrapper}>
            <ResponseHeader projectId={project_id} />

            <nav className={s.desktopActions}>
                <ResponseActionButtons />
            </nav>

            <div className={s.workArea}>
                <main className={clsx(
                    s.editorMain,
                    showTasks && s.tasksOpen,
                    showPreview && s.previewOpen,
                    showTasks && showPreview && s.bothOpen
                )}>
                    <SideOverlay 
                        isOpen={showTasks} 
                        onToggle={() => setShowTasks(!showTasks)}
                        title="Список задач"
                        className={s.leftOverlay}
                    >
                        <div className={s.itemList}>
                            {selectedComment && <SelectedCommentHeader comment={selectedComment} onClick={() => { setShowPreview(true); setPreviewContent(selectedComment.content_md); } }/>}
                            {readyTasks.length > 0 ? (
                                readyTasks.map(task => (
                                    <TaskCard  task={task} onClick={() => handleSelectItem(task.id)}/>
                                ))
                            ) : (
                                <div className={s.emptyState}>Задач не обнаружено. Проверьте выбор рецензента и замечания, а также завершите работу над задачами замечания.</div>
                            )}
                        </div>
                    </SideOverlay>

                    <div className={s.editorColumn}>
                        {!selectedCommentId ? (
                            <EmptySelection message="Выберите замечание в меню сверху, чтобы начать работу над ответом" />
                        ) : (
                            <>
                                {isGenerating && <Loader />}
                                {isPrivileged ? (
                                    <MarkdownEditor
                                        value={currentContent}
                                        onChange={(e) => setCurrentContent(e.target.value)}
                                        className={s.editor}
                                    />
                                ) : (
                                    <div>
                                        <div className={s.header}>
                                            <span>Ответ рецензенту</span>
                                        </div>
                                        <MarkdownPreview value={currentContent} />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {!isMobile && (
                        <SideOverlay 
                            isOpen={showPreview} 
                            onToggle={() => setShowPreview(!showPreview)}
                            position="right"
                            title="Предпросмотр"
                            className={s.rightOverlay}
                        >
                            {isLoading ? (
                                <Loader />
                            ) : !selectedCommentId ? (
                                <div className={s.sidePlaceholder}>Нет данных для отображения</div>
                            ) : (
                                previewContent && (
                                    <MarkdownPreview value={previewContent} />
                                )
                            )}
                        </SideOverlay>
                    )}
                </main>
            </div>
        
            {isMobile && (
                <MobileFab>
                    <ResponseActionButtons />
                </MobileFab>
            )}

            {isMobile && (
                <Dialog 
                    isOpen={showPreview} 
                    onClose={() => setShowPreview(false)} 
                    title="Предпросмотр"
                >
                    {isLoading ? (
                        <Loader />
                    ) : !selectedCommentId ? (
                        <div className={s.sidePlaceholder}>Нет данных для отображения</div>
                    ) : (
                        previewContent && (
                            <MarkdownPreview value={previewContent} />
                        )
                    )}
                </Dialog>
            )}
        </div>
    );
}
