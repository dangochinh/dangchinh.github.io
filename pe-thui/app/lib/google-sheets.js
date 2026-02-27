import { google } from 'googleapis';

export async function getGoogleSheets() {
    let credentials;
    try {
        // Try standard parse first
        credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        // If it parsed into a string (double encoded), parse again
        if (typeof credentials === 'string') credentials = JSON.parse(credentials);
    } catch (e) {
        // Fallback to robust regex extraction if JSON parsing completely fails due to bad Vercel escapes
        const raw = process.env.GOOGLE_CREDENTIALS || '';
        const emailMatch = raw.match(/"client_email"\s*:\s*(?:\\")?"([^\\"]+)(?:\\")?"/);
        const keyMatch = raw.match(/"private_key"\s*:\s*(?:\\")?"([^"]+)(?:\\")?"/);

        if (emailMatch && keyMatch) {
            credentials = {
                client_email: emailMatch[1],
                private_key: keyMatch[1].replace(/\\n/g, '\n')
            };
        } else {
            throw new Error('No Google Credentials found or parsing failed: ' + e.message);
        }
    }

    const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    return sheets;
}

export const SHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function getSheetExists(sheetName) {
    const sheets = await getGoogleSheets();
    try {
        const response = await sheets.spreadsheets.get({
            spreadsheetId: SHEET_ID
        });
        return response.data.sheets.some(s => s.properties.title === sheetName);
    } catch (e) {
        throw new Error('Could not check sheets: ' + e.message);
    }
}

export async function renameSheet(oldName, newName) {
    const sheets = await getGoogleSheets();
    try {
        const response = await sheets.spreadsheets.get({
            spreadsheetId: SHEET_ID
        });
        const sheet = response.data.sheets.find(s => s.properties.title === oldName);
        if (!sheet) throw new Error('Không tìm thấy dữ liệu cũ');

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SHEET_ID,
            requestBody: {
                requests: [{
                    updateSheetProperties: {
                        properties: {
                            sheetId: sheet.properties.sheetId,
                            title: newName
                        },
                        fields: 'title'
                    }
                }]
            }
        });
    } catch (e) {
        throw new Error('Lỗi đổi tên: ' + e.message);
    }
}

export async function createNewSheet(sheetName) {
    const sheets = await getGoogleSheets();
    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: {
            requests: [{
                addSheet: {
                    properties: { title: sheetName }
                }
            }]
        }
    });
}
