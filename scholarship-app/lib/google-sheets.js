const { google } = require('googleapis');
require('dotenv').config({ path: '.env.local' });

/**
 * Authenticate with Google Sheets API using service account credentials
 */
function authenticateGoogleSheets() {
    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
            private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    return google.sheets({ version: 'v4', auth });
}

/**
 * Get all data from Google Sheet
 */
async function getSheetData() {
    const sheets = authenticateGoogleSheets();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = `${process.env.GOOGLE_SHEET_NAME || 'Sheet1'}!A:AZ`; // Read all columns

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        return response.data.values || [];
    } catch (error) {
        console.error('Error reading from Google Sheets:', error.message);
        throw error;
    }
}

/**
 * Update a specific row in Google Sheet
 * @param {number} rowIndex - Row number (1-indexed, including header)
 * @param {Array} values - Array of values to update
 */
async function updateSheetRow(rowIndex, values) {
    const sheets = authenticateGoogleSheets();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_NAME || 'Sheet1';
    const range = `${sheetName}!A${rowIndex}:AZ${rowIndex}`;

    try {
        await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource: {
                values: [values],
            },
        });

        console.log(`✅ Updated row ${rowIndex} in Google Sheets`);
    } catch (error) {
        console.error(`Error updating row ${rowIndex}:`, error.message);
        throw error;
    }
}

/**
 * Append a new row to Google Sheet
 * @param {Array} values - Array of values to append
 */
async function appendSheetRow(values, customSheetName = '') {
    const sheets = authenticateGoogleSheets();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = customSheetName || process.env.GOOGLE_SHEET_NAME || 'Sheet1';
    const range = `${sheetName}!A:AZ`;

    try {
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'RAW',
            resource: {
                values: [values],
            },
        });

        console.log(`✅ Appended new row to Google Sheets`);
        return response.data;
    } catch (error) {
        // If the sheet doesn't exist, try creating it first
        if (error.message && (error.message.includes('Unable to parse range') || error.message.includes('requested URL was not found'))) {
            try {
                console.log(`Sheet "${sheetName}" not found. Creating it...`);
                await sheets.spreadsheets.batchUpdate({
                    spreadsheetId,
                    resource: {
                        requests: [
                            {
                                addSheet: {
                                    properties: {
                                        title: sheetName,
                                    },
                                },
                            },
                        ],
                    },
                });
                
                // Add header row to the newly created sheet
                await sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range: `${sheetName}!A1`,
                    valueInputOption: 'RAW',
                    resource: {
                        values: [['Email', 'Scholarship Slug', 'Subscribed At']],
                    },
                });
                
                // Now retry appending the actual row
                const response = await sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range,
                    valueInputOption: 'RAW',
                    resource: {
                        values: [values],
                    },
                });
                return response.data;
            } catch (createError) {
                console.error(`Error creating sheet "${sheetName}":`, createError.message);
                throw createError;
            }
        }
        console.error('Error appending to Google Sheets:', error.message);
        throw error;
    }
}

/**
 * Get column headers from Google Sheet
 */
async function getSheetHeaders() {
    const sheets = authenticateGoogleSheets();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = `${process.env.GOOGLE_SHEET_NAME || 'Sheet1'}!1:1`;

    try {
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        return response.data.values?.[0] || [];
    } catch (error) {
        console.error('Error reading headers:', error.message);
        throw error;
    }
}

/**
 * Batch update multiple ranges in Google Sheet
 * @param {Array} data - Array of { range, values } objects
 */
async function batchUpdateSheetRows(data) {
    const sheets = authenticateGoogleSheets();
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    try {
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId,
            resource: {
                valueInputOption: 'RAW',
                data: data.map(item => ({
                    range: item.range,
                    values: [item.values]
                }))
            },
        });

        console.log(`✅ Batch updated ${data.length} ranges in Google Sheets`);
    } catch (error) {
        console.error('Error in batch update:', error.message);
        throw error;
    }
}

module.exports = {
    authenticateGoogleSheets,
    getSheetData,
    updateSheetRow,
    appendSheetRow,
    getSheetHeaders,
    batchUpdateSheetRows,
};
