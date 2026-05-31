

function openModal(id) {
  const p = allProperties.find(x => x.id === id);
  if (!p) return;

    document.getElementById('modal').dataset.propId = p.id;
  document.getElementById('modal-hood').textContent  = p.neighborhood;
  document.getElementById('modal-price').textContent = p.price;
  document.getElementById('modal-name').textContent  = p.title;
  document.getElementById('modal-desc').textContent  = p.description || 'Contact us for more details about this property.';

  document.getElementById('modal-meta').innerHTML = `
    ${p.beds  ? `<span><i class="ti ti-bed"></i> ${p.beds} beds</span>` : ''}
    ${p.baths ? `<span><i class="ti ti-bath"></i> ${p.baths} baths</span>` : ''}
    ${p.size  ? `<span><i class="ti ti-ruler-measure"></i> ${p.size}</span>` : ''}
  `;

const imgEl = document.getElementById('modal-img');
const firstImage = p.property_images && p.property_images.length > 0 ? p.property_images[0].url : null;
imgEl.innerHTML = firstImage
  ? `<img src="${firstImage}" alt="${p.title}" style="width:100%;height:100%;object-fit:cover"/>`
  : `<div style="height:100%;background:${getGradient(p.neighborhood)};display:flex;align-items:center;justify-content:center;">${getPlaceholderSVG(p.neighborhood)}</div>`;

  document.getElementById('modal-wa').onclick = () => {
    const msg = encodeURIComponent(`Hi, I'm interested in: ${p.title} (${p.neighborhood}) at ${p.price}`);
    window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`);
  };

  document.getElementById('modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});