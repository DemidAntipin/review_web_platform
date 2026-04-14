import React, { useRef, useState } from 'react';
import { Download, FileText, Loader2, Plus } from 'lucide-react';
import { useAttachments } from '../lib/hooks/useAttachments';
import s from './AttachmentList.module.scss';
import { Button } from '@/shared/ui/button/Button';
import clsx from 'clsx';

export const AttachmentList = ({ projectId, taskId }: { projectId: number, taskId: number }) => {
    const { attachments, uploadFile, isUploading } = useAttachments(projectId, taskId);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) uploadFile(file);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files?.[0];
        if (file) {
            uploadFile(file);
        }
    };

    return (
        <div 
            className={clsx(s.container, isDragging && s.isDragging)}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <div className={s.list}>
                {attachments.length === 0 && !isUploading && (
                    <div className={s.empty}>
                        {isDragging ? "Отпустите файл здесь" : "Нет вложений"}
                    </div>
                )}
                
                {attachments.map(file => {
                    const displayName = file.file_url.split('/').pop()?.replace(/^t\d+_a\d+_/, '');

                    return (
                        <div key={file.id} className={s.fileItem}>
                            <FileText size={16} className={s.icon} />
                            <div className={s.info}>
                                <span className={s.name} title={displayName}>
                                    {displayName}
                                </span>
                            </div>
                            <a 
                                href={`${import.meta.env.VITE_API_URL}${file.file_url}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={s.download}
                            >
                                <Download size={14} />
                            </a>
                        </div>
                    );
                })}

                {isUploading && (
                    <div className={s.loader}>
                        <Loader2 size={16} className={s.spin} />
                        <span>Загрузка...</span>
                    </div>
                )}
            </div>

            <div className={s.footer}>
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                />
                <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isUploading}
                    className={s.addBtn}
                    variant="secondary"
                >
                    <Plus size={14} /> {isDragging ? "Бросайте!" : "Выбрать файл"}
                </Button>
            </div>
        </div>
    );
};