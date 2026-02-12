import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    className,
    showCloseButton = true
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div
                className={twMerge(clsx(
                    "bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl transform animate-scaleIn flex flex-col max-h-[90vh]",
                    className
                ))}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex justify-between items-center p-4 border-b border-slate-700">
                        {title ? (
                            <div className="text-xl font-bold text-white">{title}</div>
                        ) : <div></div>}

                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-white transition-colors text-2xl leading-none"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                )}

                {/* Body */}
                <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;
