export type TicketRow = number[];
export type TicketGrid = TicketRow[]; // 5 rows of 9 numbers (0 for empty)
export type TicketSet = TicketGrid[]; // Usually 6 tickets per set

export type GameState = 'WAITING' | 'PLAYING' | 'PAUSED' | 'ENDED';

export interface Player {
    id: string;
    name: string;
    isReady: boolean;
    setId: number;
    tickets: TicketSet; // Was sometimes any[], now strictly typed
    joinedAt?: string;
}

export interface TicketSetInfo {
    id: number;
    name: string;
    color: string;
    data: TicketSet;
    isTaken: boolean;
}

export interface WinRecord {
    name: string;
    timestamp: Date | string;
    round: number;
    reason: 'BINGO' | 'KINH_SAI';
    type: 'win' | 'fail';
    players?: Player[];
    failures?: WinRecord[];
}

export interface VerificationPopup {
    playerName: string;
    success: boolean;
    message: string;
    markedNumbers: number[];
    drawnNumbers: number[];
    playerTickets?: TicketSet;
}
