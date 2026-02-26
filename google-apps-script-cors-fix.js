// Google Apps Script Code to handle CORS and form submissions
function doPost(e) {
  // Handle CORS preflight request
  if (e.parameter.method === 'OPTIONS') {
    return ContentService
      .createTextOutput('')
      .setMimeType(ContentService.MimeType.TEXT)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  try {
    // Get form data
    const name = e.parameter.name || '';
    const email = e.parameter.email || '';
    const phone = e.parameter.phone || '';
    const service = e.parameter.service || '';
    const message = e.parameter.message || '';

    // Open the Google Sheet (replace with your sheet ID)
    const sheetId = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Replace with your actual sheet ID
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();

    // Add timestamp and data to sheet
    const timestamp = new Date();
    sheet.appendRow([timestamp, name, email, phone, service, message]);

    // Return success response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Data submitted successfully'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');

  } catch (error) {
    console.error('Error processing form submission:', error);

    // Return error response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

// Also handle GET requests for CORS
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'CORS preflight successful'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
