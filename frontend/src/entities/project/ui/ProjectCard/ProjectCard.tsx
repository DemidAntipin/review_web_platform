import React from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { ProjectPreview, ProjectStatus, STATUS_MAP } from '../../model/types';
import { calculateDeadline } from '@/shared/lib/utils/date';
import s from './ProjectCard.module.scss';
import { ProjectTeam } from '@/features/project/ui/TeamMenu/ProjectTeam';

interface Props {
    project: ProjectPreview;
    actionMenu?: React.ReactNode;
    className?: string;
}

const statusLabels: Record<ProjectStatus, string> = {
    in_progress: 'В работе',
    completed: 'Завершен',
    accepted: 'Принят',
    closed: 'Закрыт'
};

export const ProjectCard: React.FC<Props> = ({ project, actionMenu, className }) => {
    const navigate = useNavigate();
    const progressPercent = project.total_tasks_count > 0 
        ? Math.round((project.completed_tasks_count / project.total_tasks_count) * 100) 
        : 0;
    
    const daysLeft = calculateDeadline(project.deadline);
    const currentStatus: ProjectStatus = typeof project.status === 'number' 
        ? STATUS_MAP[project.status] 
        : project.status;

    return (
        <div className={clsx(s.card, className)} onClick={() => navigate(`/projects/${project.id}`)}>
            <div className={s.header}>
                <div className={s.titleGroup}>
                    <h3 className={s.title}>{project.title}</h3>
                    <span className={s.journal}>{project.journal}</span>
                </div>
                <div onClick={e => e.stopPropagation()}>
                    {actionMenu}
                </div>
            </div>

            <div className={s.progressSection}>
                <div className={s.progressInfo}>
                    <span className={s.label}>Прогресс</span>
                    <span className={s.taskCount}>
                        {project.completed_tasks_count}/{project.total_tasks_count} задач
                    </span>
                </div>
                <div className={s.progressLineWrapper}>
                    <div className={s.barContainer}>
                        <div className={s.bar} style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span className={s.percent}>{progressPercent}%</span>
                </div>
            </div>

            <div className={s.footer}>
                <span className={clsx(s.badge, s.deadlineBadge)}>
                    🕒 {daysLeft > 0 ? `${daysLeft} дн.` : 'Просрочен'}
                </span>
                <span className={clsx(s.badge, s[currentStatus])}>
                    {statusLabels[currentStatus]}
                </span>
                <div className={s.teamWrapper}>
                    <ProjectTeam 
                        projectId={project.id} 
                        triggerClassName={s.teamBtn} 
                    />
                </div>
            </div>
        </div>
    );
};