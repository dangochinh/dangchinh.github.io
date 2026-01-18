const { generateRandomSet } = require('./utils/ticketGenerator');

class GameManager {
    constructor(io) {
        this.io = io;
        this.rooms = new Map(); // roomId -> { players, ... }

        // Auto-generate 30 sets of tickets for users to choose from
        // In a real app, we might generate on demand or per room.
        // Requirement: "Chọn 1 trong 30 bộ số (phiếu) còn trống"
        // So we generate 30 sets per room? Yes.
    }

    createRoom(hostSocketId) {
        const roomId = this.generateRoomId();

        const availableSets = [];
        for (let i = 1; i <= 30; i++) {
            availableSets.push({
                id: i,
                data: generateRandomSet(),
                isTaken: false
            });
        }

        this.rooms.set(roomId, {
            id: roomId,
            hostId: hostSocketId,
            players: [], // { socketId, name, setId }
            gameState: 'WAITING', // WAITING, PLAYING, PAUSED, ENDED
            numbersDrawn: [],
            availableSets: availableSets,
            drawInterval: null,
            currentNumber: null
        });

        return roomId;
    }

    joinRoom(roomId, playerSocketId, playerName) {
        const room = this.rooms.get(roomId);
        if (!room) return { error: 'Room not found' };
        if (room.gameState !== 'WAITING') return { error: 'Game already started' };

        // Player joins, hasn't picked ticket yet
        const player = {
            id: playerSocketId,
            name: playerName,
            setId: null,
            tickets: null
        };
        room.players.push(player);
        return { success: true, room };
    }

    selectSet(roomId, playerId, setId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        const set = room.availableSets.find(s => s.id === setId);
        if (!set || set.isTaken) return { error: 'Set unavailable' };

        const player = room.players.find(p => p.id === playerId);
        if (!player) return;

        // Release old set if any
        if (player.setId) {
            const oldSet = room.availableSets.find(s => s.id === player.setId);
            if (oldSet) oldSet.isTaken = false;
        }

        set.isTaken = true;
        player.setId = setId;
        player.tickets = set.data;

        return { success: true, tickets: set.data };
    }

    leaveRoom(socketId) {
        // Handle disconnection
        // If Host leaves, end game? Or keep alive?
        // If Player leaves, keep their set taken for "reconnection"?
        // Prompt: "Xử lý trường hợp User bị rớt mạng và quay lại phòng vẫn giữ nguyên bộ số."
        // We should map socketId to a persistent user ID or just use cookie/localstorage on client.
        // For now, if socket disconnects, we might keep them in 'players' but mark disconnected.
        // But socketId changes on reconnect. We need a persistent ID.
        // Simplification: We won't handle complex auth. Just rejoin with same name? Or handle via client sending prev details.
    }

    startGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return;
        room.gameState = 'PLAYING';
        this.startDrawLoop(roomId);
    }

    pauseGame(roomId) {
        const room = this.rooms.get(roomId);
        if (room && room.drawInterval) {
            clearInterval(room.drawInterval);
            room.drawInterval = null;
            room.gameState = 'PAUSED';
        }
    }

    resumeGame(roomId) {
        const room = this.rooms.get(roomId);
        if (room && room.gameState === 'PAUSED') {
            room.gameState = 'PLAYING';
            this.startDrawLoop(roomId);
        }
    }

    startDrawLoop(roomId) {
        const room = this.rooms.get(roomId);
        if (room.drawInterval) clearInterval(room.drawInterval);

        // Speed: 5 seconds per number?
        room.drawInterval = setInterval(() => {
            this.drawNumber(roomId);
        }, 4000);
    }

    drawNumber(roomId) {
        const room = this.rooms.get(roomId);
        if (!room) return;

        if (room.numbersDrawn.length >= 90) {
            this.endGame(roomId);
            return;
        }

        let num;
        do {
            num = Math.floor(Math.random() * 90) + 1;
        } while (room.numbersDrawn.includes(num));

        room.numbersDrawn.push(num);
        room.currentNumber = num;

        this.io.to(roomId).emit('numberDrawn', { number: num, history: room.numbersDrawn });

        // Check Bingo?
        // Actually, usually Players check their own and shout Bingo. 
        // But Prompt says: "Hệ thống phải tự động kiểm tra và thông báo 'Bingo' ngay lập tức".
        this.checkBingo(room);
    }

    checkBingo(room) {
        // Check all players
        for (const player of room.players) {
            if (!player.tickets) continue;

            // Check each ticket in the set (3 tickets)
            for (const ticket of player.tickets) {
                // Check each row (3 rows)
                for (let r = 0; r < 3; r++) {
                    // Counts matches in row
                    let matches = 0;
                    for (let c = 0; c < 9; c++) {
                        const val = ticket[r][c];
                        if (val !== 0 && room.numbersDrawn.includes(val)) {
                            matches++;
                        }
                    }
                    if (matches === 5) {
                        // BINGO!
                        this.handleBingo(room, player);
                        return;
                    }
                }
            }
        }
    }

    handleBingo(room, winner) {
        this.pauseGame(room.id);
        this.io.to(room.id).emit('gameEnded', {
            winner: winner.name,
            reason: 'BINGO',
            fullHistory: room.numbersDrawn
        });
        room.gameState = 'ENDED';
    }

    endGame(roomId) {
        this.pauseGame(roomId);
        this.io.to(roomId).emit('gameEnded', { winner: null, reason: 'Full Board' });
    }

    generateRoomId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
}

module.exports = GameManager;
