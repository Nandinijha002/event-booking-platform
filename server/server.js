const express = require('express');
const cors = require('cors');
const path = require('path');

const eventsRouter = require('./routes/events');
const bookingsRouter = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ---- API routes ----
app.use('/api/events', eventsRouter);
app.use('/api/bookings', bookingsRouter);

// ---- Serve frontend (public/) ----
app.use(express.static(path.join(__dirname, '..', 'public')));

// Fallback: any unknown non-API route -> index.html
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  Event Booking Platform running at http://localhost:${PORT}\n`);
});