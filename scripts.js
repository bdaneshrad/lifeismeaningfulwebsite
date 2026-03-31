// ─────────────────────────────────────────
// CONFIG — edit these values without touching the rest of the code
// ─────────────────────────────────────────
const MOMENTS_COUNT = 100; // Update this number as more moments are collected


// ─────────────────────────────────────────
// BLUR FADE IN (scroll-triggered)
// Apply to any element with data-animate="blur-fade"
// Optional: data-delay="200" for stagger (ms)
// ─────────────────────────────────────────
function initBlurFades() {
  const elements = document.querySelectorAll('[data-animate="blur-fade"]');
  // rootMargin '0px' and threshold 0 ensure iOS Safari fires correctly —
  // negative rootMargin values are unreliable on iOS momentum scrolling.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.style.transition =
            'opacity 0.7s ease, filter 0.7s ease, transform 0.7s ease';
          entry.target.style.opacity = '1';
          entry.target.style.filter = 'blur(0px)';
          entry.target.style.transform = 'translateY(0)';
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px' });

  elements.forEach(el => {
    el.style.opacity = '0';
    el.style.filter = 'blur(8px)';
    el.style.transform = 'translateY(20px)';
    observer.observe(el);
  });
}


// ─────────────────────────────────────────
// BLUR TEXT (word-by-word animation)
// Apply to any element with data-animate="blur-text"
// ─────────────────────────────────────────
function initBlurText() {
  const elements = document.querySelectorAll('[data-animate="blur-text"]');
  elements.forEach(el => {
    // data-delay on the container offsets the whole sequence (used for line 2 stagger)
    const baseDelay = parseInt(el.dataset.delay || 0);
    // Per-element overrides — fall back to defaults if not set
    // rootMargin '0px' default ensures iOS Safari fires correctly
    const blur       = el.dataset.blur       || '10';
    const duration   = el.dataset.duration   || '0.35';
    const rootMargin = el.dataset.rootMargin || '0px';

    const words = el.textContent.trim().split(' ');
    el.innerHTML = words.map((word, i) =>
      `<span class="blur-word" style="
        display: inline-block;
        opacity: 0;
        filter: blur(${blur}px);
        transform: translateY(50px);
        transition: opacity ${duration}s ease, filter ${duration}s ease, transform ${duration}s ease;
        transition-delay: ${baseDelay + i * 100}ms;
      ">${word}</span>`
    ).join(' ');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.blur-word').forEach(word => {
            word.style.opacity = '1';
            word.style.filter = 'blur(0px)';
            word.style.transform = 'translateY(0)';
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin });
    observer.observe(el);
  });
}


// ─────────────────────────────────────────
// ROTATING SUBTEXT (Hero)
// Cycles phrases in #rotating-phrase every 4200ms.
// Locks element width to the longest phrase so the anchor never shifts.
// ─────────────────────────────────────────
function initRotatingText() {
  const phrases = [
    'Your direction',
    'Your purpose',
    'Your clarity',
    'Your identity'
  ];
  const el = document.getElementById('rotating-phrase');
  if (!el) return;

  let current = 0;

  // Set transition once — not re-applied every cycle
  el.style.transition = 'opacity 0.6s ease';

  // After all fonts are loaded, measure each phrase at its rendered size
  // and lock the element width to the widest result.
  // offsetWidth works even at opacity:0 — layout is unaffected by opacity.
  document.fonts.ready.then(() => {
    let maxWidth = 0;
    phrases.forEach(phrase => {
      el.textContent = phrase;
      maxWidth = Math.max(maxWidth, el.offsetWidth);
    });
    // Add 2px buffer to prevent sub-pixel rounding from occasionally clipping
    el.style.minWidth = (maxWidth + 2) + 'px';
    // Reset to first phrase
    el.textContent = phrases[0];
  });

  function cycle() {
    // Fade out
    el.style.opacity = '0';
    setTimeout(() => {
      // Swap text while fully invisible
      current = (current + 1) % phrases.length;
      el.textContent = phrases[current];
      // Double rAF: first frame commits new text at opacity:0,
      // second frame triggers the CSS transition to opacity:1 cleanly
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '1';
        });
      });
    }, 600); // wait for fade-out to complete before swapping
  }

  el.textContent = phrases[0];
  el.style.opacity = '1';
  setInterval(cycle, 4200); // 3000ms hold + 600ms out + 600ms in
}


// ─────────────────────────────────────────
// STAT COUNTER
// Apply data-count="100" and data-suffix="+" to any element
// Counts from 0 to value over 800ms when scrolled into view
// ─────────────────────────────────────────
function initStatCounters() {
  // Stamp the config value onto the DOM element before observing
  const momentEl = document.querySelector('[data-count-id="moments"]');
  if (momentEl) momentEl.dataset.count = MOMENTS_COUNT;

  const counters = document.querySelectorAll('[data-count]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const duration = 800;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          el.textContent = Math.floor(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}


// ─────────────────────────────────────────
// NAV SCROLL TRIGGER
// Nav is hidden on load. Fades in when hero leaves viewport.
// Uses IntersectionObserver on the hero element — not a scroll distance.
// ─────────────────────────────────────────
function initNav() {
  const nav = document.getElementById('main-nav');
  const hero = document.getElementById('hero');
  if (!nav) return;

  // No hero on this page — show nav immediately
  if (!hero) {
    nav.style.opacity = '1';
    nav.style.pointerEvents = 'all';
    return;
  }

  nav.style.opacity = '0';
  nav.style.pointerEvents = 'none';

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        nav.style.transition = 'opacity 0.4s ease';
        nav.style.opacity = '1';
        nav.style.pointerEvents = 'all';
      } else {
        nav.style.opacity = '0';
        nav.style.pointerEvents = 'none';
      }
    });
  }, { threshold: 0 });

  observer.observe(hero);
}


// ─────────────────────────────────────────
// HAMBURGER MENU (mobile)
// Toggles full-width dropdown beneath nav
// ─────────────────────────────────────────
function initHamburger() {
  const btn = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.style.display === 'flex';
    menu.style.display = isOpen ? 'none' : 'flex';
    btn.setAttribute('aria-expanded', !isOpen);
  });

  // Close menu when any link is tapped
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.style.display = 'none';
      btn.setAttribute('aria-expanded', false);
    });
  });
}


// ─────────────────────────────────────────
// CONTACT FORM — inline confirmation
// Replaces form with confirmation message on submit
// ─────────────────────────────────────────
function initContactForm() {
  const form = document.getElementById('contact-form');
  const confirmation = document.getElementById('contact-confirmation');
  if (!form || !confirmation) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        form.style.transition = 'opacity 0.4s ease';
        form.style.opacity = '0';
        setTimeout(() => {
          form.style.display = 'none';
          confirmation.style.display = 'block';
          confirmation.style.opacity = '0';
          confirmation.style.transition = 'opacity 0.6s ease';
          requestAnimationFrame(() => {
            confirmation.style.opacity = '1';
          });
        }, 400);
      }
    } catch (err) {
      // Fallback: still show confirmation so the user isn't stuck
      form.style.display = 'none';
      confirmation.style.display = 'block';
      confirmation.style.opacity = '1';
    }
  });
}


// ─────────────────────────────────────────
// EMAIL FORM — inline confirmation
// Same pattern as contact form, for Section 5
// ─────────────────────────────────────────
function initEmailForm() {
  const form = document.getElementById('email-form');
  const confirmation = document.getElementById('email-confirmation');
  if (!form || !confirmation) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.style.transition = 'opacity 0.4s ease';
    form.style.opacity = '0';
    setTimeout(() => {
      form.style.display = 'none';
      confirmation.style.display = 'block';
      confirmation.style.opacity = '0';
      confirmation.style.transition = 'opacity 0.6s ease';
      requestAnimationFrame(() => {
        confirmation.style.opacity = '1';
      });
    }, 400);
  });
}


// ─────────────────────────────────────────
// MOMENT FORM — inline submission after email confirmation (Section 5)
// ─────────────────────────────────────────
function initMomentForm() {
  const form = document.getElementById('moment-form');
  const confirmation = document.getElementById('moment-confirmation');
  if (!form || !confirmation) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        form.style.transition = 'opacity 0.4s ease';
        form.style.opacity = '0';
        setTimeout(() => {
          form.style.display = 'none';
          confirmation.style.display = 'block';
          confirmation.style.opacity = '0';
          confirmation.style.transition = 'opacity 0.6s ease';
          requestAnimationFrame(() => { confirmation.style.opacity = '1'; });
        }, 400);
      }
    } catch (err) {
      form.style.display = 'none';
      confirmation.style.display = 'block';
      confirmation.style.opacity = '1';
    }
  });
}


// ─────────────────────────────────────────
// SHARE FORM — share-a-moment.html page form
// ─────────────────────────────────────────
function initShareForm() {
  const form = document.getElementById('share-form');
  const confirmation = document.getElementById('share-confirmation');
  if (!form || !confirmation) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (response.ok) {
        form.style.transition = 'opacity 0.4s ease';
        form.style.opacity = '0';
        setTimeout(() => {
          form.style.display = 'none';
          confirmation.style.display = 'block';
          confirmation.style.opacity = '0';
          confirmation.style.transition = 'opacity 0.6s ease';
          requestAnimationFrame(() => { confirmation.style.opacity = '1'; });
        }, 400);
      }
    } catch (err) {
      form.style.display = 'none';
      confirmation.style.display = 'block';
      confirmation.style.opacity = '1';
    }
  });
}


// ─────────────────────────────────────────
// BEEHIIV THANK YOU MESSAGE
// When the user clicks anywhere in the iframe area, wait 3s then fade in
// a static thank-you message beneath the embed.
// ─────────────────────────────────────────
function initBeehiivThankyou() {
  const iframe  = document.querySelector('.beehiiv-embed');
  const message = document.getElementById('beehiiv-thankyou');
  if (!iframe || !message) return;

  let triggered = false;

  function showMessage() {
    if (triggered) return;
    triggered = true;
    setTimeout(() => {
      message.classList.add('is-visible');
    }, 3000);
  }

  // Fires when the user clicks into the iframe (focus moves from page to iframe)
  window.addEventListener('blur', () => {
    setTimeout(() => {
      if (document.activeElement === iframe) showMessage();
    }, 50);
  });

  // Also catch a direct click on the iframe element itself
  iframe.addEventListener('click', showMessage);
}


// ─────────────────────────────────────────
// INIT ALL
// Runs after DOM is fully loaded
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initRotatingText();
  initBlurFades();
  initBlurText();
  initStatCounters();
  initHamburger();
  initContactForm();
  initEmailForm();
  initMomentForm();
  initShareForm();
  initBeehiivThankyou();
});
