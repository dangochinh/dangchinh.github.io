import React from 'react';
import Modal from './ui/Modal';
import { PrimaryButton } from './ui/Button';

interface IntroModalProps {
    onClose: () => void;
}

const IntroModal: React.FC<IntroModalProps> = ({ onClose }) => {
    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Súp Lơ - LOTO ONLINE 🍲"
            className="max-w-2xl"
        >
            <div className="space-y-6">
                <section>
                    <h3 className="text-xl font-bold text-yellow-500 mb-2">📜 Luật Chơi (Game Rules)</h3>
                    <ul className="list-disc pl-5 space-y-2 text-slate-300">
                        <li>
                            <strong className="text-white">Host (Chủ phòng):</strong> Người tạo phòng, điều khiển quay số và xác nhận kết quả.
                        </li>
                        <li>
                            <strong className="text-white">Player (Người chơi):</strong> Tham gia phòng, chọn bộ vé và dò số.
                        </li>
                        <li>
                            <strong className="text-white">Cách thắng (Bingo):</strong> Khi bạn có đủ <strong>5 số trên một hàng ngang</strong> bất kỳ trên vé của mình.
                        </li>
                        <li>
                            <strong className="text-white">Kinh (Báo thắng):</strong> Khi có Bingo, bấm ngay nút <strong>"KINH"</strong> để báo hiệu! Host sẽ kiểm tra vé của bạn.
                        </li>
                    </ul>
                </section>

                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-center italic text-slate-400">
                        "Chúc các bạn chơi vui vẻ và may mắn! Đừng quên bật loa để nghe hô số nhé." - Súp Lơ Team
                    </p>
                </div>

                {/* Release Notes */}
                <section className="border-t border-slate-700 pt-4">
                    <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Release Notes</h4>
                    <div className="text-xs text-slate-500 space-y-1 font-mono">
                        <p><span className="text-cyan-400">v1.1.0</span> (2026-02-12): TypeScript Migration & Refactoring.</p>
                        <p><span className="text-cyan-400">v1.0.2</span> (2026-02-04): Fix mobile crash (UUID fallback), UI improvements.</p>
                        <p><span className="text-cyan-400">v1.0.1</span> (2026-02-03): Added CSV Export, Responsive Layout, Game Logic fixes.</p>
                    </div>
                </section>

                <div className="pt-2">
                    <PrimaryButton onClick={onClose}>
                        ĐÃ HIỂU, VÀO GAME THÔI! 🚀
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
};

export default IntroModal;
