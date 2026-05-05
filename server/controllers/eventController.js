const Event = require('../models/Event');

// GET /api/events — Get all events (with optional category filter)
const getEvents = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category && category !== 'All' ? { category } : {};
    const events = await Event.find(filter)
      .populate('createdBy', 'name email')
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/events/:id — Get single event
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/events — Create new event (protected)
const createEvent = async (req, res) => {
  try {
    const { title, description, category, date, location, capacity, imageUrl } = req.body;

    if (!title || !description || !category || !date || !location || !capacity) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const event = await Event.create({
      title,
      description,
      category,
      date,
      location,
      capacity: Number(capacity),
      imageUrl: imageUrl || '',
      createdBy: req.user.userId,
    });

    const populated = await event.populate('createdBy', 'name email');
    res.status(201).json({ message: 'Event created successfully', event: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/events/:id — Update event (protected, owner only)
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this event' });
    }

    const { title, description, category, date, location, capacity, imageUrl } = req.body;
    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (date) event.date = date;
    if (location) event.location = location;
    if (capacity) event.capacity = Number(capacity);
    if (imageUrl !== undefined) event.imageUrl = imageUrl;

    await event.save();
    res.json({ message: 'Event updated successfully', event });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/events/:id/rsvp — RSVP to event (protected)
const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const userId = req.user.userId;

    // Check if already RSVPed
    if (event.attendees.includes(userId)) {
      return res.status(400).json({ message: 'You have already RSVPed to this event' });
    }

    // Check capacity
    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: 'This event is fully booked' });
    }

    event.attendees.push(userId);
    await event.save();

    const updated = await Event.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email');

    // Emit real-time update via Socket.io
    const io = req.app.get('io');
    io.emit('rsvp-update', {
      eventId: event._id,
      attendeesCount: updated.attendees.length,
      spotsLeft: updated.capacity - updated.attendees.length,
    });

    res.json({ message: 'RSVP successful! 🎉', event: updated });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getEvents, getEventById, createEvent, updateEvent, rsvpEvent };
