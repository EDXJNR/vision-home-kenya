

let allProperties   = [];
let activeFilter    = 'all';
let activeNeighborhood = null;
let activeBudgetMax = null;

function parsePrice(price) {
  if (!price) return 0;
  return parseInt(String(price).replace(/[^0-9]/g, ''), 10) || 0;
}

function setBudgetFilter(value) {
  const n = parseInt(String(value || '').replace(/[^0-9]/g, ''), 10);
  activeBudgetMax = n > 0 ? n : null;
  renderProperties();
}

async function loadProperties() {
  try {
    const db = getDB();
    if (!db) throw new Error('DB not available');

    const { data, error } = await db
      .from('properties')
      .select(`
        *,
        property_images (
          id,
          url,
          sort_order
        )
      `)
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    allProperties = (data || []).map(p => ({
      ...p,
      property_images: (p.property_images || []).sort((a, b) => a.sort_order - b.sort_order)
    }));

  } catch (err) {
    console.warn('Supabase not connected — showing demo data.', err);
    allProperties = getDemoProperties();
  }
  renderProperties();
  updateNeighborhoodCounts();
}

function getDemoProperties() {
  return [
    { id:1, type:'rent', neighborhood:'Kilimani', price:'KES 120,000 / mo', title:'3-bedroom luxury apartment', beds:3, baths:2, size:'1,400 sqft', description:'Stunning modern apartment in the heart of Kilimani with breathtaking city views, full security, and ample parking.', lat:-1.2921, lng:36.7870, property_images:[] },
    { id:2, type:'sale', neighborhood:'Lavington', price:'KES 28,000,000', title:'4-bedroom townhouse, gated estate', beds:4, baths:3, size:'2,800 sqft', description:'Elegant townhouse within a secure gated community. Features a private garden, DSQ, and proximity to international schools.', lat:-1.2781, lng:36.7676, property_images:[] },
    { id:3, type:'sale', neighborhood:'Karen', price:'KES 65,000,000', title:'5-bedroom villa, half-acre plot', beds:5, baths:4, size:'5,000 sqft', description:'Magnificent villa set on a lush half-acre plot with a swimming pool, staff quarters, and expansive entertainment space.', lat:-1.3190, lng:36.6880, property_images:[] },
    { id:4, type:'rent', neighborhood:'Westlands', price:'KES 85,000 / mo', title:'2-bedroom apartment with city views', beds:2, baths:2, size:'950 sqft', description:'Stylish apartment in Westlands with panoramic city views, modern finishes, gym access and 24hr security.', lat:-1.2676, lng:36.8062, property_images:[] },
    { id:5, type:'sale', neighborhood:'Runda', price:'KES 95,000,000', title:'6-bedroom ambassadorial residence', beds:6, baths:5, size:'8,000 sqft', description:'Prestigious property in the elite Runda estate. Double volume living areas, staff quarters, tennis court, and extensive grounds.', lat:-1.2198, lng:36.8018, property_images:[] },
    { id:6, type:'rent', neighborhood:'Kileleshwa', price:'KES 55,000 / mo', title:'1-bedroom modern studio', beds:1, baths:1, size:'600 sqft', description:'Contemporary studio apartment in quiet Kileleshwa, ideal for a young professional. All amenities nearby.', lat:-1.2762, lng:36.7812, property_images:[] },
  ];
}

function getFirstImage(p) {
  if (p.property_images && p.property_images.length > 0) {
    return p.property_images[0].url;
  }
  return null;
}

function getRenderLimit() {
  const el = document.getElementById('props-container');
  const raw = el && el.dataset ? el.dataset.limit : '';
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function renderProperties(limit = null) {
  let filtered = allProperties;
  if (activeFilter !== 'all')  filtered = filtered.filter(p => p.type === activeFilter);
  if (activeNeighborhood)      filtered = filtered.filter(p => p.neighborhood.toLowerCase() === activeNeighborhood.toLowerCase());
  if (activeBudgetMax)         filtered = filtered.filter(p => parsePrice(p.price) <= activeBudgetMax);
  const effectiveLimit = limit ?? getRenderLimit();
  if (effectiveLimit)          filtered = filtered.slice(0, effectiveLimit);

  const container = document.getElementById('props-container');
  if (!container) return;
  container.className = 'props-grid';

  if (!filtered.length) {
    container.innerHTML = '<div class="no-listings"><i class="ti ti-home-off" style="font-size:32px;display:block;margin-bottom:12px;color:var(--gold)"></i>No listings found.<br>Try a different filter.</div>';
    return;
  }

  const total = filtered.length;
  container.innerHTML = filtered.map((p, idx) => {
    const firstImg = getFirstImage(p);
    const imgCount = p.property_images ? p.property_images.length : 0;
    const img = firstImg
      ? `<img src="${firstImg}" alt="${p.title}" loading="lazy" style="width:100%;height:100%;object-fit:cover;"/>`
      : getPlaceholderSVG(p.neighborhood);
    const soloClass = total === 1
      ? ' prop-card--solo'
      : (total % 3 === 1 && idx === total - 1 ? ' prop-card--orphan' : '');

    return `
    <div class="prop-card${soloClass}" onclick="openModal(${p.id})">
      <div class="prop-img">
        <div class="prop-img-inner prop-img-placeholder">
          ${img}
        </div>
        <span class="prop-badge ${p.type==='rent'?'badge-r':'badge-s'}">${p.type==='rent'?'For rent':'For sale'}</span>
        ${imgCount > 1 ? `<span style="position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,0.6);color:#fff;font-size:10px;padding:3px 8px;border-radius:2px;letter-spacing:0.04em;"><i class="ti ti-photo"></i> ${imgCount}</span>` : ''}
        <div class="prop-fav" onclick="event.stopPropagation();toggleFav(this,${p.id})" title="Save property"><i class="ti ti-heart"></i></div>
      </div>
      <div class="prop-body">
        <div class="prop-hood">${p.neighborhood}</div>
        <div class="prop-price">${p.price}</div>
        <div class="prop-name">${p.title}</div>
        <div class="prop-meta">
          ${p.beds  ? `<span><i class="ti ti-bed"></i> ${p.beds} beds</span>` : ''}
          ${p.baths ? `<span><i class="ti ti-bath"></i> ${p.baths} baths</span>` : ''}
          ${p.size  ? `<span><i class="ti ti-ruler-measure"></i> ${p.size}</span>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
}

function setFilter(type, btn, neighborhood = null) {
  activeFilter = type;
  activeNeighborhood = neighborhood;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProperties();
  if (neighborhood) {
    const el = document.getElementById('listings');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }
}

function updateNeighborhoodCounts() {
  ['westlands','kilimani','kileleshwa','lavington','karen','runda'].forEach(h => {
    const count = allProperties.filter(p => p.neighborhood.toLowerCase() === h).length;
    const el = document.getElementById(`cnt-${h}`);
    if (el) el.innerHTML = `${count} listing${count!==1?'s':''} <i class="ti ti-arrow-right"></i>`;
  });
}

function toggleFav(el, id) {
  const saved = JSON.parse(localStorage.getItem('vhk-saved') || '[]');
  const i = saved.indexOf(id);
  if (i === -1) { saved.push(id); el.style.color = 'var(--gold)'; }
  else          { saved.splice(i,1); el.style.color = ''; }
  localStorage.setItem('vhk-saved', JSON.stringify(saved));
}

function getGradient(hood) {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if (isLight) {
    return 'linear-gradient(135deg, var(--bg2), var(--card-bg))';
  }
  const g = {
    Kilimani:   'linear-gradient(135deg,#1a2a20,#0d1a12)',
    Lavington:  'linear-gradient(135deg,#1a1a2a,#0d0d1a)',
    Karen:      'linear-gradient(135deg,#2a1a0d,#1a0d00)',
    Westlands:  'linear-gradient(135deg,#1a2028,#0d1420)',
    Runda:      'linear-gradient(135deg,#1e1a28,#100d1a)',
    Kileleshwa: 'linear-gradient(135deg,#1a2818,#0d180d)'
  };
  return g[hood] || 'linear-gradient(135deg, var(--bg2), var(--bg))';
}

function getPlaceholderSVG(hood) {
  return `<svg width="160" height="120" viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg" opacity="0.35">
    <rect x="20" y="55" width="120" height="65" fill="none" stroke="#c9a96e" stroke-width="0.8"/>
    <polygon points="80,10 140,55 20,55" fill="none" stroke="#c9a96e" stroke-width="0.8"/>
    <rect x="60" y="80" width="40" height="40" fill="none" stroke="#c9a96e" stroke-width="0.6"/>
    <rect x="28" y="68" width="25" height="20" fill="none" stroke="#c9a96e" stroke-width="0.6"/>
    <rect x="107" y="68" width="25" height="20" fill="none" stroke="#c9a96e" stroke-width="0.6"/>
  </svg>`;
}
