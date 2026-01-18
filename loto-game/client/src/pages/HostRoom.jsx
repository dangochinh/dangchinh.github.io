import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import clsx from 'clsx';

const HostRoom = () => {
    const socket = useSocket();
    const location = useLocation();
    const navigate = useNavigate();
    const roomId = location.state?.roomId;

    const [players, setPlayers] = useState([]);
    const [gameState, setGameState] = useState('WAITING');
    const [numbersDrawn, setNumbersDrawn] = useState([]);
    const [currentNumber, setCurrentNumber] = useState(null);
    const [lastWinner, setLastWinner] = useState(null);
    const [voiceLang, setVoiceLang] = useState('vi');

    useEffect(() => {
        if (!socket || !roomId) {
            navigate('/');
            return;
        }

        socket.on('playerJoined', (updatedPlayers) => {
            setPlayers(updatedPlayers);
        });

        socket.on('playerUpdated', (updatedPlayers) => {
            setPlayers(updatedPlayers);
        });

        socket.on('numberDrawn', ({ number, history }) => {
            setCurrentNumber(number);
            setNumbersDrawn(history);
            speakNumber(number);
        });

        socket.on('gameStateChanged', (state) => {
            setGameState(state);
        });

        socket.on('gameEnded', ({ winner, reason, fullHistory }) => {
            setGameState('ENDED');
            setLastWinner(winner);
            if (fullHistory) setNumbersDrawn(fullHistory);
        });

        return () => {
            socket.off('playerJoined');
            socket.off('playerUpdated');
            socket.off('numberDrawn');
            socket.off('gameStateChanged');
            socket.off('gameEnded');
        }
    }, [socket, roomId, navigate]);

    const speakNumber = (num) => {
        if ('speechSynthesis' in window) {
            const text = voiceLang === 'vi' ? `Số ${num}` : `Number ${num}`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = voiceLang === 'vi' ? 'vi-VN' : 'en-US';

            const voices = window.speechSynthesis.getVoices();
            let selectedVoice;

            if (voiceLang === 'vi') {
                selectedVoice = voices.find(voice => voice.lang.includes('vi') || voice.lang.includes('VN'));
            } else {
                selectedVoice = voices.find(voice => voice.lang.includes('en-US') && !voice.name.includes('Zira'));
            }

            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            window.speechSynthesis.speak(utterance);
        }
    };

    const sendAction = (action) => {
        socket.emit('action', { roomId, action });
    };

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        alert('Copied ID!');
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-900 text-white">
            <header className="bg-slate-800 p-4 shadow-md flex justify-between items-center z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                        Room: <span onClick={copyRoomId} className="cursor-pointer font-mono text-white underline decoration-dashed underline-offset-4" title="Click to copy">{roomId}</span>
                    </h1>
                    <span className={clsx("px-3 py-1 rounded-full text-sm font-bold",
                        gameState === 'WAITING' ? "bg-yellow-500/20 text-yellow-400" :
                            gameState === 'PLAYING' ? "bg-green-500/20 text-green-400" :
                                gameState === 'PAUSED' ? "bg-orange-500/20 text-orange-400" :
                                    "bg-red-500/20 text-red-400"
                    )}>
                        {gameState}
                    </span>
                    <div className="flex bg-slate-700/50 rounded-lg p-0.5 border border-slate-600">
                        <button
                            onClick={() => setVoiceLang('vi')}
                            className={clsx("px-3 py-1.5 rounded font-bold text-xs transition-colors", voiceLang === 'vi' ? "bg-slate-600 text-white shadow" : "text-slate-400 hover:text-slate-300")}
                        >
                            VI
                        </button>
                        <button
                            onClick={() => setVoiceLang('en')}
                            className={clsx("px-3 py-1.5 rounded font-bold text-xs transition-colors", voiceLang === 'en' ? "bg-slate-600 text-white shadow" : "text-slate-400 hover:text-slate-300")}
                        >
                            EN
                        </button>
                    </div>
                </div>
                <div className="flex gap-2">
                    {gameState === 'WAITING' && (
                        <button onClick={() => sendAction('START')} className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold">Start Game</button>
                    )}
                    {gameState === 'PLAYING' && (
                        <button onClick={() => sendAction('PAUSE')} className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold">Pause</button>
                    )}
                    {gameState === 'PAUSED' && (
                        <button onClick={() => sendAction('RESUME')} className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold">Resume</button>
                    )}
                    <button onClick={() => navigate('/')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">Exit</button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Left: Drawn Numbers Board */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="flex justify-center mb-8">
                        {currentNumber && (
                            <div className="flex items-center gap-6">
                                <div className="flex gap-2 opacity-60">
                                    {Array.from({ length: 5 }).map((_, i) => {
                                        const idx = numbersDrawn.length - (6 - i); // 5 prev numbers
                                        if (idx < 0) return null;
                                        return (
                                            <div key={i} className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                                                <span className="text-xl text-slate-400">{numbersDrawn[idx]}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="relative animate-bounce">
                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-2xl ring-4 ring-white/20">
                                        <span className="text-6xl font-bold">{currentNumber}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                        {gameState === 'ENDED' && lastWinner && (
                            <div className="text-center">
                                <h2 className="text-4xl font-extrabold text-yellow-400 mb-2">BINGO!</h2>
                                <p className="text-2xl">Winner: {lastWinner}</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-10 gap-2 max-w-4xl mx-auto">
                        {Array.from({ length: 90 }, (_, i) => i + 1).map(num => (
                            <div
                                key={num}
                                className={clsx(
                                    "aspect-square flex items-center justify-center rounded font-medium transition-all duration-500",
                                    numbersDrawn.includes(num)
                                        ? "bg-violet-600 text-white scale-105 shadow-lg shadow-violet-500/50"
                                        : "bg-slate-800 text-slate-500"
                                )}
                            >
                                {num}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Players */}
                <aside className="w-80 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto">
                    <h3 className="text-lg font-bold mb-4 text-slate-300">Players ({players.length})</h3>
                    <div className="space-y-2">
                        {players.map(p => (
                            <div key={p.id} className="p-3 bg-slate-700/50 rounded-lg flex justify-between items-center">
                                <div>
                                    <div className="font-bold">{p.name}</div>
                                    <div className="text-xs text-slate-400">{p.setId ? `Set #${p.setId}` : 'Selecting...'}</div>
                                </div>
                                <div className={clsx("w-2 h-2 rounded-full", p.setId ? "bg-green-400" : "bg-yellow-400")}></div>
                            </div>
                        ))}
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default HostRoom;
