'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Dashboard from '../components/Dashboard';

export default function ProfilePage() {
    const params = useParams();
    const router = useRouter();
    const code = params.code;

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!code) return;

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/profile?code=${code}`);
                const json = await res.json();
                if (json.success && json.data) {
                    setProfile(json.data);
                } else {
                    setError(true);
                }
            } catch (e) {
                console.error(e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50">
                <div className="animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="60" className="text-pink-400" fill="currentColor"><path d="M256 32a96 96 0 1 1 0 192 96 96 0 1 1 0-192zm-73.6 15.2c16.3-9.4 36.3-4.2 46.1 11.8l20.4 33.3c7.5 12.3 23.5 16.3 36 9l33.3-19.4c16.2-9.5 36.4-4.5 46.2 11.5L383 125c10 16.3 5.4 37-10.4 47.1l-25.1 15.9c-12 7.6-16.1 23.2-9.2 35.8l23.7 43.1c8.5 15.5 3 35.2-12.2 44.5l-44.5 27.2c-15.5 9.5-36.2 5.1-46.2-10l-28.7-43.1A32 32 0 0 0 203.8 285l-27.1 39.5c-10 14.6-29.6 19.4-45.7 10.7l-45.8-24.8C70 302.1 63.8 282 72.3 266.8l24-42.9c7.2-12.8 2.6-29-10-36.1L62 174c-15.6-8.8-21.7-28.6-13.6-44.1l21.6-41c8.1-15.4 27.5-22 43.3-14.7l33 15.2c13.7 6.3 29.5 0 35.7-13.6l16.1-35.3c7-15.3 24.5-22.3 40.1-15.3l37.8 17zM176 112a16 16 0 1 0 -32 0 16 16 0 1 0 32 0zm176-16a16 16 0 1 0 0 32 16 16 0 1 0 0-32zM128 320v96c0 17.7 14.3 32 32 32H176V352h32V448h16c17.7 0 32-14.3 32-32V320H128z" /></svg>
                </div>
                <p className="mt-4 text-pink-400 font-bold tracking-wide">Đang tải hồ sơ bé...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 p-6">
                <div className="cute-card max-w-sm w-full p-8 text-center bg-white backdrop-blur-xl">
                    <div className="text-5xl mb-4">😢</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy mã bé!</h2>
                    <p className="text-gray-500 text-sm mb-6">Mã <b>{code}</b> không tồn tại hoặc bạn nhập sai.</p>
                    <button onClick={() => router.push('/')} className="w-full cute-button-primary py-3">
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return <Dashboard profile={profile} code={code} />;
}
