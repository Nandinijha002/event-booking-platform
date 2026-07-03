/* ==========================================================================
   Events listing page: fetch, search, filter
   ========================================================================== */

let allEvents = [];

function renderCard(e) {
  return `
  <a href="event-details.html?id=${e.id}" class="ticket-card">
    <div class="tc-banner">
      <span class="tc-category">${CATEGORY_ICON[e.category] || '🎫'} ${e.category}</span>
      <span class="tc-price-tag">${formatINR(e.price)}</span>
      ${e.image}
    </div>
    <div class="tc-body">
      <h3>${e.name}</h3>
      <div class="tc-meta">
        <span>📅 ${formatDateIndian(e.date)} · ${formatTime12h(e.time)}</span>
        <span>📍 ${e.venue}, ${e.city}</span>
      </div>
      <p class="tc-desc">${e.shortDescription}</p>
    </div>
    <div class="tc-perforation"></div>
    <div class="tc-footer">
      <span class="tc-avail">${e.ticketsAvailable > 0 ? `<strong>${e.ticketsAvailable}</strong> tickets left` : '<strong style="color:var(--danger)">Sold out</strong>'}</span>
      <span class="btn btn-primary btn-sm">View →</span>
    </div>
  </a>`;
}

function renderGrid(events) {
  const grid = document.getElementById('eventGrid');
  const count = document.getElementById('resultCount');
  count.textContent = `${events.length} event${events.length !== 1 ? 's' : ''} found`;

  if (events.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <div class="es-emoji">🎪</div>
      No events match your search. Try a different keyword or filter.
    </div>`;
    return;
  }
  grid.innerHTML = events.map(renderCard).join('');
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase().trim();
  const category = document.getElementById('categoryFilter').value;
  const city = document.getElementById('cityFilter').value;

  let filtered = allEvents;
  if (category !== 'All') filtered = filtered.filter(e => e.category === category);
  if (city !== 'All') filtered = filtered.filter(e => e.city === city);
  if (search) {
    filtered = filtered.filter(e =>
      e.name.toLowerCase().includes(search) ||
      e.city.toLowerCase().includes(search) ||
      e.shortDescription.toLowerCase().includes(search)
    );
  }
  renderGrid(filtered);
}

async function loadEvents() {
  const grid = document.getElementById('eventGrid');
  try {
    const res = await fetch(`${API_BASE}/events`);
    const data = await res.json();
    if (!data.success) throw new Error();
    allEvents = data.events;

    // Pre-fill filters from URL params (e.g. index.html?category=Music links)
    const params = new URLSearchParams(window.location.search);
    if (params.get('category')) document.getElementById('categoryFilter').value = params.get('category');
    if (params.get('city')) document.getElementById('cityFilter').value = params.get('city');

    applyFilters();
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1;">
      <div class="es-emoji">⚠️</div>
      Could not load events. Make sure the backend server is running (npm start).
    </div>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadEvents();
  document.getElementById('searchInput').addEventListener('input', applyFilters);
  document.getElementById('categoryFilter').addEventListener('change', applyFilters);
  document.getElementById('cityFilter').addEventListener('change', applyFilters);
  document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = 'All';
    document.getElementById('cityFilter').value = 'All';
    applyFilters();
  });
});