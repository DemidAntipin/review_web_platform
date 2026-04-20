import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useMemo } from 'react';
import { prepareMarkdownForPreview } from '@/shared/lib/utils/markdown';
import s from './MarkdownEditor.module.scss';

export const MarkdownPreview = ({ value }: { value: string }) => {
    const content = useMemo(() => prepareMarkdownForPreview(value), [value]);

    return (
        <div className={s.preview}>
            <div className={s.markdownBody}>
                <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    );
};