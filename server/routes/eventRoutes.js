const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  rsvpEvent,
} = require('../controllers/eventController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/events
router.get('/', getEvents);

// GET /api/events/:id
router.get('/:id', getEventById);

// POST /api/events (protected)
router.post('/', protect, createEvent);

// PUT /api/events/:id (protected)
router.put('/:id', protect, updateEvent);

// POST /api/events/:id/rsvp (protected)
router.post('/:id/rsvp', protect, rsvpEvent);

module.exports = router;
