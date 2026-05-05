import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, rsvpEvent } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const FALLBACK_IMAGES = {
  Tech:      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop',
  Business:  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop',
  Music:     'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=1200&auto=format&fit=crop',
  Sports:    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop',
  Art:       'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200&auto=format&fit=crop',
  Food:      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop',
  Health:    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&auto=format&fit=crop',
  Education: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop',
  Other:     'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&auto=format&fit=crop',
};

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [event, setEvent]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [error, setError]             = useState('');
  const [rsvpMsg, setRsvpMsg]         = useState('');
  const [rsvpError, setRsvpError]     = useState('');
  // Separate state for real-time attendee count (avoids corrupting attendees array)
  const [liveAttendeeCount, setLiveAttendeeCount] = useState(null);
  const [liveSpotsLeft, setLiveSpotsLeft]         = useState(null);

  useEffect(() => {
    fetchEvent();

    // Socket.io — listen for real-time RSVP updates
    const socket = io('http://localhost:5000');
    socket.on('rsvp-update', (data) => {
      // Compare as strings since eventId from server is an ObjectId
      if (data.eventId?.toString() === id) {
        setLiveAttendeeCount(data.attendeesCount);
        setLiveSpotsLeft(data.spotsLeft);
      }
    });

    return () => socket.disconnect();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getEventById(id);
      setEvent(res.data);
    } catch (err) {
      setError('Event not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async () => {
    if (!isLoggedIn) {
      navigate('/auth');
      return;
    }
    setRsvpLoading(true);
    setRsvpMsg('');
    setRsvpError('');
    try {
      const res = await rsvpEvent(id);
      setEvent(res.data.event);
      setRsvpMsg('🎉 You\'re in! RSVP confirmed successfully.');
    } catch (err) {
      setRsvpError(err.response?.data?.message || 'RSVP failed. Please try again.');
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) return <div className="ef-spinner"></div>;

  if (error) return (
    <div className="ef-page">
      <div className="container">
        <div className="ef-alert ef-alert-error">
          <i className="bi bi-exclamation-circle"></i>{error}
        </div>
        <button className="btn-outline-ef mt-3" onClick={() => navigate('/')}>
          <i className="bi bi-arrow-left me-1"></i>Back to Explore
        </button>
      </div>
    </div>
  );

  if (!event) return null;

  // Use live real-time counts if available, otherwise fall back to event data
  const attendeeCount = liveAttendeeCount ?? (event.attendees?.length || 0);
  const spotsLeft = liveSpotsLeft ?? (event.spotsLeft !== undefined ? event.spotsLeft : event.capacity - (event.attendees?.length || 0));
  const isFull = spotsLeft <= 0;
  // Safe hasRsvped: only check properly populated attendee objects (never null)
  const hasRsvped = isLoggedIn && event.attendees?.some((a) => {
    if (!a) return false;
    const aId = typeof a === 'object' ? a._id : a;
    return aId?.toString() === user?.id;
  });

  const imgSrc = event.imageUrl || FALLBACK_IMAGES[event.category] || FALLBACK_IMAGES.Other;

  return (
    <div className="ef-page">
      <div className="container">

        {/* Back Button */}
        <button className="btn-outline-ef mb-4" onClick={() => navigate(-1)} id="btn-back">
          <i className="bi bi-arrow-left me-1"></i>Back
        </button>

        <div className="row g-4">
          {/* LEFT — Banner + Description */}
          <div className="col-lg-8">
            {/* Banner */}
            <img
              src={imgSrc}
              alt={event.title}
              className="event-banner mb-4"
              onError={(e) => { e.target.src = FALLBACK_IMAGES.Other; }}
            />

            {/* Title & Category */}
            <div className="d-flex align-items-start justify-content-between flex-wrap gap-2 mb-3">
              <div>
                <span className={`category-badge badge-${event.category?.toLowerCase()} mb-2`}>
                  {event.category}
                </span>
                <h1 className="section-title" style={{ fontSize: '2rem', lineHeight: 1.2 }}>
                  {event.title}
                </h1>
              </div>
            </div>

            {/* Description */}
            <div className="event-detail-card mb-4">
              <h5 style={{ color: 'var(--primary)', marginBottom: '0.75rem', fontWeight: 600 }}>
                <i className="bi bi-info-circle me-2"></i>About this Event
              </h5>
              <p style={{ color: 'var(--text-sub)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {event.description}
              </p>
            </div>
          </div>

          {/* RIGHT — Details + RSVP */}
          <div className="col-lg-4">
            <div className="event-detail-card" style={{ position: 'sticky', top: '90px' }}>
              <h5 style={{ color: 'var(--primary)', marginBottom: '1rem', fontWeight: 600 }}>
                <i className="bi bi-calendar-event me-2"></i>Event Details
              </h5>

              {/* Meta items */}
              <div className="detail-meta-item">
                <i className="bi bi-calendar3"></i>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Date & Time</div>
                  <span>{formatDateTime(event.date)}</span>
                </div>
              </div>

              <div className="detail-meta-item">
                <i className="bi bi-geo-alt"></i>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Location</div>
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="detail-meta-item">
                <i className="bi bi-person-workspace"></i>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Organizer</div>
                  <span>{event.createdBy?.name || 'Unknown'}</span>
                </div>
              </div>

              <div className="detail-meta-item">
                <i className="bi bi-people"></i>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '2px' }}>Attendees</div>
                  <span>{attendeeCount} / {event.capacity}</span>
                </div>
              </div>

              {/* Spots Left */}
              <div className="my-3">
                <span className={`spots-badge ${isFull ? 'full' : ''}`}>
                  <i className={`bi ${isFull ? 'bi-x-circle' : 'bi-ticket-perforated'}`}></i>
                  {isFull ? 'Fully Booked' : `${spotsLeft} Spots Left`}
                </span>
              </div>

              {/* RSVP Alerts */}
              {rsvpMsg   && <div className="ef-alert ef-alert-success mb-3"><i className="bi bi-check-circle"></i>{rsvpMsg}</div>}
              {rsvpError && <div className="ef-alert ef-alert-error   mb-3"><i className="bi bi-x-circle"></i>{rsvpError}</div>}

              {/* RSVP Button */}
              {hasRsvped ? (
                <div className="ef-alert ef-alert-success">
                  <i className="bi bi-check-circle-fill"></i>You&apos;ve already RSVPed!
                </div>
              ) : (
                <button
                  id="btn-rsvp"
                  className="btn-primary-ef w-100 mt-2"
                  onClick={handleRsvp}
                  disabled={isFull || rsvpLoading}
                >
                  {rsvpLoading ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>Processing...</>
                  ) : isFull ? (
                    <><i className="bi bi-x-circle me-1"></i>Fully Booked</>
                  ) : !isLoggedIn ? (
                    <><i className="bi bi-person me-1"></i>Login to RSVP</>
                  ) : (
                    <><i className="bi bi-ticket-perforated me-1"></i>RSVP Now</>
                  )}
                </button>
              )}

              {!isLoggedIn && (
                <p className="text-center mt-2" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  You must be logged in to RSVP
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
