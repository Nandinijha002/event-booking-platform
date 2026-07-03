const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const EVENTS_FILE = path.join(__dirname, '..', 'data', 'events.json');

function readEvents() {
  const raw = fs.readFileSync(EVENTS_FILE, 'utf-8');
  return JSON.parse(raw);
}

// GET /api/events  -> list all events (supports ?category=&city=&search=)
router.get('/', (req, res) => {
  try {
    let events = readEvents();
    const { category, city, search } = req.query;

    if (category && category !== 'All') {
      events = events.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }
    if (city && city !== 'All') {
      events = events.filter(e => e.city.toLowerCase() === city.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      events = events.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.shortDescription.toLowerCase().includes(q) ||
        e.city.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: events.length, events });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load events.' });
  }
});

// GET /api/events/:id -> single event details
router.get('/:id', (req, res) => {
  try {
    const events = readEvents();
    const event = events.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Could not load event.' });
  }
});

module.exports = router;