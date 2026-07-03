/* ==========================================================================
   Event details page: load event, render info, run countdown timer
   ========================================================================== */

let currentEvent = null;
let countdownInterval = null;

function getEventIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

async function loadEventDetails() {
  const id = getEventIdFromURL();
  const loading = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');
  const content = document.getElementById('detailsContent');

  if (!id) {
    loading.style.display = 'none';
    errorState.style.display = 'block';
    document.getElementById('errorMsg').textContent = 'No event was specified.';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/events/${id}`);
    const data = await res.json();

    if (!data.success) {
      loading.style.display = 'none';
      errorState.style.display = 'block';
      document.getElementById('errorMsg').textContent = data.message || 'Event not found.';
      return;
    }

    currentEvent = data.event;
    renderEvent(currentEvent);
    loading.style.display = 'none';
    content.style.display = 'grid';
  } catch (err) {
    loading.style.display = 'none';
    errorState.style.display = 'block';
    document.getElementById('errorMsg').textContent = 'Could not connect to the server. Make sure it is running (npm start).';
  }
}

function renderEvent(e) {
  document.title = `${e.name} — Mela Nights`;
  document.getElementById('crumbName').textContent = e.name;
  document.getElementById('eventCategory').textContent = `${CATEGORY_ICON[e.category] || '🎫'} ${e.category}`;
  document.getElementById('eventName').textContent = e.name;
  document.getElementById('eventPoster').textContent = e.image;

  document.getElementById('infoDate').textContent = `${formatDateIndian(e.date)} (${formatDayName(e.date)})`;
  document.getElementById('infoTime').textContent = formatTime12h(e.time);
  document.getElementById('infoVenue').textContent = e.venue;
  document.getElementById('infoCity').textContent = e.city;
  document.getElementById('infoDescription').textContent = e.fullDescription;

  document.getElementById('scheduleList').innerHTML = e.schedule.map(s => `
    <div class="schedule-item">
      <span class="schedule-time">${formatTime12h(s.time)}</span>
      <span>${s.activity}</span>
    </div>`).join('');

  document.getElementById('orgName').textContent = e.organizer.name;
  document.getElementById('orgEmail').textContent = e.organizer.email;
  document.getElementById('orgPhone').textContent = e.organizer.phone;

  document.getElementById('bpPrice').textContent = formatINR(e.price);
  document.getElementById('bpAvail').textContent = e.ticketsAvailable > 0
    ? `${e.ticketsAvailable} tickets available`
    : 'Sold out';

  const submitBtn = document.getElementById('submitBtn');
  if (e.ticketsAvailable <= 0) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sold Out';
  }

  // Limit ticket dropdown to available tickets (max 5 shown)
  const ticketSelect = document.getElementById('tickets');
  const maxSelectable = Math.min(5, e.ticketsAvailable);
  ticketSelect.innerHTML = maxSelectable > 0
    ? Array.from({ length: maxSelectable }, (_, i) => i + 1)
        .map(n => `<option value="${n}">${n} Ticket${n > 1 ? 's' : ''}</option>`).join('')
    : '<option value="0">Sold out</option>';

  updateTotal();
  startCountdown(e.date, e.time);
}

function updateTotal() {
  if (!currentEvent) return;
  const tickets = parseInt(document.getElementById('tickets').value, 10) || 0;
  const total = tickets * currentEvent.price;
  document.getElementById('totalAmount').textContent = formatINR(total);
}

/* ---- Countdown timer (Bonus Feature 2 support) ---- */
function startCountdown(dateStr, timeStr) {
  const target = new Date(`${dateStr}T${timeStr}:00`);

  function tick() {
    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {
      clearInterval(countdownInterval);
      document.getElementById('cdDays').textContent = '00';
      document.getElementById('cdHours').textContent = '00';
      document.getElementById('cdMins').textContent = '00';
      document.getElementById('cdSecs').textContent = '00';
      const label = document.getElementById('countdownLabel');
      if (label) label.textContent = '🎉 Event is live / has ended';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    const secs = Math.floor((diff / 1000) % 60);

    document.getElementById('cdDays').textContent = String(days).padStart(2, '0');
    document.getElementById('cdHours').textContent = String(hours).padStart(2, '0');
    document.getElementById('cdMins').textContent = String(mins).padStart(2, '0');
    document.getElementById('cdSecs').textContent = String(secs).padStart(2, '0');
  }

  tick();
  countdownInterval = setInterval(tick, 1000);
}

document.addEventListener('DOMContentLoaded', () => {
  loadEventDetails();
  document.getElementById('tickets').addEventListener('change', updateTotal);
});