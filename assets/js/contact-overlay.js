// Contact Overlay JavaScript
(function() {
    'use strict';
    
    // EmailJS Configuration
    const EMAILJS_USER_ID = '8XYNZGBfYNxYCCYuo'; // Your EmailJS User ID
    const EMAILJS_SERVICE_ID = 'service_17o4tq4'; // Your EmailJS Service ID
    const EMAILJS_CONTACT_TEMPLATE_ID = 'template_muzi8cb'; // Template for contact form submission
    const EMAILJS_AUTO_REPLY_TEMPLATE_ID = 'template_4b8rnwc'; // Template for auto-reply to user

    let overlayInitialized = false;
    
    // Function to load EmailJS if not already loaded
    function loadEmailJS() {
        return new Promise((resolve, reject) => {
            if (typeof emailjs !== 'undefined') {
                emailjs.init(EMAILJS_USER_ID);
                console.log('EmailJS initialized');
                resolve();
                return;
            }
            
            // Try multiple CDN sources for EmailJS
            const emailJSSources = [
                'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js',
                'https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js'
            ];
            
            let currentSourceIndex = 0;
            
            function tryLoadNextSource() {
                if (currentSourceIndex >= emailJSSources.length) {
                    reject(new Error('All EmailJS sources failed to load'));
                    return;
                }
                
                const script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = emailJSSources[currentSourceIndex];
                script.onload = () => {
                    console.log(`EmailJS loaded from source: ${emailJSSources[currentSourceIndex]}`);
                    
                    // Check which library loaded and initialize accordingly
                    setTimeout(() => {
                        if (typeof emailjs !== 'undefined') {
                            emailjs.init(EMAILJS_USER_ID);
                            console.log('EmailJS initialized successfully');
                            resolve();
                        } else {
                            console.log(`Source ${emailJSSources[currentSourceIndex]} did not load emailjs, trying next...`);
                            currentSourceIndex++;
                            tryLoadNextSource();
                        }
                    }, 1000);
                };
                script.onerror = () => {
                    console.warn(`Failed to load from ${emailJSSources[currentSourceIndex]}, trying next source...`);
                    currentSourceIndex++;
                    tryLoadNextSource();
                };
                document.head.appendChild(script);
            }
            
            tryLoadNextSource();
        });
    }
    
    
    function initializeContactOverlay() {
        if (overlayInitialized) return;
        
        const getInTouchBtns = document.querySelectorAll('.get-in-touch-btn');
        const contactOverlay = document.getElementById('contactOverlay');
        
        if (!getInTouchBtns.length || !contactOverlay) {
            console.log('Elements not found yet, retrying...');
            return false;
        }
        
        console.log('Contact overlay elements found, initializing...');
        
        // Initialize EmailJS
        loadEmailJS().catch(error => {
            console.error('EmailJS initialization failed:', error);
        });
        
        const closeBtn = document.getElementById('closeContact');
        const contactForm = document.getElementById('contactForm');
        const overlayBg = document.querySelector('.contact-overlay-new__bg');
        
        // Open overlay
        getInTouchBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Get in touch button clicked');
                contactOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
        
        // Close overlay functions
        function closeOverlay() {
            contactOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Close on close button
        if (closeBtn) {
            closeBtn.addEventListener('click', closeOverlay);
        }
        
        // Close on background click
        if (overlayBg) {
            overlayBg.addEventListener('click', closeOverlay);
        }
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && contactOverlay.classList.contains('active')) {
                closeOverlay();
            }
        });
        
        // Handle form submission
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const submitBtn = contactForm.querySelector('.contact-overlay-new__btn');
                if (submitBtn) {
                    const originalText = submitBtn.innerHTML;
                    
                    submitBtn.innerHTML = 'Sending...';
                    submitBtn.disabled = true;
                    
                    // Collect form data
                    const formData = new FormData(contactForm);
                    const userName = formData.get('name');
                    const userEmail = formData.get('email');
                    const userPhone = formData.get('phone');
                    const userService = formData.get('service');
                    const userMessage = formData.get('message');
                    
                    // Submit directly to EmailJS
                    console.log('Submitting to EmailJS...');

                    // Ensure EmailJS is loaded and initialized
                    if (typeof emailjs === 'undefined') {
                        console.error('EmailJS library not loaded');
                        fallbackEmailSubmission(userName, userEmail, userPhone, userService, userMessage, submitBtn, originalText, contactForm, closeOverlay);
                        return;
                    }

                    // Ensure EmailJS is initialized
                    if (!emailjs._userID) {
                        console.log('EmailJS not initialized, initializing now...');
                        try {
                            emailjs.init(EMAILJS_USER_ID);
                            console.log('EmailJS initialized successfully');
                        } catch (initError) {
                            console.error('EmailJS initialization failed:', initError);
                            fallbackEmailSubmission(userName, userEmail, userPhone, userService, userMessage, submitBtn, originalText, contactForm, closeOverlay);
                            return;
                        }
                    }

                    // Validate EmailJS configuration
                    if (!EMAILJS_SERVICE_ID || !EMAILJS_CONTACT_TEMPLATE_ID || !EMAILJS_USER_ID) {
                        console.error('EmailJS configuration missing');
                        fallbackEmailSubmission(userName, userEmail, userPhone, userService, userMessage, submitBtn, originalText, contactForm, closeOverlay);
                        return;
                    }

                    // Prepare EmailJS parameters
                    const contactParams = {
                        name: userName,
                        email: userEmail,
                        phone: userPhone,
                        service: userService,
                        message: userMessage,
                        // Additional field names that might be in your template
                        to_email: 'jupiter.digital.tech@gmail.com',
                        to: 'jupiter.digital.tech@gmail.com',
                        recipient_email: 'jupiter.digital.tech@gmail.com',
                        recipient: 'jupiter.digital.tech@gmail.com',
                        destination: 'jupiter.digital.tech@gmail.com',
                        from_name: userName,
                        from_email: userEmail,
                        user_name: userName,
                        user_email: userEmail,
                        user_phone: userPhone,
                        user_service: userService,
                        user_message: userMessage,
                        customer_name: userName,
                        customer_email: userEmail,
                        customer_phone: userPhone,
                        customer_service: userService,
                        customer_message: userMessage
                    };

                    const replyParams = {
                        email: userEmail,
                        to_email: userEmail,
                        to_name: userName,
                        from_name: 'Jupiter Digital Technologies',
                        name: userName,
                        customer_name: userName,
                        customer_email: userEmail,
                        recipient_name: userName,
                        recipient_email: userEmail,
                        company_name: 'Jupiter Digital Technologies',
                        support_email: 'jupiter.digital.tech@gmail.com',
                        reply_to: userEmail
                    };

                    console.log('Contact params:', contactParams);
                    console.log('Reply params:', replyParams);

                    // Send contact email
                    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE_ID, contactParams)
                        .then(function(response) {
                            console.log('Contact email sent successfully:', response);

                            // Try to send auto-reply
                            return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_AUTO_REPLY_TEMPLATE_ID, replyParams)
                                .then(function(autoReplyResponse) {
                                    console.log('Auto-reply sent successfully:', autoReplyResponse);
                                    return autoReplyResponse;
                                })
                                .catch(function(autoReplyError) {
                                    console.warn('Auto-reply failed, but contact email was sent:', autoReplyError);
                                    return { status: 'partial_success', message: 'Contact email sent, auto-reply failed' };
                                });
                        })
                        .then(function(response) {
                            console.log('Email process completed:', response);
                            showSuccessMessage(submitBtn, originalText, contactForm, closeOverlay);
                        })
                        .catch(function(error) {
                            console.error('EmailJS sending failed:', error);
                            console.error('Error details:', {
                                status: error.status,
                                text: error.text,
                                serviceId: EMAILJS_SERVICE_ID,
                                templateId: EMAILJS_CONTACT_TEMPLATE_ID,
                                fullError: error
                            });
                            fallbackEmailSubmission(userName, userEmail, userPhone, userService, userMessage, submitBtn, originalText, contactForm, closeOverlay);
                        });
                }
            });
        }
        
        function showSuccessMessage(submitBtn, originalText, contactForm, closeOverlay) {
            submitBtn.innerHTML = '✓ Message Sent!';
            submitBtn.classList.add('submit-success');
            
            setTimeout(() => {
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.classList.remove('submit-success');
                closeOverlay();
            }, 3000);
        }
        
        function fallbackEmailSubmission(userName, userEmail, userPhone, userService, userMessage, submitBtn, originalText, contactForm, closeOverlay) {
            console.log('Using fallback email submission');
            
            // Store submission in localStorage as backup
            const submission = {
                name: userName,
                email: userEmail,
                phone: userPhone,
                service: userService,
                message: userMessage,
                timestamp: new Date().toISOString()
            };
            
            let submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
            submissions.push(submission);
            localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
            
            console.log('Submission stored in localStorage:', submission);
            
            // Create mailto link as final fallback
            const subject = encodeURIComponent(`New Contact Form Submission from ${userName}`);
            const body = encodeURIComponent(`
Name: ${userName}
Email: ${userEmail}
Phone: ${userPhone}
Service: ${userService}
Message: ${userMessage}
            `.trim());
            
            const mailtoLink = `mailto:jupiter.digital.tech@gmail.com?subject=${subject}&body=${body}`;
            
            // Show user that we're opening their email client
            submitBtn.innerHTML = '📧 Opening Email Client...';
            
            // Open email client in a new window
            window.open(mailtoLink, '_blank');
            
            // Show success message after a delay
            setTimeout(() => {
                submitBtn.innerHTML = '✓ Email Client Opened';
                submitBtn.classList.add('submit-success');
                
                setTimeout(() => {
                    contactForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('submit-success');
                    closeOverlay();
                }, 2000);
            }, 1000);
        }
        
        overlayInitialized = true;
        console.log('Contact overlay initialized successfully');
        return true;
    }
    
    // Try to initialize on DOMContentLoaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOMContentLoaded fired');
            // Try multiple times to catch dynamically loaded header
            let attempts = 0;
            const maxAttempts = 50;
            const interval = setInterval(() => {
                if (initializeContactOverlay() || attempts >= maxAttempts) {
                    clearInterval(interval);
                }
                attempts++;
            }, 100);
        });
    } else {
        // DOM already loaded
        console.log('DOM already loaded');
        let attempts = 0;
        const maxAttempts = 50;
        const interval = setInterval(() => {
            if (initializeContactOverlay() || attempts >= maxAttempts) {
                clearInterval(interval);
            }
            attempts++;
        }, 100);
    }
    
    // Use MutationObserver to detect when header is dynamically loaded
    const observer = new MutationObserver(function(mutations) {
        if (initializeContactOverlay()) {
            observer.disconnect();
        }
    });
    
    // Observe the document for changes
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
    });
})();

// Utility function to retrieve stored submissions (for debugging)
window.getStoredContactSubmissions = function() {
    return JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
};

// Utility function to clear stored submissions
window.clearStoredContactSubmissions = function() {
    localStorage.removeItem('contactSubmissions');
    console.log('Stored contact submissions cleared');
};

// Debug function to test EmailJS configuration
window.testEmailJSConfig = function() {
    console.log('=== EmailJS Debug Test ===');
    
    if (typeof emailjs === 'undefined') {
        console.error('❌ EmailJS library not loaded');
        return false;
    }
    
    console.log('✅ EmailJS library loaded');
    console.log('User ID:', EMAILJS_USER_ID);
    console.log('Service ID:', EMAILJS_SERVICE_ID);
    console.log('Template ID:', EMAILJS_CONTACT_TEMPLATE_ID);
    
    const testParams = {
        to_email: 'jupiter.digital.tech@gmail.com',
        to: 'jupiter.digital.tech@gmail.com',
        recipient_email: 'jupiter.digital.tech@gmail.com',
        recipient: 'jupiter.digital.tech@gmail.com',
        destination: 'jupiter.digital.tech@gmail.com',
        name: 'Test User',
        email: 'test@example.com',
        phone: '123-456-7890',
        service: 'web-development',
        message: 'This is a test message from EmailJS debug'
    };
    
    console.log('Sending test email with params:', testParams);
    
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_CONTACT_TEMPLATE_ID, testParams)
        .then(function(response) {
            console.log('✅ EmailJS test successful:', response);
        })
        .catch(function(error) {
            console.error('❌ EmailJS test failed:', error);
            console.error('Error details:', {
                status: error?.status,
                text: error?.text,
                message: error?.message,
                fullError: error
            });
        });
    
    return true;
};
