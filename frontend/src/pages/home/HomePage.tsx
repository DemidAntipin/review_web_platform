import { useState, useMemo, useEffect } from 'react';
import { ProjectCard } from '@/entities/project/ui/ProjectCard';
import { Project } from '@/entities/project/model/types';
import { SlidersHorizontal, Plus } from 'lucide-react';
import s from './home-page.module.scss';
import clsx from 'clsx';
import { Button } from '@/shared/ui/button/Button';
import { useOutletContext } from 'react-router-dom';

export const HomePage = () => {
    const { setPageTitle, setHeaderActions } = useOutletContext<any>();
    useEffect(() => {
        setPageTitle('Мои проекты');
        setHeaderActions(
            <Button variant="primary" className={s.pageActionsSlot}>
                <Plus size={20} /> Создать проект
            </Button>
        );
        return () => setHeaderActions(null);
    }, [setPageTitle, setHeaderActions]);

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