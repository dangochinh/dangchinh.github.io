import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import Ticket from '../components/Ticket';
import WinnerModal from '../components/WinnerModal';
import AlertModal from '../components/AlertModal';
import clsx from 'clsx';
import { usePlayerGame } from '../hooks/usePlayerGame';

const PlayerRoom = () => {
    const { roomId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { name } = location.state || {};

    const {
        gameState,
        availableSets,
        players,
        isReady,
        numbersDrawn,
        currentNumber,
        winHistory,
        mySetId,
        myTickets,
        lastEvent,
        actions,
        error // Get error from hook
    } = usePlayerGame(roomId, name);

    // Derived State for UI
    const [markedNumbers, setMarkedNumbers] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showDrawnNumbers, setShowDrawnNumbers] = useState(false);
    const [winnerInfo, setWinnerInfo] = useState(null);
    const [alertInfo, setAlertInfo] = useState(null); // For alerts

    // Ticket Color
    const [myTicketColor, setMyTicketColor] = useState(null);
    useEffect(() => {
        if (mySetId && availableSets) {
            const set = availableSets.find(s => s.id === mySetId);
            if (set) setMyTicketColor(set.color);
        }
    }, [mySetId, availableSets]);

    // Handle Game Events (Toasts/Alerts)
    useEffect(() => {
        if (!lastEvent) return;

        if (lastEvent.type === 'gameEnded') {
            const { winner, reason } = lastEvent.data;
            if (reason === 'BINGO') {
                setWinnerInfo({
                    name: winner,
                    isMe: winner === name
                });
            }
        } else if (lastEvent.type === 'kinhFailed') {
            const { playerName } = lastEvent.data;
            setAlertInfo({
                message: `Kinh sai rồi! ${playerName} báo kinh nhưng kiểm tra không đúng.`,
                type: 'error'
            });
        }
    }, [lastEvent, name]);

    // Reset marked numbers on restart
    useEffect(() => {
        if (gameState === 'WAITING') {
            setMarkedNumbers([]);
            setWinnerInfo(null);
            setAlertInfo(null);
        }
    }, [gameState]);


    // Redirect if invalid or error
    useEffect(() => {
        if (!roomId || !name) {
            navigate('/');
        }
        if (error) {
            setAlertInfo({ message: error, type: 'error' });
            // Don't auto-redirect immediately, let user see error? 
            // Or use the old behavior:
            // alert(error); navigate('/');
            // For now, let's keep it simple:
            // If it's a connection error, we might want to redirect.
            // But if it's just "Kinh sai", stay here.
            // The hook error is usually critical/connection related.
            // For critical errors let's delay redirect or just show modal then redirect on close.
        }
    }, [roomId, name, error, navigate]);

    const handleAlertClose = () => {
        setAlertInfo(null);
        if (error) {
            navigate('/');
        }
    };

    const handleNumberClick = (num) => {
        if (markedNumbers.includes(num)) {
            setMarkedNumbers(prev => prev.filter(n => n !== num));
        } else {
            setMarkedNumbers(prev => [...prev, num]);
        }
    };

    const autoMarkDrawnNumbers = () => {
        const numbersInTickets = [];
        if (myTickets) {
            myTickets.forEach(ticket => {
                ticket.forEach(row => {
                    row.forEach(num => {
                        if (num !== 0 && numbersDrawn.includes(num)) {
                            numbersInTickets.push(num);
                        }
                    });
                });
            });
        }
        setMarkedNumbers(numbersInTickets);
        setShowDrawnNumbers(false);
    };

    // Helper for Kinh click count not needed as much if we just have a button
    // But keeping simple logic
    const handleKinh = () => {
        if (markedNumbers.length === 0) {
            setAlertInfo({ message: 'Bạn chưa đánh số nào cả!', type: 'warning' });
            return;
        }
        // Direct call
        actions.sendKinh(markedNumbers);
    };


    if (!roomId) return null;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 pb-20">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 bg-slate-800 p-4 shadow-md z-10 flex justify-between items-center">
                <div className="font-bold">Room: {roomId}</div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowHistory(!showHistory)} className="text-xs px-2 py-1 bg-slate-700 rounded border border-slate-600">
                        {showHistory ? 'Hide History' : '🏆 History'}
                    </button>
                    <div className="font-bold text-violet-400">{gameState}</div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="font-bold">{name} {mySetId ? `(Set #${mySetId})` : ''}</div>
                    {myTickets && (
                        <div className={clsx("text-xs font-bold", isReady ? "text-green-400" : "text-yellow-400")}>
                            {isReady ? "READY" : "NOT READY"}
                        </div>
                    )}
                </div>
            </div>

            {/* History Modal */}
            {showHistory && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    {/* ... Same History Markup ... */}
                    <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-yellow-400">🏆 Hall of Fame</h3>
                            <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2">
                            {winHistory.length > 0 ? winHistory.slice().reverse().map((win, idx) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-slate-700/50 rounded">
                                    <div>
                                        <span className="font-bold text-yellow-400 mr-2">#{win.round}</span>
                                        <span className="font-bold text-white">{win.name}</span>
                                    </div>
                                    <span className="text-xs text-slate-400">{new Date(win.timestamp).toLocaleTimeString()}</span>
                                </div>
                            )) : <div className="text-center text-slate-500">No winners yet.</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* Drawn Numbers Popup */}
            {showDrawnNumbers && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-yellow-400">📋 Drawn Numbers ({numbersDrawn.length})</h3>
                            <button onClick={() => setShowDrawnNumbers(false)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto">
                            <div className="grid grid-cols-10 gap-2">
                                {numbersDrawn.map((num, idx) => (
                                    <div key={idx} className="aspect-square flex items-center justify-center rounded bg-violet-600 text-white font-bold">
                                        {num}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4">
                            <button onClick={autoMarkDrawnNumbers} className="w-full px-6 py-3 bg-green-600 rounded-lg font-bold">✓ Auto Mark</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Winner Modal */}
            {winnerInfo && <WinnerModal winnerName={winnerInfo.name} isMe={winnerInfo.isMe} onClose={() => setWinnerInfo(null)} />}

            {/* Alert Modal */}
            {alertInfo && <AlertModal message={alertInfo.message} type={alertInfo.type} onClose={handleAlertClose} />}

            <div className="pt-20 max-w-lg mx-auto">
                {/* Current Number */}
                {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
                    <div className="mb-6 flex justify-center sticky top-20 z-10">
                        <div className="flex items-center gap-4 bg-slate-800/80 p-3 rounded-full backdrop-blur-sm border border-slate-600">
                            {/* Last 5 */}
                            <div className="flex gap-2 opacity-60">
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const idx = numbersDrawn.length - (6 - i);
                                    if (idx < 0) return null;
                                    return (
                                        <div key={i} className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                            <span className="text-sm text-slate-400">{numbersDrawn[idx]}</span>
                                        </div>
                                    )
                                })}
                            </div>
                            {/* Current */}
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-lg animate-pulse">
                                <span className="text-3xl font-bold">{currentNumber || '-'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* State: Selecting Ticket */}
                {!myTickets ? (
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-center">Select Your Ticket Set</h2>
                        <div className="grid grid-cols-5 gap-3">
                            {availableSets.map((set) => {
                                // Color map matching Ticket.jsx backgrounds (rgba with transparency)
                                const colorMap = {
                                    red: 'rgba(239, 68, 68, 0.6)',      // red-500/60
                                    orange: 'rgba(249, 115, 22, 0.6)', // orange-500/60
                                    purple: 'rgba(168, 85, 247, 0.6)', // purple-500/60
                                    green: 'rgba(34, 197, 94, 0.6)',   // green-500/60
                                    blue: 'rgba(59, 130, 246, 0.6)',   // blue-500/60
                                    yellow: 'rgba(234, 179, 8, 0.6)',  // yellow-500/60
                                    pink: 'rgba(236, 72, 153, 0.6)',   // pink-500/60
                                    cyan: 'rgba(6, 182, 212, 0.6)',    // cyan-500/60
                                    teal: 'rgba(20, 184, 166, 0.6)',   // teal-500/60
                                    indigo: 'rgba(99, 102, 241, 0.6)', // indigo-500/60
                                    lime: 'rgba(132, 204, 22, 0.6)'    // lime-500/60
                                };
                                const bgColor = colorMap[set.color?.toLowerCase()] || 'rgba(59, 130, 246, 0.6)';

                                const buttonStyle = set.isTaken ? {} : {
                                    backgroundColor: bgColor
                                };

                                return (
                                    <button
                                        key={set.id}
                                        disabled={set.isTaken}
                                        onClick={() => actions.selectSet(set.id)}
                                        style={buttonStyle}
                                        className={clsx(
                                            "p-4 rounded-lg font-bold text-lg transition-all shadow-md",
                                            set.isTaken
                                                ? "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                                                : "text-white hover:scale-105 hover:shadow-lg"
                                        )}
                                    >
                                        {set.id}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    /* Playing */
                    <div className="space-y-6">
                        {gameState === 'WAITING' && (
                            <div className="bg-slate-800 p-4 rounded-xl flex items-center justify-between border border-slate-700">
                                <div>
                                    <p className="text-slate-400 text-sm">Ticket Selected</p>
                                    <p className="font-bold text-lg">Set #{mySetId}</p>
                                </div>

                                <div className="flex gap-2">
                                    {!isReady && (
                                        <button
                                            onClick={actions.leaveSeat}
                                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-bold text-slate-300"
                                        >
                                            Change Ticket
                                        </button>
                                    )}
                                    <button
                                        onClick={actions.toggleReady}
                                        className={clsx(
                                            "px-6 py-2 rounded font-bold transition-all shadow-lg",
                                            isReady ? "bg-green-600 hover:bg-green-700" : "bg-pink-600 hover:bg-pink-500 animate-pulse"
                                        )}
                                    >
                                        {isReady ? "READY!" : "I'M READY"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {Array.isArray(myTickets) && myTickets.map((ticketData, idx) => (
                            <Ticket
                                key={idx}
                                data={ticketData}
                                markedNumbers={markedNumbers}
                                onNumberClick={handleNumberClick}
                                color={myTicketColor}
                            />
                        ))}

                        <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 p-4 border-t border-slate-700 backdrop-blur-sm z-20">
                            <div className="max-w-lg mx-auto flex gap-3 items-center">
                                <div className="flex-1 text-sm text-slate-300">
                                    Marked: <span className="font-bold text-yellow-400">{markedNumbers.length}</span>
                                </div>
                                <button
                                    onClick={handleKinh}
                                    disabled={markedNumbers.length === 0 || gameState === 'ENDED' || winnerInfo !== null || (gameState !== 'PLAYING' && gameState !== 'PAUSED')}
                                    className={clsx(
                                        "px-8 py-3 rounded-lg font-bold text-lg transition-all shadow-lg",
                                        markedNumbers.length > 0 && !winnerInfo && (gameState === 'PLAYING' || gameState === 'PAUSED')
                                            ? "bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse text-white"
                                            : "bg-slate-700 text-slate-500 cursor-not-allowed"
                                    )}
                                >
                                    🎯 KINH!
                                </button>
                                <button onClick={() => setShowDrawnNumbers(true)} className="px-6 py-3 bg-blue-600 rounded-lg font-bold text-sm">📋 Drawn</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerRoom;
