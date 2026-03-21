import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Users } from 'lucide-react';
import clsx from 'clsx';
import { Project } from '../model/types';
import type { ProjectStatus } from '../model/types';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { Button } from '@/shared/ui/button/Button';
import s from './ProjectCard.module.scss';

interface Props {
    project: Project;
}

export const ProjectCard: React.FC<Props> = ({ project }) => {
    const navigate = useNavigate();
    const progressPercent = project.tasksCount > 0 ? Math.round((project.completedTasks / project.tasksCount) * 100) : 0;
    const statusMap: Record<ProjectStatus, string> = {
        in_progress: 'В работе',
        completed: 'Завершён',
        accepted: 'Принят',
        closed: "Закрыт"
    };

    const handleCardClick = () => {
        navigate(`/projects/${project.id}`);
    };

    const handleAction = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div className={s.card} onClick={handleCardClick} role="button" tabIndex={0}>
            <div className={s.header}>
                <div className={s.titleGroup}>
                    <h3 className={s.title}>{project.title}</h3>
                    <span className={s.journal}>{project.journal}</span>
                </div>
                <IconButton onClick={handleAction} size="sm"><MoreVertical size={20}/></IconButton>
            </div>
            <div className={s.progressSection}>
                <div className={s.progressInfo}>
                    <span className={s.label}>Прогресс</span>
                    <span className={s.taskCount}>
                        {project.completedTasks}/{project.tasksCount} задач
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
                    🕒 {project.deadlineDays} дн.
                </span>
                <span className={clsx(s.badge, s[project.status])}>
                    {statusMap[project.status]}
                </span>
                <Button variant="ghost" className={s.teamBtn} onClick={handleAction}>
                    <Users size={16} /> Команда
                </Button>
            </div>
        </div>
    );
};