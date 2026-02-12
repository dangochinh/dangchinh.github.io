export type TicketRow = number[];
export type TicketGrid = TicketRow[]; // 5 rows of 9 numbers (0 for empty)
export type TicketSet = TicketGrid[]; // Usually 6 tickets per set, or 3-5 depending on game

/**
 * Checks if a player has achieved Bingo (Kinh) based on their tickets and drawn numbers.
 * A Bingo occurs when a player has a full horizontal row of 5 numbers marked on any of their tickets.
 * 
 * @param {TicketSet} tickets - Array of ticket grids (each grid is 5x9).
 * @param {number[]} drawnNumbers - Array of numbers that have been drawn.
 * @returns {boolean} - True if Bingo, false otherwise.
 */
export const checkForBingo = (tickets: TicketSet, drawnNumbers: number[]): boolean => {
    if (!tickets || !Array.isArray(tickets)) return false;
    if (!drawnNumbers || !Array.isArray(drawnNumbers)) return false;

    for (const ticket of tickets) {
        // ticket is a 5x9 grid (or 3x9 for some variants, but generalized here)
        for (const row of ticket) {
            // Count non-zero numbers in the row
            const numbersInRow = row.filter(n => n !== 0);

            // Loto rows always have 5 numbers.
            // Check if ALL numbers in this row are in drawnNumbers
            const isRowFull = numbersInRow.length > 0 && numbersInRow.every(num => drawnNumbers.includes(num));

            if (isRowFull) {
                return true;
            }
        }
    }
    return false;
};

/**
 * Validates a "Kinh" claim.
 * Currently alias for checkForBingo, but could be extended for determining *which* row won.
 */
export const validateKinh = (tickets: TicketSet, drawnNumbers: number[]): boolean => {
    return checkForBingo(tickets, drawnNumbers);
};
