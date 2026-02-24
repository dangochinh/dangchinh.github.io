import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveGameSession, loadGameSession, clearGameSession } from './usePlayerGame';

// Mock sessionStorage
const mockSessionStorage = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

Object.defineProperty(globalThis, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true
});

describe('Game Session Cache', () => {
    beforeEach(() => {
        mockSessionStorage.clear();
    });

    const mockSession = {
        roomId: '123456',
        gameState: 'PLAYING' as const,
        mySetId: 3,
        myTickets: [[[1, 2, 3, 4, 5]]],
        numbersDrawn: [1, 2, 3, 10, 20],
        currentNumber: 20,
        winHistory: [],
        isReady: true,
        timestamp: Date.now()
    };

    describe('saveGameSession', () => {
        it('should save session data to sessionStorage', () => {
            saveGameSession(mockSession);
            const raw = mockSessionStorage.getItem('bingo_game_cache');
            expect(raw).not.toBeNull();
            const parsed = JSON.parse(raw!);
            expect(parsed.roomId).toBe('123456');
            expect(parsed.gameState).toBe('PLAYING');
            expect(parsed.mySetId).toBe(3);
            expect(parsed.numbersDrawn).toEqual([1, 2, 3, 10, 20]);
        });
    });

    describe('loadGameSession', () => {
        it('should return cached session for matching room', () => {
            saveGameSession(mockSession);
            const loaded = loadGameSession('123456');
            expect(loaded).not.toBeNull();
            expect(loaded!.roomId).toBe('123456');
            expect(loaded!.gameState).toBe('PLAYING');
            expect(loaded!.mySetId).toBe(3);
            expect(loaded!.myTickets).toEqual([[[1, 2, 3, 4, 5]]]);
            expect(loaded!.currentNumber).toBe(20);
            expect(loaded!.isReady).toBe(true);
        });

        it('should return null for different room', () => {
            saveGameSession(mockSession);
            const loaded = loadGameSession('999999');
            expect(loaded).toBeNull();
        });

        it('should return null when no cache exists', () => {
            const loaded = loadGameSession('123456');
            expect(loaded).toBeNull();
        });

        it('should return null for expired cache (>30 min)', () => {
            const expiredSession = {
                ...mockSession,
                timestamp: Date.now() - 31 * 60 * 1000 // 31 minutes ago
            };
            saveGameSession(expiredSession);
            const loaded = loadGameSession('123456');
            expect(loaded).toBeNull();
        });

        it('should return session for non-expired cache (<30 min)', () => {
            const recentSession = {
                ...mockSession,
                timestamp: Date.now() - 10 * 60 * 1000 // 10 minutes ago
            };
            saveGameSession(recentSession);
            const loaded = loadGameSession('123456');
            expect(loaded).not.toBeNull();
            expect(loaded!.roomId).toBe('123456');
        });

        it('should handle corrupted JSON gracefully', () => {
            mockSessionStorage.setItem('bingo_game_cache', 'not-json');
            const loaded = loadGameSession('123456');
            expect(loaded).toBeNull();
        });
    });

    describe('clearGameSession', () => {
        it('should remove cached session', () => {
            saveGameSession(mockSession);
            expect(mockSessionStorage.getItem('bingo_game_cache')).not.toBeNull();
            clearGameSession();
            expect(mockSessionStorage.getItem('bingo_game_cache')).toBeNull();
        });

        it('should not throw when no cache exists', () => {
            expect(() => clearGameSession()).not.toThrow();
        });
    });

    describe('Session continuity', () => {
        it('should update cache with new drawn numbers', () => {
            saveGameSession(mockSession);

            // Simulate new number drawn
            const cached = loadGameSession('123456')!;
            const updated = {
                ...cached,
                numbersDrawn: [...cached.numbersDrawn, 50],
                currentNumber: 50,
                timestamp: Date.now()
            };
            saveGameSession(updated);

            const reloaded = loadGameSession('123456')!;
            expect(reloaded.numbersDrawn).toContain(50);
            expect(reloaded.currentNumber).toBe(50);
        });

        it('should preserve tickets across cache updates', () => {
            saveGameSession(mockSession);

            const cached = loadGameSession('123456')!;
            saveGameSession({
                ...cached,
                gameState: 'PAUSED',
                timestamp: Date.now()
            });

            const reloaded = loadGameSession('123456')!;
            expect(reloaded.gameState).toBe('PAUSED');
            expect(reloaded.myTickets).toEqual(mockSession.myTickets);
            expect(reloaded.mySetId).toBe(mockSession.mySetId);
        });
    });
});
