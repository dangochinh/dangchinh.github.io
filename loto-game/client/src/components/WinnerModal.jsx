import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

const WinnerModal = ({ winnerName, onClose, isMe }) => {
    useEffect(() => {
        // Trigger confetti
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 60 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="bg-slate-900 border-4 border-yellow-400/50 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl transform animate-scaleIn relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 blur-3xl rounded-full -z-10"></div>

                <div className="mb-6">
                    <span className="text-6xl animate-bounce inline-block">🎉</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-orange-500 mb-2 drop-shadow-sm">
                    BINGO!
                </h2>

                <div className="my-8">
                    <p className="text-slate-400 text-lg mb-2">The winner is</p>
                    <div className="text-3xl font-bold text-white break-words p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                        {isMe ? "YOU! 🏆" : winnerName}
                    </div>
                </div>

                <div className="mt-8">
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-lg transform transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/25 ring-offset-2 ring-offset-slate-900 focus:ring-2 focus:ring-violet-500"
                    >
                        Continue
                    </button>
                    <p className="mt-4 text-xs text-slate-500">Wait for the host to restart the game</p>
                </div>
            </div>
        </div>
    );
};

export default WinnerModal;
