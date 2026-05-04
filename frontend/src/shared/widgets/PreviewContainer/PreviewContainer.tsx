import React, { useEffect, useState } from 'react';
import { Loader2, FileWarning } from 'lucide-react';
import s from './PreviewContainer.module.scss';
import clsx from 'clsx';

interface Props {
    url: string;
    isText?: boolean;
    isHtml?: boolean;
    className?: string;
}

export const PreviewContainer = ({ url, isText, isHtml, className }: Props) => {
    const [content, setContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(isText || isHtml);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (isText || isHtml) {
            setLoading(true);
            setError(false);
            fetch(url)
                .then(res => {
                    if (!res.ok) throw new Error();
                    return res.text();
                })
                .then(text => {
                    setContent(text);
                    setLoading(false);
                })
                .catch(() => {
                    setError(true);
                    setLoading(false);
                });
        }
    }, [url, isText, isHtml]);

    if (loading) return <div className={clsx(s.loader)}><Loader2 className={s.spin} /> <span>Загрузка...</span></div>;
    if (error) return <div className={s.error}><FileWarning /> <span>Ошибка загрузки</span></div>;

    if (isHtml && content) {
        return <div className={clsx(s.htmlPreview, className)} dangerouslySetInnerHTML={{ __html: content }} />;
    }

    if (isText && content) {
        return (
            <pre className={clsx(s.textPreview, className)}>
                <code>{content}</code>
            </pre>
        );
    }

    return (
        <div className={clsx(s.iframeWrapper, className)}>
            <iframe 
                src={`${url}#toolbar=1&view=FitH`}
                className={s.iframePreview} 
                title="Preview" 
            />
        </div>
    );
};