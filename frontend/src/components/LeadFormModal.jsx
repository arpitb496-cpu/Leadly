import React, { useState, useEffect } from 'react';

const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Lost'];
const SOURCE_OPTIONS = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Other'];

const EMAIL_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
const PHONE_REGEX = /^\d{7,15}$/;

export default function LeadFormModal({ isOpen, onClose, onSave, leadToEdit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website',
    status: 'New',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (leadToEdit) {
      setFormData({
        name: leadToEdit.name || '',
        email: leadToEdit.email || '',
        phone: leadToEdit.phone || '',
        company: leadToEdit.company || '',
        source: leadToEdit.source || 'Website',
        status: leadToEdit.status || 'New',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        source: 'Website',
        status: 'New',
      });
    }
    setFieldErrors({});
    setGeneralError('');
  }, [leadToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear inline error as the user modifies the field
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Frontend validation matching backend rules
  const validateForm = () => {
    const errors = {};

    // 1. Name: required
    if (!formData.name || !formData.name.trim()) {
      errors.name = 'Name is required';
    }

    // 2. Email: required, valid email format
    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!EMAIL_REGEX.test(formData.email.trim())) {
      errors.email = 'Invalid email address format (e.g. user@example.com)';
    }

    // 3. Status: required, must be from allowed list
    if (!formData.status || !formData.status.trim()) {
      errors.status = 'Status is required';
    } else if (!STATUS_OPTIONS.includes(formData.status.trim())) {
      errors.status = `Status must be one of: ${STATUS_OPTIONS.join(', ')}`;
    }

    // 4. Phone: digits only (7-15 chars) if provided
    if (formData.phone && formData.phone.trim()) {
      const phoneDigits = formData.phone.trim();
      if (!PHONE_REGEX.test(phoneDigits)) {
        errors.phone = 'Phone must contain only digits (7 to 15 numbers)';
      }
    }

    // 5. Source: must be from allowed list if provided
    if (formData.source && formData.source.trim()) {
      if (!SOURCE_OPTIONS.includes(formData.source.trim())) {
        errors.source = `Source must be one of: ${SOURCE_OPTIONS.join(', ')}`;
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    // Client-side validation check
    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    // Clean payload
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone ? formData.phone.trim() : null,
      company: formData.company ? formData.company.trim() : null,
      source: formData.source ? formData.source.trim() : null,
      status: formData.status ? formData.status.trim() : 'New',
    };

    try {
      setSubmitting(true);
      await onSave(payload, leadToEdit ? leadToEdit.id : null);
      onClose();
    } catch (err) {
      // Show backend error messages on the form
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setFieldErrors(err.fieldErrors);
      } else {
        setGeneralError(err.message || 'Failed to save lead. Please check the inputs.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <h2>{leadToEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
            <p className="modal-subtitle">
              {leadToEdit
                ? 'Update contact information and lead status.'
                : 'Enter prospect details to add them to your pipeline.'}
            </p>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
            disabled={submitting}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {generalError && (
              <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                <span>{generalError}</span>
              </div>
            )}

            <div className="form-grid">
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="lead-name">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  id="lead-name"
                  type="text"
                  name="name"
                  className={`form-control ${fieldErrors.name ? 'input-error' : ''}`}
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={submitting}
                  autoFocus
                />
                {fieldErrors.name && (
                  <span className="field-error-text">⚠ {fieldErrors.name}</span>
                )}
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label htmlFor="lead-email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  id="lead-email"
                  type="email"
                  name="email"
                  className={`form-control ${fieldErrors.email ? 'input-error' : ''}`}
                  placeholder="e.g. jane@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {fieldErrors.email && (
                  <span className="field-error-text">⚠ {fieldErrors.email}</span>
                )}
              </div>

              {/* Phone & Company */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="lead-phone">Phone Number</label>
                  <input
                    id="lead-phone"
                    type="tel"
                    name="phone"
                    className={`form-control ${fieldErrors.phone ? 'input-error' : ''}`}
                    placeholder="e.g. 5550199123"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  <span className="field-hint">7–15 digits only, no spaces/dashes</span>
                  {fieldErrors.phone && (
                    <span className="field-error-text">⚠ {fieldErrors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lead-company">Company</label>
                  <input
                    id="lead-company"
                    type="text"
                    name="company"
                    className="form-control"
                    placeholder="e.g. Acme Corp"
                    value={formData.company}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  <span className="field-hint">Optional business name</span>
                </div>
              </div>

              {/* Source & Status Dropdowns */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="lead-source">Lead Source</label>
                  <select
                    id="lead-source"
                    name="source"
                    className={`form-control ${fieldErrors.source ? 'input-error' : ''}`}
                    value={formData.source}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    {SOURCE_OPTIONS.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.source && (
                    <span className="field-error-text">⚠ {fieldErrors.source}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="lead-status">
                    Lead Status <span className="required">*</span>
                  </label>
                  <select
                    id="lead-status"
                    name="status"
                    className={`form-control ${fieldErrors.status ? 'input-error' : ''}`}
                    value={formData.status}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.status && (
                    <span className="field-error-text">⚠ {fieldErrors.status}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner" aria-hidden="true"></span>
                  <span>{leadToEdit ? 'Updating...' : 'Saving...'}</span>
                </>
              ) : (
                <span>{leadToEdit ? 'Update Lead' : 'Save Lead'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
