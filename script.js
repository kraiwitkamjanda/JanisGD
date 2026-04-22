/* ===================================================
   script.js — Somchai Garden Studio
   =================================================== */

/* ----- Navbar scroll ----- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ----- Mobile burger menu ----- */
const burgerBtn  = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');

burgerBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ----- Reveal on scroll (IntersectionObserver) ----- */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // stagger siblings in the same parent
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        let delay = 0;
        siblings.forEach((sib, idx) => {
          if (sib === entry.target) delay = idx * 80;
        });
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach(el => revealObserver.observe(el));

/* ----- Count-up animation ----- */
function countUp(el, target, duration) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - elapsed, 3); // ease-out cubic
    el.textContent = Math.round(eased * target);
    if (elapsed < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el     = entry.target;
        const target = parseInt(el.dataset.target, 10);
        if (!isNaN(target)) countUp(el, target, 1400);
        countObserver.unobserve(el);
      }
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll('[data-target]').forEach(el => countObserver.observe(el));

/* ----- Portfolio filter ----- */
const filterBtns = document.querySelectorAll('.filter-btn');
const portItems  = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    portItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.classList.remove('hidden');
        item.style.animation = 'none';
        item.offsetHeight; // reflow
        item.style.animation = 'fadeInUp 0.4s ease forwards';
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// Inject fadeInUp keyframe dynamically
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleSheet);

/* ----- Before / After slider ----- */
const baSlider  = document.getElementById('baSlider');
const baBefore  = document.getElementById('baBefore');
const baHandle  = document.getElementById('baHandle');

if (baSlider) {
  let isDragging = false;

  function setSliderPosition(clientX) {
    const rect = baSlider.getBoundingClientRect();
    let pct = (clientX - rect.left) / rect.width;
    pct = Math.min(Math.max(pct, 0.04), 0.96);
    baBefore.style.width  = (pct * 100) + '%';
    baHandle.style.left   = (pct * 100) + '%';
  }

  // Mouse
  baSlider.addEventListener('mousedown', e => { isDragging = true; setSliderPosition(e.clientX); });
  window.addEventListener('mousemove',   e => { if (isDragging) setSliderPosition(e.clientX); });
  window.addEventListener('mouseup',     () => { isDragging = false; });

  // Touch
  baSlider.addEventListener('touchstart', e => { isDragging = true; setSliderPosition(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchmove',    e => { if (isDragging) setSliderPosition(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend',     () => { isDragging = false; });
}

/* ----- Contact form ----- */
const contactForm = document.getElementById('contactForm');
const formNote    = document.getElementById('formNote');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = 'กำลังส่ง...';
    btn.disabled = true;

    // Simulate async submit (replace with real API call)
    setTimeout(() => {
      formNote.textContent = '✅ ส่งข้อความสำเร็จ! เราจะติดต่อกลับภายใน 24 ชั่วโมง';
      formNote.style.color = '#2d6a1f';
      contactForm.reset();
      btn.textContent = original;
      btn.disabled = false;
    }, 1200);
  });
}

/* ----- Smooth-scroll for nav links ----- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ----- Admin lock icon on toggle button ----- */
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.admin-toggle');
  if (toggleBtn) {
    const updateLock = () => {
      const authed = sessionStorage.getItem('sg_admin') === 'true';
      toggleBtn.classList.toggle('locked', !authed);
      toggleBtn.title = authed ? 'Admin Panel (เข้าสู่ระบบแล้ว)' : 'Admin Login';
    };
    updateLock();
    // Re-check after login/logout
    const observer = new MutationObserver(updateLock);
    observer.observe(document.body, { subtree: false, childList: false, attributes: false });
    // Poll sessionStorage change
    setInterval(updateLock, 800);
  }
});
