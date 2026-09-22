// ============================================================
// Xi-kki Portfolio — Analytics helper (GA4 + Plausible)
// ============================================================
// provider-agnostic: sends to gtag (GA4) and plausible if present
function track(eventName, params = {}) {
  try { if (typeof gtag === 'function') gtag('event', eventName, params); } catch (e) {}
  try { if (typeof plausible === 'function') plausible(eventName, { props: params }); } catch (e) {}
  // dev log on localhost
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    console.debug('[track]', eventName, params);
  }
}

// ============================================================
// Xi-kki Portfolio — Interactive Effects
// ============================================================
document.addEventListener('DOMContentLoaded', () => {

  // ─── Custom Cursor ───
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  if (window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll('a, button, .venture-card, .writing-card, .milestone-card, .stat-card, .social-btn, .tech-logo');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hovering'));
    });
  } else {
    dot.style.display = 'none';
    ring.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

  // ─── Scroll Progress ───
  const progressBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  });

  // ─── Navigation Scroll Effect ───
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // ─── Theme Toggle ───
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Check saved theme
  const savedTheme = localStorage.getItem('xi-kki-theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('xi-kki-theme', next);
    track('theme_toggle', { theme: next });
  });

  // ─── Typewriter Effect ───
  const typewriterEl = document.getElementById('typewriter');
  const phrases = [
    'Building AI agents for Africa',
    'Web3 protocols & smart contracts',
    'Foodtech tools & compliance',
    'Vibe coding at light speed',
    'AI + blockchain = trustless agents'
  ];
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 60;

  function typewriterTick() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      typewriterEl.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 30;
    } else {
      typewriterEl.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 60;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting = true;
      typeSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 400; // Pause before next
    }

    setTimeout(typewriterTick, typeSpeed);
  }

  if (typewriterEl) {
    setTimeout(typewriterTick, 500);
  }

  // ─── Canvas Background (Particle Network) ───
  const canvas = document.getElementById('hero-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrameId;

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.5 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(167, 139, 250, ${this.opacity})`;
        ctx.fill();
      }
    }

    function initParticles() {
      const count = Math.min(Math.floor(canvas.width * 0.05), 100);
      particles = Array.from({ length: count }, () => new Particle());
    }
    initParticles();

    function drawConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 160) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${0.06 * (1 - dist / 160)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawConnections();
      animFrameId = requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // Re-init on resize
    window.addEventListener('resize', () => {
      resizeCanvas();
      initParticles();
    });
  }

  // ─── Reveal Animations (Intersection Observer) ───
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // ─── Tilt Effect on Cards (Desktop hover only) ───
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const tiltCards = document.querySelectorAll('.tilt-card');

    tiltCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        card.style.transition = 'none';
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }

  // ─── Stats Counter (animated counting) ───
  const statNumbers = document.querySelectorAll('.stat-number');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target')) || 0;
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        let current = 0;
        const increment = Math.ceil(target / 40);
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.textContent = prefix + current + suffix;
        }, 30);
        statObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => statObserver.observe(el));

  // ─── Magnetic Button Effect (Desktop only) ───
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const magneticBtns = document.querySelectorAll('.magnetic');
    magneticBtns.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        btn.style.transition = 'none';
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)';
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  // ─── Smooth Nav Links (no default anchor jump) + nav tracking ───
  document.querySelectorAll('.nav-links a, .nav-cta, .hero-actions a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      const label = (link.textContent || href || '').trim().slice(0, 40);
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        track('nav_click', { label: label || href, href });
      } else if (href) {
        track('nav_click', { label: label || href, href });
      }
      if (link.closest('.hero-actions')) track('hero_cta_click', { label, href });
    });
  });

  // ─── Project / Venture tracking ───
  document.querySelectorAll('.venture-links a, .venture-card a').forEach(a => {
    a.addEventListener('click', () => {
      const card = a.closest('.venture-card');
      const project = card ? (card.querySelector('h3')?.textContent || 'unknown').trim() : 'unknown';
      const type = a.classList.contains('venture-link-gh') ? 'github' : 'live_demo';
      const href = a.getAttribute('href') || '';
      track('project_click', { project, type, href });
    });
  });

  // ─── Writing / Newsletter tracking ───
  document.querySelectorAll('.writing-card, .writing-cta a, a[href*="substack.com"]').forEach(a => {
    a.addEventListener('click', () => {
      const title = a.querySelector('h3')?.textContent?.trim() || a.textContent.trim().slice(0, 50) || 'substack';
      track('writing_click', { title, href: a.getAttribute('href') || '' });
    });
  });

  // ─── Contact / Social tracking ───
  document.querySelectorAll('.contact-social a, .social-btn, .about-link').forEach(a => {
    a.addEventListener('click', () => {
      const label = (a.textContent || a.getAttribute('href') || '').trim().slice(0, 50);
      const href = a.getAttribute('href') || '';
      let channel = 'other';
      if (href.includes('mailto:')) channel = 'email';
      else if (href.includes('github.com')) channel = 'github';
      else if (href.includes('x.com') || href.includes('twitter')) channel = 'x_twitter';
      else if (href.includes('substack')) channel = 'substack';
      else if (href.includes('t.me') || href.includes('telegram')) channel = 'telegram';
      track('contact_click', { channel, label, href });
    });
  });

  // ─── Outbound link tracking (catch-all) ───
  document.querySelectorAll('a[href^="http"]').forEach(a => {
    if (a.hostname === location.hostname) return;
    a.addEventListener('click', () => {
      // avoid double-firing if already tracked above
      if (a.closest('.venture-card') || a.closest('.contact-social') || a.closest('.about-link') || a.closest('.writing-grid')) return;
      track('outbound_click', { href: a.getAttribute('href') || '', label: (a.textContent || '').trim().slice(0, 50) });
    });
  });

  // ─── Scroll depth (25/50/75/100) ───
  const depthMarks = [25, 50, 75, 100];
  const firedDepth = new Set();
  window.addEventListener('scroll', () => {
    const scrolled = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
    depthMarks.forEach(mark => {
      if (scrolled >= mark && !firedDepth.has(mark)) {
        firedDepth.add(mark);
        track('scroll_depth', { percent: mark });
      }
    });
  }, { passive: true });

  // ─── Time on page (heartbeat at 30s, 60s, 180s) ───
  [30, 60, 180].forEach(sec => {
    setTimeout(() => track('time_on_page', { seconds: sec }), sec * 1000);
  });

  console.log('🚀 Xi-kki Portfolio loaded. Built with ❤️');
});
