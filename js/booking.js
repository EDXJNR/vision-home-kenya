

const VHK_SLOTS = [
  { id: '08:00-11:00', label: '8:00 AM – 11:00 AM' },
  { id: '11:00-14:00', label: '11:00 AM – 2:00 PM'  },
  { id: '14:00-17:00', label: '2:00 PM – 5:00 PM'   },
];

function vhkGetEffectiveBooking(row) {
  if (!row || row.status === 'rejected') return null;
  const date = row.rescheduled_date || row.appointment_date;
  const slot = row.rescheduled_slot || row.appointment_slot;
  if (!date || !slot) return null;
  return { date, slot };
}

function vhkBuildSlotMap(rows, excludeId) {
  const map = {};
  (rows || []).forEach(row => {
    if (excludeId != null && String(row.id) === String(excludeId)) return;
    const eff = vhkGetEffectiveBooking(row);
    if (!eff) return;
    if (!map[eff.date]) map[eff.date] = [];
    if (!map[eff.date].includes(eff.slot)) map[eff.date].push(eff.slot);
  });
  return map;
}

function vhkDateInRange(dateStr, startDate, endDate) {
  return dateStr >= startDate && dateStr <= endDate;
}

function vhkFilterMapToMonth(map, startDate, endDate) {
  const out = {};
  Object.keys(map || {}).forEach(d => {
    if (vhkDateInRange(d, startDate, endDate)) out[d] = map[d];
  });
  return out;
}

function vhkGetYouTubeId(url) {
  if (!url) return null;
  let s = String(url).trim();

  const iframeMatch = s.match(/src=["']([^"']+)["']/i);
  if (iframeMatch) s = iframeMatch[1];

  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;

  const patterns = [
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
  ];
  for (const pat of patterns) {
    const m = s.match(pat);
    if (m) return m[1];
  }
  return null;
}

function vhkYouTubeEmbedSrc(id, autoplay) {
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    enablejsapi: '1',
  });
  if (autoplay) {
    params.set('autoplay', '1');
    params.set('mute', '0');
  }
  if (typeof window !== 'undefined' && window.location?.origin && window.location.protocol !== 'file:') {
    params.set('origin', window.location.origin);
  }
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

function vhkInitVideoEmbeds(root) {
  const scope = root || document;
  scope.querySelectorAll('.video-embed-lazy[data-yt-id]').forEach(wrap => {
    if (wrap.dataset.bound) return;
    wrap.dataset.bound = '1';
    const id = wrap.dataset.ytId;
    const play = () => {
      if (wrap.querySelector('iframe')) return;
      const iframe = document.createElement('iframe');
      iframe.src = vhkYouTubeEmbedSrc(id, true);
      iframe.title = 'Property video tour';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      wrap.innerHTML = '';
      wrap.appendChild(iframe);
    };
    wrap.querySelector('.video-play-btn')?.addEventListener('click', play);
    wrap.querySelector('.video-open-yt')?.addEventListener('click', e => e.stopPropagation());
  });
}

function vhkNormalizeVideoLinks(links) {
  if (!links) return [];
  if (Array.isArray(links)) return links.map(v => String(v).trim()).filter(Boolean);
  if (typeof links === 'string') return links.trim() ? [links.trim()] : [];
  return [];
}

function vhkBuildVideoTourHTML(videoLinks) {
  const urls = vhkNormalizeVideoLinks(videoLinks);
  if (!urls.length) return '';
  const embeds = urls.map(url => {
    const id = vhkGetYouTubeId(url);
    if (!id) return '';
    const watchUrl = `https://www.youtube.com/watch?v=${id}`;
    return `<div class="video-embed-wrap video-embed-lazy" data-yt-id="${id}">
      <img class="video-thumb" src="https://img.youtube.com/vi/${id}/hqdefault.jpg" alt="Video tour thumbnail" loading="lazy">
      <button type="button" class="video-play-btn" aria-label="Play video tour"><i class="ti ti-player-play-filled"></i></button>
      <a class="video-open-yt" href="${watchUrl}" target="_blank" rel="noopener">Open on YouTube</a>
    </div>`;
  }).filter(Boolean).join('');
  if (!embeds) return '';
  return `<div class="prop-section-title">Video Tour</div><div class="video-tour-grid">${embeds}</div>`;
}

function vhkLocalBlockedDates() {
  try {
    return JSON.parse(localStorage.getItem('vhk-blocked-dates') || '[]');
  } catch { return []; }
}

function vhkSaveLocalBlockedDates(dates) {
  localStorage.setItem('vhk-blocked-dates', JSON.stringify(dates));
}

async function vhkFetchBlockedSet(db) {
  const set = new Set();
  if (db) {
    try {
      const { data, error } = await db.from('blocked_dates').select('blocked_date');
      if (!error && data) {
        data.forEach(r => { if (r.blocked_date) set.add(r.blocked_date); });
        return set;
      }
    } catch (_) {  }
  }
  vhkLocalBlockedDates().forEach(d => set.add(d));
  return set;
}

async function vhkSetBlockedDate(db, dateStr, blocked, reason) {
  if (db) {
    try {
      if (blocked) {
        const { error } = await db.from('blocked_dates').upsert({ blocked_date: dateStr, reason: reason || null });
        if (!error) return { ok: true };
      } else {
        const { error } = await db.from('blocked_dates').delete().eq('blocked_date', dateStr);
        if (!error) return { ok: true };
      }
    } catch (_) {  }
  }
  let local = vhkLocalBlockedDates();
  if (blocked) {
    if (!local.includes(dateStr)) local.push(dateStr);
  } else {
    local = local.filter(d => d !== dateStr);
  }
  vhkSaveLocalBlockedDates(local.sort());
  return { ok: true, local: true };
}

window.VHK_SLOTS = VHK_SLOTS;
window.vhkGetEffectiveBooking = vhkGetEffectiveBooking;
window.vhkBuildSlotMap = vhkBuildSlotMap;
window.vhkFilterMapToMonth = vhkFilterMapToMonth;
window.vhkGetYouTubeId = vhkGetYouTubeId;
window.vhkNormalizeVideoLinks = vhkNormalizeVideoLinks;
window.vhkBuildVideoTourHTML = vhkBuildVideoTourHTML;
window.vhkYouTubeEmbedSrc = vhkYouTubeEmbedSrc;
window.vhkInitVideoEmbeds = vhkInitVideoEmbeds;
window.vhkFetchBlockedSet = vhkFetchBlockedSet;
window.vhkSetBlockedDate = vhkSetBlockedDate;
