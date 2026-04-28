import { X } from "lucide-react";
import s from './MultiSelector.module.scss';
import { IconButton } from "../icon_button/IconButton";

interface Item {
    id: number | string;
    label: string;
}

interface MultiSelectedItemsProps {
    items: Item[];
    onRemove: (id: any) => void;
}

export const MultiSelector = ({ items, onRemove }: MultiSelectedItemsProps) => {
    if (items.length === 0) return null;

    return (
        <div className={s.list}>
            {items.map(item => (
                <div key={item.id} className={s.tag}>
                    <span>{item.label}</span>
                    <IconButton size="sm" type="button" variant="danger" onClick={() => onRemove(item.id)} aria-label="Remove">
                        <X size={24} />
                    </IconButton>
                </div>
            ))}
        </div>
    );
};