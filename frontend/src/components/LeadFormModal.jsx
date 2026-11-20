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
    // Clear field-level error as user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Frontend validation strictly matching backend rules
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
      errors.email = 'Invalid email address format';
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
        errors.phone = 'Phone must contain only digits (7-15 characters)';
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

    // Run client-side validation first
    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    // Prepare payload
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
      // Capture and display backend field-wise errors on the form
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
          <h2>{leadToEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
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
              {/* Name */}
              <div className="form-group">
                <label htmlFor="name">
                  Name <span className="required">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className={`form-control ${fieldErrors.name ? 'input-error' : ''}`}
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  autoFocus
                />
                {fieldErrors.name && (
                  <span className="field-error-text">{fieldErrors.name}</span>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">
                  Email <span className="required">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className={`form-control ${fieldErrors.email ? 'input-error' : ''}`}
                  placeholder="e.g. john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {fieldErrors.email && (
                  <span className="field-error-text">{fieldErrors.email}</span>
                )}
              </div>

              {/* Phone & Company */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone (7-15 digits)</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    className={`form-control ${fieldErrors.phone ? 'input-error' : ''}`}
                    placeholder="e.g. 5550199123"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {fieldErrors.phone && (
                    <span className="field-error-text">{fieldErrors.phone}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <input
                    id="company"
                    type="text"
                    name="company"
                    className="form-control"
                    placeholder="e.g. Acme Corp"
                    value={formData.company}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Source & Status Dropdowns */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="source">Lead Source</label>
                  <select
                    id="source"
                    name="source"
                    className={`form-control ${fieldErrors.source ? 'input-error' : ''}`}
                    value={formData.source}
                    onChange={handleChange}
                  >
                    {SOURCE_OPTIONS.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.source && (
                    <span className="field-error-text">{fieldErrors.source}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="status">
                    Status <span className="required">*</span>
                  </label>
                  <select
                    id="status"
                    name="status"
                    className={`form-control ${fieldErrors.status ? 'input-error' : ''}`}
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.status && (
                    <span className="field-error-text">{fieldErrors.status}</span>
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
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting
                ? leadToEdit
                  ? 'Updating...'
                  : 'Saving...'
                : leadToEdit
                ? 'Update Lead'
                : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
