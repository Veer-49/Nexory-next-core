// Project Showcase Scroll Animations
document.addEventListener('DOMContentLoaded', function() {
    const projectItems = document.querySelectorAll('.project-showcase__item');
    
    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        const windowHeight = window.innerHeight || document.documentElement.clientHeight;
        const windowWidth = window.innerWidth || document.documentElement.clientWidth;
        
        // Element is considered in viewport when it's 20% visible from bottom or top
        const threshold = windowHeight * 0.2;
        
        return (
            rect.top <= windowHeight - threshold &&
            rect.bottom >= threshold &&
            rect.left <= windowWidth &&
            rect.right >= 0
        );
    }
    
    // Function to handle scroll animations
    function handleScrollAnimations() {
        projectItems.forEach((item, index) => {
            const rect = item.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            // Check if item is visible in viewport
            if (isInViewport(item)) {
                if (!item.classList.contains('animate-in')) {
                    // Add animation class with delay for sequential effect
                    setTimeout(() => {
                        item.classList.add('animate-in');
                    }, index * 200); // 200ms delay between each item
                }
            } else {
                // Remove animation class when item is out of viewport (scrolling up)
                if (rect.bottom < 0 || rect.top > windowHeight) {
                    item.classList.remove('animate-in');
                }
            }
        });
    }
    
    // Initial check on page load
    setTimeout(handleScrollAnimations, 100);
    
    // Check on scroll with throttling for performance
    let scrollTimer;
    window.addEventListener('scroll', function() {
        if (scrollTimer) {
            clearTimeout(scrollTimer);
        }
        scrollTimer = setTimeout(function() {
            handleScrollAnimations();
        }, 50); // Throttle to 50ms
    });
    
    // Check on resize
    window.addEventListener('resize', function() {
        handleScrollAnimations();
    });
});
