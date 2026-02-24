import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Player, TicketSetInfo, GameState, TicketSet, WinRecord } from '../types';
import { generateUUID } from '../utils/uuid';

// --- Session Cache Helpers ---
const SESSION_CACHE_KEY = 'bingo_game_cache';

interface GameSessionCache {
    roomId: string;
    gameState: GameState;
    mySetId: number | null;
    myTickets: TicketSet | null;
    numbersDrawn: number[];
    currentNumber: number | null;
    winHistory: WinRecord[];
    isReady: boolean;
    timestamp: number;
}

export const saveGameSession = (data: GameSessionCache): void => {
    try {
        sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(data));
    } catch {
        // sessionStorage might be full or unavailable
    }
};

export const loadGameSession = (roomId: string): GameSessionCache | null => {
    try {
        const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
        if (!raw) return null;
        const data: GameSessionCache = JSON.parse(raw);
        // Only restore if same room and cache is less than 30 minutes old
        if (data.roomId !== roomId) return null;
        if (Date.now() - data.timestamp > 30 * 60 * 1000) return null;
        return data;
    } catch {
        return null;
    }
};

export const clearGameSession = (): void => {
    try {
        sessionStorage.removeItem(SESSION_CACHE_KEY);
    } catch {
        // ignore
    }
};

// --- Hook ---
export const usePlayerGame = (roomId: string | undefined, playerName: string | undefined) => {
    const [gameState, setGameState] = useState<GameState>('WAITING');
    const [availableSets, setAvailableSets] = useState<TicketSetInfo[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [isReady, setIsReady] = useState<boolean>(false);
    const [numbersDrawn, setNumbersDrawn] = useState<number[]>([]);
    const [currentNumber, setCurrentNumber] = useState<number | null>(null);
    const [winHistory, setWinHistory] = useState<WinRecord[]>([]);
    const [mySetId, setMySetId] = useState<number | null>(null);
    const [myTickets, setMyTickets] = useState<TicketSet | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [lastEvent, setLastEvent] = useState<any>(null); // For toasts/alerts
    const [isHostConnected, setIsHostConnected] = useState<boolean>(true);
    const [isConnecting, setIsConnecting] = useState<boolean>(true);
    const [isReconnecting, setIsReconnecting] = useState<boolean>(false);
    const [coWinners, setCoWinners] = useState<string[]>([]); // Names of co-Bingo winners

    const channelRef = useRef<RealtimeChannel | null>(null);
    const myIdRef = useRef<string | null>(null);
    const hostFoundRef = useRef<boolean>(false);
    const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const retryCountRef = useRef<number>(0);
    const maxRetries = 2;

    // Initialize my ID
    useEffect(() => {
        let id = sessionStorage.getItem('bingo_player_id');
        if (!id) {
            id = generateUUID();
            sessionStorage.setItem('bingo_player_id', id);
        }
        myIdRef.current = id;
    }, []);

    // Restore cached session on mount
    useEffect(() => {
        if (!roomId) return;
        const cached = loadGameSession(roomId);
        if (cached) {
            setGameState(cached.gameState);
            setMySetId(cached.mySetId);
            setMyTickets(cached.myTickets);
            setNumbersDrawn(cached.numbersDrawn);
            setCurrentNumber(cached.currentNumber);
            setWinHistory(cached.winHistory);
            setIsReady(cached.isReady);
            setIsReconnecting(true);
        }
    }, [roomId]);

    // Retry join logic
    const retryJoin = useCallback(() => {
        if (!channelRef.current || !myIdRef.current || !playerName) return;
        channelRef.current.send({
            type: 'broadcast',
            event: 'requestJoin',
            payload: {
                id: myIdRef.current,
                name: playerName
            }
        });
    }, [playerName]);

    const joinRoom = useCallback(() => {
        if (!roomId || !playerName || !myIdRef.current) return;

        // Cleanup any existing channel
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }

        const channel = supabase.channel(`room:${roomId}`, {
            config: { presence: { key: myIdRef.current } }
        });

        channelRef.current = channel;

        // Connection timeout with retry
        const startConnectionTimeout = () => {
            if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
            connectionTimeoutRef.current = setTimeout(() => {
                if (!hostFoundRef.current) {
                    if (retryCountRef.current < maxRetries) {
                        retryCountRef.current++;
                        // Retry sending requestJoin
                        retryJoin();
                        startConnectionTimeout(); // Reset timeout for retry
                    } else {
                        // Check if we have cached data - show reconnect option instead of hard error
                        const cached = loadGameSession(roomId);
                        if (cached) {
                            setError("Không thể kết nối lại với Chủ phòng. Phòng có thể đã kết thúc.");
                        } else {
                            setError("Không tìm thấy phòng hoặc Chủ phòng không online!");
                        }
                        setIsConnecting(false);
                        setIsReconnecting(false);
                    }
                }
            }, 5000);
        };

        startConnectionTimeout();

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const hasHost = 'host' in state;
                setIsHostConnected(hasHost);
            })
            .on('broadcast', { event: 'roomDataSync' }, ({ payload }) => {
                hostFoundRef.current = true;
                if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
                retryCountRef.current = 0;
                setIsHostConnected(true);
                setIsConnecting(false);
                setIsReconnecting(false);
                setError(null);
                setGameState(payload.gameState);
                setAvailableSets(payload.availableSets);
                setPlayers(payload.players);
                setNumbersDrawn(payload.numbersDrawn);
                setCurrentNumber(payload.currentNumber);
                setWinHistory(payload.winHistory);

                const me = payload.players.find((p: Player) => p.id === myIdRef.current);
                if (me) {
                    setMySetId(me.setId);
                    setIsReady(me.isReady);
                    setMyTickets(me.tickets);

                    // Cache session data for reconnect
                    saveGameSession({
                        roomId: roomId,
                        gameState: payload.gameState,
                        mySetId: me.setId,
                        myTickets: me.tickets,
                        numbersDrawn: payload.numbersDrawn,
                        currentNumber: payload.currentNumber,
                        winHistory: payload.winHistory,
                        isReady: me.isReady,
                        timestamp: Date.now()
                    });
                }
            })
            .on('broadcast', { event: 'playerJoined' }, ({ payload }) => {
                setPlayers(payload);
            })
            .on('broadcast', { event: 'numberDrawn' }, ({ payload }) => {
                setNumbersDrawn(payload.history);
                setCurrentNumber(payload.number);

                // Update cache with new drawn numbers
                if (roomId) {
                    const cached = loadGameSession(roomId);
                    if (cached) {
                        saveGameSession({
                            ...cached,
                            numbersDrawn: payload.history,
                            currentNumber: payload.number,
                            timestamp: Date.now()
                        });
                    }
                }
            })
            .on('broadcast', { event: 'gameStateChanged' }, ({ payload }) => {
                setGameState(payload);
                // Update cache
                if (roomId) {
                    const cached = loadGameSession(roomId);
                    if (cached) {
                        saveGameSession({ ...cached, gameState: payload, timestamp: Date.now() });
                    }
                }
            })
            .on('broadcast', { event: 'gameEnded' }, ({ payload }) => {
                setGameState('ENDED');
                setLastEvent({ type: 'gameEnded', data: payload });
                if (payload.winRecord) {
                    setWinHistory(prev => [...prev, payload.winRecord]);
                }
                setCoWinners([]);
            })
            .on('broadcast', { event: 'bingoConfirmed' }, ({ payload }) => {
                setGameState('BINGO_WINDOW');
                setLastEvent({ type: 'bingoConfirmed', data: payload });
                setCoWinners([]);
            })
            .on('broadcast', { event: 'coWinnerAdded' }, ({ payload }) => {
                setCoWinners(prev => [...prev, payload.name]);
            })
            .on('broadcast', { event: 'gameRestarted' }, ({ payload }) => {
                setGameState(payload.gameState);
                setPlayers(payload.players);
                setWinHistory(payload.winHistory);
                setNumbersDrawn([]);
                setCurrentNumber(null);
                setLastEvent(null);
                setCoWinners([]);
                const me = payload.players.find((p: Player) => p.id === myIdRef.current);
                if (me) {
                    setIsReady(me.isReady);
                }
                // Clear cache on restart (new round)
                clearGameSession();
            })
            .on('broadcast', { event: 'joinRejected' }, ({ payload }) => {
                if (payload.playerId === myIdRef.current) {
                    setGameState(payload.gameState || 'PLAYING');
                    setLastEvent({ type: 'joinRejected', data: payload });
                }
            })
            .on('broadcast', { event: 'setsUpdated' }, ({ payload }) => {
                setAvailableSets(payload);
            })
            .on('broadcast', { event: 'playerUpdated' }, ({ payload }) => {
                setPlayers(payload);
                const me = payload.find((p: Player) => p.id === myIdRef.current);
                if (me) {
                    setMySetId(me.setId);
                    setIsReady(me.isReady);
                    setMyTickets(me.tickets);
                }
            })
            .on('broadcast', { event: 'verificationResult' }, ({ payload }) => {
                if (payload.playerId === myIdRef.current) {
                    // Handle verification result for me
                }
                setLastEvent({ type: 'verification', ...payload });
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    // Join request
                    channel.send({
                        type: 'broadcast',
                        event: 'requestJoin',
                        payload: {
                            id: myIdRef.current,
                            name: playerName
                        }
                    });
                }
            });

        return () => {
            if (connectionTimeoutRef.current) clearTimeout(connectionTimeoutRef.current);
            supabase.removeChannel(channel);
            channelRef.current = null;
        };
    }, [roomId, playerName, retryJoin]);

    useEffect(() => {
        if (roomId && playerName) {
            joinRoom();
        }
    }, [roomId, playerName, joinRoom]);

    // Manual reconnect action
    const reconnect = useCallback(() => {
        setError(null);
        setIsConnecting(true);
        setIsReconnecting(true);
        hostFoundRef.current = false;
        retryCountRef.current = 0;
        joinRoom();
    }, [joinRoom]);

    const selectSet = (setId: number) => {
        if (!channelRef.current) return;
        channelRef.current.send({
            type: 'broadcast',
            event: 'requestSet',
            payload: { playerId: myIdRef.current, setId }
        });
    };

    const toggleReady = () => {
        if (!channelRef.current) return;
        channelRef.current.send({
            type: 'broadcast',
            event: 'toggleReady',
            payload: { playerId: myIdRef.current, isReady: !isReady }
        });
    };

    const claimBingo = (markedNumbers: number[]) => {
        if (!channelRef.current) return;
        channelRef.current.send({
            type: 'broadcast',
            event: 'kinh',
            payload: { playerId: myIdRef.current, markedNumbers }
        });
    };

    const leaveSeat = () => {
        if (!channelRef.current) return;
        channelRef.current.send({
            type: 'broadcast',
            event: 'unselectSet',
            payload: { playerId: myIdRef.current }
        });
    };

    const closeVerificationPopup = () => {
        setLastEvent(null);
    };

    return {
        gameState,
        availableSets,
        players,
        isReady,
        numbersDrawn,
        currentNumber,
        winHistory,
        mySetId,
        myTickets,
        error,
        lastEvent,
        actions: {
            selectSet,
            toggleReady,
            claimBingo,
            sendKinh: claimBingo,
            leaveSeat,
            closeVerificationPopup,
            reconnect
        },
        isHostConnected,
        isConnecting,
        isReconnecting,
        coWinners
    };
};
