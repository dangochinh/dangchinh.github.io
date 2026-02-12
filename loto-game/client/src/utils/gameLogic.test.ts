import { describe, it, expect } from 'vitest';
import { checkForBingo } from './gameLogic';

describe('checkForBingo', () => {

    it('should return false if tickets or drawnNumbers are invalid', () => {
        expect(checkForBingo([], [])).toBe(false);
        // @ts-ignore
        expect(checkForBingo(null, [])).toBe(false);
    });

    it('should return true when a row is fully drawn', () => {
        const ticket = [
            [1, 2, 3, 4, 5],
            [10, 11, 0, 13, 14], // 0 is empty/ignored in logic? Logic filters n !== 0
            [20, 21, 22, 23, 24],
            [30, 31, 32, 33, 34],
            [40, 41, 42, 43, 44]
        ];
        // Note: Logic says "Count non-zero numbers... if ALL numbers in this row are in drawnNumbers"
        // Let's test a standard row [1, 2, 3, 4, 5]
        const drawn = [1, 2, 3, 4, 5, 99];
        expect(checkForBingo([ticket], drawn)).toBe(true);
    });

    it('should return false if a row is partially drawn', () => {
        const ticket = [
            [1, 2, 3, 4, 5],
            [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]
        ];
        const drawn = [1, 2, 3, 4]; // Missing 5
        expect(checkForBingo([ticket], drawn)).toBe(false);
    });

    it('should ignore zeros (empty spaces) and validate remaining numbers', () => {
        // Loto logic usually implies 5 numbers per row are valid numbers.
        // If a row has [10, 0, 11, 0, 12, 0, 13, 0, 14] (9 cols), checking filtered non-zeros.
        // Our mock simplied to just numbers for now, but let's test specific logic
        const rowWithZeros = [10, 0, 11, 0, 12, 0, 13, 0, 14];
        const ticket = [
            rowWithZeros,
            [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]
        ];
        const drawn = [10, 11, 12, 13, 14];
        expect(checkForBingo([ticket], drawn)).toBe(true);
    });
});
