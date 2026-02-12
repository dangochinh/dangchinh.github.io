import React from 'react';
import Modal from './ui/Modal';
import { PrimaryButton } from './ui/Button';

interface AlertModalProps {
    isOpen?: boolean; // Optional if controlled by parent conditional rendering solely
    message: React.ReactNode;
    type?: 'error' | 'success' | 'info' | 'warning' | 'bingo' | 'kinh_sai';
    onClose: () => void;
    winnerName?: string;
    markedNumbers?: number[];
    drawnNumbers?: number[];
}

const AlertModal: React.FC<AlertModalProps> = ({
    isOpen = true,
    message,
    type = 'info',
    onClose,
    winnerName,
    markedNumbers = [],
    drawnNumbers = []
}) => {

    // Determine content based on type (handling specialized Bingo/KinhSai types)
    const isBingo = type === 'bingo';
    const isKinhSai = type === 'kinh_sai' || type === 'error'; // Mapping error to Kinh Sai for some contexts

    const renderVerificationDetails = () => {
        if (!markedNumbers || markedNumbers.length === 0) return null;

        return (
            <div className="mt-4 bg-slate-900/50 p-3 rounded text-left text-sm max-h-40 overflow-y-auto">
                <p className="text-slate-400 mb-1">Các số đã kinh:</p>
                <div className="flex flex-wrap gap-1">
                    {markedNumbers.map(n => {
                        const isCorrect = drawnNumbers.includes(n);
                        return (
                            <span key={n} className={`px-1.5 py-0.5 rounded font-bold ${isCorrect ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                                {n}
                            </span>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            showCloseButton={false}
            className={isKinhSai ? "border-red-500/50 bg-slate-800" : "border-slate-700"}
        >
            <div className="text-center space-y-6">
                {/* Icon/Image */}
                <div className="text-6xl animate-bounce">
                    {isBingo ? '🎉' : isKinhSai ? '🤡' : 'ℹ️'}
                </div>

                {/* Title/Head */}
                <div>
                    {isBingo && (
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 uppercase">
                            BINGO CONFIRMED!
                        </h2>
                    )}
                    {isKinhSai && (
                        <h2 className="text-2xl font-black text-red-500 uppercase">
                            KINH SAI RỒI!
                        </h2>
                    )}
                    {!isBingo && !isKinhSai && (
                        <h2 className="text-xl font-bold text-white uppercase">Thông Báo</h2>
                    )}
                </div>

                {/* Message */}
                <div className="text-lg text-slate-300">
                    {winnerName && <p className="font-bold text-white text-xl mb-2">{winnerName}</p>}
                    <p>{message}</p>

                    {(isBingo || isKinhSai) && renderVerificationDetails()}
                </div>

                {/* Footer */}
                <div className="pt-2">
                    <PrimaryButton
                        onClick={onClose}
                        className={isKinhSai ? "bg-gradient-to-r from-red-600 to-rose-600" : undefined}
                    >
                        {isBingo ? 'CHÚC MỪNG!' : isKinhSai ? 'LÊU LÊU :D' : 'OK'}
                    </PrimaryButton>
                    {(isBingo || isKinhSai) && (
                        <p className="mt-2 text-xs text-slate-500">
                            Game will {isBingo ? 'end' : 'resume'} after closing.
                        </p>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default AlertModal;
