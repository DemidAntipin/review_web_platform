import React, { useLayoutEffect, useRef, useState } from 'react';
import { useFloating, autoUpdate, offset, flip, shift, useInteractions, useClick, useDismiss, useRole, FloatingFocusManager, useTransitionStatus, FloatingPortal, Placement, size } from '@floating-ui/react';
import clsx from 'clsx';
import s from './dropdown.module.scss';

interface DropdownProps {
    trigger: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    position?: Placement;
    onOpenChange?: (isOpen: boolean) => void;

    containerRef?: React.RefObject<HTMLElement | null>;
}

export const Dropdown: React.FC<DropdownProps> = ({ 
    trigger, 
    children, 
    position = 'bottom-end', 
    className,
    onOpenChange, 
    containerRef
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const buttonRef = useRef<HTMLElement | null>(null);

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
            size({
                apply({ rects, elements }) {
                    if (containerRef?.current) {
                        Object.assign(elements.floating.style, {
                            width: `${rects.reference.width}px`,
                        });
                    }
                },
            }),
        ],
        whileElementsMounted: autoUpdate,
        placement: position,
        strategy: 'fixed',
    });

    useLayoutEffect(() => {
        if (containerRef?.current && buttonRef.current && isOpen) {
            const virtualElement = {
                getBoundingClientRect: () => {
                    const containerRect = containerRef.current!.getBoundingClientRect();
                    const buttonRect = buttonRef.current!.getBoundingClientRect();

                    return {
                        width: containerRect.width,
                        height: buttonRect.height,
                        x: containerRect.x,
                        y: buttonRect.y,
                        top: buttonRect.top,
                        left: containerRect.left,
                        right: containerRect.right,
                        bottom: buttonRect.bottom,
                    };
                },
            };
            refs.setPositionReference(virtualElement);
        }
    }, [containerRef, isOpen, refs]);

    const { isMounted, status } = useTransitionStatus(context, {
        duration: 100,
    });

    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context);

    const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

    return (
        <div className={clsx(s.wrapper, className)}>
            <div ref={(node) => {buttonRef.current = node; refs.setReference(node);}} 
                {...getReferenceProps()} 
                className={s.trigger}>
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