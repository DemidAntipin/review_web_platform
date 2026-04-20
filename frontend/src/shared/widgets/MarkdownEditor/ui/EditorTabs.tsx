import { Button } from '@/shared/ui/button/Button';
import s from './MarkdownEditor.module.scss';

interface EditorTabsProps {
    activeTab: 'edit' | 'preview';
    onTabChange: (tab: 'edit' | 'preview') => void;
}

export const EditorTabs = ({ activeTab, onTabChange }: EditorTabsProps) => (
    <div className={s.tabs}>
        <Button
            variant='ghost'
            type="button"
            className={activeTab === 'preview' ? s.activeTab : ''} 
            onClick={() => onTabChange('preview')}>
            Предпросмотр
        </Button>
        <Button 
            variant='ghost'
            type="button"
            className={activeTab === 'edit' ? s.activeTab : ''} 
            onClick={() => onTabChange('edit')}>
            Редактирование
        </Button>
    </div>
);