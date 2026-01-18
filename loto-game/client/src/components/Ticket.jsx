import React from 'react';
import clsx from 'clsx';

const Ticket = ({ data, markedNumbers = [], onNumberClick }) => {
    // data is 3x9 grid
    return (
        <div className="border-2 border-slate-700 bg-white text-slate-900 mb-4 p-2 rounded-lg shadow-lg max-w-2xl mx-auto">
            <div className="flex flex-col gap-1">
                {data.map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-9 gap-1 h-12">
                        {row.map((num, cIdx) => {
                            const isMarked = markedNumbers.includes(num) && num !== 0;
                            return (
                                <div
                                    key={`${rIdx}-${cIdx}`}
                                    onClick={() => num !== 0 && onNumberClick && onNumberClick(num)}
                                    className={clsx(
                                        "flex items-center justify-center font-bold text-lg rounded select-none transition-colors border",
                                        num === 0 ? "invisible border-none" : "border-slate-300 cursor-pointer",
                                        isMarked ? "bg-red-500 text-white border-red-600 scale-105" : "bg-slate-100 hover:bg-slate-200"
                                    )}
                                >
                                    {num !== 0 ? num : ''}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Ticket;
