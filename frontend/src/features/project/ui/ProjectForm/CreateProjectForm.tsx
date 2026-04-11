import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button/Button';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { projectApi } from '@/entities/project/api/project.api';
import { ProjectForm, ProjectFormValues } from './ProjectForm';

export const CreateProjectForm = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async (values: ProjectFormValues) => {
        setIsLoading(true);
        try {
            await projectApi.create({
                ...values,
                deadline: new Date(values.deadline).toISOString(),
            });
            setIsOpen(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus />Создать проект
                </Button>
            <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Новый проект">
                <ProjectForm 
                    onSubmit={handleCreate} 
                    onCancel={() => setIsOpen(false)}
                    isLoading={isLoading}
                    submitText="Создать"
                />
            </Dialog>
        </>
    );
};