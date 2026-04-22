/* ================================================================
   admin.js — CMS: Portfolio, Before/After, Reviews + Auth
   ================================================================ */

/* ---------- AUTH ---------- */
const ADMIN_PASSWORD_HASH = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; // "password"
// เปลี่ยนรหัสผ่าน: แปลงที่ https://emn178.github.io/online-tools/sha256.html แล้วใส่ hash ตรงนี้

async function sha256(msg) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
let isAuthenticated = false;
function checkAuth() {
  isAuthenticated = sessionStorage.getItem('sg_admin') === 'true';
  return isAuthenticated;
}
async function adminLogin() {
  const input = document.getElementById('adminPwInput');
  const err   = document.getElementById('adminPwError');
  const hash  = await sha256(input.value);
  if (hash === ADMIN_PASSWORD_HASH) {
    sessionStorage.setItem('sg_admin', 'true');
    isAuthenticated = true;
    closeModal('loginModal');
    input.value = '';
    err.textContent = '';
    openAdminPanel();
  } else {
    err.textContent = '❌ รหัสผ่านไม่ถูกต้อง';
    input.value = '';
    input.focus();
  }
}
function adminLogout() {
  sessionStorage.removeItem('sg_admin');
  isAuthenticated = false;
  isAdminOpen = false;
  document.getElementById('adminPanel').classList.remove('open');
  renderPortfolio(currentFilter);
}
function openAdminPanel() {
  isAdminOpen = true;
  document.getElementById('adminPanel').classList.add('open');
  renderPortfolio(currentFilter);
  renderPortAdminList();
  renderBAAdminList();
  renderReviewAdminList();
}

/* ---------- STORAGE ---------- */
const ls = {
  get: (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } },
  set: (k, v)   => localStorage.setItem(k, JSON.stringify(v)),
};

/* ---------- DEFAULT DATA ---------- */
const DEFAULT_PORTFOLIO = [
  { id: 1, title: 'สวนบ้านพักตากอากาศ', location: 'จอมเทียน, พัทยา',    category: 'design',   img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80', tall: false },
  { id: 2, title: 'รีสอร์ท พูลวิลล่า',    location: 'นาจอมเทียน, ชลบุรี', category: 'maintain', img: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=500&q=80', tall: false },
  { id: 3, title: 'น้ำตกสวนหินธรรมชาติ', location: 'พัทยาเหนือ',          category: 'decor',    img: 'https://images.unsplash.com/photo-1599598425947-5202edd56fdb?w=500&q=80', tall: true  },
  { id: 4, title: 'สวนลานคอนโดมิเนียม',  location: 'พัทยากลาง',            category: 'design',   img: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=500&q=80', tall: false },
  { id: 5, title: 'สวนดอกไม้ประดับ',      location: 'บางแสน, ชลบุรี',       category: 'decor',    img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80', tall: false },
  { id: 6, title: 'ดูแลสวนโรงแรม 5 ดาว', location: 'วงศ์อมาตย์, พัทยา',   category: 'maintain', img: 'https://images.unsplash.com/photo-1477519242566-6ae87c31d212?w=500&q=80', tall: false },
];
const DEFAULT_BA = [
  { id: 1, title: 'สวนบ้านพักอาศัย', before: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80', after: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80' },
  { id: 2, title: 'สวนรีสอร์ท',       before: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800&q=80', after: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=800&q=80' },
];
const DEFAULT_REVIEWS = [
  { id: 1, name: 'สุดา มีชัยภูมิ',    location: 'บ้านพักส่วนตัว, จอมเทียน',  stars: 5, text: 'ทำงานละเอียดมาก สวนบ้านสวยขึ้นเยอะเลยค่ะ ทีมงานตรงเวลา สะอาดเรียบร้อย แนะนำสำหรับคนที่หาช่างจัดสวนฝีมือดีแถวพัทยานะคะ', avatar: '', badge: '', color: 'pink' },
  { id: 2, name: 'วิชัย สุขสมบูรณ์',  location: 'บ้านเดี่ยว, พัทยาเหนือ',     stars: 5, text: 'ราคาเป็นธรรม ทำงานเร็ว ผลงานออกมาสวยกว่าที่คิดไว้มากครับ ฝากดูแลสวนประจำทุกเดือนตั้งแต่นั้นมาเลย ไม่ผิดหวังครับ', avatar: '', badge: '', color: 'green' },
  { id: 3, name: 'นภา ทองดี',          location: 'คอนโดมิเนียม, พัทยากลาง',   stars: 5, text: 'ประทับใจมากเลยค่ะ ตกแต่งสวนหน้าคอนโดให้สวยงามมาก เพื่อนบ้านชมกันทุกคนเลย ขอบคุณมากนะคะ', avatar: '', badge: 'รีวิวจาก LINE', color: 'blue' },
  { id: 4, name: 'ประสิทธิ์ แก้วใส',  location: 'รีสอร์ท, นาจอมเทียน',         stars: 5, text: 'จ้างดูแลสวนรีสอร์ทมา 3 ปีแล้วครับ ไม่เคยผิดหวัง ทีมงานขยัน ใส่ใจรายละเอียด แขกของรีสอร์ทชมสวนสวยทุกครั้ง', avatar: '', badge: 'ลูกค้าประจำ', color: 'green' },
  { id: 5, name: 'มาลี จันทร์เพ็ญ',    location: 'บ้านสวน, บางแสน',             stars: 5, text: 'ออกแบบสวนได้สวยงามมากค่ะ ตรงตามที่ต้องการเลย ทีมงานให้คำแนะนำดีมาก บรรยากาศบ้านเปลี่ยนไปเลยค่ะ', avatar: '', badge: '', color: 'pink' },
  { id: 6, name: 'สมพงษ์ รุ่งเรือง',  location: 'บ้านพักตากอากาศ, จอมเทียน',  stars: 5, text: 'ผลงานดีมากครับ น้ำตกและบ่อปลาที่ทำให้สวยสมจริงมาก ราคาคุ้มค่า ทำงานตรงเวลา แนะนำเลยครับ', avatar: '', badge: 'Google Review', color: 'blue' },
];

let portfolio = ls.get('sg_portfolio', DEFAULT_PORTFOLIO);
let baItems   = ls.get('sg_ba', DEFAULT_BA);
let baIndex   = ls.get('sg_ba_index', 0);
let reviews   = ls.get('sg_reviews', DEFAULT_REVIEWS);

const CAT_LABEL = { design: 'ออกแบบ', maintain: 'ดูแลรักษา', decor: 'ตกแต่ง' };
const COLORS = ['green','blue','pink'];

/* ================================================================
   FILE → BASE64 HELPER
   ================================================================ */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(''); return; }
    if (file.size > 5 * 1024 * 1024) { alert('ไฟล์ใหญ่เกิน 5MB กรุณาเลือกไฟล์ขนาดเล็กกว่า'); reject(); return; }
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function setupFileUpload(fileInputId, hiddenId, previewId, placeholderId) {
  const fileInput   = document.getElementById(fileInputId);
  const hiddenInput = document.getElementById(hiddenId);
  const preview     = document.getElementById(previewId);
  const placeholder = document.getElementById(placeholderId);
  if (!fileInput) return;

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      const b64 = await fileToBase64(file);
      hiddenInput.value   = b64;
      preview.src         = b64;
      preview.style.display  = 'block';
      if (placeholder) placeholder.style.display = 'none';
    } catch(e) { /* size error already alerted */ }
  });
}

/* ================================================================
   PORTFOLIO RENDERING
   ================================================================ */
function renderPortfolio(filter = 'all') {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;
  const items = filter === 'all' ? portfolio : portfolio.filter(p => p.category === filter);
  grid.innerHTML = items.map(p => `
    <div class="portfolio-item ${p.tall ? 'portfolio-item--tall' : ''}" data-category="${p.category}" data-id="${p.id}">
      <img src="${p.img}" alt="${p.title}" onerror="this.src='https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&q=80'" />
      <div class="portfolio-item__overlay">
        <span class="portfolio-item__tag">${CAT_LABEL[p.category] || p.category}</span>
        <h4>${p.title}</h4>
        <p>${p.location}</p>
      </div>
      ${isAdminOpen ? `<button class="item-edit-btn" onclick="openEditPortfolio(${p.id})">✏️ แก้ไข</button>
      <button class="item-del-btn" onclick="deletePortfolio(${p.id})">🗑</button>` : ''}
    </div>`).join('');
}

function renderPortAdminList() {
  const el = document.getElementById('portAdminList');
  if (!el) return;
  el.innerHTML = portfolio.map(p => `
    <div class="port-admin-item">
      <span>${p.title}</span>
      <div>
        <button onclick="openEditPortfolio(${p.id})">✏️</button>
        <button onclick="deletePortfolio(${p.id})">🗑</button>
      </div>
    </div>`).join('');
}

/* ================================================================
   PORTFOLIO CRUD
   ================================================================ */
function openAddPortfolio() {
  document.getElementById('portModalTitle').textContent = 'เพิ่มผลงานใหม่';
  document.getElementById('portId').value    = '';
  document.getElementById('portTitle').value = '';
  document.getElementById('portLoc').value   = '';
  document.getElementById('portCat').value   = 'design';
  document.getElementById('portImg').value   = '';
  document.getElementById('portTall').checked = false;
  resetUpload('portImgPreview', 'portUploadPlaceholder');
  document.getElementById('portImgFile').value = '';
  openModal('portModal');
}

function openEditPortfolio(id) {
  const item = portfolio.find(p => p.id === id);
  if (!item) return;
  document.getElementById('portModalTitle').textContent = 'แก้ไขผลงาน';
  document.getElementById('portId').value    = item.id;
  document.getElementById('portTitle').value = item.title;
  document.getElementById('portLoc').value   = item.location;
  document.getElementById('portCat').value   = item.category;
  document.getElementById('portImg').value   = item.img;
  document.getElementById('portTall').checked = item.tall;
  showUploadPreview('portImgPreview', 'portUploadPlaceholder', item.img);
  openModal('portModal');
}

function savePortfolio() {
  const id  = document.getElementById('portId').value;
  const img = document.getElementById('portImg').value.trim();
  const data = {
    id:       id ? parseInt(id) : Date.now(),
    title:    document.getElementById('portTitle').value.trim(),
    location: document.getElementById('portLoc').value.trim(),
    category: document.getElementById('portCat').value,
    img:      img,
    tall:     document.getElementById('portTall').checked,
  };
  if (!data.title) { alert('กรุณากรอกชื่อผลงาน'); return; }
  if (!data.img)   { alert('กรุณาเลือกรูปภาพ'); return; }

  if (id) {
    portfolio = portfolio.map(p => p.id === parseInt(id) ? data : p);
  } else {
    portfolio.push(data);
  }
  ls.set('sg_portfolio', portfolio);
  closeModal('portModal');
  renderPortfolio(currentFilter);
  renderPortAdminList();
}

function deletePortfolio(id) {
  if (!confirm('ลบผลงานนี้?')) return;
  portfolio = portfolio.filter(p => p.id !== id);
  ls.set('sg_portfolio', portfolio);
  renderPortfolio(currentFilter);
  renderPortAdminList();
}

/* ================================================================
   BEFORE / AFTER
   ================================================================ */
function renderBA() {
  if (!baItems.length) return;
  baIndex = Math.min(baIndex, baItems.length - 1);
  const cur = baItems[baIndex];
  const baAfterImg  = document.querySelector('.ba-after img');
  const baBeforeImg = document.querySelector('#baBefore img');
  if (baAfterImg)  baAfterImg.src  = cur.after;
  if (baBeforeImg) baBeforeImg.src = cur.before;

  const tabsEl = document.getElementById('baTabs');
  if (tabsEl) {
    tabsEl.innerHTML = baItems.map((b, i) => `
      <button class="ba-tab ${i === baIndex ? 'active' : ''}" onclick="switchBA(${i})">${b.title}</button>`).join('');
  }
  const baBefore = document.getElementById('baBefore');
  const baHandle = document.getElementById('baHandle');
  if (baBefore) baBefore.style.width = '50%';
  if (baHandle) baHandle.style.left  = '50%';
}

function switchBA(i) {
  baIndex = i;
  ls.set('sg_ba_index', baIndex);
  renderBA();
}

function renderBAAdminList() {
  const el = document.getElementById('baAdminList');
  if (!el) return;
  el.innerHTML = baItems.map((b, i) => `
    <div class="ba-admin-item">
      <span>${b.title}</span>
      <div>
        <button onclick="openEditBA(${i})">✏️</button>
        <button onclick="deleteBA(${i})">🗑</button>
      </div>
    </div>`).join('');
}

function openAddBA() {
  document.getElementById('baModalTitle').textContent = 'เพิ่มชุด ก่อน/หลัง';
  document.getElementById('baId').value = '';
  document.getElementById('baTitle').value = '';
  document.getElementById('baBefore2').value = '';
  document.getElementById('baAfter2').value  = '';
  document.getElementById('baBeforeFile').value = '';
  document.getElementById('baAfterFile').value  = '';
  resetUpload('baBeforePreview', 'baBeforePlaceholder');
  resetUpload('baAfterPreview',  'baAfterPlaceholder');
  openModal('baModal');
}

function openEditBA(i) {
  const item = baItems[i];
  document.getElementById('baModalTitle').textContent = 'แก้ไข ก่อน/หลัง';
  document.getElementById('baId').value = i;
  document.getElementById('baTitle').value = item.title;
  document.getElementById('baBefore2').value = item.before;
  document.getElementById('baAfter2').value  = item.after;
  showUploadPreview('baBeforePreview', 'baBeforePlaceholder', item.before);
  showUploadPreview('baAfterPreview',  'baAfterPlaceholder',  item.after);
  openModal('baModal');
}

function saveBA() {
  const idx = document.getElementById('baId').value;
  const data = {
    id:     idx !== '' ? (baItems[parseInt(idx)]?.id ?? Date.now()) : Date.now(),
    title:  document.getElementById('baTitle').value.trim(),
    before: document.getElementById('baBefore2').value,
    after:  document.getElementById('baAfter2').value,
  };
  if (!data.title || !data.before || !data.after) { alert('กรุณากรอกข้อมูลและเลือกรูปภาพให้ครบ'); return; }

  if (idx !== '') {
    baItems[parseInt(idx)] = data;
  } else {
    baItems.push(data);
  }
  ls.set('sg_ba', baItems);
  closeModal('baModal');
  renderBA();
  renderBAAdminList();
}

function deleteBA(i) {
  if (!confirm('ลบชุดนี้?')) return;
  baItems.splice(i, 1);
  baIndex = Math.max(0, Math.min(baIndex, baItems.length - 1));
  ls.set('sg_ba', baItems);
  ls.set('sg_ba_index', baIndex);
  renderBA();
  renderBAAdminList();
}

/* ================================================================
   REVIEWS
   ================================================================ */
const STAR_MAP = { 5:'★★★★★', 4:'★★★★☆', 3:'★★★☆☆', 2:'★★☆☆☆', 1:'★☆☆☆☆' };
const COLOR_MAP = { pink:'avatar--pink', blue:'avatar--blue', green:'avatar--green' };

function renderReviews() {
  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;
  grid.innerHTML = reviews.map(r => {
    const initial = r.name.charAt(0);
    const avatarEl = r.avatar
      ? `<img src="${r.avatar}" alt="${r.name}" style="width:42px;height:42px;border-radius:50%;object-fit:cover;flex-shrink:0" />`
      : `<div class="avatar ${COLOR_MAP[r.color] || 'avatar--green'}">${initial}</div>`;
    return `
    <div class="review-card ${r.stars === 5 ? 'review-card--featured' : ''} reveal">
      ${r.badge ? `<div class="review-card__badge">${r.badge}</div>` : ''}
      <div class="review-card__stars">${STAR_MAP[r.stars] || '★★★★★'}</div>
      <p class="review-card__text">"${r.text}"</p>
      <div class="review-card__author">
        ${avatarEl}
        <div>
          <strong>${r.name}</strong>
          <span>${r.location}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

function renderReviewAdminList() {
  const el = document.getElementById('reviewAdminList');
  if (!el) return;
  el.innerHTML = reviews.map(r => `
    <div class="port-admin-item">
      <span>${r.name}</span>
      <div>
        <button onclick="openEditReview(${r.id})">✏️</button>
        <button onclick="deleteReview(${r.id})">🗑</button>
      </div>
    </div>`).join('');
}

let selectedStars = 5;

function initStarPicker() {
  const stars = document.querySelectorAll('.star-opt');
  stars.forEach(s => {
    s.addEventListener('click', () => {
      selectedStars = parseInt(s.dataset.val);
      document.getElementById('reviewStars').value = selectedStars;
      stars.forEach((st, i) => st.classList.toggle('active', i < selectedStars));
    });
    s.addEventListener('mouseover', () => {
      const v = parseInt(s.dataset.val);
      stars.forEach((st, i) => st.classList.toggle('hover', i < v));
    });
    s.addEventListener('mouseout', () => {
      stars.forEach(st => st.classList.remove('hover'));
    });
  });
}

function setStarPicker(val) {
  selectedStars = val;
  document.getElementById('reviewStars').value = val;
  document.querySelectorAll('.star-opt').forEach((s, i) => s.classList.toggle('active', i < val));
}

function openAddReview() {
  document.getElementById('reviewModalTitle').textContent = 'เพิ่มรีวิวใหม่';
  document.getElementById('reviewId').value       = '';
  document.getElementById('reviewName').value     = '';
  document.getElementById('reviewLocation').value = '';
  document.getElementById('reviewText').value     = '';
  document.getElementById('reviewBadge').value    = '';
  document.getElementById('reviewAvatar').value   = '';
  document.getElementById('reviewAvatarFile').value = '';
  resetUpload('reviewAvatarPreview', 'reviewAvatarPlaceholder');
  setStarPicker(5);
  openModal('reviewModal');
}

function openEditReview(id) {
  const item = reviews.find(r => r.id === id);
  if (!item) return;
  document.getElementById('reviewModalTitle').textContent = 'แก้ไขรีวิว';
  document.getElementById('reviewId').value       = item.id;
  document.getElementById('reviewName').value     = item.name;
  document.getElementById('reviewLocation').value = item.location;
  document.getElementById('reviewText').value     = item.text;
  document.getElementById('reviewBadge').value    = item.badge || '';
  document.getElementById('reviewAvatar').value   = item.avatar || '';
  if (item.avatar) showUploadPreview('reviewAvatarPreview', 'reviewAvatarPlaceholder', item.avatar);
  else resetUpload('reviewAvatarPreview', 'reviewAvatarPlaceholder');
  setStarPicker(item.stars);
  openModal('reviewModal');
}

function saveReview() {
  const id = document.getElementById('reviewId').value;
  const colorList = ['green','blue','pink'];
  const data = {
    id:       id ? parseInt(id) : Date.now(),
    name:     document.getElementById('reviewName').value.trim(),
    location: document.getElementById('reviewLocation').value.trim(),
    stars:    parseInt(document.getElementById('reviewStars').value) || 5,
    text:     document.getElementById('reviewText').value.trim(),
    badge:    document.getElementById('reviewBadge').value.trim(),
    avatar:   document.getElementById('reviewAvatar').value,
    color:    colorList[Math.floor(Math.random() * colorList.length)],
  };
  if (!data.name || !data.text) { alert('กรุณากรอกชื่อและข้อความรีวิว'); return; }

  if (id) {
    reviews = reviews.map(r => r.id === parseInt(id) ? { ...r, ...data } : r);
  } else {
    reviews.push(data);
  }
  ls.set('sg_reviews', reviews);
  closeModal('reviewModal');
  renderReviews();
  renderReviewAdminList();
}

function deleteReview(id) {
  if (!confirm('ลบรีวิวนี้?')) return;
  reviews = reviews.filter(r => r.id !== id);
  ls.set('sg_reviews', reviews);
  renderReviews();
  renderReviewAdminList();
}

/* ================================================================
   UPLOAD HELPERS
   ================================================================ */
function resetUpload(previewId, placeholderId) {
  const preview     = document.getElementById(previewId);
  const placeholder = document.getElementById(placeholderId);
  if (preview)     { preview.src = ''; preview.style.display = 'none'; }
  if (placeholder) placeholder.style.display = 'flex';
}

function showUploadPreview(previewId, placeholderId, src) {
  const preview     = document.getElementById(previewId);
  const placeholder = document.getElementById(placeholderId);
  if (preview && src) { preview.src = src; preview.style.display = 'block'; }
  if (placeholder)    placeholder.style.display = src ? 'none' : 'flex';
}

/* ================================================================
   ADMIN TOGGLE
   ================================================================ */
let isAdminOpen = false;

function toggleAdmin() {
  if (isAdminOpen) {
    isAdminOpen = false;
    document.getElementById('adminPanel').classList.remove('open');
    renderPortfolio(currentFilter);
  } else {
    if (checkAuth()) {
      openAdminPanel();
    } else {
      openModal('loginModal');
      setTimeout(() => document.getElementById('adminPwInput')?.focus(), 100);
    }
  }
}

/* ================================================================
   MODALS
   ================================================================ */
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

/* ================================================================
   PORTFOLIO FILTER
   ================================================================ */
let currentFilter = 'all';
window.setPortfolioFilter = function(f) {
  currentFilter = f;
  renderPortfolio(f);
};

/* ================================================================
   INIT
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderPortfolio();
  renderReviews();
  renderBA();

  // Build BA tabs
  const baSliderEl = document.getElementById('baSlider');
  if (baSliderEl && !document.getElementById('baTabs')) {
    const tabs = document.createElement('div');
    tabs.id = 'baTabs';
    tabs.className = 'ba-tabs';
    baSliderEl.parentElement.insertBefore(tabs, baSliderEl);
    renderBA();
  }

  // Portfolio filter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      window.setPortfolioFilter(btn.dataset.filter);
    });
  });

  // Star picker
  initStarPicker();

  // File uploads
  setupFileUpload('portImgFile',       'portImg',    'portImgPreview',      'portUploadPlaceholder');
  setupFileUpload('baBeforeFile',      'baBefore2',  'baBeforePreview',     'baBeforePlaceholder');
  setupFileUpload('baAfterFile',       'baAfter2',   'baAfterPreview',      'baAfterPlaceholder');
  setupFileUpload('reviewAvatarFile',  'reviewAvatar','reviewAvatarPreview','reviewAvatarPlaceholder');
});
