import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState('');
    const [name, setName] = useState('');

    const createRoom = () => {
        // Generate a random room ID
        const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
        console.log('Hosting new game:', newRoomId);
        navigate(`/${newRoomId}/host`);
    };

    const joinRoom = (e) => {
        e.preventDefault();
        if (!roomId || !name) return;

        // Navigate to player room with name in state
        navigate(`/${roomId.toUpperCase()}/play`, {
            state: { name }
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md bg-slate-800 p-8 rounded-xl shadow-2xl text-center">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-8">
                    LOTO ONLINE
                </h1>

                <div className="mb-8">
                    <button
                        onClick={createRoom}
                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg font-bold text-xl hover:scale-105 transition-transform shadow-lg"
                    >
                        Host New Game
                    </button>
                </div>

                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-slate-600"></div>
                    <span className="flex-shrink mx-4 text-slate-400">OR</span>
                    <div className="flex-grow border-t border-slate-600"></div>
                </div>

                <form onSubmit={joinRoom} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full p-3 bg-slate-700 rounded-lg border border-slate-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-all"
                        required
                    />
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Room ID"
                            value={roomId}
                            onChange={e => setRoomId(e.target.value)}
                            className="flex-1 p-3 bg-slate-700 rounded-lg border border-slate-600 uppercase focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all"
                            maxLength={6}
                            required
                        />
                        <button
                            type="submit"
                            className="px-6 bg-pink-600 hover:bg-pink-700 rounded-lg font-bold transition-colors"
                        >
                            Join
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Home;
