import { useState } from 'react';

export default function AddRecordModal({ onClose, onSave, profile, code }) {
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const start = new Date(profile.dob);
    const end = new Date(date);
    const ageMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!weight || !height || !date) {
            setError('Vui lòng nhập đủ thông tin!');
            return;
        }

        setSaving(true);
        try {
            await fetch('/api/growth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: code,
                    date,
                    ageMonths: Math.max(0, ageMonths),
                    weight: parseFloat(weight),
                    height: parseFloat(height)
                })
            });
            onSave();
        } catch (e) {
            setError('Lỗi kết nối đến máy chủ. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="cute-card w-full max-w-sm p-6 relative bg-white">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Cập Nhật Chỉ Số</h2>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                        <span className="text-lg leading-none mt-px">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">Ngày đo</label>
                        <input
                            type="date"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all font-medium text-gray-700"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-500 mb-1">Cân nặng (kg)</label>
                            <input
                                type="number" step="0.1"
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all font-medium text-gray-700"
                                placeholder="VD: 10.1"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-bold text-gray-500 mb-1">Chiều cao (cm)</label>
                            <input
                                type="number" step="0.1"
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all font-medium text-gray-700"
                                placeholder="VD: 77"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full cute-button-primary mt-6 hover:shadow-lg disabled:opacity-50 py-4"
                    >
                        {saving ? 'Đang lưu...' : 'Lưu Kết Quả'}
                    </button>
                </form>
            </div>
        </div>
    );
}
