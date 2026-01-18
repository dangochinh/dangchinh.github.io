const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const GameManager = require('./gameManager');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all for dev
        methods: ["GET", "POST"]
    }
});

const gameManager = new GameManager(io);

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('createRoom', (data, callback) => {
        const roomId = gameManager.createRoom(socket.id);
        socket.join(roomId);
        callback({ roomId });
    });

    socket.on('joinRoom', ({ roomId, playerName }, callback) => {
        const res = gameManager.joinRoom(roomId, socket.id, playerName);
        if (res.error) {
            callback({ error: res.error });
        } else {
            socket.join(roomId);
            callback({ success: true, room: res.room });
            io.to(roomId).emit('playerJoined', res.room.players);
            // Also emit history update to the joining player? The callback handles it.
            // But we might want to broadcast history if it changes dynamically (only on win)
        }
    });

    socket.on('selectSet', ({ roomId, setId }, callback) => {
        const res = gameManager.selectSet(roomId, socket.id, setId);
        if (res && res.success) {
            callback(res);
            // Notify room that set is taken
            const room = gameManager.rooms.get(roomId);
            io.to(roomId).emit('setsUpdated', room.availableSets);
            io.to(roomId).emit('playerUpdated', room.players);
        } else {
            callback({ error: res ? res.error : 'Failed' });
        }
    });

    socket.on('action', ({ roomId, action }) => {
        // Host actions
        const room = gameManager.rooms.get(roomId);
        if (!room || room.hostId !== socket.id) return;

        if (action === 'START') gameManager.startGame(roomId);
        if (action === 'PAUSE') gameManager.pauseGame(roomId);
        if (action === 'RESUME') gameManager.resumeGame(roomId);
        if (action === 'RESTART') gameManager.restartGame(roomId);

        io.to(roomId).emit('gameStateChanged', room.gameState);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // gameManager.leaveRoom(socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
