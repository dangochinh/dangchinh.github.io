/**
 * Simulation: 16 players × 100 games — RANDOM vs REGULATED comparison
 */
const fs = require('fs');
const LotoController = require('./lotoController');
const { getAllTicketSets } = require('./utils/ticketGenerator');

const allSets = getAllTicketSets();
const players = allSets.slice(0, 16).map((set) => ({
    name: set.name,
    tickets: set.data
}));

const NUM_GAMES = 200;

function checkBingoForPlayer(player, drawnSet) {
    for (const ticket of player.tickets) {
        for (const row of ticket) {
            const nonZero = row.filter(n => n !== 0);
            if (nonZero.length === 5 && nonZero.every(n => drawnSet.has(n))) return true;
        }
    }
    return false;
}

function runSimulation(mode) {
    const winCount = {};
    const drawsToFirstBingo = [];
    players.forEach(p => { winCount[p.name] = 0; });

    for (let game = 0; game < NUM_GAMES; game++) {
        const drawnNumbers = new Set();
        const allNumbers = Array.from({ length: 90 }, (_, i) => i + 1);
        let ctrl = null;

        if (mode === 'REGULATED') {
            ctrl = new LotoController(players);
        }

        let gameEnded = false;
        for (let draw = 0; draw < 90; draw++) {
            let num;
            if (mode === 'REGULATED' && ctrl) {
                const result = ctrl.drawNextNumber();
                if (!result) break;
                num = result.number;
                drawnNumbers.add(num); // keep in sync for checkBingo
            } else {
                // RANDOM mode
                const remaining = allNumbers.filter(n => !drawnNumbers.has(n));
                num = remaining[Math.floor(Math.random() * remaining.length)];
                drawnNumbers.add(num);
            }

            const winners = players.filter(p => checkBingoForPlayer(p, mode === 'REGULATED' && ctrl ? ctrl.drawnNumbers : drawnNumbers));
            if (winners.length > 0) {
                drawsToFirstBingo.push(drawnNumbers.size);
                winners.forEach(w => { winCount[w.name]++; });
                gameEnded = true;
                break;
            }
        }
        if (!gameEnded) drawsToFirstBingo.push(90);
    }

    const min = Math.min(...drawsToFirstBingo);
    const max = Math.max(...drawsToFirstBingo);
    const avg = (drawsToFirstBingo.reduce((a, b) => a + b, 0) / drawsToFirstBingo.length).toFixed(1);

    return {
        mode,
        winsByTicket: Object.entries(winCount)
            .map(([name, wins]) => ({ name, wins }))
            .sort((a, b) => b.wins - a.wins),
        drawStats: {
            min: min,
            max: max,
            avg: parseFloat(avg)
        }
    };
}

const regulated_10_20 = runSimulation('REGULATED');

// Run REGULATED with K=[15,25] by temporarily patching
const origRandom = Math.random;
let kCallCount = 0;
const regulated_15_25 = (() => {
    const wc = {};
    const draws = [];
    players.forEach(p => { wc[p.name] = 0; });

    for (let game = 0; game < NUM_GAMES; game++) {
        const ctrl = new LotoController(players);
        // Override K to [15, 25]
        ctrl.k_threshold = Math.floor(Math.random() * 11) + 15;
        const drawnNumbers = new Set();

        let gameEnded = false;
        for (let draw = 0; draw < 90; draw++) {
            const result = ctrl.drawNextNumber();
            if (!result) break;

            const winners = players.filter(p => checkBingoForPlayer(p, ctrl.drawnNumbers));
            if (winners.length > 0) {
                draws.push(ctrl.drawnNumbers.size);
                winners.forEach(w => { wc[w.name]++; });
                gameEnded = true;
                break;
            }
        }
        if (!gameEnded) draws.push(90);
    }

    const min = Math.min(...draws);
    const max = Math.max(...draws);
    const avg = (draws.reduce((a, b) => a + b, 0) / draws.length).toFixed(1);
    return {
        mode: 'REGULATED_K15_25',
        winsByTicket: Object.entries(wc).map(([name, wins]) => ({ name, wins })).sort((a, b) => b.wins - a.wins),
        drawStats: { min, max, avg: parseFloat(avg) }
    };
})();

const random = runSimulation('RANDOM');

const summary = {
    config: { players: 16, gamesPerMode: NUM_GAMES },
    'REGULATED_K10_20': regulated_10_20,
    'REGULATED_K15_25': regulated_15_25,
    RANDOM: random
};

fs.writeFileSync('simulation_100games.json', JSON.stringify(summary, null, 2), 'utf8');
console.log('Done');
