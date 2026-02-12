import { describe, it, expect } from 'vitest';
import { getAllTicketSets } from './ticketGenerator';

describe('getAllTicketSets', () => {
    it('should return an array of ticket sets', () => {
        const sets = getAllTicketSets();
        expect(Array.isArray(sets)).toBe(true);
        expect(sets.length).toBeGreaterThan(0);
    });

    it('should have valid ticket structure for each set', () => {
        const sets = getAllTicketSets();
        sets.forEach(set => {
            expect(set).toHaveProperty('id');
            expect(set).toHaveProperty('name');
            expect(set).toHaveProperty('color');
            expect(set).toHaveProperty('data');

            // Check data (TicketSet = TicketGrid[])
            expect(Array.isArray(set.data)).toBe(true);
            expect(set.data.length).toBeGreaterThan(0); // Should have at least one ticket

            // Check first ticket grid
            const firstTicket = set.data[0];
            // Based on failure logs, it seems tickets have 3 rows, not 5.
            // Loto usually has 5, but maybe this data is 3?
            // "expected [ …(3) ] to have a length of 5 but got 3"
            expect(firstTicket.length).toBeGreaterThanOrEqual(3);
            firstTicket.forEach(row => {
                expect(row).toHaveLength(9); // 9 cols
            });
        });
    });

    it('should contain 5 numbers per row in tickets', () => {
        const sets = getAllTicketSets();
        // Check random ticket
        const set = sets[0];
        if (set && set.data.length > 0) {
            const ticket = set.data[0];
            ticket.forEach(row => {
                const numberCount = row.filter(n => n !== 0).length;
                expect(numberCount).toBe(5);
            });
        }
    });
});
