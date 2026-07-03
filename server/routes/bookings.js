const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const BOOKINGS_FILE = path.join(__dirname, '..', 'data', 'bookings.json');
const EVENTS_FILE = path.join(__dirname, '..', 'data', 'events.json');

function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

function generateBookingId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BK${Date.now().toString().slice(-6)}${rand}`;
}

// Indian mobile number: 10 digits, starts with 6-9
const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/bookings -> create a new booking
router.post('/', (req, res) => {
  try {
    const { eventId, name, email, phone, tickets } = req.body;

    // ---- Validation ----
    const errors = {};
    if (!eventId) errors.eventId = 'Event is required.';
    if (!name || name.trim().length < 2) errors.name = 'Enter a valid full name.';
    if (!email || !EMAIL_REGEX.test(email)) errors.email = 'Enter a valid email address.';
    if (!phone || !INDIAN_PHONE_REGEX.test(String(phone).replace(/\D/g, '').slice(-10))) {
      errors.phone = 'Enter a valid 10-digit Indian mobile number.';
    }
    const ticketCount = parseInt(tickets, 10);
    if (!ticketCount || ticketCount < 1 || ticketCount > 10) {
      errors.tickets = 'Select between 1 and 10 tickets.';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    // ---- Check event & availability ----
    const events = readJSON(EVENTS_FILE);
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    const event = events[eventIndex];
    if (event.ticketsAvailable < ticketCount) {
      return res.status(400).json({
        success: false,
        message: `Only ${event.ticketsAvailable} tickets left for this event.`
      });
    }

    // ---- Deduct tickets ----
    events[eventIndex].ticketsAvailable -= ticketCount;
    writeJSON(EVENTS_FILE, events);

    // ---- Save booking ----
    const bookings = readJSON(BOOKINGS_FILE);
    const newBooking = {
      bookingId: generateBookingId(),
      eventId,
      eventName: event.name,
      eventDate: event.date,
      eventVenue: `${event.venue}, ${event.city}`,
      name: name.trim(),
      email: email.trim(),
      phone: String(phone).replace(/\D/g, '').slice(-10),
      tickets: ticketCount,
      pricePerTicket: event.price,
      totalAmount: event.price * ticketCount,
      bookedAt: new Date().toISOString()
    };
    bookings.push(newBooking);
    writeJSON(BOOKINGS_FILE, bookings);

    res.status(201).json({ success: true, booking: newBooking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Something went wrong while booking.' });
  }
});

// GET /api/bookings -> all bookings (used by admin dashboard)
router.get('/', (req, res) => {
  try {
    const bookings = readJSON(BOOKINGS_FILE).sort(
      (a, b) => new Date(b.bookedAt) - new Date(a.bookedAt)
    );
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load bookings.' });
  }
});

// GET /api/bookings/:bookingId -> single booking (used by confirmation page)
router.get('/:bookingId', (req, res) => {
  try {
    const bookings = readJSON(BOOKINGS_FILE);
    const booking = bookings.find(b => b.bookingId === req.params.bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load booking.' });
  }
});

module.exports = router;