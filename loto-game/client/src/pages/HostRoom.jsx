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
            const utterance = new SpeechSynthesisUtterance(`Số ${num}`);
            utterance.lang = 'vi-VN'; // Vietnamese
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
                                    {numbersDrawn[numbersDrawn.length - 3] && (
                                        <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center border-2 border-slate-600">
                                            <span className="text-2xl text-slate-400">{numbersDrawn[numbersDrawn.length - 3]}</span>
                                        </div>
                                    )}
                                    {numbersDrawn[numbersDrawn.length - 2] && (
                                        <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center border-2 border-slate-500">
                                            <span className="text-3xl text-slate-300">{numbersDrawn[numbersDrawn.length - 2]}</span>
                                        </div>
                                    )}
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
