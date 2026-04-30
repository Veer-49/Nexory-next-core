const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static data for demo purposes
const mockData = {
    leads: [],
    clients: [],
    invoices: [],
    expenses: []
};

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

// Authentication middleware for admin routes
const adminAuth = (req, res, next) => {
    // For now, we'll use a simple API key check
    // In production, you should use proper JWT authentication
    const apiKey = req.headers['x-admin-api-key'];
    const validApiKey = process.env.ADMIN_API_KEY || 'admin-secret-key-2024';
    
    console.log('Auth middleware - Received API Key:', apiKey);
    console.log('Auth middleware - Valid API Key:', validApiKey);
    console.log('Auth middleware - Keys match:', apiKey === validApiKey);
    
    if (!apiKey || apiKey !== validApiKey) {
        console.log('Auth middleware - Access denied');
        return res.status(401).json({ 
            success: false, 
            error: 'Unauthorized access' 
        });
    }
    
    console.log('Auth middleware - Access granted');
    next();
};

// API key validation endpoint
app.get('/api/validate', adminAuth, (req, res) => {
    res.json({ 
        success: true, 
        message: 'API key is valid',
        timestamp: new Date().toISOString()
    });
});

// Get credentials endpoint
app.get('/api/get-credentials', (req, res) => {
    res.json({ 
        validUsername: process.env.ADMIN_USERNAME || 'admin',
        validPassword: process.env.ADMIN_PASSWORD || process.env.PASSWORD || 'admin123',
        validApiKey: process.env.ADMIN_API_KEY || 'admin-secret-key-2024'
    });
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
    console.log('Login attempt received:', req.body);
    const { username, password } = req.body;
    
    // Simple authentication (in production, use proper password hashing)
    const validUsername = process.env.ADMIN_USERNAME || 'admin';
    const validPassword = process.env.ADMIN_PASSWORD || process.env.PASSWORD || 'admin123';
    
    console.log('Validating credentials:', { username, validUsername, password, validPassword });
    
    if (username === validUsername && password === validPassword) {
        console.log('Login successful for user:', username);
        const token = jwt.sign(
            { username, role: 'admin' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        const response = {
            success: true,
            data: {
                token,
                apiKey: process.env.ADMIN_API_KEY || 'admin-secret-key-2024',
                user: { username, role: 'admin' }
            }
        };
        
        console.log('Sending login response:', response);
        res.json(response);
    } else {
        console.log('Login failed for user:', username);
        res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }

// API Routes for Admin Panel

// LEADS ENDPOINTS
app.get('/api/admin/leads', adminAuth, (req, res) => {
    const { status, source, search } = req.query;
    
    let filteredLeads = mockData.leads;
    
    if (status) {
        filteredLeads = filteredLeads.filter(lead => lead.status === status);
    }
    if (source) {
        filteredLeads = filteredLeads.filter(lead => lead.source === source);
    }
    if (search) {
        filteredLeads = filteredLeads.filter(lead => 
            lead.name.toLowerCase().includes(search.toLowerCase()) ||
            lead.email.toLowerCase().includes(search.toLowerCase()) ||
            lead.company.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    res.json({ success: true, data: filteredLeads });
});

app.post('/api/admin/leads', adminAuth, (req, res) => {
    const { name, email, phone, company, source, status, notes } = req.body;
    const id = uuidv4();
    
    const newLead = {
        id, name, email, phone, company, source, status, notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    mockData.leads.push(newLead);
    res.json({ success: true, data: newLead });
});

app.put('/api/admin/leads/:id', adminAuth, (req, res) => {
    const { id } = req.params;
    const { name, email, phone, company, source, status, notes } = req.body;
    
    const leadIndex = mockData.leads.findIndex(lead => lead.id === id);
    if (leadIndex === -1) {
        return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    
    mockData.leads[leadIndex] = {
        id, name, email, phone, company, source, status, notes,
        updated_at: new Date().toISOString()
    };
    
    res.json({ success: true, message: 'Lead updated successfully' });
});

app.delete('/api/admin/leads/:id', adminAuth, (req, res) => {
    const { id } = req.params;
    
    const leadIndex = mockData.leads.findIndex(lead => lead.id === id);
    if (leadIndex === -1) {
        return res.status(404).json({ success: false, error: 'Lead not found' });
    }
    
    mockData.leads.splice(leadIndex, 1);
    res.json({ success: true, message: 'Lead deleted successfully' });
});

// CLIENTS ENDPOINTS
app.get('/api/admin/clients', adminAuth, (req, res) => {
    const { status, type, search } = req.query;
    
    let filteredClients = mockData.clients;
    
    if (status) {
        filteredClients = filteredClients.filter(client => client.status === status);
    }
    if (type) {
        filteredClients = filteredClients.filter(client => client.type === type);
    }
    if (search) {
        filteredClients = filteredClients.filter(client => 
            client.company_name.toLowerCase().includes(search.toLowerCase()) ||
            client.contact_person.toLowerCase().includes(search.toLowerCase()) ||
            client.email.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    res.json({ success: true, data: filteredClients });
});

app.post('/api/admin/clients', adminAuth, (req, res) => {
    const { company_name, contact_person, email, phone, address, type, status, notes } = req.body;
    const id = uuidv4();
    
    const newClient = {
        id, company_name, contact_person, email, phone, address, type, status, notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    
    mockData.clients.push(newClient);
    res.json({ success: true, data: newClient });
});

app.put('/api/admin/clients/:id', adminAuth, (req, res) => {
    const { id } = req.params;
    const { company_name, contact_person, email, phone, address, type, status, notes } = req.body;
    
    const clientIndex = mockData.clients.findIndex(client => client.id === id);
    if (clientIndex === -1) {
        return res.status(404).json({ success: false, error: 'Client not found' });
    }
    
    mockData.clients[clientIndex] = {
        id, company_name, contact_person, email, phone, address, type, status, notes,
        updated_at: new Date().toISOString()
    };
    
    res.json({ success: true, message: 'Client updated successfully' });
});

app.delete('/api/admin/clients/:id', adminAuth, (req, res) => {
    const { id } = req.params;
    
    const clientIndex = mockData.clients.findIndex(client => client.id === id);
    if (clientIndex === -1) {
        return res.status(404).json({ success: false, error: 'Client not found' });
    }
    
    mockData.clients.splice(clientIndex, 1);
    res.json({ success: true, message: 'Client deleted successfully' });
});

// INVOICES ENDPOINTS
app.get('/api/admin/invoices', adminAuth, (req, res) => {
    const { status, month, search } = req.query;
    
    let filteredInvoices = mockData.invoices;
    
    let query = `SELECT i.*, c.company_name, c.contact_person 
                 FROM invoices i 
                 JOIN clients c ON i.client_id = c.id 
                 WHERE 1=1`;
    const params = [];

    if (status) {
        query += ' AND i.status = ?';
        params.push(status);
    }
    if (month) {
        query += ' AND strftime("%Y-%m", i.issue_date) = ?';
        params.push(month);
    }
    if (search) {
        query += ' AND (i.invoice_number LIKE ? OR c.company_name LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY i.created_at DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: rows });
    });
});

app.post('/api/admin/invoices', adminAuth, (req, res) => {
    const { client_id, issue_date, due_date, items, notes, tax_rate } = req.body;
    const id = uuidv4();
    const invoice_number = 'INV-' + Date.now();

    // Calculate totals
    let subtotal = 0;
    items.forEach(item => {
        subtotal += item.quantity * item.unit_price;
    });
    const tax_amount = subtotal * (tax_rate || 0) / 100;
    const total = subtotal + tax_amount;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Insert invoice
        db.run(`INSERT INTO invoices (id, invoice_number, client_id, issue_date, due_date, 
                subtotal, tax_rate, tax_amount, total, notes) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, invoice_number, client_id, issue_date, due_date, subtotal, tax_rate, tax_amount, total, notes],
            function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ success: false, error: err.message });
                }

                // Insert invoice items
                const itemStmt = db.prepare(`INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, total) 
                                            VALUES (?, ?, ?, ?, ?, ?)`);
                
                let itemsInserted = 0;
                items.forEach(item => {
                    const itemTotal = item.quantity * item.unit_price;
                    itemStmt.run([uuidv4(), id, item.description, item.quantity, item.unit_price, itemTotal], (err) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ success: false, error: err.message });
                        }
                        
                        itemsInserted++;
                        if (itemsInserted === items.length) {
                            itemStmt.finalize();
                            db.run('COMMIT');
                            res.json({ 
                                success: true, 
                                data: { id, invoice_number, client_id, issue_date, due_date, subtotal, tax_rate, tax_amount, total, notes }
                            });
                        }
                    });
                });
            }
        );
    });
});

app.put('/api/admin/invoices/:id', adminAuth, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    db.run('UPDATE invoices SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [status, id],
        function(err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ success: false, error: 'Invoice not found' });
            }
            res.json({ success: true, message: 'Invoice updated successfully' });
        }
    );
});

app.delete('/api/admin/invoices/:id', adminAuth, (req, res) => {
    const { id } = req.params;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Delete invoice items first (due to foreign key constraint)
        db.run('DELETE FROM invoice_items WHERE invoice_id = ?', [id], (err) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ success: false, error: err.message });
            }

            // Delete the invoice
            db.run('DELETE FROM invoices WHERE id = ?', [id], function(err) {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ success: false, error: err.message });
                }

                if (this.changes === 0) {
                    db.run('ROLLBACK');
                    return res.status(404).json({ success: false, error: 'Invoice not found' });
                }

                db.run('COMMIT');
                res.json({ success: true, message: 'Invoice deleted successfully' });
            });
        });
    });
});

// EXPENSES ENDPOINTS
app.get('/api/admin/expenses', adminAuth, (req, res) => {
    const { category, month, search } = req.query;
    let query = 'SELECT * FROM expenses WHERE 1=1';
    const params = [];

    if (category) {
        query += ' AND category = ?';
        params.push(category);
    }
    if (month) {
        query += ' AND strftime("%Y-%m", date) = ?';
        params.push(month);
    }
    if (search) {
        query += ' AND description LIKE ?';
        params.push(`%${search}%`);
    }

    query += ' ORDER BY date DESC';

    db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: rows });
    });
});

app.post('/api/admin/expenses', adminAuth, (req, res) => {
    const { date, description, category, amount, payment_method, notes } = req.body;
    const id = uuidv4();

    db.run(`INSERT INTO expenses (id, date, description, category, amount, payment_method, notes) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, date, description, category, amount, payment_method, notes],
        function(err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, data: { id, date, description, category, amount, payment_method, notes } });
        }
    );
});

app.delete('/api/admin/expenses/:id', adminAuth, (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM expenses WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, error: 'Expense not found' });
        }
        res.json({ success: true, message: 'Expense deleted successfully' });
    });
});

app.put('/api/admin/expenses/:id', adminAuth, (req, res) => {
    const { id } = req.params;
    const { date, description, category, amount, payment_method, notes } = req.body;

    db.run(`UPDATE expenses SET 
            date = ?, 
            description = ?, 
            category = ?, 
            amount = ?, 
            payment_method = ?, 
            notes = ?,
            updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?`,
        [date, description, category, amount, payment_method, notes, id],
        function(err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ success: false, error: 'Expense not found' });
            }
            res.json({ success: true, message: 'Expense updated successfully' });
        }
    );
});

// DASHBOARD STATISTICS
app.get('/api/admin/dashboard/stats', adminAuth, (req, res) => {
    const stats = {
        totalLeads: 0,
        leadsThisMonth: 0,
        totalClients: 0,
        totalRevenue: 0,
        revenueThisMonth: 0,
        revenueThisWeek: 0,
        revenueThisYear: 0,
        totalExpenses: 0,
        expensesThisMonth: 0,
        expensesThisWeek: 0,
        expensesThisYear: 0,
        netProfit: 0
    };

    res.json({ success: true, data: stats });
});

// REVENUE ANALYTICS
app.get('/api/admin/revenue/analytics', adminAuth, (req, res) => {
    const analytics = {};

    // Today's revenue
    db.get(`SELECT COALESCE(SUM(total), 0) as total FROM invoices 
            WHERE status = "paid" AND date(created_at) = date("now")`, (err, row) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        analytics.today = row.total;

        // This week's revenue
        db.get(`SELECT COALESCE(SUM(total), 0) as total FROM invoices 
                WHERE status = "paid" AND created_at >= date("now", "-7 days")`, (err, row) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            analytics.week = row.total;

            // This month's revenue
            db.get(`SELECT COALESCE(SUM(total), 0) as total FROM invoices 
                    WHERE status = "paid" AND strftime("%Y-%m", created_at) = strftime("%Y-%m", "now")`, (err, row) => {
                if (err) return res.status(500).json({ success: false, error: err.message });
                analytics.month = row.total;

                // This year's revenue
                db.get(`SELECT COALESCE(SUM(total), 0) as total FROM invoices 
                        WHERE status = "paid" AND strftime("%Y", created_at) = strftime("%Y", "now")`, (err, row) => {
                    if (err) return res.status(500).json({ success: false, error: err.message });
                    analytics.year = row.total;

                    // Monthly revenue trend (last 12 months)
                    db.all(`SELECT strftime("%Y-%m", created_at) as month, 
                                   COALESCE(SUM(total), 0) as revenue 
                            FROM invoices 
                            WHERE status = "paid" AND created_at >= date("now", "-12 months")
                            GROUP BY strftime("%Y-%m", created_at)
                            ORDER BY month`, (err, rows) => {
                        if (err) return res.status(500).json({ success: false, error: err.message });
                        analytics.monthlyTrend = rows;

                        res.json({ success: true, data: analytics });
                    });
                });
            });
        });
    });
});

// Serve static files (after API routes)
app.use(express.static('.'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal server error'
    });
});

// Export for Vercel serverless
module.exports = app;

// Start server for local development
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
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
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});
