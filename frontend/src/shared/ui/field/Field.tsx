import s from './field.module.scss';

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement> {
    label?: string;
    error?: string;
    onPaste?: React.ClipboardEventHandler<HTMLInputElement>;
}

export const Field = ({ label, error, children, onPaste, ...props }: FieldProps) => (
    <div className={s.field}>
        <label>{label}</label>
        {children || <input 
                {...(props as React.InputHTMLAttributes<HTMLInputElement>)} 
                onPaste={onPaste}
            />}
        {error && <span className={s.errorText}>{error}</span>}
    </div>
);