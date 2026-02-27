const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('.'));

// EmailJS Configuration
const EMAILJS_USER_ID = '8XYNZGBfYNxYCCYuo';
const EMAILJS_SERVICE_ID = 'service_17o4tq4';
const EMAILJS_CONTACT_TEMPLATE_ID = 'template_muzi8cb';
const EMAILJS_AUTO_REPLY_TEMPLATE_ID = 'template_4b8rnwc';
const EMAILJS_API_KEY = process.env.EMAILJS_API_KEY || ''; // Add to environment variable

// Gmail Configuration for fallback email
const GMAIL_USER = process.env.GMAIL_USER || 'jupiter.digital.tech@gmail.com';
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD || ''; // Use App Password, not regular password

// Initialize nodemailer for Gmail
let transporter = null;
if (GMAIL_USER && GMAIL_PASSWORD) {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: GMAIL_USER,
            pass: GMAIL_PASSWORD
        }
    });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Backend server is running' });
});

// Contact form submission endpoint
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, service, message } = req.body;

        // Validate required fields
        if (!name || !email || !service || !message) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, email, service, message'
            });
        }

        console.log('Contact form submission received:', { name, email, phone, service });

        // Submit via email only
        const emailResult = await sendEmailNotification(name, email, phone, service, message);

        console.log('Email submission result:', emailResult);

        res.json({
            success: emailResult.success,
            message: emailResult.success ? 'Your message has been submitted successfully!' : 'Email submission failed',
            details: { email: emailResult }
        });

    } catch (error) {
        console.error('Error processing contact form:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

// Billing authentication endpoint
app.post('/api/auth', (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                error: 'Password is required'
            });
        }

        const correctPassword = process.env.BILLING_PASSWORD || 'Billing@123';

        if (password === correctPassword) {
            // Create a simple token (expires in 24 hours)
            const token = Buffer.from(JSON.stringify({
                authenticated: true,
                exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
            })).toString('base64');

            res.json({
                success: true,
                token: token,
                message: 'Authentication successful'
            });
        } else {
            res.status(401).json({
                success: false,
                error: 'Invalid password'
            });
        }
    } catch (error) {
        console.error('Auth error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication failed'
        });
    }
});

// Function to send email
async function sendEmailNotification(name, email, phone, service, message) {
    try {
        console.log('Preparing email notification...');

        // Use nodemailer for Gmail if configured
        if (transporter) {
            return await sendGmailEmail(name, email, phone, service, message);
        }

        // Fallback to EmailJS API
        return await sendEmailJSEmail(name, email, phone, service, message);

    } catch (error) {
        console.error('Email sending error:', error);
        throw error;
    }
}

// Send via Gmail using nodemailer
async function sendGmailEmail(name, email, phone, service, message) {
    try {
        // Email to business
        const businessMailOptions = {
            from: GMAIL_USER,
            to: 'jupiter.digital.tech@gmail.com',
            subject: `New Contact Form Submission from ${name}`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><em>Submitted at: ${new Date().toLocaleString()}</em></p>
            `
        };

        await transporter.sendMail(businessMailOptions);
        console.log('Business notification email sent');

        // Auto-reply to customer
        const autoReplyOptions = {
            from: GMAIL_USER,
            to: email,
            subject: 'Thank you for contacting Jupiter Digital Technologies',
            html: `
                <h2>Thank you, ${name}!</h2>
                <p>We have received your message and will get back to you as soon as possible.</p>
                <hr>
                <h3>Your Submission Details:</h3>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p>Best regards,<br>Jupiter Digital Technologies</p>
            `
        };

        await transporter.sendMail(autoReplyOptions);
        console.log('Auto-reply email sent to customer');

        return { success: true, message: 'Emails sent successfully' };

    } catch (error) {
        console.error('Gmail sending error:', error);
        throw error;
    }
}

// Send via EmailJS API
async function sendEmailJSEmail(name, email, phone, service, message) {
    try {
        const contactParams = {
            name,
            email,
            phone,
            service,
            message,
            to_email: 'jupiter.digital.tech@gmail.com',
            from_name: name,
            from_email: email
        };

        console.log('Sending via EmailJS...');

        const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                service_id: EMAILJS_SERVICE_ID,
                template_id: EMAILJS_CONTACT_TEMPLATE_ID,
                user_id: EMAILJS_USER_ID,
                accessToken: EMAILJS_API_KEY,
                template_params: contactParams
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`EmailJS returned status ${response.status}: ${errorText}`);
        }

        console.log('EmailJS submission successful');
        return { success: true, message: 'Email sent successfully' };

    } catch (error) {
        console.error('EmailJS sending error:', error);
        throw error;
    }
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✓ Backend server running on http://localhost:${PORT}`);
    console.log(`✓ Health check: http://localhost:${PORT}/health`);
    console.log(`✓ Contact endpoint: POST http://localhost:${PORT}/api/contact`);
    console.log(`✓ CORS enabled for all origins`);
    
    if (!transporter) {
        console.warn('⚠ Gmail not configured. Email will fall back to EmailJS.');
        console.warn('⚠ Set GMAIL_USER and GMAIL_PASSWORD environment variables for Gmail support.');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
