/* ==========================================================================
   Booking form: client-side validation + submission to backend
   ========================================================================== */

const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldError(fieldId, hasError) {
  const group = document.getElementById(`fg-${fieldId}`);
  if (group) group.classList.toggle('has-error', hasError);
}

function validateForm() {
  let valid = true;

  const name = document.getElementById('fullName').value.trim();
  if (name.length < 2) { setFieldError('name', true); valid = false; }
  else setFieldError('name', false);

  const email = document.getElementById('email').value.trim();
  if (!EMAIL_REGEX.test(email)) { setFieldError('email', true); valid = false; }
  else setFieldError('email', false);

  const phone = document.getElementById('phone').value.trim();
  if (!INDIAN_PHONE_REGEX.test(phone)) { setFieldError('phone', true); valid = false; }
  else setFieldError('phone', false);

  const tickets = parseInt(document.getElementById('tickets').value, 10);
  if (!tickets || tickets < 1) { setFieldError('tickets', true); valid = false; }
  else setFieldError('tickets', false);

  return valid;
}

function showAlert(message) {
  const alertBox = document.getElementById('formAlert');
  alertBox.textContent = message;
  alertBox.style.display = 'block';
}

function hideAlert() {
  const alertBox = document.getElementById('formAlert');
  alertBox.style.display = 'none';
}

async function submitBooking(e) {
  e.preventDefault();
  hideAlert();

  if (!currentEvent) return;
  if (!validateForm()) {
    showAlert('Please fix the highlighted fields before continuing.');
    return;
  }

  const submitBtn = document.getElementById('submitBtn');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';

  const payload = {
    eventId: currentEvent.id,
    name: document.getElementById('fullName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    tickets: document.getElementById('tickets').value
  };

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!data.success) {
      showAlert(data.message || 'Please check the form and try again.');
      if (data.errors) {
        Object.keys(data.errors).forEach(key => {
          const map = { eventId: null, name: 'name', email: 'email', phone: 'phone', tickets: 'tickets' };
          if (map[key]) setFieldError(map[key], true);
        });
      }
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }

    // Success -> redirect to confirmation page
    window.location.href = `confirmation.html?bookingId=${data.booking.bookingId}`;
  } catch (err) {
    showAlert('Could not connect to the server. Make sure the backend is running.');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('bookingForm');
  if (form) form.addEventListener('submit', submitBooking);

  const phoneInput = document.getElementById('phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 10);
    });
  }
});