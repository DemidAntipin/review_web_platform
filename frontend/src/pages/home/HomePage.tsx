import { useState, useMemo, useEffect } from 'react';
import { ProjectCard } from '@/entities/project/ui/ProjectCard';
import { Project } from '@/entities/project/model/types';
import { SlidersHorizontal, Plus } from 'lucide-react';
import s from './home-page.module.scss';
import clsx from 'clsx';
import { Button } from '@/shared/ui/button/Button';
import { IconButton } from '@/shared/ui/icon_button/IconButton';
import { useOutletContext } from 'react-router-dom';

export const HomePage = () => {
    const { setPageTitle } = useOutletContext<{ setPageTitle: (t: string) => void }>();
    useEffect(() => setPageTitle('Мои проекты'), [setPageTitle]);

    const [projects] = useState<Project[]>([
        {
            id: '1',
            title: 'Методы автоматизации рецензирования',
            journal: 'Вестник науки',
            deadlineDays: 12,
            status: 'in_progress',
            tasksCount: 15,
            completedTasks: 9,
            authorId: 1
        },
        {
            id: '1',
            title: 'Методы автоматизации рецензирования',
            journal: 'Вестник науки',
            deadlineDays: 12,
            status: 'in_progress',
            tasksCount: 15,
            completedTasks: 9,
            authorId: 1
        },
        {
            id: '1',
            title: 'Методы автоматизации рецензирования',
            journal: 'Вестник науки',
            deadlineDays: 12,
            status: 'completed',
            tasksCount: 15,
            completedTasks: 9,
            authorId: 1
        },
        {
            id: '1',
            title: 'Методы автоматизации рецензирования',
            journal: 'Вестник науки',
            deadlineDays: 12,
            status: 'in_progress',
            tasksCount: 15,
            completedTasks: 9,
            authorId: 1
        },
        {
            id: '1',
            title: 'Методы автоматизации рецензирования',
            journal: 'Вестник науки',
            deadlineDays: 12,
            status: 'accepted',
            tasksCount: 15,
            completedTasks: 9,
            authorId: 1
        },
        {
            id: '1',
            title: 'Методы автоматизации рецензирования',
            journal: 'Вестник науки',
            deadlineDays: 12,
            status: 'in_progress',
            tasksCount: 15,
            completedTasks: 9,
            authorId: 1
        },
        {
            id: '1',
            title: 'Методы автоматизации рецензирования',
            journal: 'Вестник науки',
            deadlineDays: 12,
            status: 'closed',
            tasksCount: 15,
            completedTasks: 9,
            authorId: 1
        }
    ]); 

    return (
        <div className={s.container}>
            <h1 className={clsx(s.mobileTitle, s.mobileOnly)}>Мои проекты</h1>

            <div className={s.actionRow}>
                <div className={s.searchWrap}>
                    <input className={s.searchInput} placeholder="Поиск проекта..." />
                    <IconButton size="md">
                        <SlidersHorizontal size={20} />
                    </IconButton>
                </div>
                
                <Button variant="primary" className={s.desktopOnly}>
                    <Plus size={20} /> Создать проект
                </Button>
            </div>

            <div className={s.grid}>
                {projects.map(p => <ProjectCard key={p.id} project={p} />)}
            </div>

            <div className={clsx(s.createBtnMobile, s.mobileOnly)}>
                <Button variant="primary" fullWidth>
                    <Plus size={20} /> Создать новый проект
                </Button>
            </div>
        </div>
    );
};