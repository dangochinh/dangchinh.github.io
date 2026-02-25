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
            title="Team 9h - LOTO ONLINE 🍲"
            className="max-w-2xl"
        >
            <div className="space-y-4 sm:space-y-6 max-h-[70vh] overflow-y-auto pr-1 -mr-1">
                {/* 1. Cách Chơi */}
                <section>
                    <h3 className="text-lg sm:text-xl font-bold text-yellow-500 mb-2">📜 Luật Chơi</h3>
                    <ul className="list-disc pl-4 sm:pl-5 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-slate-300">
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

                <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                    <p className="text-center italic text-slate-400 text-sm sm:text-base">
                        "Chúc các bạn chơi vui vẻ và may mắn! Đừng quên bật loa để nghe hô số nhé." - Team 9h
                    </p>
                </div>

                {/* 2. Lịch Sử Cập Nhật */}
                <section className="border-t border-slate-700 pt-3 sm:pt-4">
                    <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Lịch Sử Cập Nhật</h4>
                    <div className="text-xs text-slate-500 space-y-1.5 font-mono leading-relaxed">
                        <p><span className="text-cyan-400">v1.5.0</span> (2026-02-26): Mã phòng 3 số, Tự Động Dò tự tắt popup, Sắp xếp lại nút Info, Fix bug Bingo trùng lặp.</p>
                        <p><span className="text-cyan-400">v1.4.0</span> (2026-02-24): Tự kết nối lại khi mất kết nối, Nút info ở tất cả màn hình, Tự Động Dò cooldown 30s, Highlight số chờ xổ (4/5) trong Xem Vé Host, SEO tối ưu.</p>
                        <p><span className="text-cyan-400">v1.3.0</span> (2026-02-22): Bingo Trùng (cho phép nhiều người cùng thắng trong 1 ván) & Chặn tham gia khi ván đang diễn ra.</p>
                        <p><span className="text-cyan-400">v1.2.0</span> (2026-02-12): Giao diện Mobile mới, Xác nhận thoát game, Sửa lỗi kết nối & Tự động thoát khi mất Host.</p>
                    </div>
                </section>

                {/* 3. Ủng Hộ */}
                <section className="bg-gradient-to-r from-pink-900/50 to-purple-900/50 p-3 sm:p-4 rounded-lg border border-pink-700/50">
                    <h3 className="text-base sm:text-lg font-bold text-pink-400 mb-2 flex items-center gap-2">
                        🧧 Ủng Hộ
                    </h3>
                    <p className="text-slate-300 text-xs sm:text-sm mb-3">
                        Nếu thấy vui, hãy ủng hộ team ly cà phê nhé! Cảm ơn các bạn rất nhiều ❤️
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-center">
                        <div className="bg-white p-1.5 sm:p-2 rounded-lg shadow-lg">
                            {/* QR Code */}
                            <div className="w-24 h-24 sm:w-32 sm:h-32 overflow-hidden rounded bg-gray-100 relative flex items-center justify-center">
                                <img
                                    src="/donation-qr.jpg"
                                    alt="QR Code"
                                    className="max-w-full max-h-full object-contain"
                                />
                            </div>
                        </div>
                        <div className="text-xs sm:text-sm space-y-1.5 sm:space-y-2 text-center sm:text-left">
                            <p><strong className="text-pink-400">Momo:</strong> <span className="font-mono text-white text-sm sm:text-base">0363839007</span></p>
                            <p><strong className="text-blue-400">Bank (ACB):</strong> <span className="font-mono text-white text-sm sm:text-base">12342467</span> <br /><span className="text-xs text-slate-400">Đặng Ngọc Chính</span></p>
                            <p className="text-xs text-slate-500 italic border-t border-slate-700/50 pt-1.5">* Nội dung: Loto + Tên bạn</p>
                        </div>
                    </div>
                </section>

                <div className="pt-1 sm:pt-2 sticky bottom-0 bg-slate-800 pb-1">
                    <PrimaryButton onClick={onClose}>
                        ĐÃ HIỂU, VÀO GAME THÔI! 🚀
                    </PrimaryButton>
                </div>
            </div>
        </Modal>
    );
};

export default IntroModal;
