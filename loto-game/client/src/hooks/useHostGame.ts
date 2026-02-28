import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getAllTicketSets } from '../utils/ticketGenerator';
import { checkForBingo } from '../utils/gameLogic';
import { LotoController } from '../utils/lotoController';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Player, GameState, WinRecord, VerificationPopup, TicketSetInfo } from '../types';

export const useHostGame = (roomId: string | undefined) => {
    const [gameState, setGameState] = useState<GameState>('WAITING');
    const [players, setPlayers] = useState<Player[]>([]);
    const [numbersDrawn, setNumbersDrawn] = useState<number[]>([]);
    const [currentNumber, setCurrentNumber] = useState<number | null>(null);
    const [winHistory, setWinHistory] = useState<WinRecord[]>([]);
    const [verificationPopup, setVerificationPopup] = useState<VerificationPopup | null>(null);
    const [drawIntervalSeconds, setDrawIntervalSeconds] = useState<number>(3);

    // Refs for state accessed inside callbacks/intervals
    const gameStateRef = useRef<GameState>(gameState);
    const playersRef = useRef<Player[]>(players);
    const numbersDrawnRef = useRef<number[]>(numbersDrawn);
    const winHistoryRef = useRef<WinRecord[]>(winHistory);
    const failuresRef = useRef<WinRecord[]>([]);
    const drawIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    // Bingo Window state
    const firstWinnerRef = useRef<Player | null>(null);
    const coWinnersRef = useRef<string[]>([]);
    const bingoWindowTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lotoControllerRef = useRef<LotoController | null>(null);

    // Sync refs
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
    useEffect(() => { playersRef.current = players; }, [players]);
    useEffect(() => { numbersDrawnRef.current = numbersDrawn; }, [numbersDrawn]);
    useEffect(() => { winHistoryRef.current = winHistory; }, [winHistory]);

    // Initialize available sets
    const [availableSets, setAvailableSets] = useState<TicketSetInfo[]>([]);
    useEffect(() => {
        const allSets = getAllTicketSets();
        const sets: TicketSetInfo[] = allSets.map(set => ({
            id: set.id,
            name: set.name,
            color: set.color,
            data: set.data,
            isTaken: false
        }));
        setAvailableSets(sets);
    }, []);

    const availableSetsRef = useRef<TicketSetInfo[]>(availableSets);
    useEffect(() => { availableSetsRef.current = availableSets; }, [availableSets]);

    // Broadcast helper
    const broadcast = useCallback((event: string, payload: any) => {
        if (channelRef.current) {
            channelRef.current.send({
                type: 'broadcast',
                event: event,
                payload: payload
            });
        }
    }, []);

    // Game Loop
    const drawNumber = useCallback(() => {
        if (gameStateRef.current !== 'PLAYING') return;
        if (numbersDrawnRef.current.length >= 90) {
            pauseGame();
            setGameState('ENDED');
            broadcast('gameStateChanged', 'ENDED');
            broadcast('gameEnded', { winner: null, reason: 'Full Board' });
            return;
        }

        let num: number;

        // Sử dụng LotoController nếu đang ở chế độ REGULATED
        if (lotoControllerRef.current) {
            const result = lotoControllerRef.current.drawNextNumber();
            if (!result) {
                pauseGame();
                setGameState('ENDED');
                broadcast('gameStateChanged', 'ENDED');
                broadcast('gameEnded', { winner: null, reason: 'Full Board' });
                return;
            }
            num = result.number;
            console.log(`[LotoController] Drew #${result.totalDrawn} = ${num} (Stage: ${result.stage})`);
        } else {
            // Chế độ RANDOM: bốc ngẫu nhiên 100%
            do {
                num = Math.floor(Math.random() * 90) + 1;
            } while (numbersDrawnRef.current.includes(num));
        }

        const newHistory = [...numbersDrawnRef.current, num];
        setNumbersDrawn(newHistory);
        setCurrentNumber(num);

        broadcast('numberDrawn', { number: num, history: newHistory });
    }, [broadcast]);

    const startGame = () => {
        const allReady = playersRef.current.length > 0 && playersRef.current.every(p => p.isReady);
        if (!allReady) {
            alert("Not all players are ready!");
            return;
        }

        // Tính toán thông tin lịch sử ván đấu
        const winRecords = winHistoryRef.current.filter(r => r.type === 'win');
        const gameIndex = winRecords.length + 1;

        // streakCounts: Số ván liên tiếp chưa bingo cho mỗi player
        const streakCounts: Record<string, number> = {};
        playersRef.current.forEach(player => {
            let streak = 0;
            // Duyệt ngược lịch sử thắng
            for (let i = winRecords.length - 1; i >= 0; i--) {
                const record = winRecords[i];
                const isWinner = record.name === player.name || record.coWinners?.includes(player.name);
                if (isWinner) break;
                streak++;
            }
            streakCounts[player.id] = streak;
        });

        const lastWin = winRecords[winRecords.length - 1];
        const lastWinnerIds: string[] = [];
        if (lastWin) {
            const mainWinner = playersRef.current.find(p => p.name === lastWin.name);
            if (mainWinner) lastWinnerIds.push(mainWinner.id);
            lastWin.coWinners?.forEach(name => {
                const coWinner = playersRef.current.find(p => p.name === name);
                if (coWinner) lastWinnerIds.push(coWinner.id);
            });
        }

        // Tính toán danh sách người chơi đã đạt giới hạn thắng (max 5 ván)
        const cappedPlayerIds: string[] = [];
        playersRef.current.forEach(player => {
            let totalWins = 0;
            winRecords.forEach(record => {
                const isWinner = record.name === player.name || record.coWinners?.includes(player.name);
                if (isWinner) totalWins++;
            });
            if (totalWins >= 5) {
                cappedPlayerIds.push(player.id);
            }
        });

        // --- CẬP NHẬT: Logic Offset cho ván cứu ---
        // Ván_cứu = (5 * n) +/- {0, 1}
        const cycleN = Math.round(gameIndex / 5);
        let isSpecialRound = false;

        if (cycleN > 0 && roomId) {
            // Sử dụng roomId làm seed để offset cố định trong suốt ván đấu của room đó
            // nhưng vẫn ngẫu nhiên giữa các room và các chu kỳ n
            const seed = roomId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + cycleN;
            const offset = (seed % 3) - 1; // Kết quả: -1, 0, hoặc 1
            const targetSpecialGame = (5 * cycleN) + offset;

            isSpecialRound = gameIndex === targetSpecialGame;
        }

        const useRegulated = isSpecialRound || Math.random() < 0.5;

        if (useRegulated) {
            lotoControllerRef.current = new LotoController(
                playersRef.current,
                streakCounts,
                lastWinnerIds,
                isSpecialRound,
                cappedPlayerIds
            );
            console.log(`[Game] Mode = REGULATED (Round=${gameIndex}). Capped Players: ${cappedPlayerIds.length}`);
            if (isSpecialRound) {
                const sortedStreaks = Object.entries(streakCounts).sort((a, b) => b[1] - a[1]);
                console.log(`[Game] Special "NO ONE LEFT BEHIND" Round ${gameIndex}: Algorithm Mandatory! Top lost streak:`, sortedStreaks[0]);
            }
        } else {
            lotoControllerRef.current = null;
            console.log(`[Game] Mode = RANDOM (Round=${gameIndex}, Players=${playersRef.current.length})`);
        }

        setGameState('PLAYING');
        broadcast('gameStateChanged', 'PLAYING');

        if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
        drawIntervalRef.current = setInterval(() => {
            drawNumber();
        }, drawIntervalSeconds * 1000);
    };

    const pauseGame = () => {
        if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
        setGameState('PAUSED');
        broadcast('gameStateChanged', 'PAUSED');
    };

    const resumeGame = () => {
        if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
        drawIntervalRef.current = setInterval(() => {
            drawNumber();
        }, drawIntervalSeconds * 1000);
        setGameState('PLAYING');
        broadcast('gameStateChanged', 'PLAYING');
    };

    const restartGame = () => {
        if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
        lotoControllerRef.current = null; // Xóa controller khi restart
        setGameState('WAITING');
        setNumbersDrawn([]);
        setCurrentNumber(null);
        failuresRef.current = [];

        const resetPlayers = playersRef.current.map(p => ({ ...p, isReady: false }));
        setPlayers(resetPlayers);

        // setWinHistory([]); // Keep history across restarts!

        broadcast('gameRestarted', {
            gameState: 'WAITING',
            players: resetPlayers,
            winHistory: winHistoryRef.current // Send existing history
        });
    };

    const endBingoWindow = useCallback(() => {
        if (bingoWindowTimerRef.current) clearTimeout(bingoWindowTimerRef.current);
        const winner = firstWinnerRef.current;
        if (!winner) return;
        const currentRound = winHistoryRef.current.filter(r => r.type === 'win').length + 1;
        const winRecord: WinRecord = {
            name: winner.name,
            coWinners: coWinnersRef.current.length > 0 ? [...coWinnersRef.current] : undefined,
            timestamp: new Date(),
            round: currentRound,
            reason: 'BINGO',
            type: 'win',
            players: JSON.parse(JSON.stringify(playersRef.current)),
            failures: [...failuresRef.current]
        };
        const newHistory = [...winHistoryRef.current, winRecord].slice(-50);
        setWinHistory(newHistory);
        winHistoryRef.current = newHistory;

        setVerificationPopup({
            playerName: winner.name,
            success: true,
            message: coWinnersRef.current.length > 0
                ? `BINGO! Trùng với: ${coWinnersRef.current.join(', ')}`
                : 'Player has BINGO!',
            markedNumbers: [],
            drawnNumbers: numbersDrawnRef.current,
            playerTickets: winner.tickets
        });

        broadcast('gameEnded', {
            winner,
            coWinners: [...coWinnersRef.current],
            reason: 'BINGO',
            winRecord
        });
        setGameState('ENDED');
        gameStateRef.current = 'ENDED';
        // Reset
        firstWinnerRef.current = null;
        coWinnersRef.current = [];
    }, [broadcast]);

    const verifyKinh = (playerId: string, markedNumbers: number[]) => {
        const player = playersRef.current.find(p => p.id === playerId);
        if (!player) return;

        // Block KINH khi game đã kết thúc hoặc chưa bắt đầu
        if (gameStateRef.current === 'ENDED' || gameStateRef.current === 'WAITING') return;

        const hasBingo = checkForBingo(player.tickets, numbersDrawnRef.current);
        const currentRound = winHistoryRef.current.filter(r => r.type === 'win').length + 1;

        if (hasBingo) {
            // --- CASE 1: First KINH in this round → open BINGO_WINDOW ---
            if (gameStateRef.current === 'PLAYING' || gameStateRef.current === 'PAUSED') {
                if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
                firstWinnerRef.current = player;
                coWinnersRef.current = [];
                setGameState('BINGO_WINDOW');
                gameStateRef.current = 'BINGO_WINDOW';
                broadcast('gameStateChanged', 'BINGO_WINDOW');
                broadcast('bingoConfirmed', { winner: player, windowSeconds: 5 });

                // Start 5-second window, then auto-end
                bingoWindowTimerRef.current = setTimeout(() => endBingoWindow(), 5000);
            }
            // --- CASE 2: Co-winner presses KINH within window ---
            else if (gameStateRef.current === 'BINGO_WINDOW') {
                // Skip if this player is already registered (duplicate event)
                if (
                    firstWinnerRef.current?.id !== player.id &&
                    !coWinnersRef.current.includes(player.name)
                ) {
                    coWinnersRef.current = [...coWinnersRef.current, player.name];
                    broadcast('coWinnerAdded', { name: player.name });
                }
            }
        } else {
            // Kinh Sai — only valid outside of BINGO_WINDOW
            if (gameStateRef.current === 'BINGO_WINDOW') return; // Ignore false claims during window

            if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
            setGameState('PAUSED');
            gameStateRef.current = 'PAUSED';
            broadcast('gameStateChanged', 'PAUSED');

            const failRecord: WinRecord = {
                name: player.name,
                timestamp: new Date(),
                round: currentRound,
                reason: 'KINH_SAI',
                type: 'fail',
                players: JSON.parse(JSON.stringify(playersRef.current))
            };

            failuresRef.current.push(failRecord);

            // Keep last 50 rounds
            const newHistory = [...winHistoryRef.current, failRecord].slice(-50);
            setWinHistory(newHistory);
            winHistoryRef.current = newHistory;

            setVerificationPopup({
                playerName: player.name,
                success: false,
                message: `${player.name} kinh sai! Phạt đi!`,
                markedNumbers,
                drawnNumbers: numbersDrawnRef.current,
                playerTickets: player.tickets
            });

            broadcast('verificationResult', {
                success: false,
                playerId: player.id,
                message: `${player.name} kinh sai! Phạt đi!`
            });

            // Sync history to all clients
            broadcast('roomDataSync', {
                gameState: gameStateRef.current,
                numbersDrawn: numbersDrawnRef.current,
                players: playersRef.current,
                availableSets: availableSetsRef.current,
                currentNumber: numbersDrawnRef.current[numbersDrawnRef.current.length - 1] || null,
                winHistory: newHistory
            });
        }
    };

    const endGame = () => {
        if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
        setGameState('ENDED');
        broadcast('gameStateChanged', 'ENDED');
    };

    useEffect(() => {
        if (!roomId) return;

        const channel = supabase.channel(`room:${roomId}`, {
            config: {
                presence: {
                    key: 'host',
                },
            },
        });

        channelRef.current = channel;

        channel
            .on('broadcast', { event: 'requestJoin' }, ({ payload }) => {
                // If player already exists, just sync
                if (playersRef.current.some(p => p.id === payload.id)) {
                    channel.send({
                        type: 'broadcast',
                        event: 'roomDataSync',
                        payload: {
                            gameState: gameStateRef.current,
                            numbersDrawn: numbersDrawnRef.current,
                            players: playersRef.current,
                            availableSets: availableSetsRef.current,
                            currentNumber: numbersDrawnRef.current[numbersDrawnRef.current.length - 1] || null,
                            winHistory: winHistoryRef.current
                        }
                    });
                    return;
                }

                // Block new players from joining mid-game
                if (gameStateRef.current !== 'WAITING') {
                    channel.send({
                        type: 'broadcast',
                        event: 'joinRejected',
                        payload: {
                            playerId: payload.id,
                            reason: 'Ván đang diễn ra. Vui lòng chờ Host bắt đầu ván mới.',
                            gameState: gameStateRef.current
                        }
                    });
                    return;
                }

                const newPlayer: Player = {
                    id: payload.id,
                    name: payload.name,
                    isReady: false,
                    setId: -1,
                    tickets: [] as any,
                    joinedAt: new Date().toISOString()
                };

                // Assign a set if available
                const setArg = availableSetsRef.current.find(s => !s.isTaken);
                if (setArg) {
                    newPlayer.setId = setArg.id;
                    newPlayer.tickets = setArg.data;

                    const updatedSets = availableSetsRef.current.map(s => s.id === setArg.id ? { ...s, isTaken: true } : s);
                    setAvailableSets(updatedSets);
                    availableSetsRef.current = updatedSets;
                }

                const updatedPlayers = [...playersRef.current, newPlayer];
                setPlayers(updatedPlayers);

                // Sync current state to ALL (including new player)
                channel.send({
                    type: 'broadcast',
                    event: 'roomDataSync',
                    payload: {
                        gameState: gameStateRef.current,
                        numbersDrawn: numbersDrawnRef.current,
                        players: updatedPlayers,
                        availableSets: availableSetsRef.current,
                        currentNumber: numbersDrawnRef.current[numbersDrawnRef.current.length - 1] || null,
                        winHistory: winHistoryRef.current
                    }
                });
            })
            .on('broadcast', { event: 'toggleReady' }, ({ payload }) => {
                setPlayers(prev => prev.map(p => p.id === payload.playerId ? { ...p, isReady: payload.isReady } : p));
                // Broadcast update to all
                channel.send({
                    type: 'broadcast',
                    event: 'playerUpdated',
                    payload: playersRef.current.map(p => p.id === payload.playerId ? { ...p, isReady: payload.isReady } : p)
                });
            })
            .on('broadcast', { event: 'kinh' }, ({ payload }) => {
                const { playerId, markedNumbers } = payload;
                verifyKinh(playerId, markedNumbers);
            })
            .on('broadcast', { event: 'requestSet' }, ({ payload }) => {
                const { playerId, setId } = payload;

                // Block set changes mid-game
                if (gameStateRef.current !== 'WAITING') return;

                const player = playersRef.current.find(p => p.id === playerId);
                if (!player) return;

                // Check if set is available
                const targetSet = availableSetsRef.current.find(s => s.id === setId);
                if (!targetSet || targetSet.isTaken) return; // Already taken or invalid

                // Release old set
                let updatedSets = [...availableSetsRef.current];
                if (player.setId !== -1) {
                    updatedSets = updatedSets.map(s => s.id === player.setId ? { ...s, isTaken: false } : s);
                }

                // Take new set
                updatedSets = updatedSets.map(s => s.id === setId ? { ...s, isTaken: true } : s);

                setAvailableSets(updatedSets);
                availableSetsRef.current = updatedSets;

                // Update player
                const updatedPlayers = playersRef.current.map(p => p.id === playerId ? { ...p, setId: setId, tickets: targetSet.data } : p);
                setPlayers(updatedPlayers);

                // Broadcast updates
                channel.send({
                    type: 'broadcast',
                    event: 'roomDataSync',
                    payload: {
                        gameState: gameStateRef.current,
                        numbersDrawn: numbersDrawnRef.current,
                        players: updatedPlayers,
                        availableSets: updatedSets,
                        currentNumber: numbersDrawnRef.current[numbersDrawnRef.current.length - 1] || null,
                        winHistory: winHistoryRef.current
                    }
                });
            })
            .on('broadcast', { event: 'unselectSet' }, ({ payload }) => {
                const { playerId } = payload;
                const player = playersRef.current.find(p => p.id === playerId);
                if (!player) return;

                // Release set
                if (player.setId !== -1) {
                    const updatedSets = availableSetsRef.current.map(s => s.id === player.setId ? { ...s, isTaken: false } : s);
                    setAvailableSets(updatedSets);
                    availableSetsRef.current = updatedSets;

                    // Update player to have no set
                    const updatedPlayers = playersRef.current.map(p => p.id === playerId ? { ...p, setId: -1, tickets: [] as any } : p);
                    setPlayers(updatedPlayers);

                    channel.send({
                        type: 'broadcast',
                        event: 'roomDataSync',
                        payload: {
                            gameState: gameStateRef.current,
                            numbersDrawn: numbersDrawnRef.current,
                            players: updatedPlayers,
                            availableSets: updatedSets,
                            currentNumber: numbersDrawnRef.current[numbersDrawnRef.current.length - 1] || null,
                            winHistory: winHistoryRef.current
                        }
                    });
                }
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // Host subscribed
                }
            });

        return () => {
            if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);
            supabase.removeChannel(channel);
        };
    }, [roomId]);

    return {
        gameState,
        players,
        numbersDrawn,
        currentNumber,
        winHistory,
        verificationPopup,
        availableSets,
        drawIntervalSeconds,
        actions: {
            startGame,
            pauseGame,
            resumeGame,
            restartGame,
            endGame,
            endBingoWindow,
            setVerificationPopup,
            setDrawInterval: setDrawIntervalSeconds,
            setDrawIntervalSeconds, // Alias for HostRoom.jsx compatibility
            removePlayer: (playerId: string) => {
                const player = playersRef.current.find(p => p.id === playerId);
                if (!player) return;

                // Release set if any
                if (player.setId !== -1) {
                    const updatedSets = availableSetsRef.current.map(s => s.id === player.setId ? { ...s, isTaken: false } : s);
                    setAvailableSets(updatedSets);
                    availableSetsRef.current = updatedSets;
                }

                // Remove player
                const updatedPlayers = playersRef.current.filter(p => p.id !== playerId);
                setPlayers(updatedPlayers);

                // Broadcast
                channelRef.current?.send({
                    type: 'broadcast',
                    event: 'roomDataSync',
                    payload: {
                        gameState: gameStateRef.current,
                        numbersDrawn: numbersDrawnRef.current,
                        players: updatedPlayers,
                        availableSets: availableSetsRef.current,
                        currentNumber: numbersDrawnRef.current[numbersDrawnRef.current.length - 1] || null,
                        winHistory: winHistoryRef.current
                    }
                });

                // Optionally send specific kick event
                /*
                channelRef.current?.send({
                    type: 'broadcast',
                    event: 'playerRemoved',
                    payload: { playerId }
                });
                */
            }
        }
    };
};
