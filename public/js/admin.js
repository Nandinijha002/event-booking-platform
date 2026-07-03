/* ==========================================================================
   Admin dashboard: fetch all bookings, render stats + table (Bonus Feature)
   ========================================================================== */

let allBookings = [];

function renderStats(bookings) {
  const totalBookings = bookings.length;
  const totalTickets = bookings.reduce((sum, b) => sum + b.tickets, 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const uniqueEvents = new Set(bookings.map(b => b.eventId)).size;

  document.getElementById('adminStats').innerHTML = `
    <div class="stat-card"><div class="stat-num">${totalBookings}</div><div class="stat-label">Total Bookings</div></div>
    <div class="stat-card"><div class="stat-num">${totalTickets}</div><div class="stat-label">Tickets Sold</div></div>
    <div class="stat-card"><div class="stat-num">${formatINR(totalRevenue)}</div><div class="stat-label">Total Revenue</div></div>
    <div class="stat-card"><div class="stat-num">${uniqueEvents}</div><div class="stat-label">Events Booked</div></div>
  `;
}

function renderTable(bookings) {
  const tbody = document.getElementById('bookingsBody');

  if (bookings.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--text-faint);">No bookings yet. Book a ticket to see it appear here.</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td><code style="color:var(--marigold);">${b.bookingId}</code></td>
      <td>${b.eventName}</td>
      <td>${b.name}</td>
      <td>${b.email}<br><span style="color:var(--text-faint);">+91 ${b.phone}</span></td>
      <td>${b.tickets}</td>
      <td>${formatINR(b.totalAmount)}</td>
      <td>${new Date(b.bookedAt).toLocaleString('en-IN')}</td>
      <td><span class="badge">Confirmed</span></td>
    </tr>
  `).join('');
}

function applyAdminSearch() {
  const q = document.getElementById('adminSearch').value.toLowerCase().trim();
  if (!q) { renderTable(allBookings); return; }
  const filtered = allBookings.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.email.toLowerCase().includes(q) ||
    b.bookingId.toLowerCase().includes(q) ||
    b.eventName.toLowerCase().includes(q)
  );
  renderTable(filtered);
}

async function loadBookings() {
  try {
    const res = await fetch(`${API_BASE}/bookings`);
    const data = await res.json();
    if (!data.success) throw new Error();
    allBookings = data.bookings;
    renderStats(allBookings);
    renderTable(allBookings);
  } catch (err) {
    document.getElementById('bookingsBody').innerHTML =
      `<tr><td colspan="8" style="text-align:center; padding:40px; color:var(--danger);">Could not load bookings. Make sure the server is running.</td></tr>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadBookings();
  document.getElementById('adminSearch').addEventListener('input', applyAdminSearch);
  document.getElementById('refreshBtn').addEventListener('click', loadBookings);
});