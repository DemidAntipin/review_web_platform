import clsx from 'clsx';
import s from './loader.module.scss';

export type LoaderType = 'line' | 'circle';

interface LoaderProps {
    type?: LoaderType;
    withLabel?: boolean;
    className?: string;
}

export const Loader = ({ 
    type = 'circle', 
    withLabel = false, 
    className 
}: LoaderProps) => {
    return (
        <div className={clsx(s.wrapper, className)}>
            <div className={s.loaderBox}>
                <span className={clsx(s.loader, s[type])} />
                
                {withLabel && (
                    <span className={s.label}>Загрузка данных...</span>
                )}
            </div>
        </div>
    );
};