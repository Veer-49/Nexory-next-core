// Service Card Mobile Flip Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Get all service showcase items
    const serviceItems = document.querySelectorAll('.service-showcase__item');
    
    if (serviceItems.length > 0) {
        serviceItems.forEach(item => {
            // Add click event listener for mobile
            item.addEventListener('click', function(e) {
                if (isMobile()) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Toggle flipped class
                    this.classList.toggle('flipped');
                    
                    // Close other cards (optional - remove if you want multiple cards open)
                    serviceItems.forEach(otherItem => {
                        if (otherItem !== this) {
                            otherItem.classList.remove('flipped');
                        }
                    });
                }
            });
            
            // Touch events for better mobile experience
            item.addEventListener('touchstart', function(e) {
                if (isMobile()) {
                    this.style.transform = 'scale(0.98)';
                }
            });
            
            item.addEventListener('touchend', function(e) {
                if (isMobile()) {
                    this.style.transform = '';
                }
            });
        });
        
        // Close cards when clicking outside (mobile only)
        document.addEventListener('click', function(e) {
            if (isMobile()) {
                const isClickInsideCard = e.target.closest('.service-showcase__item');
                
                if (!isClickInsideCard) {
                    serviceItems.forEach(item => {
                        item.classList.remove('flipped');
                    });
                }
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (!isMobile()) {
                // Remove flipped class when switching to desktop
                serviceItems.forEach(item => {
                    item.classList.remove('flipped');
                });
            }
        });
    }
});
