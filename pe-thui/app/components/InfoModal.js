'use client';

import { FaInfoCircle, FaHeart, FaBook, FaHistory, FaTimes } from 'react-icons/fa';

export default function InfoModal({ onClose }) {
    const sections = [
        {
            id: 'about',
            title: 'Giới thiệu',
            icon: <FaInfoCircle className="text-blue-500" />,
            content: 'Pe Thúi Tracker là ứng dụng nhỏ giúp ba mẹ theo dõi hành trình khôn lớn của bé yêu. Ứng dụng tập trung vào sự đơn giản, dễ thương và bảo mật dữ liệu thông qua hệ thống Mã Code riêng biệt.'
        },
        {
            id: 'guide',
            title: 'Hướng dẫn',
            icon: <FaBook className="text-pink-500" />,
            content: (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    <li>Nhập Mã Code của bé để xem lại dữ liệu cũ.</li>
                    <li>Thêm mới cân nặng/chiều cao để theo dõi biểu đồ.</li>
                    <li>Sử dụng chức năng dự đoán để tham khảo chiều cao tương lai.</li>
                    <li>Chụp màn hình biểu đồ để chia sẻ cùng người thân.</li>
                </ul>
            )
        },
        {
            id: 'release',
            title: 'Nhật ký cập nhật',
            icon: <FaHistory className="text-orange-500" />,
            content: (
                <div className="space-y-3">
                    <div className="border-l-2 border-pink-200 pl-3">
                        <p className="text-xs font-bold text-gray-400">v1.1.0 - 27/02/2026</p>
                        <p className="text-sm text-gray-700">Thêm đếm ngược sinh nhật, tiêu đề tab chạy chữ, đổi tên miền mới và thay toàn bộ giao diện thông báo xịn hơn.</p>
                    </div>
                    <div className="border-l-2 border-gray-100 pl-3">
                        <p className="text-xs font-bold text-gray-400">v1.0.0 - 20/02/2026</p>
                        <p className="text-sm text-gray-600">Phiên bản đầu tiên với đầy đủ tính năng theo dõi và biểu đồ WHO.</p>
                    </div>
                </div>
            )
        },
        {
            id: 'donate',
            title: 'Ủng hộ tác giả',
            icon: <FaHeart className="text-red-500" />,
            content: (
                <div className="text-center bg-pink-50 p-4 rounded-2xl border border-pink-100">
                    <p className="text-sm text-gray-700 mb-3">Nếu bạn thấy ứng dụng hữu ích, hãy mời mình một ly cafe nhé! ☕</p>
                    <div className="bg-white p-2 inline-block rounded-xl border shadow-sm mb-2">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=STB:070104675545:NGO%20DINH%20CHINH" alt="QR Donate" className="w-32 h-32" />
                    </div>
                    <p className="text-[10px] text-gray-400 italic">Cảm ơn ba mẹ rất nhiều! ❤️</p>
                </div>
            )
        }
    ];

    return (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="p-6 text-center border-b border-gray-50 bg-gradient-to-r from-pink-50 to-white">
                    <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-400 hover:text-pink-500 rounded-full transition-all active:scale-95 shadow-sm">
                        <FaTimes size={14} />
                    </button>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Thông Tin ℹ️</h2>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                    {sections.map((section) => (
                        <div key={section.id} className="space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">{section.icon}</span>
                                <h3 className="font-black text-gray-800 uppercase tracking-wider text-xs">{section.title}</h3>
                            </div>
                            <div className="text-sm text-gray-600 leading-relaxed font-medium">
                                {section.content}
                            </div>
                        </div>
                    ))}
                    <div className="pt-4 text-center">
                        <p className="text-[10px] text-gray-300 font-bold tracking-widest uppercase">From Pe Thúi Tracker with ❤️</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
