import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import { invitationConfig } from './invitationConfig.js';
import { FireworksEffect } from './FireworksEffect.jsx';
import './invitation.css';

/**
 * MeetingFormScene — shown after she says YES.
 * She picks a date, time, and place.
 * On submit, details are emailed via EmailJS and shown on screen.
 * The creator can also see a fallback copy-to-clipboard view.
 */
export function MeetingFormScene({ onConfirmed }) {
  const { meetingForm, emailjs: ejsCfg } = invitationConfig;

  const [date, setDate]       = useState('');
  const [time, setTime]       = useState('');
  const [place, setPlace]     = useState('');
  const [note, setNote]       = useState('');
  const [status, setStatus]   = useState('idle'); // idle | submitting | success | error
  const [showFW, setShowFW]   = useState(false);
  const [copied, setCopied]   = useState(false);
  const formRef = useRef(null);

  // ── Helpers ────────────────────────────────────────────────
  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (t) => {
    if (!t) return '';
    const [h, m] = t.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayH = hour % 12 || 12;
    return `${displayH}:${m} ${ampm}`;
  };

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !time || !place.trim()) return;

    setStatus('submitting');

    const templateParams = {
      meeting_date:  formatDate(date),
      meeting_time:  formatTime(time),
      meeting_place: place.trim(),
      note:          note.trim() || 'None',
      to_email:      ejsCfg.toEmail,
    };

    const isConfigured =
      ejsCfg.serviceId  !== 'YOUR_SERVICE_ID'  &&
      ejsCfg.templateId !== 'YOUR_TEMPLATE_ID' &&
      ejsCfg.publicKey  !== 'YOUR_PUBLIC_KEY';

    if (isConfigured) {
      try {
        await emailjs.send(
          ejsCfg.serviceId,
          ejsCfg.templateId,
          templateParams,
          { publicKey: ejsCfg.publicKey }
        );
      } catch (err) {
        console.warn('[EmailJS] Failed to send:', err);
        // Continue to success UI anyway — details are still visible
      }
    } else {
      console.info('[Invitation] EmailJS not configured. Showing details on screen.');
    }

    // Always show success + fireworks
    setShowFW(true);
    setTimeout(() => setStatus('success'), 400);
  };

  // ── Copy details to clipboard ─────────────────────────────
  const copyDetails = () => {
    const text =
      `📅 Date: ${formatDate(date)}\n` +
      `⏰ Time: ${formatTime(time)}\n` +
      `📍 Place: ${place}\n` +
      (note ? `📝 Note: ${note}` : '');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // ── Render: Success State ─────────────────────────────────
  if (status === 'success') {
    return (
      <>
        {showFW && <FireworksEffect onDone={() => setShowFW(false)} />}
        <div className="inv-scene inv-scene--form" aria-label="Meeting confirmed">
          <div className="inv-form-card inv-form-card--success inv-form-card--visible">
            <div className="inv-success-icon" aria-hidden="true">❤️</div>

            <h1 className="inv-form-heading inv-form-heading--success">
              {meetingForm.successHeading}
            </h1>
            <p className="inv-form-subheading">{meetingForm.successBody}</p>

            {/* Details summary */}
            <div className="inv-details-grid">
              <div className="inv-detail-row">
                <span className="inv-detail-icon" aria-hidden="true">📅</span>
                <div className="inv-detail-content">
                  <span className="inv-detail-label">Date</span>
                  <span className="inv-detail-value">{formatDate(date)}</span>
                </div>
              </div>
              <div className="inv-detail-row">
                <span className="inv-detail-icon" aria-hidden="true">⏰</span>
                <div className="inv-detail-content">
                  <span className="inv-detail-label">Time</span>
                  <span className="inv-detail-value">{formatTime(time)}</span>
                </div>
              </div>
              <div className="inv-detail-row">
                <span className="inv-detail-icon" aria-hidden="true">📍</span>
                <div className="inv-detail-content">
                  <span className="inv-detail-label">Place</span>
                  <span className="inv-detail-value">{place}</span>
                </div>
              </div>
              {note && (
                <div className="inv-detail-row">
                  <span className="inv-detail-icon" aria-hidden="true">📝</span>
                  <div className="inv-detail-content">
                    <span className="inv-detail-label">Note</span>
                    <span className="inv-detail-value">{note}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="inv-success-actions">
              <button
                className="inv-btn inv-btn--copy"
                onClick={copyDetails}
                aria-label="Copy meeting details"
              >
                {copied ? '✅ Copied!' : '📋 Copy details'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Render: Form State ────────────────────────────────────
  return (
    <div className="inv-scene inv-scene--form" aria-label="Meeting scheduler">
      <div className="inv-form-card inv-form-card--visible">
        <div className="inv-form-header">
          <div className="inv-form-emoji" aria-hidden="true">☕</div>
          <h1 className="inv-form-heading">{meetingForm.heading}</h1>
          <p className="inv-form-subheading">{meetingForm.subheading}</p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="inv-form" noValidate>

          {/* Date */}
          <div className="inv-field">
            <label className="inv-label" htmlFor="meeting-date">
              <span className="inv-label-icon" aria-hidden="true">📅</span>
              Date
            </label>
            <input
              id="meeting-date"
              type="date"
              className="inv-input"
              value={date}
              onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              aria-required="true"
            />
            {date && (
              <span className="inv-field-preview">{formatDate(date)}</span>
            )}
          </div>

          {/* Time */}
          <div className="inv-field">
            <label className="inv-label" htmlFor="meeting-time">
              <span className="inv-label-icon" aria-hidden="true">⏰</span>
              Time
            </label>
            <input
              id="meeting-time"
              type="time"
              className="inv-input"
              value={time}
              onChange={e => setTime(e.target.value)}
              required
              aria-required="true"
            />
            {time && (
              <span className="inv-field-preview">{formatTime(time)}</span>
            )}
          </div>

          {/* Place */}
          <div className="inv-field">
            <label className="inv-label" htmlFor="meeting-place">
              <span className="inv-label-icon" aria-hidden="true">📍</span>
              Place
            </label>
            <input
              id="meeting-place"
              type="text"
              className="inv-input"
              placeholder={meetingForm.placePlaceholder}
              value={place}
              onChange={e => setPlace(e.target.value)}
              maxLength={100}
              required
              aria-required="true"
            />
          </div>

          {/* Optional note */}
          <div className="inv-field">
            <label className="inv-label" htmlFor="meeting-note">
              <span className="inv-label-icon" aria-hidden="true">📝</span>
              Note
              <span className="inv-label-optional">(optional)</span>
            </label>
            <textarea
              id="meeting-note"
              className="inv-input inv-textarea"
              placeholder={meetingForm.notePlaceholder}
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={2}
              maxLength={300}
            />
          </div>

          <button
            type="submit"
            className="inv-btn inv-btn--yes inv-btn--submit"
            disabled={!date || !time || !place.trim() || status === 'submitting'}
            aria-label={status === 'submitting' ? meetingForm.submittingLabel : meetingForm.submitLabel}
          >
            <span className="inv-btn-ripple" aria-hidden="true" />
            {status === 'submitting' ? (
              <span className="inv-spinner" aria-hidden="true" />
            ) : null}
            {status === 'submitting' ? meetingForm.submittingLabel : meetingForm.submitLabel}
          </button>

        </form>
      </div>
    </div>
  );
}
