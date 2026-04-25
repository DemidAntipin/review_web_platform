import { Button } from "@/shared/ui/button/Button";
import { Field } from "@/shared/ui/field/Field";
import { SideOverlay } from "@/shared/ui/sideoverlay/SideOverlay";
import { MarkdownEditor } from "@/shared/widgets/MarkdownEditor/ui/MarkdownEditor";
import { MarkdownPreview } from "@/shared/widgets/MarkdownEditor/ui/MarkdownPreview";
import { ChangeEvent, SubmitEvent, useEffect, useState } from "react";
import { PRIORITY_MAP, Task, TYPE_MAP } from "../../model/types";
import s from './TaskForm.module.scss';
import clsx from 'clsx';
import { ReviewerComment } from "@/entities/reviewer/model/types";
import { useUserSearch } from "@/features/project/lib/hooks/useUserSearch";
import { UserSearchSelect } from "@/features/project/ui/TeamMenu/MemberForm/UserSearchSelect";
import { useParams } from "react-router-dom";
import { useKanbanStore } from "@/features/kanban-dnd/model/kanban.store";
import { Loader } from "@/shared/ui/loader/Loader";

interface TaskFormProps {
    reviewerComment: ReviewerComment;
    initialData?: Partial<Task> & { assignee?: string };
    onSubmit: (data: Partial<Task>) => void;
    onCancel: () => void;
}

export const TaskForm = ({ reviewerComment, initialData, onSubmit, onCancel }: TaskFormProps) => {
    const { projectId } = useParams<{ projectId: string }>();
    const fetchTaskDetails = useKanbanStore(state => state.fetchTaskDetails);
    const [formState, setFormState] = useState({
        title: initialData?.title || '',
        type: initialData?.type || 1,
        description_md: initialData?.description_md || '', 
        assignee_id: initialData?.assignee_id || undefined
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadDetails = async () => {
            if (initialData?.id && !formState.description_md) {
                setIsLoading(true);
                try {
                    const fullData = await fetchTaskDetails(Number(projectId), initialData.id);
                    setFormState(prev => ({
                        ...prev,
                        description_md: fullData.description_md,
                    }));
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadDetails();
    }, [initialData?.id]);

    const [showContext, setShowContext] = useState(false);

    const { searchTerm, setSearchTerm, suggestions } = useUserSearch(false);

    const updateField = (name: string, value: any) => {
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    if (isLoading) return <Loader />;

    return (
        <div className={s.formContainer}>
            <SideOverlay 
                isOpen={showContext} 
                onToggle={() => setShowContext(!showContext)}
                title="Текст замечания"
            >
                <MarkdownPreview value={reviewerComment.content_md} />
            </SideOverlay>
            <form className={s.form} onSubmit={(e) => { e.preventDefault(); onSubmit(formState); }}>
                <div className={s.body}>
                    <Field label="Название" required
                        className={s.input} 
                        value={formState.title} 
                        onChange={e => updateField('title', e.target.value)} 
                        placeholder="Введите название задачи" />

                    <Field label="Тип" required>
                        <select className={s.select} value={formState.type} onChange={e => updateField('type', Number(e.target.value))}>
                            {Object.entries(TYPE_MAP).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                        </select>
                    </Field>

                    <UserSearchSelect
                        label="Исполнитель"
                        value={searchTerm}
                        onChange={setSearchTerm}
                        suggestions={suggestions}
                        onSelect={u => { updateField('assignee_id', Number(u.id)); setSearchTerm(u.username); }}
                        placeholder="Введите username исполнителя"
                    />

                    <MarkdownEditor
                        label="Описание задачи"
                        value={formState.description_md}
                        onChange={e => updateField('description_md', e.target.value)}
                        placeholder="Опишите задачу в формате Markdown + вставки LaTeX"
                        required
                    />
                </div>

                <div className={s.formFooter}>
                    <Button variant="secondary" type="button" onClick={onCancel}>Отмена</Button>
                    <Button variant="primary" type="submit" disabled={!formState.title.trim()}>
                        {initialData ? 'Обновить' : 'Добавить'}
                    </Button>
                </div>
            </form>
        </div>
    );
};