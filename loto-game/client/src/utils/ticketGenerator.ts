
import ticketData from '../data/ticketData.json';
import { TicketGrid } from './gameLogic';

// Define the shape of the JSON data
interface PredefinedTicket {
    id: number;
    name: string;
    color: string;
    sheets: TicketGrid[]; // The JSON likely has 'sheets' which matches our TicketGrid structure (array of number[][])
}

interface TicketData {
    tickets: PredefinedTicket[];
}

// Cast import to typed data
const loadedTicketData = ticketData as TicketData;

// Load predefined tickets from JSON import
function loadPredefinedTickets(): PredefinedTicket[] {
    try {
        return loadedTicketData.tickets;
    } catch (error) {
        console.error('Error loading predefined tickets:', error);
        return [];
    }
}

// Main function to get all ticket sets
export function getAllTicketSets() {
    const predefinedTickets = loadPredefinedTickets();
    const allSets: { id: number; name: string; color: string; data: TicketGrid[] }[] = [];

    // Add the predefined tickets
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
