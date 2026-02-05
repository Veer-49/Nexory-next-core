// Contact Overlay JavaScript
(function() {
    'use strict';
    
    let overlayInitialized = false;
    
    function initializeContactOverlay() {
        if (overlayInitialized) return;
        
        const getInTouchBtn = document.querySelector('.get-in-touch-btn');
        const contactOverlay = document.getElementById('contactOverlay');
        
        if (!getInTouchBtn || !contactOverlay) {
            console.log('Elements not found yet, retrying...');
            return false;
        }
        
        console.log('Contact overlay elements found, initializing...');
        
        const closeBtn = document.getElementById('closeContact');
        const contactForm = document.getElementById('contactForm');
        const overlayBg = document.querySelector('.contact-overlay-new__bg');
        
        // Open overlay
        getInTouchBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Get in touch button clicked');
            contactOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
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
                
                // Show success message
                const submitBtn = contactForm.querySelector('.contact-overlay-new__btn');
                if (submitBtn) {
                    const originalText = submitBtn.innerHTML;
                    
                    submitBtn.innerHTML = '✓ Message Sent!';
                    submitBtn.disabled = true;
                    submitBtn.classList.add('submit-success');
                    
                    // Reset form after delay
                    setTimeout(() => {
                        contactForm.reset();
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('submit-success');
                        closeOverlay();
                    }, 2000);
                }
            });
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
