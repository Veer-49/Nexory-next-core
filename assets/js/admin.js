// Admin Panel JavaScript
// Dynamic API URL detection for all environments
const API_BASE_URL = getApiBaseUrl();
let currentSection = 'dashboard';
let charts = {};

// In-memory mock data storage (replaces database)
const mockData = {
    leads: [],
    clients: [],
    invoices: [],
    expenses: []
};

// Data retention settings
const DATA_RETENTION = {
    LEADS_CLIENTS_MONTHS: 1, // Auto-delete leads/clients after 1 month
    INVOICES_YEARS: 5,      // Keep invoices for 5 years (long-term revenue)
    EXPENSES_YEARS: 5        // Keep expenses for 5 years (long-term records)
};

// Function to detect API base URL based on current domain
function getApiBaseUrl() {
    const currentHost = window.location.hostname;
    
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        return 'http://localhost:3001';
    } else if (currentHost.includes('vercel.app')) {
        // For Vercel deployment, use relative URLs or your deployed API
        return ''; // Use relative URLs for same-domain API
    } else {
        // For production domains, use the same domain with HTTPS
        return `https://${currentHost}`;
    }
}

// Helper function to get API key
function getApiKey() {
    return localStorage.getItem('adminApiKey') || sessionStorage.getItem('adminApiKey');
}

// Helper function to make authenticated API calls
async function authenticatedFetch(url, options = {}) {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error('No API key found');
    }
    
    // Ensure headers exist
    if (!options.headers) {
        options.headers = {};
    }
    
    // Add API key
    options.headers['X-Admin-API-Key'] = apiKey;
    
    // Handle relative URLs for different environments
    let fullUrl = url;
    if (url.startsWith('/api/') && API_BASE_URL) {
        fullUrl = API_BASE_URL + url;
    }
    
    console.log('Authenticated fetch to:', fullUrl, 'with API key:', apiKey ? 'present' : 'missing');
    
    return fetch(fullUrl, options);
}

// Data cleanup functions
function cleanupOldData() {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - DATA_RETENTION.LEADS_CLIENTS_MONTHS, now.getDate());
    const fiveYearsAgo = new Date(now.getFullYear() - DATA_RETENTION.INVOICES_YEARS, now.getMonth(), now.getDate());
    
    // Cleanup old leads (older than 1 month)
    const originalLeadsCount = mockData.leads.length;
    mockData.leads = mockData.leads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate > oneMonthAgo;
    });
    
    // Cleanup old clients (older than 1 month)
    const originalClientsCount = mockData.clients.length;
    mockData.clients = mockData.clients.filter(client => {
        const clientDate = new Date(client.created_at);
        return clientDate > oneMonthAgo;
    });
    
    // Keep invoices for long-term revenue (5 years)
    const originalInvoicesCount = mockData.invoices.length;
    mockData.invoices = mockData.invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.created_at);
        return invoiceDate > fiveYearsAgo;
    });
    
    // Keep expenses for long-term records (5 years)
    const originalExpensesCount = mockData.expenses.length;
    mockData.expenses = mockData.expenses.filter(expense => {
        const expenseDate = new Date(expense.created_at);
        return expenseDate > fiveYearsAgo;
    });
    
    // Log cleanup results
    const deletedLeads = originalLeadsCount - mockData.leads.length;
    const deletedClients = originalClientsCount - mockData.clients.length;
    const deletedInvoices = originalInvoicesCount - mockData.invoices.length;
    const deletedExpenses = originalExpensesCount - mockData.expenses.length;
    
    if (deletedLeads > 0 || deletedClients > 0 || deletedInvoices > 0 || deletedExpenses > 0) {
        console.log('Data cleanup completed:', {
            deletedLeads,
            deletedClients,
            deletedInvoices,
            deletedExpenses,
            cleanupDate: now.toISOString()
        });
        
        // Show notification for significant cleanups
        if (deletedLeads > 0 || deletedClients > 0) {
            showNotification(`Auto-cleanup: Removed ${deletedLeads} old leads and ${deletedClients} old clients (older than 1 month)`, 'info');
        }
    }
}

function getDataRetentionInfo() {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    
    const expiringLeads = mockData.leads.filter(lead => {
        const leadDate = new Date(lead.created_at);
        return leadDate <= oneMonthAgo;
    }).length;
    
    const expiringClients = mockData.clients.filter(client => {
        const clientDate = new Date(client.created_at);
        return clientDate <= oneMonthAgo;
    }).length;
    
    return {
        totalLeads: mockData.leads.length,
        totalClients: mockData.clients.length,
        totalInvoices: mockData.invoices.length,
        totalExpenses: mockData.expenses.length,
        expiringLeads,
        expiringClients,
        retentionPeriod: `${DATA_RETENTION.LEADS_CLIENTS_MONTHS} month(s)`,
        invoiceRetention: `${DATA_RETENTION.INVOICES_YEARS} year(s)`,
        nextCleanup: 'Next page load'
    };
}

function showDataRetentionInfo() {
    const info = getDataRetentionInfo();
    
    const modalHtml = `
        <div class="modal fade" id="dataRetentionModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-clock me-2"></i>Data Retention Policy
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            <strong>Automatic Data Cleanup</strong><br>
                            Old data is automatically cleaned up to maintain system performance.
                        </div>
                        
                        <h6 class="mt-3"><i class="fas fa-users me-2"></i>Leads & Clients</h6>
                        <ul class="list-unstyled">
                            <li><strong>Retention Period:</strong> ${info.retentionPeriod}</li>
                            <li><strong>Current Leads:</strong> ${info.totalLeads}</li>
                            <li><strong>Current Clients:</strong> ${info.totalClients}</li>
                            ${info.expiringLeads > 0 || info.expiringClients > 0 ? 
                                `<li class="text-warning"><i class="fas fa-exclamation-triangle me-1"></i>
                                    ${info.expiringLeads} leads and ${info.expiringClients} clients will be deleted on next cleanup</li>` : 
                                '<li class="text-success"><i class="fas fa-check me-1"></i>No leads/clients expiring soon</li>'}
                        </ul>
                        
                        <h6 class="mt-3"><i class="fas fa-file-invoice-dollar me-2"></i>Financial Data</h6>
                        <ul class="list-unstyled">
                            <li><strong>Invoices Retention:</strong> ${info.invoiceRetention} (long-term revenue tracking)</li>
                            <li><strong>Current Invoices:</strong> ${info.totalInvoices}</li>
                            <li><strong>Current Expenses:</strong> ${info.totalExpenses}</li>
                        </ul>
                        
                        <div class="alert alert-success mt-3">
                            <i class="fas fa-shield-alt me-2"></i>
                            <strong>Revenue Data Preserved</strong><br>
                            All financial data is kept long-term for accurate business analytics and reporting.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="cleanupOldData(); bootstrap.Modal.getInstance(document.getElementById('dataRetentionModal')).hide();">
                            <i class="fas fa-broom me-2"></i>Run Cleanup Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if present
    const existingModal = document.getElementById('dataRetentionModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body and show it
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('dataRetentionModal'));
    modal.show();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthentication();
    initializeEventListeners();
    setDefaultDates();
    
    // Run data cleanup on page load
    cleanupOldData();
});

// Check authentication
function checkAuthentication() {
    const apiKey = localStorage.getItem('adminApiKey') || sessionStorage.getItem('adminApiKey');
    
    console.log('Checking authentication - API Key found:', !!apiKey);
    
    // Simple authentication check - redirect if no API key
    if (!apiKey) {
        console.log('No API key found, redirecting to login');
        clearAuthData();
        window.location.replace('admin-login.html');
        return false;
    }
    
    // Validate API key format (basic validation)
    if (apiKey.length < 10) {
        console.log('Invalid API key format, redirecting to login');
        clearAuthData();
        window.location.replace('admin-login.html');
        return false;
    }
    
    // Set up authenticated fetch interceptor
    setupAuthenticatedFetch(apiKey);
    
    // Load dashboard data
    loadDashboardData();
    return true;
}

// Clear authentication data
function clearAuthData() {
    localStorage.removeItem('adminApiKey');
    localStorage.removeItem('adminUser');
    sessionStorage.removeItem('adminApiKey');
    sessionStorage.removeItem('adminUser');
}

// Set up authenticated fetch with proper API key handling
function setupAuthenticatedFetch(apiKey) {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        // Don't add API key to login requests or health checks
        const isLoginRequest = args[0].includes('/api/admin/login');
        const isHealthCheck = args[0].includes('/health');
        
        if (!isLoginRequest && !isHealthCheck) {
            // Ensure options object exists
            if (!args[1]) {
                args[1] = {};
            }
            
            // Ensure headers object exists
            if (!args[1].headers) {
                args[1].headers = {};
            }
            
            // Add API key header
            args[1].headers['X-Admin-API-Key'] = apiKey;
        }
        
        return originalFetch.apply(this, args);
    };
}

// Initialize event listeners
function initializeEventListeners() {
    // Invoice form calculations
    document.addEventListener('input', function(e) {
        if (e.target.name === 'itemQuantity' || e.target.name === 'itemPrice') {
            calculateInvoiceItemTotal(e.target);
        }
        if (e.target.id === 'invoiceTax') {
            calculateInvoiceTotals();
        }
    });
}

// Set default dates for forms
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];

    const expenseDate = document.getElementById('expenseDate');
    const invoiceDate = document.getElementById('invoiceDate');
    const invoiceDueDate = document.getElementById('invoiceDueDate');

    if (expenseDate) expenseDate.value = today;
    if (invoiceDate) invoiceDate.value = today;
    if (invoiceDueDate) invoiceDueDate.value = dueDateStr;
}

// Section navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionName).classList.add('active');
    
    // Add active class to clicked menu item
    event.target.classList.add('active');
    
    currentSection = sectionName;
    
    // Load data for the section
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'leads':
            loadLeads();
            break;
        case 'clients':
            loadClients();
            break;
        case 'billing':
            loadInvoices();
            break;
        case 'revenue':
            loadRevenueData();
            break;
        case 'expenses':
            loadExpenses();
            break;
        case 'reports':
            loadReports();
            break;
    }
}

// Refresh all data
function refreshData() {
    showNotification('Refreshing data...', 'info');
    
    // Run cleanup before refreshing data
    cleanupOldData();
    
    loadDashboardData();
    if (currentSection !== 'dashboard') {
        showSection(currentSection);
    }
    
    const retentionInfo = getDataRetentionInfo();
    showNotification(`Data refreshed! Active: ${retentionInfo.totalLeads} leads, ${retentionInfo.totalClients} clients`, 'success');
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Calculate actual stats from mock data
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        const stats = {
            totalLeads: mockData.leads.length,
            leadsThisMonth: mockData.leads.filter(lead => {
                const leadDate = new Date(lead.created_at);
                return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
            }).length,
            totalClients: mockData.clients.length,
            totalRevenue: mockData.invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0),
            revenueThisMonth: mockData.invoices.filter(invoice => {
                const invoiceDate = new Date(invoice.created_at);
                return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
            }).reduce((sum, invoice) => sum + (invoice.total || 0), 0),
            revenueThisWeek: 0, // Calculate this week if needed
            revenueThisYear: mockData.invoices.filter(invoice => {
                const invoiceDate = new Date(invoice.created_at);
                return invoiceDate.getFullYear() === currentYear;
            }).reduce((sum, invoice) => sum + (invoice.total || 0), 0),
            totalExpenses: mockData.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0),
            expensesThisMonth: mockData.expenses.filter(expense => {
                const expenseDate = new Date(expense.created_at);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            }).reduce((sum, expense) => sum + (expense.amount || 0), 0),
            expensesThisWeek: 0, // Calculate this week if needed
            expensesThisYear: mockData.expenses.filter(expense => {
                const expenseDate = new Date(expense.created_at);
                return expenseDate.getFullYear() === currentYear;
            }).reduce((sum, expense) => sum + (expense.amount || 0), 0),
            netProfit: 0
        };

        // Calculate net profit
        stats.netProfit = stats.totalRevenue - stats.totalExpenses;

        const revenue = {
            today: 0,
            week: stats.revenueThisWeek,
            month: stats.revenueThisMonth,
            year: stats.revenueThisYear,
            monthlyTrend: []
        };

        updateDashboardStats(stats);
        loadRevenueCharts(revenue);
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading dashboard data. Please try again.', 'error');
        
        // Set default values to prevent UI errors
        updateDashboardStats({
            totalLeads: 0,
            totalClients: 0,
            totalRevenue: 0,
            netProfit: 0
        });
    }
}

function updateDashboardStats(stats) {
    document.getElementById('totalLeads').textContent = stats.totalLeads || 0;
    document.getElementById('totalClients').textContent = stats.totalClients || 0;
    document.getElementById('totalRevenue').textContent = '₹' + formatNumber(stats.totalRevenue || 0);
    document.getElementById('netProfit').textContent = '₹' + formatNumber(stats.netProfit || 0);
    
    // Calculate growth percentages based on real data
    document.getElementById('leadsGrowth').textContent = '0%';
    document.getElementById('clientsGrowth').textContent = '0%';
    document.getElementById('revenueGrowth').textContent = '0%';
    
    // Update profit margin
    const margin = stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0;
    document.getElementById('profitMargin').textContent = `Margin: ${margin}%`;
}

function loadRevenueCharts() {
    // Calculate actual revenue data from invoices
    const revenueData = calculateRevenueData();
    
    createRevenueChart(revenueData.monthlyTrend);
    createLeadSourceChart();
    createRevenueByClientChart();
}

function calculateRevenueData() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate monthly revenue trend for the last 6 months
    const monthlyTrend = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format
        const month = date.getMonth();
        const year = date.getFullYear();
        
        const monthRevenue = mockData.invoices
            .filter(invoice => {
                const invoiceDate = new Date(invoice.created_at);
                return invoiceDate.getMonth() === month && invoiceDate.getFullYear() === year;
            })
            .reduce((sum, invoice) => sum + (invoice.total || 0), 0);
        
        monthlyTrend.push({
            month: monthStr,
            revenue: monthRevenue
        });
    }
    
    return {
        today: mockData.invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.created_at);
            return invoiceDate.toDateString() === today.toDateString();
        }).reduce((sum, invoice) => sum + (invoice.total || 0), 0),
        week: 0, // Calculate this week if needed
        month: mockData.invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.created_at);
            return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
        }).reduce((sum, invoice) => sum + (invoice.total || 0), 0),
        year: mockData.invoices.filter(invoice => {
            const invoiceDate = new Date(invoice.created_at);
            return invoiceDate.getFullYear() === currentYear;
        }).reduce((sum, invoice) => sum + (invoice.total || 0), 0),
        monthlyTrend: monthlyTrend
    };
}

function createRevenueChart(monthlyData) {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (charts.revenueChart) {
        charts.revenueChart.destroy();
    }
    
    // Ensure we have at least 6 months of data for proper visualization
    let processedData = [];
    
    if (monthlyData && monthlyData.length > 0) {
        // Sort data by month
        const sortedData = [...monthlyData].sort((a, b) => a.month.localeCompare(b.month));
        
        // If less than 6 months, add previous months with 0 values
        if (sortedData.length < 6) {
            const firstMonth = sortedData[0].month;
            const [year, month] = firstMonth.split('-').map(Number);
            
            // Generate previous months to fill up to 6 months total
            const neededMonths = 6 - sortedData.length;
            for (let i = neededMonths; i > 0; i--) {
                const prevMonth = new Date(year, month - 1 - i, 1);
                const monthStr = prevMonth.toISOString().slice(0, 7); // YYYY-MM format
                processedData.push({ month: monthStr, revenue: 0 });
            }
        }
        
        // Add actual data
        processedData = [...processedData, ...sortedData];
        
        // Keep only last 6 months if more than 6
        if (processedData.length > 6) {
            processedData = processedData.slice(-6);
        }
    } else {
        // Generate last 6 months with 0 values if no data
        const now = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            processedData.push({ 
                month: d.toISOString().slice(0, 7), 
                revenue: 0 
            });
        }
    }
    
    // Create labels and data arrays
    const labels = processedData.map(item => {
        const date = new Date(item.month + '-01');
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    const data = processedData.map(item => item.revenue || 0);
    
    // Create gradient background
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.3)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.01)');
    
    charts.revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue Trend',
                data: data,
                borderColor: '#2563eb',
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#fff',
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#1d4ed8',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#2563eb',
                    borderWidth: 1,
                    padding: 16,
                    displayColors: false,
                    titleFont: {
                        size: 14,
                        weight: 'bold',
                        family: 'Inter, sans-serif'
                    },
                    bodyFont: {
                        size: 13,
                        family: 'Inter, sans-serif'
                    },
                    callbacks: {
                        title: function(context) {
                            return context[0].label + ' Revenue';
                        },
                        label: function(context) {
                            return 'Amount: \u20B9' + formatNumber(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.03)',
                        drawBorder: false,
                        lineWidth: 1
                    },
                    ticks: {
                        callback: function(value) {
                            return '\u20B9' + formatNumber(value);
                        },
                        font: {
                            size: 11,
                            family: 'Inter, sans-serif',
                            weight: '500'
                        },
                        color: '#64748b',
                        padding: 10
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 11,
                            family: 'Inter, sans-serif',
                            weight: '500'
                        },
                        color: '#64748b',
                        padding: 10
                    }
                }
            },
            elements: {
                point: {
                    hoverRadius: 8
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function createLeadSourceChart() {
    const ctx = document.getElementById('leadSourceChart');
    if (!ctx) return;
    
    // Destroy existing chart if it exists
    if (charts.leadSourceChart) {
        charts.leadSourceChart.destroy();
    }
    
    charts.leadSourceChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#2563eb',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Leads Functions
function loadLeads() {
    try {
        showLoading(true);
        displayLeads(mockData.leads);
    } catch (error) {
        console.error('Error loading leads:', error);
        showNotification('Error loading leads', 'error');
    } finally {
        showLoading(false);
    }
}

function displayLeads(leads) {
    const tbody = document.getElementById('leadsTableBody');
    tbody.innerHTML = '';
    
    leads.forEach(lead => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${lead.name}</td>
            <td>${lead.email}</td>
            <td>${lead.phone || '-'}</td>
            <td><span class="badge bg-info">${lead.source}</span></td>
            <td>${getStatusBadge(lead.status)}</td>
            <td>${formatDate(lead.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editLead('${lead.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteLead('${lead.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openLeadModal() {
    document.getElementById('leadForm').reset();
    delete document.getElementById('leadForm').dataset.editId;
    document.querySelector('#leadModal .modal-title').textContent = 'Add New Lead';
    const modal = new bootstrap.Modal(document.getElementById('leadModal'));
    modal.show();
}

function saveLead() {
    const editId = document.getElementById('leadForm').dataset.editId;
    const formData = {
        name: document.getElementById('leadName').value,
        email: document.getElementById('leadEmail').value,
        phone: document.getElementById('leadPhone').value,
        company: document.getElementById('leadCompany').value,
        source: document.getElementById('leadSource').value,
        status: document.getElementById('leadStatus').value,
        notes: document.getElementById('leadNotes').value
    };
    
    console.log('Saving lead with data:', formData, 'Edit ID:', editId);
    
    try {
        if (editId) {
            // Update existing lead
            const leadIndex = mockData.leads.findIndex(l => l.id === editId);
            if (leadIndex !== -1) {
                mockData.leads[leadIndex] = { ...mockData.leads[leadIndex], ...formData, updated_at: new Date().toISOString() };
            }
        } else {
            // Create new lead
            const newLead = {
                id: 'lead_' + Date.now(),
                ...formData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            mockData.leads.push(newLead);
        }
        
        bootstrap.Modal.getInstance(document.getElementById('leadModal')).hide();
        showNotification(editId ? 'Lead updated successfully!' : 'Lead saved successfully!', 'success');
        loadLeads();
        loadDashboardData(); // Update dashboard stats
        delete document.getElementById('leadForm').dataset.editId;
    } catch (error) {
        console.error('Error saving lead:', error);
        showNotification('Error saving lead', 'error');
    }
}

function deleteLead(id) {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    
    try {
        const leadIndex = mockData.leads.findIndex(l => l.id === id);
        if (leadIndex !== -1) {
            mockData.leads.splice(leadIndex, 1);
            showNotification('Lead deleted successfully!', 'success');
            loadLeads();
        } else {
            showNotification('Lead not found', 'error');
        }
    } catch (error) {
        console.error('Error deleting lead:', error);
        showNotification('Error deleting lead', 'error');
    }
}

function searchLeads() {
    const searchTerm = document.getElementById('leadSearch').value;
    const status = document.getElementById('leadStatusFilter').value;
    const source = document.getElementById('leadSourceFilter').value;
    
    // Implement search logic
    loadLeadsWithFilters(searchTerm, status, source);
}

async function loadLeadsWithFilters(search, status, source) {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (source) params.append('source', source);
        
        const response = await fetch(`${API_BASE_URL}/api/admin/leads?${params}`);
        const result = await response.json();
        
        if (result.success) {
            displayLeads(result.data);
        }
    } catch (error) {
        console.error('Error loading filtered leads:', error);
    }
}

// Clients Functions
function loadClients() {
    try {
        showLoading(true);
        displayClients(mockData.clients);
    } catch (error) {
        console.error('Error loading clients:', error);
        showNotification('Error loading clients', 'error');
    } finally {
        showLoading(false);
    }
}

function displayClients(clients) {
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '';
    
    clients.forEach(client => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.company_name}</td>
            <td>${client.contact_person}</td>
            <td>${client.email}</td>
            <td>${client.phone || '-'}</td>
            <td><span class="badge bg-info">${client.type}</span></td>
            <td>${getStatusBadge(client.status)}</td>
            <td>0</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editClient('${client.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteClient('${client.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openClientModal() {
    document.getElementById('clientForm').reset();
    delete document.getElementById('clientForm').dataset.editId;
    document.querySelector('#clientModal .modal-title').textContent = 'Add New Client';
    const modal = new bootstrap.Modal(document.getElementById('clientModal'));
    modal.show();
}

function saveClient() {
    const editId = document.getElementById('clientForm').dataset.editId;
    const formData = {
        company_name: document.getElementById('clientCompany').value,
        contact_person: document.getElementById('clientContact').value,
        email: document.getElementById('clientEmail').value,
        phone: document.getElementById('clientPhone').value,
        address: document.getElementById('clientAddress').value,
        type: document.getElementById('clientType').value,
        status: document.getElementById('clientStatus').value,
        notes: document.getElementById('clientNotes').value
    };
    
    try {
        if (editId) {
            // Update existing client
            const clientIndex = mockData.clients.findIndex(c => c.id === editId);
            if (clientIndex !== -1) {
                mockData.clients[clientIndex] = { ...mockData.clients[clientIndex], ...formData, updated_at: new Date().toISOString() };
            }
        } else {
            // Create new client
            const newClient = {
                id: 'client_' + Date.now(),
                ...formData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            mockData.clients.push(newClient);
        }
        
        bootstrap.Modal.getInstance(document.getElementById('clientModal')).hide();
        showNotification(editId ? 'Client updated successfully!' : 'Client saved successfully!', 'success');
        loadClients();
        loadDashboardData(); // Update dashboard stats
        delete document.getElementById('clientForm').dataset.editId;
        document.querySelector('#clientModal .modal-title').textContent = 'Add New Client';
    } catch (error) {
        console.error('Error saving client:', error);
        showNotification('Error saving client', 'error');
    }
}

function deleteClient(id) {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
        const clientIndex = mockData.clients.findIndex(c => c.id === id);
        if (clientIndex !== -1) {
            mockData.clients.splice(clientIndex, 1);
            showNotification('Client deleted successfully!', 'success');
            loadClients();
        } else {
            showNotification('Client not found', 'error');
        }
    } catch (error) {
        console.error('Error deleting client:', error);
        showNotification('Error deleting client', 'error');
    }
}

// Invoice Functions
function loadInvoices() {
    try {
        showLoading(true);
        displayInvoices(mockData.invoices);
    } catch (error) {
        console.error('Error loading invoices:', error);
        showNotification('Error loading invoices', 'error');
    } finally {
        showLoading(false);
    }
}

function displayInvoices(invoices) {
    const tbody = document.getElementById('invoicesTableBody');
    tbody.innerHTML = '';
    
    invoices.forEach(invoice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.invoice_number}</td>
            <td>${invoice.company_name}</td>
            <td>₹${formatNumber(invoice.total)}</td>
            <td>${formatDate(invoice.due_date)}</td>
            <td>${getInvoiceStatusBadge(invoice.status)}</td>
            <td>${formatDate(invoice.created_at)}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="viewInvoice('${invoice.id}')">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-outline-success" onclick="markAsPaid('${invoice.id}')">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteInvoice('${invoice.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadClientsForInvoice() {
    try {
        const clientSelect = document.getElementById('invoiceClient');
        clientSelect.innerHTML = '<option value="">Select Client</option>';
        
        mockData.clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.company_name} (${client.contact_person})`;
            clientSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading clients for invoice:', error);
    }
}

function updateInvoiceClientName() {
    const clientId = document.getElementById('invoiceClient').value;
    const clientNameInput = document.getElementById('invoiceClientName');
    
    if (clientId && clientNameInput) {
        const client = mockData.clients.find(c => c.id === clientId);
        if (client) {
            clientNameInput.value = client.company_name;
        } else {
            clientNameInput.value = '';
        }
    } else if (clientNameInput) {
        clientNameInput.value = '';
    }
}

function openInvoiceModal() {
    document.getElementById('invoiceForm').reset();
    generateInvoiceNumber();
    loadClientsForInvoice(); // Load clients when opening modal
    const modal = new bootstrap.Modal(document.getElementById('invoiceModal'));
    modal.show();
}

function generateInvoiceNumber() {
    const invoiceNumber = 'INV-' + Date.now();
    document.getElementById('invoiceNumber').value = invoiceNumber;
}

function addInvoiceItem() {
    const container = document.getElementById('invoiceItems');
    const itemRow = document.createElement('div');
    itemRow.className = 'row mb-2';
    itemRow.innerHTML = `
        <div class="col-md-5">
            <input type="text" class="form-control" placeholder="Description" name="itemDescription">
        </div>
        <div class="col-md-2">
            <input type="number" class="form-control" placeholder="Quantity" name="itemQuantity" min="1" value="1">
        </div>
        <div class="col-md-2">
            <input type="number" class="form-control" placeholder="Price" name="itemPrice" min="0" step="0.01">
        </div>
        <div class="col-md-2">
            <input type="number" class="form-control" placeholder="Total" name="itemTotal" readonly>
        </div>
        <div class="col-md-1">
            <button type="button" class="btn btn-danger btn-sm" onclick="removeInvoiceItem(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(itemRow);
}

function removeInvoiceItem(button) {
    button.closest('.row').remove();
    calculateInvoiceTotals();
}

function calculateInvoiceItemTotal(input) {
    const row = input.closest('.row');
    const quantity = parseFloat(row.querySelector('[name="itemQuantity"]').value) || 0;
    const price = parseFloat(row.querySelector('[name="itemPrice"]').value) || 0;
    const total = quantity * price;
    
    row.querySelector('[name="itemTotal"]').value = total.toFixed(2);
    calculateInvoiceTotals();
}

function calculateInvoiceTotals() {
    const itemTotals = document.querySelectorAll('[name="itemTotal"]');
    let subtotal = 0;
    
    itemTotals.forEach(total => {
        subtotal += parseFloat(total.value) || 0;
    });
    
    const taxRate = parseFloat(document.getElementById('invoiceTax').value) || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;
    
    document.getElementById('invoiceSubtotal').value = subtotal.toFixed(2);
    document.getElementById('invoiceTaxAmount').value = taxAmount.toFixed(2);
    document.getElementById('invoiceTotal').value = total.toFixed(2);
}

async function saveInvoice() {
    const clientId = document.getElementById('invoiceClient').value;
    const issueDate = document.getElementById('invoiceDate').value;
    const dueDate = document.getElementById('invoiceDueDate').value;
    const notes = document.getElementById('invoiceNotes').value;
    const taxRate = parseFloat(document.getElementById('invoiceTax').value) || 0;
    
    // Get invoice items
    const items = [];
    const itemRows = document.querySelectorAll('#invoiceItems .row');
    
    itemRows.forEach(row => {
        const description = row.querySelector('[name="itemDescription"]').value;
        const quantity = parseFloat(row.querySelector('[name="itemQuantity"]').value) || 0;
        const unitPrice = parseFloat(row.querySelector('[name="itemPrice"]').value) || 0;
        
        if (description && quantity > 0 && unitPrice > 0) {
            items.push({
                description,
                quantity,
                unit_price: unitPrice
            });
        }
    });
    
    if (items.length === 0) {
        showNotification('Please add at least one item to the invoice', 'error');
        return;
    }
    
    const invoiceData = {
        client_id: clientId,
        issue_date: issueDate,
        due_date: dueDate,
        items,
        notes,
        tax_rate: taxRate
    };
    
    try {
        const newInvoice = {
            id: 'invoice_' + Date.now(),
            invoice_number: document.getElementById('invoiceNumber').value,
            company_name: mockData.clients.find(c => c.id === clientId).company_name,
            total: parseFloat(document.getElementById('invoiceTotal').value),
            status: 'pending',
            created_at: new Date().toISOString(),
            ...invoiceData
        };
        mockData.invoices.push(newInvoice);
        
        bootstrap.Modal.getInstance(document.getElementById('invoiceModal')).hide();
        showNotification('Invoice created successfully!', 'success');
        loadInvoices();
        loadDashboardData(); // Update dashboard stats
    } catch (error) {
        console.error('Error creating invoice:', error);
        showNotification('Error creating invoice', 'error');
    }
}

// Expense Functions
function loadExpenses() {
    try {
        showLoading(true);
        displayExpenses(mockData.expenses);
    } catch (error) {
        console.error('Error loading expenses:', error);
        showNotification('Error loading expenses', 'error');
    } finally {
        showLoading(false);
    }
}

function displayExpenses(expenses) {
    const tbody = document.getElementById('expensesTableBody');
    tbody.innerHTML = '';
    
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(expense.date)}</td>
            <td>${expense.description}</td>
            <td><span class="badge bg-info">${expense.category}</span></td>
            <td>₹${formatNumber(expense.amount)}</td>
            <td>${expense.payment_method}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary" onclick="editExpense('${expense.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense('${expense.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateExpenseStats(expenses) {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().slice(0, 7);
    
    const monthExpenses = expenses
        .filter(e => e.date.startsWith(currentMonth))
        .reduce((sum, e) => sum + e.amount, 0);
    
    const lastMonthExpenses = expenses
        .filter(e => e.date.startsWith(lastMonthStr))
        .reduce((sum, e) => sum + e.amount, 0);
    
    document.getElementById('monthExpenses').textContent = '₹' + formatNumber(monthExpenses);
    document.getElementById('lastMonthExpenses').textContent = '₹' + formatNumber(lastMonthExpenses);
    
    const avgExpenses = expenses.length > 0 
        ? expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length 
        : 0;
    document.getElementById('avgExpenses').textContent = '₹' + formatNumber(avgExpenses);
}

function openExpenseModal() {
    document.getElementById('expenseForm').reset();
    delete document.getElementById('expenseForm').dataset.editId;
    document.querySelector('#expenseModal .modal-title').textContent = 'Add Expense';
    setDefaultDates();
    const modal = new bootstrap.Modal(document.getElementById('expenseModal'));
    modal.show();
}

function saveExpense() {
    const editId = document.getElementById('expenseForm').dataset.editId;
    const formData = {
        date: document.getElementById('expenseDate').value,
        description: document.getElementById('expenseDescription').value,
        category: document.getElementById('expenseCategory').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        payment_method: document.getElementById('expensePaymentMethod').value,
        notes: document.getElementById('expenseNotes').value
    };
    
    try {
        if (editId) {
            // Update existing expense
            const expenseIndex = mockData.expenses.findIndex(e => e.id === editId);
            if (expenseIndex !== -1) {
                mockData.expenses[expenseIndex] = { ...mockData.expenses[expenseIndex], ...formData, updated_at: new Date().toISOString() };
            }
        } else {
            // Create new expense
            const newExpense = {
                id: 'expense_' + Date.now(),
                ...formData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            mockData.expenses.push(newExpense);
        }
        
        bootstrap.Modal.getInstance(document.getElementById('expenseModal')).hide();
        showNotification(editId ? 'Expense updated successfully!' : 'Expense saved successfully!', 'success');
        loadExpenses();
        delete document.getElementById('expenseForm').dataset.editId;
        document.querySelector('#expenseModal .modal-title').textContent = 'Add Expense';
    } catch (error) {
        console.error('Error saving expense:', error);
        showNotification('Error saving expense', 'error');
    }
}

function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    
    try {
        const expenseIndex = mockData.expenses.findIndex(e => e.id === id);
        if (expenseIndex !== -1) {
            mockData.expenses.splice(expenseIndex, 1);
            showNotification('Expense deleted successfully!', 'success');
            loadExpenses();
        } else {
            showNotification('Expense not found', 'error');
        }
    } catch (error) {
        console.error('Error deleting expense:', error);
        showNotification('Error deleting expense', 'error');
    }
}

// Revenue Functions
function loadRevenueData() {
    // Calculate actual revenue data from invoices
    const revenueData = calculateRevenueData();
    
    updateRevenueStats(revenueData);
    createRevenueOverviewChart(revenueData.monthlyTrend);
    createRevenueByClientChart();
}

function updateRevenueStats(data) {
    document.getElementById('todayRevenue').textContent = '₹' + formatNumber(data.today || 0);
    document.getElementById('weekRevenue').textContent = '₹' + formatNumber(data.week || 0);
    document.getElementById('monthRevenue').textContent = '₹' + formatNumber(data.month || 0);
    document.getElementById('yearRevenue').textContent = '₹' + formatNumber(data.year || 0);
}

function createRevenueOverviewChart(monthlyData) {
    const ctx = document.getElementById('revenueOverviewChart');
    if (!ctx) return;
    
    if (charts.revenueOverviewChart) {
        charts.revenueOverviewChart.destroy();
    }
    
    const labels = monthlyData ? monthlyData.map(item => {
        const date = new Date(item.month + '-01');
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }) : [];
    
    const data = monthlyData ? monthlyData.map(item => item.revenue) : [];
    
    charts.revenueOverviewChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly Revenue',
                data: data,
                backgroundColor: '#2563eb'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + formatNumber(value);
                        }
                    }
                }
            }
        }
    });
}

function createRevenueByClientChart() {
    const ctx = document.getElementById('revenueByClientChart');
    if (!ctx) return;
    
    if (charts.revenueByClientChart) {
        charts.revenueByClientChart.destroy();
    }
    
    // Calculate revenue by client
    const clientRevenue = {};
    
    mockData.invoices.forEach(invoice => {
        const clientName = invoice.company_name || 'Unknown Client';
        if (!clientRevenue[clientName]) {
            clientRevenue[clientName] = 0;
        }
        clientRevenue[clientName] += invoice.total || 0;
    });
    
    // Sort by revenue and take top clients
    const sortedClients = Object.entries(clientRevenue)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5); // Top 5 clients
    
    const labels = sortedClients.map(([client]) => client);
    const data = sortedClients.map(([, revenue]) => revenue);
    
    charts.revenueByClientChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    '#2563eb',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = '₹' + formatNumber(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Reports Functions
async function loadReports() {
    try {
        showLoading(true);
        await loadProfitLossData();
        createExpenseBreakdownChart();
        loadMonthlyPerformance();
    } catch (error) {
        console.error('Error loading reports:', error);
        showNotification('Error loading reports', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadProfitLossData() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard/stats`);
        const result = await response.json();
        
        if (result.success) {
            const stats = result.data;
            document.getElementById('reportTotalRevenue').textContent = '₹' + formatNumber(stats.totalRevenue || 0);
            document.getElementById('reportTotalExpenses').textContent = '₹' + formatNumber(stats.totalExpenses || 0);
            document.getElementById('reportNetProfit').textContent = '₹' + formatNumber(stats.netProfit || 0);
            
            const margin = stats.totalRevenue > 0 ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) : 0;
            document.getElementById('reportProfitMargin').textContent = `Profit Margin: ${margin}%`;
            
            // Update color based on profit/loss
            const netProfitElement = document.getElementById('reportNetProfit');
            if (stats.netProfit >= 0) {
                netProfitElement.className = 'revenue-positive';
            } else {
                netProfitElement.className = 'revenue-negative';
            }
        }
    } catch (error) {
        console.error('Error loading profit/loss data:', error);
    }
}

function createExpenseBreakdownChart() {
    const ctx = document.getElementById('expenseBreakdownChart');
    if (!ctx) return;
    
    if (charts.expenseBreakdownChart) {
        charts.expenseBreakdownChart.destroy();
    }
    
    // Empty data until real expense data is available
    charts.expenseBreakdownChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#2563eb',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6',
                    '#64748b'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function loadMonthlyPerformance() {
    // Empty monthly performance table until real data is available
    const tbody = document.getElementById('monthlyPerformanceTable');
    tbody.innerHTML = '';
    
    // Show a message when no data is available
    const row = document.createElement('tr');
    row.innerHTML = `
        <td colspan="6" class="text-center text-muted">
            No monthly performance data available yet. Start adding invoices and expenses to see reports.
        </td>
    `;
    tbody.appendChild(row);
}

// Utility Functions
function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(num);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function getStatusBadge(status) {
    const badges = {
        'new': '<span class="badge bg-primary">New</span>',
        'contacted': '<span class="badge bg-info">Contacted</span>',
        'qualified': '<span class="badge bg-warning">Qualified</span>',
        'converted': '<span class="badge bg-success">Converted</span>',
        'lost': '<span class="badge bg-danger">Lost</span>',
        'active': '<span class="badge bg-success">Active</span>',
        'inactive': '<span class="badge bg-secondary">Inactive</span>',
        'pending': '<span class="badge bg-warning">Pending</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">' + status + '</span>';
}

function getInvoiceStatusBadge(status) {
    const badges = {
        'draft': '<span class="badge bg-secondary">Draft</span>',
        'sent': '<span class="badge bg-info">Sent</span>',
        'paid': '<span class="badge bg-success">Paid</span>',
        'overdue': '<span class="badge bg-danger">Overdue</span>',
        'cancelled': '<span class="badge bg-dark">Cancelled</span>'
    };
    return badges[status] || '<span class="badge bg-secondary">' + status + '</span>';
}

function showLoading(show) {
    const spinner = document.querySelector('.loading-spinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Export functions
async function exportInvoices() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/invoices`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            // Convert to CSV
            const headers = ['Invoice Number', 'Client', 'Amount', 'Issue Date', 'Due Date', 'Status', 'Created'];
            const csvRows = [
                headers.join(','),
                ...result.data.map(invoice => [
                    invoice.invoice_number,
                    invoice.company_name,
                    invoice.total,
                    invoice.issue_date,
                    invoice.due_date,
                    invoice.status,
                    invoice.created_at
                ].join(','))
            ].join('\n');
            
            // Create download link
            const blob = new Blob([csvRows], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `invoices_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            showNotification('Invoices exported successfully!', 'success');
        } else {
            showNotification('No invoices to export', 'info');
        }
    } catch (error) {
        console.error('Error exporting invoices:', error);
        showNotification('Error exporting invoices', 'error');
    }
}

async function exportExpenses() {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/expenses`);
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            // Convert to CSV
            const headers = ['Date', 'Description', 'Category', 'Amount', 'Payment Method'];
            const csvRows = [
                headers.join(','),
                ...result.data.map(expense => [
                    expense.date,
                    expense.description,
                    expense.category,
                    expense.amount,
                    expense.payment_method
                ].join(','))
            ].join('\n');
            
            // Create download link
            const blob = new Blob([csvRows], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            showNotification('Expenses exported successfully!', 'success');
        } else {
            showNotification('No expenses to export', 'info');
        }
    } catch (error) {
        console.error('Error exporting expenses:', error);
        showNotification('Error exporting expenses', 'error');
    }
}

// Edit functions
async function editLead(id) {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/leads`);
        const result = await response.json();
        
        if (result.success) {
            const lead = result.data.find(l => l.id === id);
            if (lead) {
                // Populate the lead modal with existing data
                document.getElementById('leadName').value = lead.name;
                document.getElementById('leadEmail').value = lead.email;
                document.getElementById('leadPhone').value = lead.phone || '';
                document.getElementById('leadCompany').value = lead.company || '';
                document.getElementById('leadSource').value = lead.source;
                document.getElementById('leadStatus').value = lead.status;
                document.getElementById('leadNotes').value = lead.notes || '';
                
                // Store the ID for update
                document.getElementById('leadForm').dataset.editId = id;
                
                // Change modal title
                document.querySelector('#leadModal .modal-title').textContent = 'Edit Lead';
                
                // Show modal
                const modal = new bootstrap.Modal(document.getElementById('leadModal'));
                modal.show();
            }
        }
    } catch (error) {
        console.error('Error loading lead for edit:', error);
        showNotification('Error loading lead data', 'error');
    }
}

async function editExpense(id) {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/expenses`);
        const result = await response.json();
        
        if (result.success) {
            const expense = result.data.find(e => e.id === id);
            if (expense) {
                // Populate the expense modal with existing data
                document.getElementById('expenseDate').value = expense.date;
                document.getElementById('expenseDescription').value = expense.description;
                document.getElementById('expenseCategory').value = expense.category;
                document.getElementById('expenseAmount').value = expense.amount;
                document.getElementById('expensePaymentMethod').value = expense.payment_method || 'cash';
                document.getElementById('expenseNotes').value = expense.notes || '';
                
                // Store the ID for update
                document.getElementById('expenseForm').dataset.editId = id;
                
                // Change modal title
                document.querySelector('#expenseModal .modal-title').textContent = 'Edit Expense';
                
                // Show modal
                const modal = new bootstrap.Modal(document.getElementById('expenseModal'));
                modal.show();
            }
        }
    } catch (error) {
        console.error('Error loading expense for edit:', error);
        showNotification('Error loading expense data', 'error');
    }
}

async function editClient(id) {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/api/admin/clients`);
        const result = await response.json();
        
        if (result.success) {
            const client = result.data.find(c => c.id === id);
            if (client) {
                // Populate the client modal with existing data
                document.getElementById('clientCompany').value = client.company_name;
                document.getElementById('clientContact').value = client.contact_person;
                document.getElementById('clientEmail').value = client.email;
                document.getElementById('clientPhone').value = client.phone || '';
                document.getElementById('clientAddress').value = client.address || '';
                document.getElementById('clientType').value = client.type;
                document.getElementById('clientStatus').value = client.status;
                document.getElementById('clientNotes').value = client.notes || '';
                
                // Store the ID for update
                document.getElementById('clientForm').dataset.editId = id;
                
                // Change modal title
                document.querySelector('#clientModal .modal-title').textContent = 'Edit Client';
                
                // Show modal
                const modal = new bootstrap.Modal(document.getElementById('clientModal'));
                modal.show();
            }
        }
    } catch (error) {
        console.error('Error loading client for edit:', error);
        showNotification('Error loading client data', 'error');
    }
}

function viewInvoice(id) {
    showNotification('Invoice view feature coming soon!', 'info');
}

async function markAsPaid(id) {
    if (!confirm('Are you sure you want to mark this invoice as paid?')) return;
    
    try {
        // Find the invoice in mock data
        const invoiceIndex = mockData.invoices.findIndex(inv => inv.id === id);
        if (invoiceIndex !== -1) {
            // Update the invoice status
            mockData.invoices[invoiceIndex].status = 'paid';
            mockData.invoices[invoiceIndex].updated_at = new Date().toISOString();
            
            showNotification('Invoice marked as paid!', 'success');
            loadInvoices();
            loadDashboardData(); // Update dashboard stats
        } else {
            showNotification('Invoice not found', 'error');
        }
    } catch (error) {
        console.error('Error marking invoice as paid:', error);
        showNotification('Error updating invoice', 'error');
    }
}

async function deleteInvoice(id) {
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone and will affect revenue calculations.')) return;
    
    try {
        // Find the invoice in mock data
        const invoiceIndex = mockData.invoices.findIndex(inv => inv.id === id);
        if (invoiceIndex !== -1) {
            // Remove the invoice
            mockData.invoices.splice(invoiceIndex, 1);
            
            showNotification('Invoice deleted successfully!', 'success');
            loadInvoices();
            loadDashboardData(); // Update dashboard stats
        } else {
            showNotification('Invoice not found', 'error');
        }
    } catch (error) {
        console.error('Error deleting invoice:', error);
        showNotification('Error deleting invoice', 'error');
    }
}

function filterLeads() {
    searchLeads();
}

function filterClients() {
    const searchTerm = document.getElementById('clientSearch').value;
    const status = document.getElementById('clientStatusFilter').value;
    const type = document.getElementById('clientTypeFilter').value;
    
    // Implement filter logic
    loadClientsWithFilters(searchTerm, status, type);
}

async function loadClientsWithFilters(search, status, type) {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (type) params.append('type', type);
        
        const response = await fetch(`${API_BASE_URL}/api/admin/clients?${params}`);
        const result = await response.json();
        
        if (result.success) {
            displayClients(result.data);
        }
    } catch (error) {
        console.error('Error loading filtered clients:', error);
    }
}

function searchClients() {
    filterClients();
}

function filterInvoices() {
    const searchTerm = document.getElementById('invoiceSearch').value;
    const status = document.getElementById('invoiceStatusFilter').value;
    const month = document.getElementById('invoiceMonthFilter').value;
    
    // Implement filter logic
    loadInvoicesWithFilters(searchTerm, status, month);
}

async function loadInvoicesWithFilters(search, status, month) {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (month) params.append('month', month);
        
        const response = await fetch(`${API_BASE_URL}/api/admin/invoices?${params}`);
        const result = await response.json();
        
        if (result.success) {
            displayInvoices(result.data);
        }
    } catch (error) {
        console.error('Error loading filtered invoices:', error);
    }
}

function searchInvoices() {
    filterInvoices();
}

function filterExpenses() {
    const searchTerm = document.getElementById('expenseSearch').value;
    const category = document.getElementById('expenseCategoryFilter').value;
    const month = document.getElementById('expenseMonthFilter').value;
    
    // Implement filter logic
    loadExpensesWithFilters(searchTerm, category, month);
}

async function loadExpensesWithFilters(search, category, month) {
    try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category) params.append('category', category);
        if (month) params.append('month', month);
        
        const response = await fetch(`${API_BASE_URL}/api/admin/expenses?${params}`);
        const result = await response.json();
        
        if (result.success) {
            displayExpenses(result.data);
            updateExpenseStats(result.data);
        }
    } catch (error) {
        console.error('Error loading filtered expenses:', error);
    }
}

function searchExpenses() {
    filterExpenses();
}

// Logout function
function logout() {
    // Clear all authentication data
    clearAuthData();
    
    showNotification('Logged out successfully!', 'success');
    
    // Immediate redirect to prevent back navigation
    setTimeout(() => {
        window.location.replace('admin-login.html');
    }, 500);
}
