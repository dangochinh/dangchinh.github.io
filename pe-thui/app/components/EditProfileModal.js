import { useState } from 'react';
import { FaMars, FaVenus } from 'react-icons/fa6';

export default function EditProfileModal({ profile, code, onClose, onSave }) {
    const [newCode, setNewCode] = useState(code || '');
    const [name, setName] = useState(profile.name || '');
    const [gender, setGender] = useState(profile.gender || 'female');
    const [dob, setDob] = useState(profile.dob || '');
    const [avatarUrl, setAvatarUrl] = useState(profile.avatar || '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const formatCode = (str) => {
        const noAccents = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
        // Remove everything except letters and numbers
        const alphanumeric = noAccents.replace(/[^a-zA-Z0-9]/g, '');
        return alphanumeric.toUpperCase().slice(0, 30);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!name || !dob || !newCode) {
            setError('Vui lòng nhập đủ các thông tin bắt buộc!');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: newCode, oldCode: code, name, gender, dob, avatar: avatarUrl })
            });

            const json = await res.json();
            if (!json.success) {
                setError(json.error || 'Đã có lỗi xảy ra khi lưu thông tin.');
                return;
            }

            onSave(newCode);
        } catch (e) {
            setError('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
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
                <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Sửa Thông Tin Của Bé</h2>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl mb-6 text-sm font-medium flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                        <span className="text-lg leading-none mt-px">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">Mã Code</label>
                        <input
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all font-medium text-gray-700"
                            placeholder="Mã này dùng để truy cập trang web"
                            value={newCode}
                            onChange={(e) => setNewCode(formatCode(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">Tên của bé</label>
                        <input
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all font-medium text-gray-700"
                            placeholder="VD: Pepe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">Avatar URL (Tùy chọn)</label>
                        <input
                            type="text"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all font-medium text-gray-700"
                            placeholder="Link ảnh (Imgur...)"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-2">Giới tính</label>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setGender('male')}
                                className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all ${gender === 'male' ? 'border-blue-400 bg-blue-50 text-blue-600 font-bold shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                <FaMars size={18} /> Bé Trai
                            </button>
                            <button
                                type="button"
                                onClick={() => setGender('female')}
                                className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 border-2 transition-all ${gender === 'female' ? 'border-pink-400 bg-pink-50 text-pink-600 font-bold shadow-sm' : 'border-gray-100 bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                            >
                                <FaVenus size={18} /> Bé Gái
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-500 mb-1">Ngày sinh</label>
                        <input
                            type="date"
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-300 transition-all font-medium text-gray-700"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full cute-button-primary mt-6 hover:shadow-lg disabled:opacity-50 py-4"
                    >
                        {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                </form>
            </div>
        </div>
    );
}
