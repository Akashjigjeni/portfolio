/* =========================================================
   AKASH JIGJENI — PORTFOLIO CONTROLLER & INTERACTIONS
   ========================================================= */

let profile = null;
let certs = null;

/* ---------------------------------------------------------
   STORAGE HELPERS (supports window.storage & localStorage)
--------------------------------------------------------- */
const storage = {
  async get(key) {
    if (window.storage && typeof window.storage.get === 'function') {
      try { return await window.storage.get(key, false); } catch(e) {}
    }
    try {
      const val = localStorage.getItem('aj_' + key);
      return val ? { value: val } : null;
    } catch(e) { return null; }
  },
  async set(key, val) {
    if (window.storage && typeof window.storage.set === 'function') {
      try { await window.storage.set(key, val, false); } catch(e) {}
    }
    try {
      localStorage.setItem('aj_' + key, val);
    } catch(e) {}
  }
};

async function loadData(){
  try{
    const p = await storage.get('profile');
    profile = p ? JSON.parse(p.value) : structuredClone(DEFAULT_PROFILE);
    if(profile){
      if(!profile.college || !profile.college.includes('TE')){
        profile.college = DEFAULT_PROFILE.college;
      }
      if(!profile.bio || !profile.bio.includes('TE')){
        profile.bio = DEFAULT_PROFILE.bio;
      }
      if(!profile.email){
        profile.email = DEFAULT_PROFILE.email;
      }
      if(!profile.phone){
        profile.phone = DEFAULT_PROFILE.phone;
      }
    }
  }catch(e){ profile = structuredClone(DEFAULT_PROFILE); }

  try{
    const c = await storage.get('certificates');
    if(c && c.value){
      const parsed = JSON.parse(c.value);
      // Migrate/populate verifyUrl, credentialId, and images for default certs
      parsed.forEach(item => {
        const def = DEFAULT_CERTS.find(d => d.id === item.id);
        if(def){
          if(!item.verifyUrl) item.verifyUrl = def.verifyUrl;
          if(!item.credentialId) item.credentialId = def.credentialId;
          if(!item.image && def.image) item.image = def.image;
        }
      });
      certs = parsed;
    } else {
      certs = structuredClone(DEFAULT_CERTS);
    }
  }catch(e){ certs = structuredClone(DEFAULT_CERTS); }

  try{
    const t = await storage.get('theme');
    if(t && t.value === 'dark'){ document.body.setAttribute('data-theme','dark'); themeToggle.textContent = '☀'; }
  }catch(e){ /* default light */ }
}

async function saveProfile(){
  try{ await storage.set('profile', JSON.stringify(profile)); }
  catch(e){ console.error('save profile failed', e); }
}
async function saveCerts(){
  try{ await storage.set('certificates', JSON.stringify(certs)); }
  catch(e){ console.error('save certs failed', e); }
}
async function saveTheme(val){
  try{ await storage.set('theme', val); }
  catch(e){ console.error('save theme failed', e); }
}

/* ---------------------------------------------------------
   RENDER
--------------------------------------------------------- */
function renderProfile(){
  document.getElementById('heroName').innerHTML = profile.name.split(' ').join('<br>');
  document.getElementById('heroRole').innerHTML = 'Aspiring <span>' + escapeHtml(profile.role.replace(/^Aspiring /,'')) + '</span>';
  
  const collegeEl = document.getElementById('heroCollege');
  if(collegeEl){
    collegeEl.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style="vertical-align:-2px; margin-right:6px; color:var(--forest); flex-shrink:0;" aria-hidden="true">
        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
      </svg>
      <span>${escapeHtml(profile.college || 'TE (Third Year) · NUTAN MAHARASHTRA INSTITUTE OF ENGINEERING AND TECHNOLOGY (NMIET)')}</span>
    `;
  }
  document.getElementById('heroBio').textContent = profile.bio;

  // Contact section fields update
  const emailVal = profile.email || 'jigjeniakash@gmail.com';
  const phoneVal = profile.phone || '+91 9090894033';
  const cleanPhone = phoneVal.replace(/[^0-9]/g, '');

  const cEmail = document.getElementById('contactEmail');
  if(cEmail) cEmail.textContent = emailVal;
  const cEmailLink = document.getElementById('contactEmailLink');
  if(cEmailLink) cEmailLink.href = 'mailto:' + emailVal;

  const cPhone = document.getElementById('contactPhone');
  if(cPhone) cPhone.textContent = phoneVal;
  const cPhoneLink = document.getElementById('contactPhoneLink');
  if(cPhoneLink) cPhoneLink.href = 'tel:' + phoneVal;
  const cWaLink = document.getElementById('contactWaLink');
  if(cWaLink) cWaLink.href = 'https://wa.me/' + (cleanPhone.length === 10 ? '91' + cleanPhone : cleanPhone);

  const issuers = new Set(certs.map(c => c.platform.split(' · ')[0].split(' ')[0]));
  document.getElementById('statCount').textContent = certs.length;
  document.getElementById('statIssuers').textContent = new Set(certs.map(c=>c.platform)).size;
  const years = certs.map(c => (c.date.match(/\d{4}/)||[])[0]).filter(Boolean);
  document.getElementById('statYear').textContent = years.length ? Math.max(...years) : '—';

  const linksWrap = document.getElementById('heroLinks');
  linksWrap.innerHTML = '';
  const footerLinks = document.getElementById('footerLinks');
  footerLinks.innerHTML = '';
  const linkDefs = [
    ['Email', emailVal ? 'mailto:'+emailVal : ''],
    ['Phone', phoneVal ? 'tel:'+phoneVal : ''],
    ['WhatsApp', cleanPhone ? 'https://wa.me/'+(cleanPhone.length === 10 ? '91'+cleanPhone : cleanPhone) : ''],
    ['GitHub', profile.github],
    ['LinkedIn', profile.linkedin],
    ['Twitter / X', profile.twitter],
  ];
  linkDefs.forEach(([label, url]) => {
    if(!url) return;
    const a = document.createElement('a');
    a.href = url;
    if(!url.startsWith('mailto:') && !url.startsWith('tel:')){
      a.target = '_blank'; a.rel = 'noopener';
    }
    a.textContent = label + ' ↗';
    linksWrap.appendChild(a);
    const a2 = a.cloneNode(true);
    footerLinks.appendChild(a2);
  });

  const skillsWrap = document.getElementById('skillsWrap');
  skillsWrap.innerHTML = '';
  profile.skills.forEach(s => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = s;
    skillsWrap.appendChild(chip);
  });
}

function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function renderCerts(){
  const grid = document.getElementById('certGrid');
  grid.innerHTML = '';
  document.getElementById('certCount').textContent = certs.length + (certs.length===1?' entry, verified':' entries, verified');

  certs.forEach(cert => {
    const card = document.createElement('div');
    card.className = 'cert-card';

    const stamp = document.createElement('div');
    stamp.className = 'stamp';
    const monthYear = cert.date || '';
    stamp.innerHTML = '<div class="stamp-inner">Verified<br>' + escapeHtml(monthYear.replace(/\d{1,2}\s/,'')) + '</div>';
    card.appendChild(stamp);

    if(cert.image){
      const img = document.createElement('img');
      img.className = 'cert-thumb';
      img.src = cert.image;
      img.alt = cert.title;
      img.title = "Click to inspect certificate";
      img.addEventListener('click', () => openPreviewModal(cert));
      card.appendChild(img);
    } else {
      const ph = document.createElement('div');
      ph.className = 'cert-thumb placeholder';
      ph.textContent = cert.platform;
      ph.title = "Click to inspect certificate";
      ph.addEventListener('click', () => openPreviewModal(cert));
      card.appendChild(ph);
    }

    const body = document.createElement('div');
    body.className = 'cert-body';
    body.innerHTML = `
      <div class="cert-platform">${escapeHtml(cert.platform)}</div>
      <h3 class="cert-title" style="cursor:pointer;" title="Click to inspect certificate">${escapeHtml(cert.title)}</h3>
      <div class="cert-date">${escapeHtml(cert.date)}${cert.credentialId ? ' · ID '+escapeHtml(cert.credentialId) : ''}</div>
      <div class="cert-foot">
        <div class="cert-actions">
          ${cert.verifyUrl 
            ? `<a class="cert-btn btn-verify" href="${encodeURI(cert.verifyUrl)}" target="_blank" rel="noopener">Verify ↗</a>` 
            : `<button class="cert-btn btn-verify" data-preview="${cert.id}">Verify ↗</button>`}
          <button class="cert-btn btn-download" data-download="${cert.id}">Download ↓</button>
        </div>
        <button class="cert-del" data-id="${cert.id}" title="Remove certificate">Remove</button>
      </div>
    `;
    
    body.querySelector('.cert-title').addEventListener('click', () => openPreviewModal(cert));
    card.appendChild(body);
    grid.appendChild(card);
  });

  const addCard = document.createElement('div');
  addCard.className = 'add-card';
  addCard.innerHTML = '<div class="plus">+</div><div>Add certificate</div>';
  addCard.addEventListener('click', () => openCertModal());
  grid.appendChild(addCard);

  // Attach download handlers
  grid.querySelectorAll('[data-download]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-download');
      downloadCert(id);
    });
  });

  // Attach preview handlers for verify buttons without external links
  grid.querySelectorAll('[data-preview]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-preview');
      const targetCert = certs.find(c => c.id === id);
      if(targetCert) openPreviewModal(targetCert);
    });
  });

  // Attach remove handlers
  grid.querySelectorAll('.cert-del').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      if(!confirm('Are you sure you want to remove this certificate?')) return;
      certs = certs.filter(c => c.id !== id);
      await saveCerts();
      renderCerts();
      renderProfile();
      showToast('Certificate removed');
    });
  });
}

/* ---------------------------------------------------------
   CERTIFICATE PREVIEW & DOWNLOAD
--------------------------------------------------------- */
const previewScrim = document.getElementById('previewScrim');
let activePreviewCert = null;

function openPreviewModal(cert){
  activePreviewCert = cert;
  document.getElementById('prevPlatform').textContent = cert.platform || 'Credential';
  document.getElementById('prevTitle').textContent = cert.title || 'Certificate';
  document.getElementById('prevDate').textContent = (cert.date || '—') + (cert.credentialId ? ' · ID ' + cert.credentialId : '');
  
  const imgEl = document.getElementById('prevImg');
  const phEl = document.getElementById('prevPlaceholder');
  if(cert.image){
    imgEl.src = cert.image;
    imgEl.style.display = 'block';
    phEl.style.display = 'none';
  } else {
    imgEl.style.display = 'none';
    phEl.style.display = 'block';
  }

  const vBtn = document.getElementById('prevVerifyBtn');
  if(cert.verifyUrl){
    vBtn.href = cert.verifyUrl;
    vBtn.style.display = 'inline-flex';
  } else {
    vBtn.style.display = 'none';
  }

  previewScrim.classList.add('open');
}

document.getElementById('closePreview').addEventListener('click', () => previewScrim.classList.remove('open'));
previewScrim.addEventListener('click', (e) => { if(e.target === previewScrim) previewScrim.classList.remove('open'); });

document.getElementById('prevDownloadBtn').addEventListener('click', () => {
  if(activePreviewCert) downloadCert(activePreviewCert.id);
});

function downloadCert(certId){
  const cert = certs.find(c => c.id === certId);
  if(!cert) return;
  if(cert.image){
    const a = document.createElement('a');
    a.href = cert.image;
    const safeTitle = (cert.title || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `Akash_Jigjeni_${safeTitle}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloading ${cert.title}...`);
  } else {
    showToast(`Generating certificate download for ${cert.title}...`);
    generateAndDownloadCert(cert);
  }
}

function generateAndDownloadCert(cert){
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#f7f7f2';
  ctx.fillRect(0, 0, 1200, 800);
  
  ctx.strokeStyle = '#1f4d3e';
  ctx.lineWidth = 12;
  ctx.strokeRect(30, 30, 1140, 740);
  ctx.strokeStyle = '#b5792a';
  ctx.lineWidth = 2;
  ctx.strokeRect(45, 45, 1110, 710);
  
  ctx.fillStyle = '#1f4d3e';
  ctx.font = 'bold 26px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CERTIFICATE OF COMPLETION & VERIFICATION', 600, 140);
  
  ctx.fillStyle = '#4b5952';
  ctx.font = '20px sans-serif';
  ctx.fillText('This is to certify that', 600, 210);
  
  ctx.fillStyle = '#16241e';
  ctx.font = 'bold 44px serif';
  ctx.fillText(profile.name || 'Akash Jigjeni', 600, 280);
  
  ctx.fillStyle = '#4b5952';
  ctx.font = '20px sans-serif';
  ctx.fillText('has successfully demonstrated competence in coursework for', 600, 350);
  
  ctx.fillStyle = '#1f4d3e';
  ctx.font = 'bold 36px serif';
  ctx.fillText(cert.title, 600, 420);
  
  ctx.fillStyle = '#0d6fb8';
  ctx.font = 'bold 22px monospace';
  ctx.fillText(`ISSUING PLATFORM: ${cert.platform}`, 600, 490);
  
  ctx.fillStyle = '#4b5952';
  ctx.font = '18px monospace';
  ctx.fillText(`Date: ${cert.date || '—'}   |   Credential ID: ${cert.credentialId || 'VERIFIED-LEDGER'}`, 600, 540);
  
  ctx.strokeStyle = '#b5792a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(600, 650, 48, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#b5792a';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('OFFICIAL', 600, 644);
  ctx.fillText('VERIFIED', 600, 662);
  
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  const safeTitle = (cert.title || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `Akash_Jigjeni_${safeTitle}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Certificate downloaded');
}

/* ---------------------------------------------------------
   THEME TOGGLE
--------------------------------------------------------- */
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', async () => {
  const isDark = document.body.getAttribute('data-theme') === 'dark';
  document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
  themeToggle.textContent = isDark ? '☾' : '☀';
  await saveTheme(isDark ? 'light' : 'dark');
});

/* ---------------------------------------------------------
   SETTINGS MODAL
--------------------------------------------------------- */
const settingsScrim = document.getElementById('settingsScrim');
document.getElementById('settingsToggle').addEventListener('click', () => {
  document.getElementById('fName').value = profile.name;
  document.getElementById('fRole').value = profile.role;
  document.getElementById('fCollege').value = profile.college || '';
  document.getElementById('fBio').value = profile.bio;
  document.getElementById('fEmail').value = profile.email || '';
  document.getElementById('fPhone').value = profile.phone || '';
  document.getElementById('fGithub').value = profile.github || '';
  document.getElementById('fLinkedin').value = profile.linkedin || '';
  document.getElementById('fTwitter').value = profile.twitter || '';
  document.getElementById('fSkills').value = profile.skills.join(', ');
  settingsScrim.classList.add('open');
});
document.getElementById('closeSettings').addEventListener('click', () => settingsScrim.classList.remove('open'));
settingsScrim.addEventListener('click', (e) => { if(e.target === settingsScrim) settingsScrim.classList.remove('open'); });

document.getElementById('saveSettings').addEventListener('click', async () => {
  profile.name = document.getElementById('fName').value.trim() || profile.name;
  profile.role = document.getElementById('fRole').value.trim() || profile.role;
  profile.college = document.getElementById('fCollege').value.trim() || profile.college;
  profile.bio = document.getElementById('fBio').value.trim() || profile.bio;
  profile.email = document.getElementById('fEmail').value.trim() || DEFAULT_PROFILE.email;
  profile.phone = document.getElementById('fPhone').value.trim() || DEFAULT_PROFILE.phone;
  profile.github = document.getElementById('fGithub').value.trim();
  profile.linkedin = document.getElementById('fLinkedin').value.trim();
  profile.twitter = document.getElementById('fTwitter').value.trim();
  profile.skills = document.getElementById('fSkills').value.split(',').map(s=>s.trim()).filter(Boolean);
  await saveProfile();
  renderProfile();
  settingsScrim.classList.remove('open');
  showToast('Profile saved');
});

document.getElementById('resetData').addEventListener('click', async () => {
  if(!confirm('Reset all profile and certificate data back to defaults? This cannot be undone.')) return;
  profile = structuredClone(DEFAULT_PROFILE);
  certs = structuredClone(DEFAULT_CERTS);
  await saveProfile();
  await saveCerts();
  renderProfile();
  renderCerts();
  settingsScrim.classList.remove('open');
  showToast('Data reset to defaults');
});

/* ---------------------------------------------------------
   ADD CERTIFICATE MODAL
--------------------------------------------------------- */
const certScrim = document.getElementById('certScrim');
let pendingImage = "";

function openCertModal(){
  document.getElementById('fCertTitle').value = '';
  document.getElementById('fCertPlatform').value = '';
  document.getElementById('fCertDate').value = '';
  document.getElementById('fCertId').value = '';
  document.getElementById('fCertUrl').value = '';
  pendingImage = "";
  document.getElementById('fileDropPreview').style.display = 'none';
  document.getElementById('fileDropLabel').style.display = 'block';
  certScrim.classList.add('open');
}
document.getElementById('openAddCert').addEventListener('click', openCertModal);
document.getElementById('closeCert').addEventListener('click', () => certScrim.classList.remove('open'));
certScrim.addEventListener('click', (e) => { if(e.target === certScrim) certScrim.classList.remove('open'); });

document.getElementById('fileDrop').addEventListener('click', () => document.getElementById('fCertImage').click());
document.getElementById('fCertImage').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    pendingImage = ev.target.result;
    const preview = document.getElementById('fileDropPreview');
    preview.src = pendingImage;
    preview.style.display = 'block';
    document.getElementById('fileDropLabel').style.display = 'none';
  };
  reader.readAsDataURL(file);
});

document.getElementById('saveCert').addEventListener('click', async () => {
  const title = document.getElementById('fCertTitle').value.trim();
  const platform = document.getElementById('fCertPlatform').value.trim();
  if(!title || !platform){ showToast('Title and platform are required'); return; }
  const newCert = {
    id: 'c' + Date.now(),
    title,
    platform,
    date: document.getElementById('fCertDate').value.trim() || '—',
    credentialId: document.getElementById('fCertId').value.trim(),
    verifyUrl: document.getElementById('fCertUrl').value.trim(),
    image: pendingImage
  };
  certs.unshift(newCert);
  await saveCerts();
  renderCerts();
  renderProfile();
  certScrim.classList.remove('open');
  showToast('Certificate added');
});

/* ---------------------------------------------------------
   TOAST
--------------------------------------------------------- */
let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

/* ---------------------------------------------------------
   INIT
--------------------------------------------------------- */
(async function init(){
  await loadData();
  renderProfile();
  renderCerts();
})();
