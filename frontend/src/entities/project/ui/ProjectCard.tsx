import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Users } from 'lucide-react';
import clsx from 'clsx';
import { ProjectPreview, ProjectStatus, STATUS_MAP } from '../model/types';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { Button } from '@/shared/ui/button/Button';
import { calculateDeadline } from '@/shared/lib/utils/date';
import s from './ProjectCard.module.scss';

interface Props {
    project: ProjectPreview;
}

export const ProjectCard: React.FC<Props> = ({ project }) => {
    const navigate = useNavigate();
    const progressPercent = project.total_tasks_count > 0 ? Math.round((project.completed_tasks_count / project.total_tasks_count) * 100) : 0;
    const daysLeft = calculateDeadline(project.deadline);
    const currentStatus: ProjectStatus = typeof project.status === 'number' ? STATUS_MAP[project.status] : project.status;
    const statusLabels: Record<ProjectStatus, string> = {
        in_progress: 'В работе',
        completed: 'Завершен',
        accepted: 'Принят',
        closed: "Закрыт"
    };

    return (
        <div className={s.card} onClick={() => navigate(`/projects/${project.id}`)}>
            <div className={s.header}>
                <div className={s.titleGroup}>
                    <h3 className={s.title}>{project.title}</h3>
                    <span className={s.journal}>{project.journal}</span>
                </div>
                <IconButton onClick={(e) => e.stopPropagation()} size="sm">
                    <MoreVertical size={20}/>
                </IconButton>
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
                <Button 
                    variant="ghost" 
                    className={s.teamBtn} 
                    onClick={(e) => e.stopPropagation()}
                >
                    <Users size={16} /> Команда
                </Button>
            </div>
        </div>
    );
};