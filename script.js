(() => {
    'use strict';

    /* ==============================
       PARTICLE CANVAS
       ============================== */
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        const count = Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 12000));
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.4 + 0.1,
            });
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            // Slight attraction toward mouse
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 250) {
                p.vx += dx * 0.00003;
                p.vy += dy * 0.00003;
            }

            p.x += p.vx;
            p.y += p.vy;

            // Damping
            p.vx *= 0.999;
            p.vy *= 0.999;

            // Wrap around
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.fill();

            // Draw connections
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const d = Math.hypot(p.x - p2.x, p.y - p2.y);
                if (d < 120) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(0, 229, 255, ${0.07 * (1 - d / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    createParticles();
    drawParticles();

    window.addEventListener('resize', () => {
        resizeCanvas();
        createParticles();
    });

    /* ==============================
       MOUSE GLOW
       ============================== */
    const glow = document.getElementById('glow');
    let glowX = window.innerWidth / 2;
    let glowY = window.innerHeight / 2;
    let targetGlowX = glowX;
    let targetGlowY = glowY;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        targetGlowX = e.clientX;
        targetGlowY = e.clientY;
    });

    function animateGlow() {
        glowX += (targetGlowX - glowX) * 0.08;
        glowY += (targetGlowY - glowY) * 0.08;
        glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
        requestAnimationFrame(animateGlow);
    }
    animateGlow();

    /* ==============================
       SECTIONS & STATE
       ============================== */
    const panels = document.querySelectorAll('.panel');
    const dots = document.querySelectorAll('.dot');
    const totalSections = panels.length;
    let currentSection = 0;
    let isTransitioning = false;
    let isLoaded = false;

    // Mark first panel as active
    panels[0].classList.add('active');

    /* ==============================
       LOADER
       ============================== */
    const loader = document.getElementById('loader');
    const loaderFill = document.querySelector('.loader-fill');
    const loaderPercent = document.querySelector('.loader-percent');

    let loadProgress = 0;
    const loadInterval = setInterval(() => {
        loadProgress += Math.random() * 15 + 5;
        if (loadProgress >= 100) {
            loadProgress = 100;
            clearInterval(loadInterval);
            setTimeout(finishLoading, 400);
        }
        loaderFill.style.width = loadProgress + '%';
        loaderPercent.textContent = Math.round(loadProgress) + '%';
    }, 120);

    function finishLoading() {
        isLoaded = true;

        gsap.to(loader, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
                loader.style.display = 'none';
                animateSection(0);
            },
        });
    }

    /* ==============================
       SECTION TRANSITIONS
       ============================== */
    function animateSection(index) {
        if (index < 0 || index >= totalSections) return;

        isTransitioning = true;
        const prev = currentSection;
        currentSection = index;

        // Update dots
        dots.forEach((d, i) => d.classList.toggle('active', i === index));

        // Update footer visibility
        const footer = document.getElementById('footer');
        footer.classList.toggle('show', index === totalSections - 1);

        // Timeline for exit
        const tl = gsap.timeline({
            onComplete: () => {
                panels[prev].classList.remove('active');
                panels[index].classList.add('active');
                animateSectionIn(index);
            },
        });

        if (prev !== index) {
            const direction = index > prev ? 1 : -1;
            tl.to(panels[prev], {
                opacity: 0,
                y: -60 * direction,
                scale: 0.97,
                duration: 0.6,
                ease: 'power3.in',
            });
        } else {
            // First load — just continue
            panels[index].classList.add('active');
            animateSectionIn(index);
            return;
        }
    }

    function animateSectionIn(index) {
        const panel = panels[index];
        // Reset position
        gsap.set(panel, { opacity: 1, y: 0, scale: 1, visibility: 'visible' });

        const tl = gsap.timeline({
            onComplete: () => {
                isTransitioning = false;
            },
        });

        // Animate split-text line reveals
        const lines = panel.querySelectorAll('.split-text .line-inner');
        if (lines.length) {
            gsap.set(lines, { y: '110%' });
            tl.to(lines, {
                y: '0%',
                duration: 1,
                ease: 'power4.out',
                stagger: 0.12,
            }, 0);
        }

        // Animate reveal-text
        const revealTexts = panel.querySelectorAll('.reveal-text');
        if (revealTexts.length) {
            gsap.set(revealTexts, { opacity: 0, y: 30 });
            tl.to(revealTexts, {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
                stagger: 0.1,
            }, 0.3);
        }

        // Animate reveal-card
        const cards = panel.querySelectorAll('.reveal-card');
        if (cards.length) {
            gsap.set(cards, { opacity: 0, y: 50, scale: 0.95 });
            tl.to(cards, {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: 'power3.out',
                stagger: 0.12,
            }, 0.4);
        }

        // Counter animation for stats section
        if (panel.id === 'stats') {
            const counters = panel.querySelectorAll('.stat-number');
            counters.forEach((counter) => {
                const target = parseInt(counter.dataset.target);
                gsap.fromTo(counter, { innerText: 0 }, {
                    innerText: target,
                    duration: 2,
                    ease: 'power2.out',
                    snap: { innerText: 1 },
                    delay: 0.5,
                });
            });
        }
    }

    /* ==============================
       SCROLL / WHEEL HANDLING
       ============================== */
    let lastWheelTime = 0;
    const wheelCooldown = 1200;

    window.addEventListener('wheel', (e) => {
        if (!isLoaded || isTransitioning) return;

        const now = Date.now();
        if (now - lastWheelTime < wheelCooldown) return;

        const delta = e.deltaY;
        if (Math.abs(delta) < 30) return; // ignore tiny scrolls

        lastWheelTime = now;

        if (delta > 0 && currentSection < totalSections - 1) {
            animateSection(currentSection + 1);
        } else if (delta < 0 && currentSection > 0) {
            animateSection(currentSection - 1);
        }
    }, { passive: true });

    /* ==============================
       TOUCH HANDLING (mobile swipe)
       ============================== */
    let touchStartY = 0;

    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (!isLoaded || isTransitioning) return;

        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;

        if (Math.abs(diff) < 50) return;

        if (diff > 0 && currentSection < totalSections - 1) {
            animateSection(currentSection + 1);
        } else if (diff < 0 && currentSection > 0) {
            animateSection(currentSection - 1);
        }
    }, { passive: true });

    /* ==============================
       KEYBOARD NAVIGATION
       ============================== */
    window.addEventListener('keydown', (e) => {
        if (!isLoaded || isTransitioning) return;

        if (e.key === 'ArrowDown' || e.key === ' ') {
            e.preventDefault();
            if (currentSection < totalSections - 1) animateSection(currentSection + 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (currentSection > 0) animateSection(currentSection - 1);
        }
    });

    /* ==============================
       DOT NAVIGATION
       ============================== */
    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            if (isTransitioning) return;
            const target = parseInt(dot.dataset.section);
            if (target !== currentSection) animateSection(target);
        });
    });

    /* ==============================
       NAV LINK NAVIGATION
       ============================== */
    document.querySelectorAll('[data-goto]').forEach((el) => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            if (isTransitioning) return;
            const target = parseInt(el.dataset.goto);
            if (target !== currentSection) animateSection(target);
        });
    });

    /* ==============================
       MOBILE MENU
       ============================== */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            hamburger.classList.toggle('open');
        });

        mobileNavLinks.forEach((link) => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                mobileMenu.classList.remove('open');
                hamburger.classList.remove('open');
                if (isTransitioning) return;
                const target = parseInt(link.dataset.goto);
                if (target !== currentSection) animateSection(target);
            });
        });
    }

})();
