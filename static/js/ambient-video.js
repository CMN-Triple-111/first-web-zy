/**
 * ZYOA Ambient Video & Core UI Interactions
 * Lightweight, zero-glitch, hardware-accelerated background video handler
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Ambient Background Video Management
    // ----------------------------------------------------
    const video = document.getElementById('backgroundVideo');
    const toggleBtn = document.getElementById('videoTogglePlay');

    if (video) {
        // Ensure initial playback without blocking
        const attemptPlay = () => {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay was prevented by browser policy (e.g., Low Power mode)
                    if (toggleBtn) {
                        updateToggleButton(false);
                    }
                });
            }
        };

        const updateToggleButton = (isPlaying) => {
            if (!toggleBtn) return;
            const span = toggleBtn.querySelector('span');
            const svg = toggleBtn.querySelector('svg');
            
            if (isPlaying) {
                toggleBtn.setAttribute('title', 'Pause background video');
                if (span) span.textContent = 'Pause Video';
                if (svg) {
                    svg.innerHTML = `
                        <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                        <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                    `;
                }
            } else {
                toggleBtn.setAttribute('title', 'Play background video');
                if (span) span.textContent = 'Play Video';
                if (svg) {
                    svg.innerHTML = `
                        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
                    `;
                }
            }
        };

        // Toggle button click handler
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                if (video.paused) {
                    video.play().then(() => updateToggleButton(true)).catch(() => {});
                } else {
                    video.pause();
                    updateToggleButton(false);
                }
            });
        }

        // Performance Optimization: Pause video when hero section is not visible
        const heroSection = document.getElementById('hero');
        if ('IntersectionObserver' in window && heroSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        // User scrolled past hero - pause video to preserve CPU / battery
                        if (!video.paused) {
                            video.pause();
                        }
                    } else {
                        // User scrolled back to hero - resume if not explicitly paused by user
                        if (video.paused && (!toggleBtn || toggleBtn.dataset.userPaused !== 'true')) {
                            attemptPlay();
                            updateToggleButton(true);
                        }
                    }
                });
            }, { threshold: 0.05 });

            observer.observe(heroSection);
        }

        // Initial play attempt
        attemptPlay();
    }

    // ----------------------------------------------------
    // 2. Sticky Header Scroll Effect (Passive Listener)
    // ----------------------------------------------------
    const header = document.querySelector('.header-main');
    if (header) {
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    if (window.scrollY > 40) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    // ----------------------------------------------------
    // 3. Mobile Navigation Drawer
    // ----------------------------------------------------
    const hamburger = document.querySelector('.hamburger');
    const drawer = document.getElementById('mobileDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const drawerClose = document.querySelector('.drawer-close');
    const drawerLinks = document.querySelectorAll('.drawer-nav a');

    const openDrawer = () => {
        if (!drawer || !overlay) return;
        drawer.classList.add('open');
        overlay.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
    };

    const closeDrawer = () => {
        if (!drawer || !overlay) return;
        drawer.classList.remove('open');
        overlay.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
    };

    if (hamburger) {
        hamburger.addEventListener('click', openDrawer);
    }
    if (drawerClose) {
        drawerClose.addEventListener('click', closeDrawer);
    }
    if (overlay) {
        overlay.addEventListener('click', closeDrawer);
    }
    drawerLinks.forEach((link) => {
        link.addEventListener('click', closeDrawer);
    });

    // Close drawer on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
            closeDrawer();
        }
    });
});
