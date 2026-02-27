import { useState } from 'react';

export default function EditRecordModal({ onClose, onSave, profile, code, record }) {
    const [date, setDate] = useState(record.date || new Date().toISOString().split('T')[0]);
    const [weight, setWeight] = useState(record.weight || '');
    const [height, setHeight] = useState(record.height || '');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!weight || !height || !date) {
            setError('Vui lòng nhập đủ thông tin!');
            return;
        }

        setSaving(true);
        try {
            const start = new Date(profile.dob);
            const end = new Date(date);
            const ageMonths = Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));

            await fetch('/api/growth', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: record.id,
                    code,
                    date,
                    ageMonths,
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

    const handleDelete = async () => {
        setDeleting(true);
        setError('');
        try {
            const res = await fetch(`/api/growth?code=${code}&id=${record.id}`, {
                method: 'DELETE'
            });
            const json = await res.json();
            if (json.success) {
                onSave();
            } else {
                setError('Lỗi khi xóa bản ghi.');
            }
        } catch (e) {
            setError('Lỗi kết nối đến máy chủ. Vui lòng thử lại.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="cute-card w-full max-w-sm p-6 relative bg-white">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-pink-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Sửa Lịch Sử Phát Triển</h2>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                        <span className="text-lg leading-none mt-px">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {showConfirmDelete ? (
                    <div className="text-center py-4 animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">⚠️</div>
                        <h3 className="font-bold text-gray-800 mb-2">Xóa bản ghi này?</h3>
                        <p className="text-sm text-gray-500 mb-6 px-2">Bạn có chắc chắn muốn xóa bản ghi cân đo ngày <b className="text-gray-700">{new Date(record.date).toLocaleDateString('vi-VN')}</b> không? Dữ liệu bị xóa không thể khôi phục.</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowConfirmDelete(false)} disabled={deleting} className="flex-1 py-3 rounded-2xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Hủy</button>
                            <button onClick={handleDelete} disabled={deleting} className="flex-1 py-3 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50 shadow-sm shadow-red-200">
                                {deleting ? 'Đang xóa...' : 'Vâng, Xóa đi!'}
                            </button>
                        </div>
                    </div>
                ) : (
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
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Cân nặng (kg)</label>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all font-medium text-gray-700 text-lg"
                                placeholder="Ví dụ: 8.5"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-500 mb-1">Chiều cao (cm)</label>
                            <input
                                type="number"
                                step="0.1"
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all font-medium text-gray-700 text-lg"
                                placeholder="Ví dụ: 72.5"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full cute-button-primary mt-6 hover:shadow-lg disabled:opacity-50 py-4"
                        >
                            {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowConfirmDelete(true)}
                            className="w-full py-3 mt-2 font-bold text-red-400 hover:text-red-500 border-2 border-transparent hover:border-red-100 bg-transparent hover:bg-red-50 rounded-2xl transition-all"
                        >
                            Xóa bản ghi này
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
