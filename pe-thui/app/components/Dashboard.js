import { useState, useEffect } from 'react';
import { calculateAge, predictAdultHeight, assessWeight, assessHeight } from '../lib/calculations';
import { FaPlus, FaChevronLeft, FaEllipsisV, FaEdit, FaInfoCircle } from 'react-icons/fa';
import { FaBaby } from 'react-icons/fa6';
import AddRecordModal from './AddRecordModal';
import EditProfileModal from './EditProfileModal';
import EditRecordModal from './EditRecordModal';
import GrowthCharts from './GrowthCharts';
import InfoModal from './InfoModal';

export default function Dashboard({ profile, code }) {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [view, setView] = useState('dashboard');

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/growth?code=${code}`);
            const json = await res.json();
            if (json.success && json.data) {
                const sorted = json.data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setRecords(sorted);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    useEffect(() => {
        const baseTitle = `${profile.name} Tracker`;
        if (baseTitle.length > 20) {
            let scrollText = baseTitle + " • ";
            const scrollInterval = setInterval(() => {
                scrollText = scrollText.substring(1) + scrollText.substring(0, 1);
                document.title = scrollText;
            }, 300);
            return () => clearInterval(scrollInterval);
        } else {
            document.title = baseTitle;
        }
    }, [profile.name]);

    const ageInfo = calculateAge(profile.dob);
    const latest = records[0];

    let wStatus = { status: 'Chưa có', color: 'text-gray-400', bg: 'bg-gray-50' };
    let hStatus = { status: 'Chưa có', color: 'text-gray-400', bg: 'bg-gray-50' };
    let predicted = 0;

    if (latest) {
        wStatus = assessWeight(latest.weight, latest.ageMonths);
        hStatus = assessHeight(latest.height, latest.ageMonths);
        predicted = predictAdultHeight(latest.height, profile.gender, latest.ageMonths);
    }

    const calculateDaysToBirthday = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

        if (today > nextBirthday) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = nextBirthday - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const daysToBirthday = calculateDaysToBirthday(profile.dob);

    if (view === 'charts') {
        return <GrowthCharts records={records} profile={profile} onBack={() => setView('dashboard')} />;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-10">
            <div className="p-4 space-y-6">
                {/* Profile Card */}
                {/* Profile Card Refined */}
                <div className="mt-[70px] relative px-1">
                    {/* Info Button - Top Right */}
                    <button
                        onClick={() => setShowInfo(true)}
                        className="absolute -top-[105px] right-2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-gray-400 hover:text-pink-500 transition-all active:scale-90 z-30 border border-pink-50"
                    >
                        <FaInfoCircle size={20} />
                    </button>

                    {/* Pink thick outer border container simulating the wavy frame */}
                    <div className="bg-[#f06e9c] rounded-[40px] p-[6px] shadow-md relative">
                        {/* Decorative stars and doodles on the pink frame */}
                        <div className="absolute top-4 left-6 text-white text-xs opacity-80">⭐</div>
                        <div className="absolute top-1/2 right-4 text-white text-xs opacity-80">⭐</div>
                        <div className="absolute bottom-6 left-12 text-white text-xs opacity-80">⭐</div>
                        <div className="absolute bottom-4 right-10 text-white text-xs opacity-80">⭐</div>

                        {/* Inner cream background */}
                        <div className="bg-[#fff3e0] rounded-[34px] pt-12 pb-8 px-6 relative overflow-visible border-[3px] border-dashed border-[#f4b3c2]">

                            {/* Moon and Snail emojis as simple decorations */}
                            <div className="absolute top-10 left-4 text-3xl opacity-80 z-0 drop-shadow-sm">🌜</div>
                            <div className="absolute bottom-2 right-4 text-4xl opacity-90 z-0 drop-shadow-md transform -scale-x-100">🐌</div>
                            <div className="absolute top-20 right-8 text-orange-400 text-lg opacity-80 z-0">⭐</div>
                            <div className="absolute top-1/2 left-8 text-pink-300 text-xl opacity-80 z-0">✨</div>

                            {/* White cloud shape behind avatar */}
                            <div className="absolute -top-[14px] left-1/2 transform -translate-x-1/2 w-[220px] h-[70px] bg-white rounded-[50px] z-0 shadow-sm"></div>
                            <div className="absolute -top-[30px] left-1/2 transform -translate-x-1/2 -ml-12 w-[80px] h-[80px] bg-white rounded-full z-0 shadow-sm"></div>
                            <div className="absolute -top-[25px] left-1/2 transform -translate-x-1/2 ml-14 w-[60px] h-[60px] bg-white rounded-full z-0 shadow-sm"></div>
                            <div className="absolute -top-[10px] left-1/2 transform -translate-x-1/2 w-[220px] h-[70px] bg-white rounded-[50px] z-10"></div>
                            <div className="absolute -top-[26px] left-1/2 transform -translate-x-1/2 -ml-12 w-[70px] h-[70px] bg-white rounded-full z-10"></div>
                            <div className="absolute -top-[21px] left-1/2 transform -translate-x-1/2 ml-14 w-[50px] h-[50px] bg-white rounded-full z-10"></div>


                            {/* Avatar */}
                            <div className="absolute -top-[100px] left-1/2 transform -translate-x-1/2 w-[140px] h-[140px] bg-pink-50 rounded-full flex items-center justify-center border-[4px] border-white shadow-md z-20 overflow-hidden">
                                {profile.avatar ? (
                                    <img
                                        src={profile.avatar}
                                        alt="Avatar"
                                        className="w-[100%] h-[100%] object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/baby-default.png'; }}
                                    />
                                ) : (
                                    <img src="/baby-default.png" alt="Baby Avatar" className="w-[100%] h-[100%] object-cover block" />
                                )}
                            </div>

                            <div className="relative z-20 text-center mt-2">
                                <h2 className="text-[26px] font-black text-gray-900 flex items-center justify-center gap-2 tracking-tight">
                                    {profile.name}
                                    <span className={`w-8 h-8 rounded-full text-white text-[14px] font-bold flex items-center justify-center shadow-sm ${profile.gender === 'male' ? 'bg-[#3fbdf1]' : 'bg-[#f42f88]'}`}>
                                        {profile.gender === 'male' ? '♂' : '♀'}
                                    </span>
                                    <button onClick={() => setShowEditProfile(true)} className="text-gray-300 hover:text-pink-500 transition-colors ml-1 p-1 bg-white rounded-full shadow-sm border border-gray-100" title="Sửa thông tin của bé">
                                        <FaEdit size={14} className="ml-0.5" />
                                    </button>
                                </h2>
                                <p className="text-[17px] text-gray-800 mt-[10px] font-medium tracking-wide">Ngày sinh: {new Date(profile.dob).getDate()} tháng {new Date(profile.dob).getMonth() + 1} năm {new Date(profile.dob).getFullYear()}</p>
                                <p className="text-[17px] text-gray-800 mt-[6px] font-medium tracking-wide">Tuổi: {ageInfo.text}</p>

                                {/* Birthday Countdown moved above Code */}
                                <div className="mt-4 flex justify-center animate-bounce-slow">
                                    <div className="bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-2xl shadow-sm border border-orange-200 flex items-center gap-2">
                                        <span className="text-xl">🎂</span>
                                        <div className="text-left">
                                            <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider leading-none">Sắp đến sinh nhật</p>
                                            <p className="text-sm font-black text-gray-800">Còn <span className="text-orange-500">{daysToBirthday}</span> ngày nữa</p>
                                        </div>
                                    </div>
                                </div>

                                {/* User Code badge */}
                                <div className="mt-4 flex justify-center">
                                    <div className="bg-white px-4 py-1.5 rounded-full shadow-sm border-2 border-pink-100 flex items-center justify-center gap-2 drop-shadow-sm cursor-pointer hover:bg-pink-50 transition-colors" title="Lưu mã này để tra cứu sau">
                                        <span className="text-xs text-gray-400 font-bold tracking-wider">MÃ CODE:</span>
                                        <span className="text-[15px] text-pink-500 font-black tracking-widest uppercase">{code}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <button onClick={() => setView('charts')} className="text-cyan-500 font-bold hover:underline mb-4 text-sm tracking-wide transition-colors hover:text-cyan-600">Xem biểu đồ phát triển</button>

                    <div className="flex gap-4">
                        <div className="cute-card flex-1 p-4 bg-white text-center shadow-sm">
                            <div className="text-2xl mb-2 text-indigo-400 bg-indigo-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">⚖️</div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Cân nặng</p>
                            <p className="text-xl font-extrabold text-[#4a4a4a] my-2">{latest ? latest.weight : '--'} <span className="text-sm text-gray-400 font-medium">kg</span></p>
                            <div className={`text-[11px] py-1 px-2 rounded-full font-bold ${wStatus.bg} ${wStatus.color} inline-block`}>
                                {wStatus.status}
                            </div>
                        </div>
                        <div className="cute-card flex-1 p-4 bg-white text-center shadow-sm">
                            <div className="text-2xl mb-2 text-pink-400 bg-pink-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto">📏</div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Chiều cao</p>
                            <p className="text-xl font-extrabold text-[#4a4a4a] my-2">{latest ? latest.height : '--'} <span className="text-sm text-gray-400 font-medium">cm</span></p>
                            <div className={`text-[11px] py-1 px-2 rounded-full font-bold ${hStatus.bg} ${hStatus.color} inline-block`}>
                                {hStatus.status}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Banner */}
                <div className="cute-card p-6 bg-gradient-to-r from-pink-50 via-orange-50 to-yellow-50 flex items-center justify-between border-0">
                    <div>
                        <h3 className="font-extrabold text-gray-800 text-lg">HÀNH TRÌNH KHÔN LỚN</h3>
                        <p className="text-xs text-gray-500 mt-1 mb-4">Lưu lại những dấu mốc con khôn lớn...</p>
                        <button className="cute-button-primary py-2 px-5 text-sm" onClick={() => setShowAdd(true)}>
                            Cùng chia sẻ
                        </button>
                    </div>
                    <div className="text-5xl animate-pulse">👶</div>
                </div>

                {/* Prediction */}
                <div className="cute-card bg-cyan-400 text-white p-6 relative overflow-hidden border-0 shadow-lg shadow-cyan-200">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-20 rounded-full mix-blend-overlay"></div>
                    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white opacity-20 rounded-full mix-blend-overlay"></div>

                    <p className="text-center text-sm font-medium mb-5 z-10 relative opacity-90">Dự đoán chiều cao trưởng thành cho con</p>
                    <div className="flex items-center justify-between z-10 relative bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
                        <div>
                            <p className="text-xs font-bold text-cyan-100 mb-1 leading-tight w-24">Chiều cao dự kiến trưởng thành của bé</p>
                            <p className="text-[10px] text-cyan-50 mt-2">Ngày đo: {latest ? new Date(latest.date).toLocaleDateString('vi-VN') : '--'}</p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                            <p className="text-4xl font-extrabold">{predicted ? `${predicted} ` : '--'}<span className="text-lg opacity-80">CM</span></p>
                            <button className="mt-3 bg-white text-cyan-600 text-xs font-bold py-1.5 px-4 rounded-full shadow-sm hover:scale-105 transition-transform active:scale-95">
                                TÍNH LẠI
                            </button>
                        </div>
                    </div>
                </div>

                {/* History List */}
                <div>
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="font-extrabold text-gray-800 text-lg">Quá trình phát triển của con</h3>
                        <button onClick={() => setShowAdd(true)} className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 hover:text-pink-500 rounded-full transition-colors font-bold text-xl">+</button>
                    </div>

                    {loading ? (
                        <p className="text-center text-gray-400 py-8 font-medium animate-pulse">Đang tải dữ liệu...</p>
                    ) : records.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-pink-100">
                            <div className="text-4xl mb-3">📝</div>
                            <p className="text-gray-400 font-medium">Chưa có dữ liệu. Hãy thêm mới nhé!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {records.map(record => {
                                const recWStatus = assessWeight(record.weight, record.ageMonths);
                                const recHStatus = assessHeight(record.height, record.ageMonths);

                                return (
                                    <div key={record.id} className="cute-card bg-white p-0 border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-center bg-gray-50/50 px-5 py-3 border-b border-gray-100">
                                            <span className="font-bold text-gray-700 text-sm">Tuổi: {calculateAge(profile.dob, record.date).text}</span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                    {new Date(record.date).toLocaleDateString('vi-VN')}
                                                </span>
                                                <button onClick={() => setEditingRecord(record)} className="text-gray-300 hover:text-blue-500 transition-colors p-1" title="Sửa bản ghi">
                                                    <FaEdit size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex p-5 text-center divide-x divide-gray-100">
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-wider">Cân nặng</p>
                                                <p className={`font-extrabold text-lg ${recWStatus.color.replace('text-', 'text-')}`}>{record.weight} <span className="text-sm font-medium opacity-50">kg</span></p>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-gray-400 mb-1 font-bold uppercase tracking-wider">Chiều cao</p>
                                                <p className={`font-extrabold text-lg ${recHStatus.color.replace('text-', 'text-')}`}>{record.height} <span className="text-sm font-medium opacity-50">cm</span></p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {showAdd && (
                <AddRecordModal
                    profile={profile}
                    code={code}
                    onClose={() => setShowAdd(false)}
                    onSave={() => {
                        setShowAdd(false);
                        fetchRecords();
                    }}
                />
            )}

            {showEditProfile && (
                <EditProfileModal
                    profile={profile}
                    code={code}
                    onClose={() => setShowEditProfile(false)}
                    onSave={(updatedCode) => {
                        if (updatedCode && updatedCode !== code) {
                            window.location.href = `/${updatedCode}`;
                        } else {
                            window.location.reload();
                        }
                    }}
                />
            )}

            {editingRecord && (
                <EditRecordModal
                    profile={profile}
                    code={code}
                    record={editingRecord}
                    onClose={() => setEditingRecord(null)}
                    onSave={() => {
                        setEditingRecord(null);
                        fetchRecords();
                    }}
                />
            )}

            {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
        </div>
    );
}
