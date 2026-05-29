/* ═══════════════════════════════════════════════════════════════
   admin.js  —  Vision Homes Kenya Admin Dashboard
   ═══════════════════════════════════════════════════════════════ */

/* ── 0. Supabase client ───────────────────────────────────────── */
const { createClient } = supabase;
const sb = createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

/* ── 1. State ─────────────────────────────────────────────────── */
let allProperties = [];
let pillFilter    = 'all';
let pendingImages = [];  // { file, url, isExisting, dbId? }

/* ── 2. Auth ──────────────────────────────────────────────────── */
async function doLogin() {
  const email = document.getElementById('admin-email').value.trim();
  const pass  = document.getElementById('admin-pass').value;
  const btn   = document.getElementById('login-btn');
  const errEl = document.getElementById('login-error');

  errEl.style.display = 'none';
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div> Signing in…';

  const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });

  if (error) {
    errEl.textContent = error.message;
    errEl.style.display = 'block';
    btn.disabled = false;
    btn.innerHTML = '<i class="ti ti-lock"></i> Sign In to Dashboard';
    return;
  }

  bootAdmin(data.user);
}

async function doLogout() {
  await sb.auth.signOut();
  document.getElementById('admin-shell').style.display  = 'none';
  document.getElementById('login-screen').style.display = 'flex';
}

async function checkSession() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) bootAdmin(session.user);
}

function bootAdmin(user) {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('admin-shell').style.display  = 'block';
  document.getElementById('topbar-email').textContent   = user.email;
  loadProperties();
  loadEnquiries();
  loadSubscribers();
}

/* ── 3. Tab switching ─────────────────────────────────────────── */
function showTab(tab, navEl) {
  document.querySelectorAll('[id^="tab-"]').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  document.getElementById('tab-' + tab).style.display = 'block';
  if (navEl) navEl.classList.add('active');
  if (tab === 'add') { openAddDrawer(); showTab('properties', document.querySelector('.nav-item')); }
}

/* ── 4. Load properties (includes property_images) ───────────── */
async function loadProperties() {
  const { data, error } = await sb
    .from('properties')
    .select(`*, property_images(id, url, sort_order)`)
    .order('created_at', { ascending: false });

  if (error) { showToast('Failed to load: ' + error.message, 'error'); return; }

  allProperties = (data || []).map(p => ({
    ...p,
    property_images: (p.property_images || []).sort((a, b) => a.sort_order - b.sort_order),
  }));
  updateStats();
  renderTable();
}

function updateStats() {
  const total   = allProperties.length;
  const active  = allProperties.filter(p => p.active).length;
  const forSale = allProperties.filter(p => p.type === 'sale').length;
  const forRent = allProperties.filter(p => p.type === 'rent').length;

  document.getElementById('stat-total').textContent  = total;
  document.getElementById('stat-active').textContent = active;
  document.getElementById('stat-sale').textContent   = forSale;
  document.getElementById('stat-rent').textContent   = forRent;
  document.getElementById('nav-count-props').textContent = total;
}

/* ── 5. Render table ──────────────────────────────────────────── */
function filterTable() { renderTable(); }

function setPillFilter(f, el) {
  pillFilter = f;
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  renderTable();
}

function renderTable() {
  const q     = document.getElementById('prop-search').value.toLowerCase();
  const tbody = document.getElementById('props-tbody');

  let rows = allProperties;

  if (pillFilter === 'sale')     rows = rows.filter(p => p.type === 'sale');
  if (pillFilter === 'rent')     rows = rows.filter(p => p.type === 'rent');
  if (pillFilter === 'inactive') rows = rows.filter(p => !p.active);

  if (q) rows = rows.filter(p =>
    (p.title        || '').toLowerCase().includes(q) ||
    (p.neighborhood || '').toLowerCase().includes(q) ||
    (p.price        || '').toLowerCase().includes(q)
  );

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <i class="ti ti-building-off"></i>
      <div style="margin-top:10px;">No properties found</div>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(p => {
    // Get first image from property_images
    const firstImg = p.property_images && p.property_images.length > 0 ? p.property_images[0].url : null;
    const imgCount = p.property_images ? p.property_images.length : 0;

    const imgEl = firstImg
      ? `<div style="position:relative;display:inline-block;">
           <img class="prop-thumb" src="${escHtml(firstImg)}" alt="">
           ${imgCount > 1 ? `<span style="position:absolute;bottom:2px;right:2px;background:rgba(0,0,0,0.7);color:#fff;font-size:8px;padding:1px 4px;border-radius:1px;">${imgCount}</span>` : ''}
         </div>`
      : `<div class="prop-thumb-placeholder"><i class="ti ti-photo"></i></div>`;

    const typeBadge   = p.type === 'sale' ? `<span class="badge badge-sale">Sale</span>` : `<span class="badge badge-rent">Rent</span>`;
    const statusBadge = p.active ? `<span class="badge badge-active">Active</span>` : `<span class="badge badge-inactive">Inactive</span>`;
    const hasCoords   = p.lat && p.lng ? `<span title="Has coordinates" style="color:var(--green);font-size:12px;margin-left:4px;"><i class="ti ti-map-pin"></i></span>` : '';

    return `<tr>
      <td>${imgEl}</td>
      <td class="td-title">${escHtml(p.title || '—')}${hasCoords}</td>
      <td>${escHtml(p.neighborhood || '—')}</td>
      <td class="td-price">${escHtml(p.price || '—')}</td>
      <td>${typeBadge}</td>
      <td>${statusBadge}</td>
      <td>
        <div class="td-actions">
          <button class="btn btn-outline btn-sm" onclick="openEditDrawer(${p.id})">
            <i class="ti ti-pencil"></i> Edit
          </button>
          <button class="btn ${p.active ? 'btn-danger' : 'btn-success'} btn-sm"
                  onclick="toggleActive(${p.id}, ${p.active})">
            <i class="ti ti-${p.active ? 'eye-off' : 'eye'}"></i>
            ${p.active ? 'Deactivate' : 'Activate'}
          </button>
          <button class="btn btn-danger btn-sm" onclick="confirmDelete(${p.id}, '${escHtml(p.title || '')}')">
            <i class="ti ti-trash"></i>
          </button>
        </div>
      </td>
    </tr>`;
  }).join('');
}

/* ── 6. Drawer open / close ───────────────────────────────────── */
function openAddDrawer() {
  resetForm();
  document.getElementById('drawer-title').textContent = 'Add Property';
  document.getElementById('edit-id').value = '';
  document.getElementById('prop-drawer').classList.add('open');
}

function openEditDrawer(id) {
  const p = allProperties.find(x => x.id === id);
  if (!p) { showToast('Property not found', 'error'); return; }

  resetForm();
  document.getElementById('drawer-title').textContent  = 'Edit Property';
  document.getElementById('edit-id').value             = id;
  document.getElementById('f-title').value             = p.title        || '';
  document.getElementById('f-type').value              = p.type         || 'sale';
  document.getElementById('f-neighborhood').value      = p.neighborhood || 'Karen';
  document.getElementById('f-price').value             = p.price        || '';
  document.getElementById('f-description').value       = p.description  || '';
  document.getElementById('f-beds').value              = p.beds         ?? '';
  document.getElementById('f-baths').value             = p.baths        ?? '';
  document.getElementById('f-size').value              = p.size         || '';
  document.getElementById('f-lat').value               = p.lat          ?? '';
  document.getElementById('f-lng').value               = p.lng          ?? '';
  document.getElementById('f-active').value            = String(p.active !== false);

  // Load existing images from property_images
  if (p.property_images && p.property_images.length > 0) {
    pendingImages = p.property_images.map(img => ({
      file: null,
      url: img.url,
      isExisting: true,
      dbId: img.id,
    }));
    renderPreviews();
  }

  document.getElementById('prop-drawer').classList.add('open');
}

function closeDrawer() {
  document.getElementById('prop-drawer').classList.remove('open');
  resetForm();
}

function resetForm() {
  ['f-title','f-price','f-description','f-beds','f-baths','f-size','f-lat','f-lng'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('f-type').value         = 'sale';
  document.getElementById('f-active').value        = 'true';
  document.getElementById('f-neighborhood').value  = 'Karen';
  document.getElementById('edit-id').value         = '';
  pendingImages = [];
  renderPreviews();
  document.getElementById('upload-progress').classList.remove('visible');
}

/* ── 7. Image handling (property_images table) ────────────────── */
function handleFileSelect(files) {
  Array.from(files).forEach(file => {
    if (file.size > 5 * 1024 * 1024) {
      showToast(`${file.name} exceeds 5 MB`, 'error');
      return;
    }
    pendingImages.push({ file, url: URL.createObjectURL(file), isExisting: false, dbId: null });
  });
  renderPreviews();
  document.getElementById('f-images').value = '';
}

function renderPreviews() {
  const container = document.getElementById('image-previews');
  container.innerHTML = pendingImages.map((img, i) => `
    <div class="img-preview">
      <img src="${img.url}" alt="">
      ${i === 0 ? '<div class="img-preview-main-badge">Cover</div>' : ''}
      <button class="img-preview-remove" onclick="removeImage(${i})">
        <i class="ti ti-x" style="font-size:10px;"></i>
      </button>
    </div>
  `).join('');
}

function removeImage(i) {
  const img = pendingImages[i];
  if (!img.isExisting) URL.revokeObjectURL(img.url);
  pendingImages.splice(i, 1);
  renderPreviews();
}

async function uploadSingleImage(file) {
  const ext  = file.name.split('.').pop();
  const path = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await sb.storage
    .from('property-images')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw new Error('Image upload failed: ' + error.message);

  const { data: { publicUrl } } = sb.storage
    .from('property-images')
    .getPublicUrl(path);

  return publicUrl;
}

/* ── 8. Save property ─────────────────────────────────────────── */
async function saveProperty() {
  const title  = document.getElementById('f-title').value.trim();
  const price  = document.getElementById('f-price').value.trim();
  const editId = document.getElementById('edit-id').value;

  if (!title || !price) { showToast('Title and Price are required.', 'error'); return; }

  const saveBtn = document.getElementById('save-btn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;"></div> Saving…';

  try {
    // Parse lat/lng
    const latRaw = document.getElementById('f-lat').value.trim();
    const lngRaw = document.getElementById('f-lng').value.trim();
    const lat = latRaw ? parseFloat(latRaw) : null;
    const lng = lngRaw ? parseFloat(lngRaw) : null;

    const payload = {
      title,
      type         : document.getElementById('f-type').value,
      neighborhood : document.getElementById('f-neighborhood').value,
      price,
      description  : document.getElementById('f-description').value.trim(),
      beds         : parseInt(document.getElementById('f-beds').value)  || null,
      baths        : parseInt(document.getElementById('f-baths').value) || null,
      size         : document.getElementById('f-size').value.trim(),
      lat,
      lng,
      active       : document.getElementById('f-active').value === 'true',
    };

    let propId = editId ? parseInt(editId) : null;
    let error;

    if (editId) {
      ({ error } = await sb.from('properties').update(payload).eq('id', editId));
    } else {
      const { data: inserted, error: insertErr } = await sb.from('properties').insert([payload]).select('id').single();
      error = insertErr;
      if (inserted) propId = inserted.id;
    }

    if (error) throw new Error(error.message);

    // ── Handle images in property_images table ──
    if (propId) {
      const progress     = document.getElementById('upload-progress');
      const progressText = document.getElementById('upload-progress-text');

      // Upload new files
      const newImages = pendingImages.filter(i => !i.isExisting);
      if (newImages.length > 0) {
        progress.classList.add('visible');
        for (let i = 0; i < newImages.length; i++) {
          progressText.textContent = `Uploading image ${i + 1} of ${newImages.length}…`;
          const url = await uploadSingleImage(newImages[i].file);
          newImages[i].url = url; // update with real URL
          await sb.from('property_images').insert({
            property_id: propId,
            url,
            sort_order: pendingImages.findIndex(x => x === newImages[i]),
          });
        }
        progress.classList.remove('visible');
      }

      // If editing: delete images that were removed (existing ones no longer in pendingImages)
      if (editId) {
        const keptDbIds = pendingImages
          .filter(i => i.isExisting && i.dbId)
          .map(i => i.dbId);

        // Fetch current DB images
        const { data: currentImgs } = await sb
          .from('property_images')
          .select('id')
          .eq('property_id', propId);

        const toDelete = (currentImgs || [])
          .filter(img => !keptDbIds.includes(img.id))
          .map(img => img.id);

        if (toDelete.length > 0) {
          await sb.from('property_images').delete().in('id', toDelete);
        }

        // Update sort_order for kept images
        for (let i = 0; i < pendingImages.length; i++) {
          const img = pendingImages[i];
          if (img.isExisting && img.dbId) {
            await sb.from('property_images').update({ sort_order: i }).eq('id', img.dbId);
          }
        }
      }
    }

    showToast(editId ? 'Property updated.' : 'Property added.', 'success');
    closeDrawer();
    loadProperties();

  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="ti ti-device-floppy"></i> Save Property';
  }
}

/* ── 9. Toggle active ─────────────────────────────────────────── */
async function toggleActive(id, current) {
  const { error } = await sb.from('properties').update({ active: !current }).eq('id', id);
  if (error) { showToast('Update failed: ' + error.message, 'error'); return; }
  showToast(current ? 'Property deactivated.' : 'Property activated.', 'success');
  loadProperties();
}

/* ── 10. Delete ───────────────────────────────────────────────── */
function confirmDelete(id, title) {
  document.getElementById('confirm-title').textContent = 'Delete Property?';
  document.getElementById('confirm-sub').textContent   =
    `"${title}" and all its images will be permanently removed.`;
  document.getElementById('confirm-dialog').classList.add('open');
  document.getElementById('confirm-ok-btn').onclick = () => deleteProperty(id);
}

async function deleteProperty(id) {
  closeConfirm();
  // property_images cascade-deletes via FK, so just delete the property
  const { error } = await sb.from('properties').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  showToast('Property deleted.', 'success');
  loadProperties();
}

function closeConfirm() {
  document.getElementById('confirm-dialog').classList.remove('open');
}

/* ── 11. Enquiries ────────────────────────────────────────────── */
async function loadEnquiries() {
  const tbody = document.getElementById('enq-tbody');

  const { data, error } = await sb
    .from('enquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">Failed to load.</div></td></tr>`;
    return;
  }

  document.getElementById('nav-count-enq').textContent = data.length;

  // Update enquiry stats
  const enqTotal    = data.length;
  const enqProperty = data.filter(e => e.type === 'property').length;
  const enqValuation= data.filter(e => e.type === 'valuation').length;
  const enqGeneral  = data.filter(e => e.type === 'general' || e.type === 'other').length;

  const statsEl = document.getElementById('enq-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="stat-card"><div class="stat-label">Total</div><div class="stat-value">${enqTotal}</div></div>
      <div class="stat-card"><div class="stat-label">Property</div><div class="stat-value">${enqProperty}</div></div>
      <div class="stat-card"><div class="stat-label">Valuation</div><div class="stat-value">${enqValuation}</div></div>
      <div class="stat-card"><div class="stat-label">General</div><div class="stat-value">${enqGeneral}</div></div>
    `;
  }

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state">
      <i class="ti ti-mail-off"></i><div style="margin-top:10px;">No enquiries yet</div>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(e => {
    const typeBadge = {
      property:  '<span class="badge badge-sale">Property</span>',
      valuation: '<span class="badge badge-rent">Valuation</span>',
      general:   '<span class="badge" style="background:rgba(255,255,255,0.08);color:var(--text-dim);">General</span>',
      other:     '<span class="badge" style="background:rgba(255,255,255,0.08);color:var(--text-dim);">Other</span>',
    }[e.type] || `<span class="badge">${escHtml(e.type || '—')}</span>`;

    const phone = e.phone || e.whatsapp || '—';
    const waLink = phone !== '—'
      ? `<a href="https://wa.me/${phone.replace(/\D/g,'')}" target="_blank" style="color:var(--gold);text-decoration:none;" title="WhatsApp"><i class="ti ti-brand-whatsapp"></i></a>`
      : '';

    return `<tr>
      <td>${escHtml(e.name || '—')}</td>
      <td>${escHtml(phone)} ${waLink}</td>
      <td>${typeBadge}</td>
      <td>${escHtml(e.property_title || e.subject || '—')}</td>
      <td class="enq-msg">${escHtml(e.message || '—')}</td>
      <td style="white-space:nowrap;font-size:11px;color:var(--text-faint);">
        ${e.created_at ? new Date(e.created_at).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' }) : '—'}
      </td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteEnquiry('${e.id}')">
          <i class="ti ti-trash"></i>
        </button>
      </td>
    </tr>`;
  }).join('');
}

async function deleteEnquiry(id) {
  const { error } = await sb.from('enquiries').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  showToast('Enquiry deleted.', 'success');
  loadEnquiries();
}

/* ── 12. Subscribers ──────────────────────────────────────────── */
async function loadSubscribers() {
  const tbody = document.getElementById('sub-tbody');

  const { data, error } = await sb
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !data) {
    tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state">Failed to load.</div></td></tr>`;
    return;
  }

  // Update subscriber count stat
  const subCountEl = document.getElementById('sub-count-stat');
  if (subCountEl) subCountEl.textContent = data.length;

  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="3"><div class="empty-state">
      <i class="ti ti-users-off"></i><div style="margin-top:10px;">No subscribers yet</div>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(s => `
    <tr>
      <td>
        <a href="mailto:${escHtml(s.email || '')}" style="color:var(--text-dim);text-decoration:none;transition:color 0.2s;"
           onmouseover="this.style.color='var(--gold)'" onmouseout="this.style.color='var(--text-dim)'">
          ${escHtml(s.email || '—')}
        </a>
      </td>
      <td style="font-size:11px;color:var(--text-faint);">
        ${s.created_at ? new Date(s.created_at).toLocaleDateString('en-KE', { day:'numeric', month:'short', year:'numeric' }) : '—'}
      </td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteSubscriber(${s.id})">
          <i class="ti ti-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

async function deleteSubscriber(id) {
  const { error } = await sb.from('subscribers').delete().eq('id', id);
  if (error) { showToast('Delete failed: ' + error.message, 'error'); return; }
  showToast('Subscriber removed.', 'success');
  loadSubscribers();
}

function exportSubscribers() {
  const rows = document.querySelectorAll('#sub-tbody tr');
  const emails = [];
  rows.forEach(row => {
    const email = row.querySelector('td:first-child a');
    if (email) emails.push(email.textContent.trim());
  });
  if (!emails.length) { showToast('No subscribers to export.', 'error'); return; }
  const csv = 'Email\n' + emails.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `vhk-subscribers-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  showToast(`Exported ${emails.length} subscribers.`, 'success');
}

/* ── 13. Toast ────────────────────────────────────────────────── */
let toastTimer;
function showToast(msg, type = 'success') {
  const el   = document.getElementById('toast');
  const icon = el.querySelector('i');
  const txt  = document.getElementById('toast-msg');

  el.className = `show ${type}`;
  icon.className = `ti ti-${type === 'success' ? 'circle-check' : 'alert-circle'} ${type}`;
  txt.textContent = msg;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ''; }, 3200);
}

/* ── 14. Helpers ──────────────────────────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

/* ── 15. Drag-and-drop ────────────────────────────────────────── */
const zone = document.getElementById('upload-zone');
if (zone) {
  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.classList.add('drag-over'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    handleFileSelect(e.dataTransfer.files);
  });
}

/* ── 16. Keyboard shortcuts ───────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeDrawer(); closeConfirm(); }
});

/* ── 17. Boot ─────────────────────────────────────────────────── */
checkSession();
