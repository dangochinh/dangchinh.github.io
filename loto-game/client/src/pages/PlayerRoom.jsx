import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import Ticket from '../components/Ticket';
import clsx from 'clsx';

const PlayerRoom = () => {
    const socket = useSocket();
    const location = useLocation();
    const navigate = useNavigate();
    const { roomId, name, initialRoomData } = location.state || {};

    const [gameState, setGameState] = useState(initialRoomData?.gameState || 'WAITING');
    const [availableSets, setAvailableSets] = useState(initialRoomData?.availableSets || []);
    const [myTickets, setMyTickets] = useState(null);
    const [markedNumbers, setMarkedNumbers] = useState([]);
    const [currentNumber, setCurrentNumber] = useState(initialRoomData?.currentNumber || null);
    const [drawnHistory, setDrawnHistory] = useState(initialRoomData?.numbersDrawn || []);

    const [isSelecting, setIsSelecting] = useState(false);

    useEffect(() => {
        if (!socket || !roomId) {
            navigate('/');
            return;
        }

        // Listeners
        socket.on('setsUpdated', (sets) => setAvailableSets(sets));

        socket.on('numberDrawn', ({ number, history }) => {
            setCurrentNumber(number);
            setDrawnHistory(history);
        });

        socket.on('gameStateChanged', (state) => setGameState(state));

        socket.on('gameEnded', ({ winner, reason }) => {
            alert(reason === 'BINGO' ? `BINGO! Winner: ${winner}` : 'Game Over');
            setGameState('ENDED');
        });

        return () => {
            socket.off('setsUpdated');
            socket.off('numberDrawn');
            socket.off('gameStateChanged');
            socket.off('gameEnded');
        }
    }, [socket, roomId, navigate]);

    const selectSet = (setId) => {
        setIsSelecting(true);
        socket.emit('selectSet', { roomId, setId }, (res) => {
            setIsSelecting(false);
            if (res.error) {
                alert(res.error);
            } else {
                setMyTickets(res.tickets);
            }
        });
    };

    const handleNumberClick = (num) => {
        if (gameState !== 'PLAYING') return;

        // Validation: Can only mark if it has been drawn?
        if (drawnHistory.includes(num)) {
            if (!markedNumbers.includes(num)) {
                setMarkedNumbers(prev => [...prev, num]);
            }
        }
    };

    if (!roomId) return null;

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 pb-20">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 bg-slate-800 p-4 shadow-md z-10 flex justify-between items-center">
                <div className="font-bold">Room: {roomId}</div>
                <div className="font-bold text-violet-400">{gameState}</div>
                <div className="flex flex-col items-end">
                    <div className="font-bold">{name}</div>
                    {myTickets && <div className="text-xs text-green-400">Ready</div>}
                </div>
            </div>

            <div className="pt-20 max-w-lg mx-auto">
                {/* Current Number Display */}
                {/* Current Number Display */}
                {gameState === 'PLAYING' && (
                    <div className="mb-6 flex justify-center sticky top-20 z-10">
                        <div className="flex items-center gap-4 bg-slate-800/80 p-4 rounded-full backdrop-blur-sm border border-slate-600 overflow-x-auto max-w-full">
                            {/* Previous */}
                            <div className="flex gap-2 opacity-60">
                                {Array.from({ length: 5 }).map((_, i) => {
                                    const idx = drawnHistory.length - (6 - i);
                                    if (idx < 0) return null;
                                    return (
                                        <div key={i} className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center border border-slate-500">
                                            <span className="text-sm text-slate-400">{drawnHistory[idx]}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Current */}
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-lg ring-4 ring-white/10 animate-pulse flex-shrink-0">
                                <span className="text-4xl font-bold">{currentNumber || '-'}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* State: Selecting Ticket */}
                {!myTickets ? (
                    <div>
                        <h2 className="text-xl font-bold mb-4 text-center">Select Your Ticket Set</h2>
                        <div className="grid grid-cols-5 gap-3">
                            {availableSets.map((set) => (
                                <button
                                    key={set.id}
                                    disabled={set.isTaken || isSelecting}
                                    onClick={() => selectSet(set.id)}
                                    className={clsx(
                                        "p-4 rounded-lg font-bold text-lg transition-all shadow-md",
                                        set.isTaken
                                            ? "bg-slate-700 text-slate-500 cursor-not-allowed opacity-50"
                                            : "bg-gradient-to-br from-blue-500 to-cyan-500 hover:scale-105 hover:from-blue-400 hover:to-cyan-400 text-white"
                                    )}
                                >
                                    {set.id}
                                </button>
                            ))}
                        </div>
                        {availableSets.length === 0 && (
                            <div className="text-center text-slate-500 mt-4">
                                Loading sets...
                            </div>
                        )}
                    </div>
                ) : (
                    /* State: Playing */
                    <div className="space-y-6">
                        {myTickets.map((ticketData, idx) => (
                            <Ticket
                                key={idx}
                                data={ticketData}
                                markedNumbers={markedNumbers}
                                onNumberClick={handleNumberClick}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayerRoom;
