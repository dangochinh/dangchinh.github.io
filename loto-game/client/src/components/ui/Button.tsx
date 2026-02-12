import React from 'react';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

export const PrimaryButton: React.FC<ButtonProps> = ({ children, className, ...props }) => {
    return (
        <button
            className={cn(
                "w-full py-4 text-xl font-black text-white uppercase tracking-wider rounded-xl shadow-lg transition-transform transform active:scale-95 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-cyan-500/50",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

export const SecondaryButton: React.FC<ButtonProps> = ({ children, className, ...props }) => {
    return (
        <button
            className={cn(
                "px-6 py-3 rounded-lg font-bold border-2 border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white transition-colors bg-transparent",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};

interface IconButtonProps extends ButtonProps {
    title?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({ children, className, ...props }) => {
    return (
        <button
            className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors font-bold",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
