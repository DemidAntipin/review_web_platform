import s from './field.module.scss';
import clsx from 'clsx';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
    label?: string;
    error?: string;
    onPaste?: React.ClipboardEventHandler<HTMLInputElement>;
    className?: string;
}

export const Field = ({ label, error, children, className, onPaste, ...props }: FieldProps) => (
    <div className={clsx(s.field, className)}>
        <label>{label}</label>
        <div className={s.controlWrapper}>
            {children || (
                <input 
                    {...(props as React.InputHTMLAttributes<HTMLInputElement>)} 
                    onPaste={onPaste}
                />
            )}
        </div>
        {error && <span className={s.errorText}>{error}</span>}
    </div>
);