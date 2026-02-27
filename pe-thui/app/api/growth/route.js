import { getGoogleSheets, SHEET_ID } from '../../lib/google-sheets';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        if (!code) return NextResponse.json({ success: true, data: [] });

        const sheets = await getGoogleSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${code}!A7:D`, // Data starts at A7
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return NextResponse.json({ success: true, data: [] });
        }

        const data = rows.map((row, index) => ({
            id: index + 7, // Physical row number in Sheets
            date: row[0],
            ageMonths: Number(row[1]),
            weight: Number(row[2]),
            height: Number(row[3])
        }));

        return NextResponse.json({ success: true, data });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const code = body.code;
        if (!code) throw new Error('Missing code');

        const sheets = await getGoogleSheets();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${code}!A6:D6`,
        });

        if (!response.data.values || response.data.values.length === 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `${code}!A6:D6`,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [['Ngày đo', 'Tháng tuổi', 'Cân nặng', 'Chiều cao']]
                }
            });
        }

        const newRow = [
            body.date,
            body.ageMonths,
            body.weight,
            body.height
        ];

        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: `${code}!A7:D`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [newRow]
            }
        });

        return NextResponse.json({ success: true, data: body });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = parseInt(searchParams.get('id'));
        if (!id || isNaN(id)) throw new Error('Invalid or missing ID');
        const code = searchParams.get('code');
        if (!code) throw new Error('Missing code');

        const sheets = await getGoogleSheets();

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${code}!A7:D`,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) return NextResponse.json({ success: true });

        // Filter out the row that matches the physical row number
        const newRows = rows.filter((_, index) => (index + 7) !== id);

        await sheets.spreadsheets.values.clear({
            spreadsheetId: SHEET_ID,
            range: `${code}!A7:D`, // Clear data rows
        });

        if (newRows.length > 0) {
            await sheets.spreadsheets.values.update({
                spreadsheetId: SHEET_ID,
                range: `${code}!A7:D${6 + newRows.length}`,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values: newRows }
            });
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        const code = body.code;
        const id = body.id;
        if (!code || !id) throw new Error('Missing code or ID');

        const sheets = await getGoogleSheets();

        const updatedRow = [
            body.date,
            body.ageMonths,
            body.weight,
            body.height
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `${code}!A${id}:D${id}`, // Update the exact physical row
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: [updatedRow]
            }
        });

        return NextResponse.json({ success: true, data: body });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
