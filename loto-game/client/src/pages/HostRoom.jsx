import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { useHostGame } from '../hooks/useHostGame';

const HostRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();

    // Use our new Supabase Hook
    const {
        gameState,
        players,
        numbersDrawn,
        currentNumber,
        winHistory,
        verificationPopup,
        availableSets,
        drawIntervalSeconds,
        actions
    } = useHostGame(roomId);

    const [showToast, setShowToast] = useState(false);
    const [showAllTickets, setShowAllTickets] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [voiceLang, setVoiceLang] = useState('vi');

    // Navigation safety
    useEffect(() => {
        if (!roomId) {
            navigate('/');
        }
    }, [roomId, navigate]);

    // Preload voices on mount
    const [voices, setVoices] = useState([]);
    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };

        // Load voices immediately and also on change event
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    // Speech synthesis effect
    useEffect(() => {
        if (currentNumber && gameState === 'PLAYING') {
            speakNumber(currentNumber);
        }
    }, [currentNumber]);

    // Cancel speech when game ends
    useEffect(() => {
        if (gameState === 'ENDED' || gameState === 'WAITING') {
            window.speechSynthesis.cancel();
        }
    }, [gameState]);

    const speakNumber = (num) => {
        if ('speechSynthesis' in window && voices.length > 0) {
            // Cancel any ongoing speech first
            window.speechSynthesis.cancel();

            const text = voiceLang === 'vi' ? `Số ${num}` : `Number ${num}`;
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = voiceLang === 'vi' ? 'vi-VN' : 'en-US';

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

    const copyRoomId = () => {
        navigator.clipboard.writeText(roomId);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
    };

    const exportHallOfFame = () => {
        const data = winHistory.map(game => ({
            Round: game.round,
            Winner: game.name,
            Timestamp: new Date(game.timestamp).toLocaleString(),
            Players: game.players ? game.players.map(p => `${p.name} (Set ${p.setId})`).join(', ') : 'N/A',
            Failures: game.failures ? game.failures.map(f => `${f.name} (${new Date(f.timestamp).toLocaleTimeString()})`).join('; ') : 'None'
        }));

        const csv = [
            ['Round', 'Winner', 'Timestamp', 'Players', 'Failures'],
            ...data.map(row => [row.Round, row.Winner, row.Timestamp, row.Players, row.Failures])
        ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hall-of-fame-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const closeVerificationPopup = () => {
        const wasKinhSai = verificationPopup && !verificationPopup.success;
        actions.setVerificationPopup(null);
        if (wasKinhSai) {
            actions.resumeGame();
        }
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-900 text-white">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg font-bold animate-fade-in">
                    ✓ Copied ID!
                </div>
            )}

            {/* Verification Popup */}
            {verificationPopup && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-xl p-6 w-full max-w-3xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold">
                                {verificationPopup.success ? (
                                    <span className="text-green-400">✅ BINGO! - {verificationPopup.playerName}</span>
                                ) : (
                                    <span className="text-red-400">❌ KINH SAI - {verificationPopup.playerName}</span>
                                )}
                            </h3>
                            <button onClick={closeVerificationPopup} className="text-slate-400 hover:text-white text-2xl">✕</button>
                        </div>

                        {verificationPopup.message && (
                            <div className="mb-4 p-3 bg-red-900/50 rounded text-red-200 text-sm">
                                {verificationPopup.message}
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto space-y-4">
                            {verificationPopup.playerTickets && verificationPopup.playerTickets.map((ticket, idx) => (
                                <div key={idx} className="border-2 border-slate-700 bg-slate-900/50 p-3 rounded-lg">
                                    <div className="text-sm text-slate-400 mb-2">Ticket {idx + 1}</div>
                                    <div className="flex flex-col gap-1">
                                        {ticket.map((row, rIdx) => (
                                            <div key={rIdx} className="grid grid-cols-9 gap-1">
                                                {row.map((num, cIdx) => {
                                                    const isMarked = verificationPopup.markedNumbers.includes(num) && num !== 0;
                                                    const isDrawn = verificationPopup.drawnNumbers.includes(num) && num !== 0;
                                                    return (
                                                        <div
                                                            key={`${rIdx}-${cIdx}`}
                                                            className={clsx(
                                                                "flex items-center justify-center font-bold text-sm rounded h-10",
                                                                num === 0 ? "invisible" : "",
                                                                isMarked && isDrawn ? "bg-green-500 text-white" :
                                                                    isMarked && !isDrawn ? "bg-red-500 text-white" :
                                                                        isDrawn ? "bg-blue-500/50 text-white" :
                                                                            "bg-slate-700 text-slate-300"
                                                            )}
                                                        >
                                                            {num !== 0 ? num : ''}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={closeVerificationPopup}
                                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 rounded-lg font-bold text-lg"
                            >
                                {verificationPopup.success ? 'Close' : 'Close & Resume Game'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAllTickets && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-xl p-6 w-full max-w-6xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-cyan-400">👁️ All Player Tickets</h3>
                            <button onClick={() => setShowAllTickets(false)} className="text-slate-400 hover:text-white text-2xl">✕</button>
                        </div>
                        {/* Tickets rendering logic similar to before, using players state */}
                        <div className="flex-1 overflow-y-auto space-y-6">
                            {players.map((player) => {
                                if (!player.tickets) return null;

                                // Helper to check if a row has bingo
                                const checkBingoRow = (row) => {
                                    const nums = row.filter(n => n !== 0);
                                    return nums.every(n => numbersDrawn.includes(n));
                                };

                                return (
                                    <div key={player.id} className="border-2 border-slate-700 bg-slate-900/50 p-4 rounded-lg">
                                        <div className="font-bold mb-2">{player.name} (Set #{player.setId})</div>
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                                            {player.tickets.map((ticket, tIdx) => (
                                                <div key={tIdx} className="border border-slate-700 bg-slate-800/50 p-2 rounded">
                                                    {ticket.map((row, rIdx) => {
                                                        const isBingoRow = checkBingoRow(row);
                                                        return (
                                                            <div key={rIdx} className={clsx(
                                                                "grid grid-cols-9 gap-0.5 p-1 rounded",
                                                                isBingoRow ? "bg-green-900/50 border border-green-500 box-content" : ""
                                                            )}>
                                                                {row.map((num, cIdx) => (
                                                                    <div key={cIdx} className={clsx(
                                                                        "flex items-center justify-center font-bold text-xs rounded h-7",
                                                                        num === 0 ? "invisible" : "",
                                                                        numbersDrawn.includes(num) ? "bg-violet-600 text-white" : "bg-slate-700 text-slate-300"
                                                                    )}>
                                                                        {num !== 0 ? num : ''}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {showHistory && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-yellow-400">🏆 Game History</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={exportHallOfFame}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-sm flex items-center gap-2"
                                >
                                    📥 Export CSV
                                </button>
                                <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white text-2xl">✕</button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-slate-900/50 rounded-lg p-4">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-slate-400 border-b border-slate-700">
                                        <th className="p-3">Round</th>
                                        <th className="p-3">Player</th>
                                        <th className="p-3">Type</th>
                                        <th className="p-3">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {winHistory.slice().reverse().map((record, idx) => (
                                        <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                                            <td className="p-3 font-bold text-slate-300">#{record.round}</td>
                                            <td className="p-3 font-bold text-white">{record.name}</td>
                                            <td className="p-3">
                                                <span className={clsx(
                                                    "px-2 py-1 rounded text-xs font-bold",
                                                    record.reason === 'BINGO' ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"
                                                )}>
                                                    {record.reason}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm text-slate-400">
                                                {new Date(record.timestamp).toLocaleTimeString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {winHistory.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="p-8 text-center text-slate-500">No history yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            <header className="bg-slate-800 p-4 shadow-md flex justify-between items-center z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                        Room: <span onClick={copyRoomId} className="cursor-pointer font-mono text-white underline decoration-dashed underline-offset-4 hover:text-cyan-400 transition-colors" title="Click to copy">{roomId}</span>
                    </h1>
                    <span className={clsx("px-3 py-1 rounded-full text-sm font-bold",
                        gameState === 'WAITING' ? "bg-yellow-500/20 text-yellow-400" :
                            gameState === 'PLAYING' ? "bg-green-500/20 text-green-400" :
                                gameState === 'PAUSED' ? "bg-orange-500/20 text-orange-400" :
                                    "bg-red-500/20 text-red-400"
                    )}>
                        {gameState}
                    </span>

                    {/* Draw Interval */}
                    <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-1.5 border border-slate-600">
                        <label className="text-xs text-slate-400">Interval (s):</label>
                        <input
                            type="number" min="1" max="60"
                            value={drawIntervalSeconds}
                            onChange={(e) => actions.setDrawIntervalSeconds(Number(e.target.value))}
                            className="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                        />
                    </div>
                    <button
                        onClick={() => setShowAllTickets(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-sm"
                    >
                        👁️ View Tickets
                    </button>
                    <button
                        onClick={() => setShowHistory(true)}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg font-bold text-sm"
                    >
                        📜 History
                    </button>
                </div>
                <div className="flex gap-2">
                    {gameState === 'WAITING' && (
                        <button
                            onClick={actions.startGame}
                            disabled={players.length === 0 || !players.every(p => p.isReady)}
                            className={clsx(
                                "px-6 py-2 rounded-lg font-bold transition-all",
                                players.length > 0 && players.every(p => p.isReady)
                                    ? "bg-green-600 hover:bg-green-700 shadow-lg hover:scale-105"
                                    : "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                            )}
                        >
                            {players.length === 0 ? "Waiting..." : "Start Game"}
                        </button>
                    )}
                    {gameState === 'PLAYING' && (
                        <button onClick={actions.pauseGame} className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold">Pause</button>
                    )}
                    {gameState === 'PAUSED' && (
                        <button onClick={actions.resumeGame} className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold">Resume</button>
                    )}
                    <button onClick={() => navigate('/')} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">Exit</button>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* Board */}
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="flex justify-center mb-8">
                        {/* Current Number */}
                        {currentNumber && (
                            <div className="text-5xl font-bold bg-gradient-to-br from-pink-500 to-violet-600 w-24 h-24 rounded-full flex items-center justify-center shadow-lg">
                                {currentNumber}
                            </div>
                        )}
                        {gameState === 'ENDED' && (
                            <div className="ml-8 text-center">
                                <h2 className="text-3xl font-bold text-yellow-400">Game Over</h2>
                                <button onClick={actions.restartGame} className="mt-2 px-6 py-2 bg-green-600 rounded font-bold">New Game</button>
                            </div>
                        )}
                    </div>

                    {/* Board Grid */}
                    <div className="grid grid-cols-10 gap-2 max-w-4xl mx-auto mt-8">
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

                {/* Players List */}
                <aside className="w-80 bg-slate-800 border-l border-slate-700 p-4 overflow-y-auto">
                    <h3 className="text-lg font-bold mb-4 text-slate-300">Players ({players.length})</h3>
                    <div className="space-y-2">
                        {players.map(p => (
                            <div key={p.id} className="p-3 bg-slate-700/50 rounded-lg flex justify-between items-center">
                                <div>
                                    <div className="font-bold">{p.name}</div>
                                    <div className="text-xs text-slate-400">{p.setId ? `Set #${p.setId}` : 'Selecting...'}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {p.isReady && <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded">READY</span>}
                                    <button onClick={() => actions.removePlayer(p.id)} className="text-red-400 hover:text-red-300">✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>
            </main>
        </div>
    );
};

export default HostRoom;
