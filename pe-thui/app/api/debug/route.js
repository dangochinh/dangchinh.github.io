import { NextResponse } from 'next/server';

export async function GET() {
    let raw = process.env.GOOGLE_CREDENTIALS;
    let parsed = null;
    let errStr = null;
    try {
        let credsStr = raw || "";
        if (credsStr.startsWith('"') && credsStr.endsWith('"')) {
            credsStr = credsStr.slice(1, -1);
        }
        credsStr = credsStr.replace(/\\n/g, '\n').replace(/\\"/g, '"');
        parsed = JSON.parse(credsStr);
    } catch (e) {
        errStr = e.message;
    }

    return NextResponse.json({
        rawType: typeof raw,
        rawLength: raw ? raw.length : 0,
        rawStarts: raw ? raw.substring(0, 10) : null,
        rawEnds: raw ? raw.substring(raw.length - 10) : null,
        parsedKeys: parsed ? Object.keys(parsed) : null,
        errStr,
        sheetId: process.env.GOOGLE_SHEET_ID
    });
}
