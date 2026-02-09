import React from 'react';

const AlertModal = ({ message, onClose, type = 'error' }) => {
    // Determine styles based on type (error, warning, info)
    const styles = {
        error: {
            border: 'border-red-500/50',
            glow: 'bg-red-500/20',
            titleGradient: 'from-red-300 via-red-500 to-pink-500',
            button: 'from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500',
            icon: '❌'
        },
        warning: {
            border: 'border-yellow-500/50',
            glow: 'bg-yellow-500/20',
            titleGradient: 'from-yellow-300 via-yellow-500 to-orange-500',
            button: 'from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500',
            icon: '⚠️'
        }
    };

    const currentStyle = styles[type] || styles.error;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className={`bg-slate-900 border-4 ${currentStyle.border} rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl transform animate-scaleIn relative overflow-hidden`}>
                {/* Decorative background glow */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 ${currentStyle.glow} blur-3xl rounded-full -z-10`}></div>

                <div className="mb-4 text-5xl animate-bounce">
                    {currentStyle.icon}
                </div>

                <h2 className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${currentStyle.titleGradient} mb-4`}>
                    OOPS!
                </h2>

                <div className="mb-6">
                    <p className="text-white text-lg font-medium">
                        {message}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className={`w-full py-2 px-4 rounded-lg bg-gradient-to-r ${currentStyle.button} text-white font-bold transform transition-all hover:scale-105 active:scale-95 shadow-lg`}
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default AlertModal;
