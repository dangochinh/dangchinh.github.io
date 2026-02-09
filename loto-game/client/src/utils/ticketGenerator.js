import ticketData from '../data/ticketData.json';

// Load predefined tickets from JSON import
function loadPredefinedTickets() {
    try {
        return ticketData.tickets;
    } catch (error) {
        console.error('Error loading predefined tickets:', error);
        return [];
    }
}

// Generate a random ticket set (original logic)
export function generateRandomSet() {
    const colRanges = [
        { min: 1, max: 9 },
        { min: 10, max: 19 },
        { min: 20, max: 29 },
        { min: 30, max: 39 },
        { min: 40, max: 49 },
        { min: 50, max: 59 },
        { min: 60, max: 69 },
        { min: 70, max: 79 },
        { min: 80, max: 90 },
    ];

    const tickets = [];
    for (let t = 0; t < 3; t++) {
        tickets.push(generateOneTicket(colRanges));
    }
    return tickets;
}

function generateOneTicket(colRanges) {
    let grid = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

    const layout = generateLayout();

    for (let c = 0; c < 9; c++) {
        let countInCol = 0;
        for (let r = 0; r < 3; r++) {
            if (layout[r][c] === 1) countInCol++;
        }

        if (countInCol > 0) {
            const nums = getUniqueRandomInts(colRanges[c].min, colRanges[c].max, countInCol);
            let numIdx = 0;
            for (let r = 0; r < 3; r++) {
                if (layout[r][c] === 1) {
                    grid[r][c] = nums[numIdx++];
                }
            }
        }
    }

    return grid;
}

function generateLayout() {
    let grid = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

    for (let r = 0; r < 3; r++) {
        let cols = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        shuffleArray(cols);
        for (let i = 0; i < 5; i++) {
            grid[r][cols[i]] = 1;
        }
    }

    return grid;
}

function getUniqueRandomInts(min, max, count) {
    const arr = [];
    while (arr.length < count) {
        const r = Math.floor(Math.random() * (max - min + 1)) + min;
        if (!arr.includes(r)) arr.push(r);
    }
    return arr.sort((a, b) => a - b);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Main function to get all ticket sets (only 16 predefined)
export function getAllTicketSets() {
    const predefinedTickets = loadPredefinedTickets();
    const allSets = [];

    // Add the 16 predefined tickets
    if (predefinedTickets) {
        predefinedTickets.forEach(ticket => {
            allSets.push({
                id: ticket.id,
                name: ticket.name,
                color: ticket.color,
                data: ticket.sheets
            });
        });
    }

    return allSets;
}
