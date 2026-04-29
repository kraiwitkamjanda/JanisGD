/* ===================================================
   script.js — Somchai Garden Studio
   =================================================== */

/* ================================================================
   CONFIG — แก้ไขค่าตรงนี้เท่านั้น
   ================================================================ */

// ✅ EmailJS
const EMAILJS_PUBLIC_KEY  = 'nwP8iILI3k_JKlzXO';
const EMAILJS_SERVICE_ID  = 'service_t7308o9';
const EMAILJS_TEMPLATE_ID = 'template_m2r5yug';

// ✅ GAS URL — ไม่ต้องแก้อะไรเพิ่ม
const LINE_PROXY_URL = 'https://script.google.com/macros/s/AKfycbyBR8Va8V8Vo3cuZAsawR6DDDIowGDHyEAk9g6Tv_O1gxsp7KSDAZxBi7LQd5vbT5BCsA/exec';

/* ================================================================
   EMAILJS — โหลด SDK
   ================================================================ */
(function loadEmailJS() {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  s.onload = () => emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  document.head.appendChild(s);
})();

async function sendEmail(params) {
  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    return { ok: true };
  } catch (e) {
    console.error('[EmailJS]', e);
    return { ok: false };
  }
}

/* ================================================================
   ส่งข้อมูลไปหา Google Apps Script → GAS ส่ง LINE ต่อเอง
   ================================================================ */
async function sendToGAS(fields) {
  try {
    // ใช้ URLSearchParams เพื่อให้ GAS รับได้ผ่าน e.parameter
    const body = new URLSearchParams();
    body.append('name',    fields.name);
    body.append('phone',   fields.phone);
    body.append('service', fields.service);
    body.append('message', fields.message);

    // no-cors เพราะ GAS ไม่ support CORS — ส่งได้แต่อ่าน response ไม่ได้
    await fetch(LINE_PROXY_URL, {
      method: 'POST',
      mode:   'no-cors',
      body:   body,
    });

    // no-cors ถือว่า ok ถ้าไม่ throw error
    return { ok: true };
  } catch (e) {
    console.error('[GAS]', e);
    return { ok: false };
  }
}

/* ================================================================
   NAVBAR SCROLL
   ================================================================ */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

/* ================================================================
   MOBILE MENU
   ================================================================ */
const burgerBtn  = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');

burgerBtn.addEventListener('click', () => mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ================================================================
   REVEAL ON SCROLL
   ================================================================ */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const siblings = entry.target.parentElement.querySelectorAll('.reveal');
        let delay = 0;
        siblings.forEach((sib, idx) => { if (sib === entry.target) delay = idx * 80; });
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach(el => revealObserver.observe(el));

/* ================================================================
   COUNT-UP ANIMATION
   ================================================================ */
function countUp(el, target, duration) {
  const start = performance.now();
  const update = (now) => {
    const elapsed = Math.min((now - start) / duration, 1);
    const eased   = 1 - Math.pow(1 - elapsed, 3);
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

/* ================================================================
   PORTFOLIO FILTER
   ================================================================ */
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
        item.offsetHeight;
        item.style.animation = 'fadeInUp 0.4s ease forwards';
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleSheet);

/* ================================================================
   BEFORE / AFTER SLIDER
   ================================================================ */
const baSlider = document.getElementById('baSlider');
const baBefore = document.getElementById('baBefore');
const baHandle = document.getElementById('baHandle');

if (baSlider) {
  let isDragging = false;
  function setSliderPosition(clientX) {
    const rect = baSlider.getBoundingClientRect();
    let pct = Math.min(Math.max((clientX - rect.left) / rect.width, 0.04), 0.96);
    baBefore.style.width = (pct * 100) + '%';
    baHandle.style.left  = (pct * 100) + '%';
  }
  baSlider.addEventListener('mousedown',  e => { isDragging = true; setSliderPosition(e.clientX); });
  window.addEventListener('mousemove',    e => { if (isDragging) setSliderPosition(e.clientX); });
  window.addEventListener('mouseup',      () => { isDragging = false; });
  baSlider.addEventListener('touchstart', e => { isDragging = true; setSliderPosition(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchmove',    e => { if (isDragging) setSliderPosition(e.touches[0].clientX); }, { passive: true });
  window.addEventListener('touchend',     () => { isDragging = false; });
}

/* ================================================================
   CONTACT FORM — ส่งทั้ง Email + LINE พร้อมกัน
   ================================================================ */
const contactForm = document.getElementById('contactForm');
const formNote    = document.getElementById('formNote');

if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();

    const btn      = contactForm.querySelector('button[type="submit"]');
    const original = btn.textContent;
    btn.textContent = '⏳ กำลังส่ง...';
    btn.disabled    = true;
    formNote.textContent = '';

    // เก็บค่าจากฟอร์ม
    const fields = {
      name:    document.getElementById('name').value.trim()    || 'ไม่ระบุ',
      phone:   document.getElementById('phone').value.trim()   || 'ไม่ระบุ',
      service: document.getElementById('service').value        || 'ไม่ระบุ',
      message: document.getElementById('message').value.trim() || '-',
    };
    const now = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

    // EmailJS params
    const emailParams = {
      from_name: fields.name,
      phone:     fields.phone,
      service:   fields.service,
      message:   fields.message,
      sent_at:   now,
    };

    // ส่งพร้อมกันทั้ง 2 ช่องทาง
    const [emailResult, gasResult] = await Promise.allSettled([
      sendEmail(emailParams),
      sendToGAS(fields),
    ]);

    const emailOk = emailResult.status === 'fulfilled' && emailResult.value?.ok;
    const gasOk   = gasResult.status   === 'fulfilled' && gasResult.value?.ok;

    if (emailOk || gasOk) {
      let ch = [];
      if (emailOk) ch.push('📧 อีเมล');
      if (gasOk)   ch.push('💬 LINE');
      formNote.textContent = `✅ ส่งสำเร็จผ่าน ${ch.join(' และ ')} — เราจะติดต่อกลับภายใน 24 ชั่วโมง`;
      formNote.style.color = '#2d6a1f';
      contactForm.reset();
    } else {
      formNote.textContent = '❌ ส่งไม่สำเร็จ กรุณาโทรติดต่อโดยตรงที่ 081-234-5678';
      formNote.style.color = '#c0392b';
    }

    if (emailOk && !gasOk) formNote.textContent += ' (LINE ขัดข้อง แต่อีเมลส่งแล้ว)';
    if (!emailOk && gasOk) formNote.textContent += ' (อีเมลขัดข้อง แต่ LINE ส่งแล้ว)';

    btn.textContent = original;
    btn.disabled    = false;
  });
}

/* ================================================================
   SMOOTH SCROLL
   ================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ================================================================
   ADMIN LOCK ICON
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.querySelector('.admin-toggle');
  if (toggleBtn) {
    const updateLock = () => {
      const authed = sessionStorage.getItem('sg_admin') === 'true';
      toggleBtn.classList.toggle('locked', !authed);
      toggleBtn.title = authed ? 'Admin Panel (เข้าสู่ระบบแล้ว)' : 'Admin Login';
    };
    updateLock();
    setInterval(updateLock, 800);
  }
});
