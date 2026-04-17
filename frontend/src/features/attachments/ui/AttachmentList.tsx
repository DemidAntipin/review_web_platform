import React, { useRef, useState } from 'react';
import { Download, Eye, FileText, Loader2, Plus } from 'lucide-react';
import { useAttachments } from '../lib/hooks/useAttachments';
import s from './AttachmentList.module.scss';
import { Button } from '@/shared/ui/button/Button';
import clsx from 'clsx';
import { Dialog } from '@/shared/ui/dialog/Dialog';
import { ENDPOINTS } from '@/shared/api/endpoints';
import { useAttachmentPreview } from '../lib/hooks/useAttachmentsPreview';
import { IconButton } from '@/shared/ui/icon_button/IconButton';

export const AttachmentList = ({ projectId, taskId }: { projectId: number, taskId: number }) => {
    const { attachments, uploadFile, isUploading, downloadFile } = useAttachments(projectId, taskId);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { previewUrl, isLoading, loadPreview, clearPreview } = useAttachmentPreview(projectId, taskId);
    const [selectedName, setSelectedName] = useState<string | null>(null);

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
                            <FileText size={18} className={s.icon} />
                            <div className={s.info}>
                                <span className={s.name} title={displayName}>
                                    {displayName}
                                </span>
                            </div>
                            <div className={s.actions}>
                                <IconButton
                                    className={s.download} 
                                    title="Просмотр"
                                    onClick={() => {
                                        setSelectedName(file.file_url.split('_').pop() || null);
                                        loadPreview(file.id);
                                    }}
                                >
                                    <Eye size={16} />
                                </IconButton>
                                <IconButton 
                                    className={s.download} 
                                    title="Скачать"
                                    onClick={() => downloadFile(file.id, displayName || 'file')}
                                >
                                    <Download size={16} />
                                </IconButton>
                            </div>
                        </div>
                    );
                })}

                <Dialog
                    isOpen={!!selectedName} 
                    onClose={() => { setSelectedName(null); clearPreview(); }} 
                    title={selectedName || ''}>
                    {isLoading ? (
                        <div className={s.loader}><Loader2 className={s.spin} size={20} /></div>
                    ) : (
                        previewUrl && (
                            <iframe 
                                src={previewUrl} 
                                style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '8px' }} 
                            />
                        )
                    )}
                </Dialog>

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
                    variant="primary"
                >
                    <Plus size={14} /> {isDragging ? "Бросайте!" : "Выбрать файл"}
                </Button>
            </div>
        </div>
    );
};