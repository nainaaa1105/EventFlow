import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Tech', 'Business', 'Music', 'Sports', 'Art', 'Food', 'Health', 'Education', 'Other'];

const initialForm = {
  title: '',
  category: '',
  location: '',
  date: '',
  description: '',
  capacity: '',
  imageUrl: '',
};

export default function CreateEventPage() {
  const [form, setForm]       = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const { user }              = useAuth();
  const navigate              = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!form.title || !form.category || !form.location || !form.date || !form.description || !form.capacity) {
      setError('Please fill in all required fields.');
      return;
    }
    if (Number(form.capacity) < 1) {
      setError('Capacity must be at least 1.');
      return;
    }

    setLoading(true);
    try {
      const res = await createEvent(form);
      setSuccess('Event created successfully! Redirecting...');
      setTimeout(() => navigate(`/events/${res.data.event._id}`), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ef-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">

            {/* Header */}
            <div className="mb-4">
              <h1 className="section-title">
                <i className="bi bi-plus-circle me-2" style={{ color: 'var(--primary)' }}></i>
                Create New Event
              </h1>
              <p className="section-sub">
                Fill in the details below to publish your event on EventFlow.
                {user && (
                  <span style={{ color: 'var(--primary-light)' }}>
                    {' '}Organizer: <strong>{user.name}</strong>
                  </span>
                )}
              </p>
            </div>

            <div className="ef-form-card">
              {/* Alerts */}
              {error   && <div className="ef-alert ef-alert-error   mb-4"><i className="bi bi-exclamation-circle"></i>{error}</div>}
              {success && <div className="ef-alert ef-alert-success mb-4"><i className="bi bi-check-circle"></i>{success}</div>}

              <form onSubmit={handleSubmit} noValidate>
                <div className="row g-3">

                  {/* Event Name */}
                  <div className="col-12">
                    <label className="ef-label">Event Name <span style={{ color:'var(--secondary)' }}>*</span></label>
                    <input
                      id="input-title"
                      type="text"
                      name="title"
                      className="form-control ef-form-control"
                      placeholder="e.g. AI Summit 2025"
                      value={form.title}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Category + Location */}
                  <div className="col-md-6">
                    <label className="ef-label">Category <span style={{ color:'var(--secondary)' }}>*</span></label>
                    <select
                      id="input-category"
                      name="category"
                      className="form-control ef-form-control"
                      value={form.category}
                      onChange={handleChange}
                    >
                      <option value="">— Select category —</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="ef-label">Location <span style={{ color:'var(--secondary)' }}>*</span></label>
                    <input
                      id="input-location"
                      type="text"
                      name="location"
                      className="form-control ef-form-control"
                      placeholder="e.g. New York, NY"
                      value={form.location}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Date + Capacity */}
                  <div className="col-md-6">
                    <label className="ef-label">Date & Time <span style={{ color:'var(--secondary)' }}>*</span></label>
                    <input
                      id="input-date"
                      type="datetime-local"
                      name="date"
                      className="form-control ef-form-control"
                      value={form.date}
                      onChange={handleChange}
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="ef-label">Max Capacity <span style={{ color:'var(--secondary)' }}>*</span></label>
                    <input
                      id="input-capacity"
                      type="number"
                      name="capacity"
                      className="form-control ef-form-control"
                      placeholder="e.g. 200"
                      min={1}
                      value={form.capacity}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Description */}
                  <div className="col-12">
                    <label className="ef-label">Description <span style={{ color:'var(--secondary)' }}>*</span></label>
                    <textarea
                      id="input-description"
                      name="description"
                      className="form-control ef-form-control"
                      placeholder="Describe your event in detail..."
                      rows={5}
                      value={form.description}
                      onChange={handleChange}
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  {/* Image URL */}
                  <div className="col-12">
                    <label className="ef-label">
                      Image URL <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(optional)</span>
                    </label>
                    <input
                      id="input-imageUrl"
                      type="url"
                      name="imageUrl"
                      className="form-control ef-form-control"
                      placeholder="https://example.com/event-image.jpg"
                      value={form.imageUrl}
                      onChange={handleChange}
                    />
                    {form.imageUrl && (
                      <div className="mt-2">
                        <img
                          src={form.imageUrl}
                          alt="Preview"
                          style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="col-12 mt-2">
                    <div className="d-flex gap-3">
                      <button
                        id="btn-create-event"
                        type="submit"
                        className="btn-primary-ef"
                        disabled={loading}
                        style={{ flex: 1 }}
                      >
                        {loading ? (
                          <><span className="spinner-border spinner-border-sm me-2"></span>Creating Event...</>
                        ) : (
                          <><i className="bi bi-rocket-takeoff me-2"></i>Publish Event</>
                        )}
                      </button>
                      <button
                        type="button"
                        className="btn-outline-ef"
                        onClick={() => navigate('/')}
                        id="btn-cancel-create"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
