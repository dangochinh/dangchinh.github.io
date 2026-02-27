require('dotenv').config({ path: '.env.local' });
const { getGoogleSheets, SHEET_ID, getFirstSheetName } = require('../app/lib/google-sheets');

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
        console.log('Data:', response.data.values);

        console.log('--- ALL TESTS PASSED ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ TEST FAILED:', err.message);
        process.exit(1);
    }
}

// In CommonJS mock process.env for the lib module
// Next.js uses ES modules for routing, but our test script uses CJS so we need a slight adjustment
// if getGoogleSheets relies on `export` we need to use dynamic import or use babel.
runTests();
