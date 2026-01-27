// Contact Overlay JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Contact overlay script loaded');
    
    // Use MutationObserver to detect when header is loaded
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                const getInTouchBtn = document.querySelector('.main-menu__right .ogency-btn[href="contact.html"]');
                if (getInTouchBtn && !getInTouchBtn.hasAttribute('data-overlay-initialized')) {
                    console.log('Header detected, initializing contact overlay');
                    initializeContactOverlay();
                    getInTouchBtn.setAttribute('data-overlay-initialized', 'true');
                    observer.disconnect();
                }
            }
        });
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Also check immediately in case header is already loaded
    if (document.querySelector('.main-menu__right .ogency-btn[href="contact.html"]')) {
        initializeContactOverlay();
    }
    
    // Wait for header to be loaded before initializing
    function initializeContactOverlay() {
        console.log('Initializing contact overlay...');
        
        const getInTouchBtn = document.querySelector('.main-menu__right .ogency-btn[href="contact.html"]');
        const contactOverlay = document.getElementById('contactOverlay');
        const closeBtn = document.getElementById('closeContact');
        const contactForm = document.getElementById('contactForm');
        const overlayTitle = document.querySelector('.contact-overlay__title');
        
        console.log('Elements found:', {
            getInTouchBtn: !!getInTouchBtn,
            contactOverlay: !!contactOverlay,
            closeBtn: !!closeBtn,
            contactForm: !!contactForm,
            overlayTitle: !!overlayTitle
        });
        
        // Prevent default link behavior and open overlay
        if (getInTouchBtn) {
            getInTouchBtn.addEventListener('click', function(e) {
                console.log('Get in touch button clicked');
                e.preventDefault();
                openContactOverlay();
            });
            console.log('Contact overlay event listener attached successfully');
        } else {
            console.error('Get in touch button not found');
        }
        
        // Close overlay
        if (closeBtn) {
            closeBtn.addEventListener('click', closeContactOverlay);
        }
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && contactOverlay && contactOverlay.classList.contains('active')) {
                closeContactOverlay();
            }
        });
        
        // Close on background click
        if (contactOverlay) {
            contactOverlay.addEventListener('click', function(e) {
                if (e.target === contactOverlay) {
                    closeContactOverlay();
                }
            });
        }
        
        function openContactOverlay() {
            if (contactOverlay) {
                contactOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                
                // Animate button text to title
                setTimeout(() => {
                    if (overlayTitle) {
                        overlayTitle.classList.add('animate-in');
                    }
                }, 300);
            }
        }
        
        function closeContactOverlay() {
            if (contactOverlay) {
                contactOverlay.classList.remove('active');
                document.body.style.overflow = '';
                if (overlayTitle) {
                    overlayTitle.classList.remove('animate-in');
                }
            }
        }
        
        // Handle form submission
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Add success animation
                const submitBtn = this.querySelector('.contact-overlay__submit');
                if (submitBtn) {
                    submitBtn.classList.add('success');
                    submitBtn.innerHTML = '<span>Message Sent!</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                    
                    // Reset form after delay
                    setTimeout(() => {
                        contactForm.reset();
                        submitBtn.classList.remove('success');
                        submitBtn.innerHTML = '<span>Send Message</span><svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                        closeContactOverlay();
                    }, 2000);
                }
            });
        }
    }
});
