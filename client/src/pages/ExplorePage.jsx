import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents } from '../services/api';

const CATEGORIES = ['All', 'Tech', 'Business', 'Music', 'Sports', 'Art', 'Food', 'Health', 'Education', 'Other'];

const FALLBACK_IMAGES = {
  Tech:      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop',
  Business:  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop',
  Music:     'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=600&auto=format&fit=crop',
  Sports:    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop',
  Art:       'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&auto=format&fit=crop',
  Food:      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop',
  Health:    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop',
  Education: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop',
  Other:     'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&auto=format&fit=crop',
};

function getBadgeClass(category) {
  return `category-badge badge-${category?.toLowerCase()}`;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  });
}

export default function ExplorePage() {
  const [events, setEvents]     = useState([]);
  const [filter, setFilter]     = useState('All');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const navigate                = useNavigate();

  useEffect(() => {
    fetchEvents(filter);
  }, [filter]);

  const fetchEvents = async (category) => {
    setLoading(true);
    setError('');
    try {
      const res = await getEvents(category);
      setEvents(res.data);
    } catch (err) {
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="ef-hero">
        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center">
            <div className="col-lg-7">
              <p className="mb-2" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                <span className="pulse-dot"></span>Live Events Near You
              </p>
              <h1>
                Discover <span className="gradient-text">Amazing Events</span><br />
                Around the World
              </h1>
              <p className="mt-3" style={{ color: 'var(--text-sub)', fontSize: '1.05rem', maxWidth: '480px' }}>
                Browse, RSVP, and connect with events that match your passion — from tech conferences to live music.
              </p>
            </div>
            <div className="col-lg-5 d-none d-lg-flex justify-content-end">
              <div style={{
                width: '260px', height: '260px',
                background: 'radial-gradient(circle, rgba(91,76,255,0.12) 0%, transparent 70%)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '6.5rem'
              }}>
                🎪
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <div className="ef-page">
        <div className="container">

          {/* Filter Buttons */}
          <div className="d-flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                id={`filter-${cat.toLowerCase()}`}
                className={`filter-btn ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Count */}
          {!loading && !error && (
            <p className="section-sub mb-4">
              Showing <strong style={{ color: 'var(--text-main)' }}>{events.length}</strong> event{events.length !== 1 ? 's' : ''}
              {filter !== 'All' ? ` in ${filter}` : ''}
            </p>
          )}

          {/* Loading */}
          {loading && <div className="ef-spinner"></div>}

          {/* Error */}
          {error && (
            <div className="ef-alert ef-alert-error mb-4">
              <i className="bi bi-exclamation-circle"></i>{error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && events.length === 0 && (
            <div className="empty-state">
              <i className="bi bi-calendar-x"></i>
              <h4 style={{ color: 'var(--text-main)' }}>No events found</h4>
              <p>Try a different category or create the first event!</p>
            </div>
          )}

          {/* Event Cards Grid */}
          {!loading && !error && events.length > 0 && (
            <div className="row g-4">
              {events.map((event) => {
                const spotsLeft = event.capacity - (event.attendees?.length || 0);
                const isFull = spotsLeft <= 0;
                const imgSrc = event.imageUrl || FALLBACK_IMAGES[event.category] || FALLBACK_IMAGES.Other;

                return (
                  <div key={event._id} className="col-12 col-sm-6 col-lg-4">
                    <div
                      className="event-card"
                      id={`event-card-${event._id}`}
                      onClick={() => navigate(`/events/${event._id}`)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(`/events/${event._id}`)}
                    >
                      {/* Image */}
                      <div className="card-img-wrapper">
                        <img
                          src={imgSrc}
                          alt={event.title}
                          className="card-img-top"
                          onError={(e) => { e.target.src = FALLBACK_IMAGES.Other; }}
                        />
                        {/* Overlay badge */}
                        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                          <span className={getBadgeClass(event.category)}>{event.category}</span>
                        </div>
                        {isFull && (
                          <div style={{
                            position: 'absolute', top: '12px', right: '12px',
                            background: 'rgba(255,101,132,0.9)', color: '#fff',
                            padding: '0.2rem 0.7rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600
                          }}>
                            FULL
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="card-body">
                        <h5 className="card-title">{event.title}</h5>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className="bi bi-calendar3" style={{ color: 'var(--primary)', fontSize: '0.85rem' }}></i>
                          <span className="card-text">{formatDate(event.date)}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-geo-alt" style={{ color: 'var(--secondary)', fontSize: '0.85rem' }}></i>
                          <span className="card-text">{event.location}</span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            <i className="bi bi-people me-1"></i>
                            {event.attendees?.length || 0} / {event.capacity}
                          </span>
                          <span style={{
                            color: isFull ? 'var(--secondary)' : 'var(--accent)',
                            fontSize: '0.8rem', fontWeight: 600
                          }}>
                            {isFull ? 'Fully Booked' : `${spotsLeft} spots left`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
