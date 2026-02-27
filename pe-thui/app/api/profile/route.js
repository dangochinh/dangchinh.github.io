import { getGoogleSheets, SHEET_ID, getSheetExists, createNewSheet, renameSheet } from '../../lib/google-sheets';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        if (!code) return NextResponse.json({ success: true, data: null });

        const exists = await getSheetExists(code);
        if (!exists) return NextResponse.json({ success: true, data: null });

        const sheets = await getGoogleSheets();
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${code}!A1:B4`, // Row 1 to 4
        });

        const rows = response.data.values;
        if (!rows || rows.length < 3) {
            return NextResponse.json({ success: true, data: null });
        }

        const profile = {
            name: rows[0] ? rows[0][1] || '' : '',
            gender: rows[1] ? rows[1][1] || '' : '',
            dob: rows[2] ? rows[2][1] || '' : '',
            avatar: rows[3] ? rows[3][1] || '' : '',
        };

        return NextResponse.json({ success: true, data: profile });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const code = body.code;
        const oldCode = body.oldCode;
        if (!code) throw new Error('Code is required');

        if (oldCode && oldCode !== code) {
            // Check if new code already exists
            const newExists = await getSheetExists(code);
            if (newExists) {
                return NextResponse.json({ success: false, error: 'Mã code này đã được sử dụng bởi người khác!' }, { status: 400 });
            }
            await renameSheet(oldCode, code);
        } else {
            const exists = await getSheetExists(code);
            if (!exists) {
                await createNewSheet(code);
            }
        }

        const sheets = await getGoogleSheets();

        const values = [
            ['Tên bé', body.name || ''],
            ['Giới tính', body.gender || ''],
            ['Ngày sinh', body.dob || ''],
            ['Avatar URL', body.avatar || '']
        ];

        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `${code}!A1:B4`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values }
        });

        return NextResponse.json({ success: true, data: body });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
