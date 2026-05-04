import { ReactNode } from "react";
import { Dropdown } from "../dropdown/Dropdown";
import { IconButton } from "../icon_button/IconButton";
import { Plus } from "lucide-react";
import s from './MobileFab.module.scss';


interface MobileFabProps {
    children: ReactNode;
}


export const MobileFab = ({ children }: MobileFabProps) => {
    return (
            <div className={s.mobileFab}>
                <Dropdown trigger={
                    <IconButton size="lg" variant='primary'>
                        <Plus size={24} />
                    </IconButton>
                }>
                    <div className={s.container}>
                        {children}
                    </div>
                </Dropdown>
            </div>
    );
}