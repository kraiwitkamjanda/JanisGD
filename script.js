/* ===================================================
   script.js — Somchai Garden Studio
   =================================================== */

/* ================================================================
   CONFIG — แก้ไขค่าตรงนี้เท่านั้น
   ================================================================ */

// ✅ EmailJS (มีแล้ว ไม่ต้องแก้)
const EMAILJS_PUBLIC_KEY  = 'nwP8iILI3k_JKlzXO';
const EMAILJS_SERVICE_ID  = 'service_t7308o9';
const EMAILJS_TEMPLATE_ID = 'template_m2r5yug';

// ⬇️ LINE — ต้องแก้ 3 ค่านี้เอง
const LINE_TOKEN     = '+iG5LQP6ivXaOeqCktMftSeCPZDRv4gTjhzv3JPRIiqWyjrBBNOFlu/pHIgLfgb8MAtz/V6sW6KHLZpGNqtG+5Xd5Toq+/ONH7IviNIxdaOUTMnDjt1TaXFH/bsPe/xQTUGkg1TYt+LpFxp509HeTgdB04t89/1O/w1cDnyilFU=';   // จาก developers.line.biz
const LINE_USER_ID   = 'Ufb16cc5b103a3aa948e883d810e6457d';                     // ขึ้นต้นด้วย U...
const LINE_PROXY_URL = 'https://janis-gd.kraiwitkamjanda.workers.dev';       // https://line-proxy.xxx.workers.dev

/* ================================================================
   EMAILJS — โหลด SDK
   ================================================================ */
(function loadEmailJS() {
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
  s.onload = () => {
    if (EMAILJS_PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
      emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
    }
  };
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
   LINE Messaging API — ผ่าน Cloudflare Worker
   ================================================================ */
async function sendLineNotify(lineMsg) {
  // ยังไม่ได้ตั้งค่า → dev mode
  if (!LINE_PROXY_URL || LINE_PROXY_URL.includes('ใส่')) {
    console.log('[LINE] dev mode:', lineMsg);
    return { ok: true, dev: true };
  }
  try {
    const res  = await fetch(LINE_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token:   LINE_TOKEN,
        userId:  LINE_USER_ID,
        message: lineMsg,
      }),
    });
    const data = await res.json();
    return { ok: data.ok };
  } catch (e) {
    console.error('[LINE]', e);
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

burgerBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
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
    let pct = (clientX - rect.left) / rect.width;
    pct = Math.min(Math.max(pct, 0.04), 0.96);
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

    const name    = document.getElementById('name').value.trim();
    const phone   = document.getElementById('phone').value.trim();
    const service = document.getElementById('service').value || 'ไม่ระบุ';
    const message = document.getElementById('message').value.trim() || '-';
    const now     = new Date().toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' });

    // ข้อความสำหรับ LINE
    const lineMsg = [
      '🌿 มีลูกค้าใหม่จากเว็บไซต์!',
      '──────────────────',
      `👤 ชื่อ: ${name}`,
      `📞 เบอร์: ${phone}`,
      `🛠 บริการ: ${service}`,
      `💬 รายละเอียด: ${message}`,
      '──────────────────',
      `🕐 เวลา: ${now}`,
    ].join('\n');

    // params สำหรับ EmailJS
    const emailParams = {
      from_name: name,
      phone,
      service,
      message,
      sent_at: now,
    };

    // ส่งพร้อมกันทั้ง 2 ช่องทาง
    const [emailResult, lineResult] = await Promise.allSettled([
      sendEmail(emailParams),
      sendLineNotify(lineMsg),
    ]);

    const emailOk  = emailResult.status === 'fulfilled' && emailResult.value?.ok;
    const lineOk   = lineResult.status  === 'fulfilled' && lineResult.value?.ok;
    const lineDev  = lineResult.value?.dev;

    if (emailOk || lineOk) {
      let channels = [];
      if (emailOk)            channels.push('📧 อีเมล');
      if (lineOk && !lineDev) channels.push('💬 LINE');

      formNote.textContent = channels.length
        ? `✅ ส่งสำเร็จผ่าน ${channels.join(' และ ')} — เราจะติดต่อกลับภายใน 24 ชั่วโมง`
        : '✅ ส่งสำเร็จ! เราจะติดต่อกลับภายใน 24 ชั่วโมง';
      formNote.style.color = '#2d6a1f';
      contactForm.reset();
    } else {
      formNote.textContent = '❌ ส่งไม่สำเร็จ กรุณาโทรติดต่อโดยตรงที่ 081-234-5678';
      formNote.style.color = '#c0392b';
    }

    if (emailOk && !lineOk && !lineDev) formNote.textContent += ' (LINE ขัดข้อง แต่อีเมลส่งแล้ว)';
    if (!emailOk && lineOk)             formNote.textContent += ' (อีเมลขัดข้อง แต่ LINE ส่งแล้ว)';

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
