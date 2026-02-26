// Vercel Function to submit form data to Google Sheets
// This bypasses CORS issues by handling the request server-side

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status ? res.status(200).end() : (res.statusCode = 200, res.end());
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    const statusCode = res.status ? 405 : (res.statusCode = 405, 405);
    if (res.status) {
      return res.status(statusCode).json({ error: 'Method not allowed' });
    }
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    // Parse request body
    let body = '';
    
    // Handle both Vite dev server and Vercel environments
    if (req.on) {
      // Vite/Express style - need to read body
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        processFormSubmission(body, req, res);
      });
    } else {
      // Vercel style - body already parsed
      processFormSubmission(req.body, req, res);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    const statusCode = res.status ? 500 : (res.statusCode = 500, 500);
    if (res.status) {
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to process request'
      });
    }
    res.end(JSON.stringify({
      success: false,
      error: error.message || 'Failed to process request'
    }));
  }
}

function processFormSubmission(bodyData, req, res) {
  try {
    let data;
    
    // Parse body data (could be JSON string or URLSearchParams)
    if (typeof bodyData === 'string') {
      if (bodyData.startsWith('{')) {
        data = JSON.parse(bodyData);
      } else {
        // URLSearchParams format
        data = {};
        bodyData.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          data[decodeURIComponent(key)] = decodeURIComponent(value);
        });
      }
    } else {
      data = bodyData;
    }

    const { name, email, phone, service, message } = data;

    // Validate required fields
    if (!name || !email || !message) {
      const statusCode = res.status ? 400 : (res.statusCode = 400, 400);
      if (res.status) {
        return res.status(statusCode).json({
          success: false,
          error: 'Missing required fields: name, email, and message'
        });
      }
      res.end(JSON.stringify({
        success: false,
        error: 'Missing required fields: name, email, and message'
      }));
      return;
    }

    // Get the Google Apps Script URL from environment variable
    const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL || 'https://script.google.com/macros/s/AKfycby5VoGkuqlzXOB7Kscb4QzzGiu-ntPSOCbHx9KCQjfktEYScSrpdtvBNPCmEDtBYaTXKg/exec';

    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone || '');
    formData.append('service', service || '');
    formData.append('message', message);

    console.log('Submitting to Google Sheets:', {
      name, email, phone, service, message
    });

    // Submit to Google Sheets via server (no CORS issues)
    fetch(GOOGLE_SHEETS_URL, {
      method: 'POST',
      body: formData.toString(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })
    .then(response => {
      console.log('Google Sheets response status:', response.status);

      if (response.ok || response.status === 200) {
        return response.text().then(responseText => {
          console.log('Google Sheets response:', responseText);
          
          const statusCode = res.status ? 200 : (res.statusCode = 200, 200);
          if (res.status) {
            return res.status(statusCode).json({
              success: true,
              message: 'Form submitted successfully',
              data: {
                name,
                email,
                phone,
                service,
                message
              }
            });
          }
          res.end(JSON.stringify({
            success: true,
            message: 'Form submitted successfully',
            data: {
              name,
              email,
              phone,
              service,
              message
            }
          }));
        });
      } else {
        console.error('Google Sheets returned status:', response.status);
        const statusCode = res.status ? response.status : (res.statusCode = response.status, response.status);
        if (res.status) {
          return res.status(statusCode).json({
            success: false,
            error: `Google Sheets returned status ${response.status}`
          });
        }
        res.end(JSON.stringify({
          success: false,
          error: `Google Sheets returned status ${response.status}`
        }));
      }
    })
    .catch(error => {
      console.error('Error submitting form to Google Sheets:', error);
      const statusCode = res.status ? 500 : (res.statusCode = 500, 500);
      if (res.status) {
        return res.status(statusCode).json({
          success: false,
          error: error.message || 'Failed to submit form'
        });
      }
      res.end(JSON.stringify({
        success: false,
        error: error.message || 'Failed to submit form'
      }));
    });
  } catch (error) {
    console.error('Error processing form data:', error);
    const statusCode = res.status ? 500 : (res.statusCode = 500, 500);
    if (res.status) {
      return res.status(statusCode).json({
        success: false,
        error: error.message || 'Failed to process form'
      });
    }
    res.end(JSON.stringify({
      success: false,
      error: error.message || 'Failed to process form'
    }));
  }
}
