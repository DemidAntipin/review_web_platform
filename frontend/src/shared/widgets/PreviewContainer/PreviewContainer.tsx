import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import s from './PreviewContainer.module.scss'; // Используем ваши стили лоадера

interface Props {
    url: string;
    isText: boolean;
}

export const PreviewContainer = ({ url, isText }: Props) => {
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(isText);

    useEffect(() => {
        if (isText) {
            setLoading(true);
            fetch(url)
                .then(res => res.text())
                .then(text => {
                    setContent(text);
                    setLoading(false);
                });
        }
    }, [url, isText]);

    if (loading) {
        return <div className={s.loader}><Loader2 className={s.spin} /> <span>Загрузка содержимого...</span></div>;
    }

    if (isText) {
        return (
            <pre style={{ 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-all',
                background: 'var(--background-card)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '13px',
                maxHeight: '70vh',
                overflow: 'auto'
            }}>
                <code>{content}</code>
            </pre>
        );
    }

    return (
        <iframe 
            src={url} 
            style={{ width: '100%', height: '75vh', border: 'none', borderRadius: '4px' }} 
        />
    );
};