// Vercel Function for password authentication
// This endpoint verifies the password and returns a JWT token

export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  // Get password from environment variable
  const CORRECT_PASSWORD = process.env.BILLING_PASSWORD || 'billing123';

  // Verify password
  if (password === CORRECT_PASSWORD) {
    // Create a simple token (in production, use JWT library)
    const token = Buffer.from(
      JSON.stringify({
        authenticated: true,
        timestamp: new Date().getTime(),
        expires: new Date().getTime() + 24 * 60 * 60 * 1000 // 24 hours
      })
    ).toString('base64');

    return res.status(200).json({
      success: true,
      token: token,
      message: 'Authentication successful'
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password'
    });
  }
}
