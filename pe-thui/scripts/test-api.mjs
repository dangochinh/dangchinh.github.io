import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { getGoogleSheets, SHEET_ID, getFirstSheetName } from '../app/lib/google-sheets.js';

async function runTests() {
    console.log('--- STARTING UNIT TESTS ---');
    try {
        console.log('Test 1: Connecting to Google Sheets API...');
        const sheets = await getGoogleSheets();
        console.log('✅ Test 1 Passed: Authentication successful');

        console.log('Test 2: Retrieving first sheet name...');
        const sheetName = await getFirstSheetName();
        if (!sheetName) throw new Error('Sheet name is undefined');
        console.log(`✅ Test 2 Passed: Sheet name is '${sheetName}'`);

        console.log('Test 3: Reading Profile headers (A1:C2)...');
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: `${sheetName}!A1:C2`,
        });
        console.log(`✅ Test 3 Passed: Successfully fetched data from ${sheetName}!A1:C2`);
        console.log('Raw Data:', response.data.values);

        console.log('--- ALL TESTS PASSED ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ TEST FAILED:', err.message);
        process.exit(1);
    }
}

runTests();
