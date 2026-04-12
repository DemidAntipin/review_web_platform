import React, { useEffect, useState, ChangeEvent } from 'react';
import clsx from 'clsx';
import s from './SearchInput.module.scss';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounce?: number;
    className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = 'Поиск...',
    debounce = 300,
    className
}) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (localValue !== value) {
                onChange(localValue);
            }
        }, debounce);

        return () => clearTimeout(timer);
    }, [localValue, debounce, onChange, value]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    };

    return (
        <div className={clsx(s.wrapper, className)}>
            <input
                type="text"
                className={s.input}
                value={localValue}
                onChange={handleChange}
                placeholder={placeholder}
            />
        </div>
    );
};