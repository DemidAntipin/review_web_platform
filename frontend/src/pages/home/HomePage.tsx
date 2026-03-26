import { useEffect } from 'react';
import { ProjectCard } from '@/entities/project/ui/ProjectCard';
import { useProjectStore } from '@/entities/project/model/project.store';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { useOutletContext } from 'react-router-dom';
import { Loader } from '@/shared/ui/loader/Loader';
import { useProjectSocket } from '@/entities/project/lib/hooks/useProjectSocket';
import s from './home-page.module.scss';

export const HomePage = () => {
    const { setPageTitle, setHeaderActions } = useOutletContext<any>();
    
    const { projects, isLoading, setProjects } = useProjectStore();

    useProjectSocket();

    useEffect(() => {
        setPageTitle('Мои проекты');
        setHeaderActions(
            <Button variant="primary">
                <Plus size={20} /> Создать проект
            </Button>
        );
        
        setProjects();

        return () => setHeaderActions(null);
    }, [setPageTitle, setHeaderActions, setProjects]);

    if (isLoading && projects.length === 0) {
        return <div className={s.loaderWrap}><Loader /></div>;
    }

    return (
        <div className={s.container}>
            <div className={s.grid}>
                {projects.map(p => (
                    <ProjectCard key={p.id} project={p} />
                ))}
            </div>
        </div>
    );
};