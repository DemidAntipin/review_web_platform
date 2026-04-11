import React, { useState } from 'react';
import { useFloating, autoUpdate, offset, flip, shift, useInteractions, useClick, useDismiss, useRole, FloatingFocusManager, useTransitionStatus, FloatingPortal, Placement } from '@floating-ui/react';
import clsx from 'clsx';
import s from './dropdown.module.scss';

interface DropdownProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    position?: Placement;
    onOpenChange?: (isOpen: boolean) => void;
}

export const Dropdown: React.FC<DropdownProps> = ({ 
    trigger, 
    children, 
    position = 'bottom-end', 
    className,
    onOpenChange 
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const { refs, floatingStyles, context } = useFloating({
        open: isOpen,
        onOpenChange: (nextOpen) => {
            setIsOpen(nextOpen);
            onOpenChange?.(nextOpen);
        },
        middleware: [
            offset(8),
            flip({ fallbackAxisSideDirection: 'end' }),
            shift({ padding: 10 }),
        ],
        whileElementsMounted: autoUpdate,
        placement: position,
        strategy: 'fixed',
    });

    const { isMounted, status } = useTransitionStatus(context, {
        duration: 100,
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

    return (
        <div className={clsx(s.wrapper, className)}>
            <div ref={refs.setReference} {...getReferenceProps()} className={s.trigger}>
                {trigger}
            </div>

            {isMounted && (
                <FloatingPortal>
                    <FloatingFocusManager context={context} modal={false}>
                        <div
                            ref={refs.setFloating}
                            style={{
                                ...floatingStyles,
                                visibility: context.x === null ? 'hidden' : 'visible',
                            }}
                            {...getFloatingProps()}
                            className={s.menu}
                            data-status={status}
                        >
                            {children}
                        </div>
                    </FloatingFocusManager>
                </FloatingPortal>
            )}
        </div>
    );
};