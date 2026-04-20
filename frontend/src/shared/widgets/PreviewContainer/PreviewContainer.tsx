import React, { useEffect, useState } from 'react';
import { Loader2, FileWarning } from 'lucide-react';
import s from './PreviewContainer.module.scss';

interface Props {
    url: string;
    isText?: boolean;
    isHtml?: boolean;
}

export const PreviewContainer = ({ url, isText, isHtml }: Props) => {
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

    if (loading) return <div className={s.loader}><Loader2 className={s.spin} /> <span>Загрузка...</span></div>;
    if (error) return <div className={s.error}><FileWarning /> <span>Ошибка загрузки</span></div>;

    if (isHtml && content) {
        return <div className={s.htmlPreview} dangerouslySetInnerHTML={{ __html: content }} />;
    }

    if (isText && content) {
        return (
            <pre className={s.textPreview}>
                <code>{content}</code>
            </pre>
        );
    }

    return <iframe src={url} className={s.iframePreview} title="Preview" />;
};