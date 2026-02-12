import React from 'react';
import { clsx } from 'clsx';
import { TicketGrid } from '../utils/gameLogic';

interface TicketProps {
    data: TicketGrid;
    markedNumbers: number[];
    onNumberClick?: (num: number) => void;
    color?: string;
    readOnly?: boolean;
}

const Ticket: React.FC<TicketProps> = ({
    data,
    markedNumbers,
    onNumberClick,
    color = 'blue',
    readOnly = false
}) => {
    // Map color names to Tailwind classes (backgrounds with opacity)
    const colorMap: Record<string, string> = {
        red: 'bg-red-500/20 border-red-500/50',
        orange: 'bg-orange-500/20 border-orange-500/50',
        yellow: 'bg-yellow-500/20 border-yellow-500/50',
        green: 'bg-green-500/20 border-green-500/50',
        blue: 'bg-blue-500/20 border-blue-500/50',
        purple: 'bg-purple-500/20 border-purple-500/50',
        pink: 'bg-pink-500/20 border-pink-500/50',
        cyan: 'bg-cyan-500/20 border-cyan-500/50',
        teal: 'bg-teal-500/20 border-teal-500/50',
        indigo: 'bg-indigo-500/20 border-indigo-500/50',
        lime: 'bg-lime-500/20 border-lime-500/50',
        'lime green': 'bg-lime-500/20 border-lime-500/50',
    };

    const themeClass = colorMap[color?.toLowerCase()] || colorMap['blue'];

    return (
        <div className={clsx("p-2 rounded-lg border-2", themeClass)}>
            <div className="flex flex-col gap-1">
                {data.map((row, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-9 gap-1">
                        {row.map((num, colIndex) => {
                            if (num === 0) {
                                return <div key={colIndex} className="h-8 md:h-10"></div>; // Empty cell
                            }

                            const isMarked = markedNumbers.includes(num);

                            return (
                                <button
                                    key={colIndex}
                                    onClick={() => !readOnly && onNumberClick && onNumberClick(num)}
                                    disabled={readOnly}
                                    className={clsx(
                                        "h-8 md:h-10 flex items-center justify-center font-bold text-sm md:text-base rounded shadow-sm transition-all",
                                        isMarked
                                            ? "bg-red-600 text-white scale-105 shadow-md border border-red-400"
                                            : "bg-white text-slate-800 hover:bg-slate-100",
                                        readOnly ? "cursor-default" : "cursor-pointer active:scale-95"
                                    )}
                                >
                                    {num}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Ticket;
