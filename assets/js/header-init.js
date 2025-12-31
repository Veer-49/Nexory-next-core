// Centralized Header Initialization Script
// This script handles dynamic header loading and mobile menu initialization

(function() {
    'use strict';

    // Global flag to prevent multiple initializations
    let headerInitialized = false;
    let mobileMenuInitialized = false;

    // Function to initialize sticky header
    function initializeStickyHeader() {
        if ($(".sticky-header__content").length) {
            let navContent = document.querySelector(".main-menu").innerHTML;
            let mobileNavContainer = document.querySelector(".sticky-header__content");
            mobileNavContainer.innerHTML = navContent;
        }
        
        if ($(".main-menu__nav").length && $(".mobile-nav__container").length) {
            let navContent = document.querySelector(".main-menu__nav").innerHTML;
            let mobileNavContainer = document.querySelector(".mobile-nav__container");
            mobileNavContainer.innerHTML = navContent;
        }
        
        // Initialize mobile sticky header functionality
        initializeMobileStickyHeader();
    }
    
    // Function to handle mobile sticky header
    function initializeMobileStickyHeader() {
        // Remove existing scroll handler to prevent duplicates
        $(window).off('scroll.mobileSticky');
        
        if ($(window).width() < 1200) {
            console.log('Mobile sticky header initialized');
            $(window).on('scroll.mobileSticky', function() {
                var mobileHeaderScrollPos = 100;
                var mainHeader = $(".main-header");
                var scrollTop = $(window).scrollTop();
                
                if (scrollTop > mobileHeaderScrollPos) {
                    if (!mainHeader.hasClass("mobile-sticky")) {
                        mainHeader.addClass("mobile-sticky");
                        console.log('Mobile sticky header added');
                    }
                } else if (scrollTop <= mobileHeaderScrollPos) {
                    if (mainHeader.hasClass("mobile-sticky")) {
                        mainHeader.removeClass("mobile-sticky");
                        console.log('Mobile sticky header removed');
                    }
                }
            });
        } else {
            // Remove mobile-sticky class if not on mobile
            $(".main-header").removeClass("mobile-sticky");
        }
    }
    
    // Handle window resize for mobile sticky header
    function handleResize() {
        initializeMobileStickyHeader();
    }
    
    // Function to initialize mobile menu with proper event delegation
    function initializeMobileMenu() {
        // Remove existing event handlers to prevent duplicates
        $(document).off('click', '.mobile-nav__toggler');
        
        // Use event delegation for dynamic content
        $(document).on('click', '.mobile-nav__toggler', function (e) {
            e.preventDefault();
            $(".mobile-nav__wrapper").toggleClass("expanded");
            $("body").toggleClass("locked");
            console.log("Mobile menu clicked");
        });
        
        // Also handle close button
        $(document).off('click', '.mobile-nav__close');
        $(document).on('click', '.mobile-nav__close', function (e) {
            e.preventDefault();
            $(".mobile-nav__wrapper").removeClass("expanded");
            $("body").removeClass("locked");
        });
        
        // Handle overlay click
        $(document).off('click', '.mobile-nav__overlay');
        $(document).on('click', '.mobile-nav__overlay', function (e) {
            e.preventDefault();
            $(".mobile-nav__wrapper").removeClass("expanded");
            $("body").removeClass("locked");
        });
        
        console.log("Mobile menu initialized with event delegation");
        mobileMenuInitialized = true;
    }

    // Main initialization function
    function initializeHeader() {
        if (headerInitialized) {
            console.log("Header already initialized, skipping...");
            return;
        }

        const headerContainer = document.getElementById('header-container');
        if (!headerContainer) {
            console.log("Header container not found");
            return;
        }

        fetch('header.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                headerContainer.innerHTML = data;
                
                // Wait for DOM to update
                setTimeout(() => {
                    if (window.$ && window.$.fn) {
                        initializeStickyHeader();
                        initializeMobileMenu();
                        headerInitialized = true;
                    } else {
                        // Wait for jQuery to load
                        const checkJQuery = setInterval(() => {
                            if (window.$ && window.$.fn) {
                                clearInterval(checkJQuery);
                                initializeStickyHeader();
                                initializeMobileMenu();
                                headerInitialized = true;
                            }
                        }, 100);
                    }
                }, 100);
            })
            .catch(error => {
                console.error('Error loading header:', error);
            });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeHeader);
    } else {
        initializeHeader();
    }

    // Re-initialize on page visibility changes (for SPA-like behavior)
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden && !headerInitialized) {
            setTimeout(initializeHeader, 100);
        }
    });

    // Handle window resize events - wait for jQuery to be available
    function initializeResizeHandler() {
        if (window.$ && window.$.fn) {
            $(window).on('resize', function() {
                handleResize();
            });
        }
    }

    // Initialize resize handler when jQuery is ready
    if (window.$ && window.$.fn) {
        initializeResizeHandler();
    } else {
        // Wait for jQuery to load
        const checkJQueryForResize = setInterval(() => {
            if (window.$ && window.$.fn) {
                clearInterval(checkJQueryForResize);
                initializeResizeHandler();
            }
        }, 100);
    }

    // Make functions globally available for backward compatibility
    window.initializeStickyHeader = initializeStickyHeader;
    window.initializeMobileMenu = initializeMobileMenu;
    window.initializeHeader = initializeHeader;

})();
