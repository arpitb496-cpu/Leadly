import React from 'react';

export default function DeleteConfirmModal({
  isOpen,
  lead,
  onClose,
  onConfirm,
  isDeleting,
}) {
  if (!isOpen || !lead) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content delete-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="delete-modal-body">
          <div className="delete-warning-icon">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>

          <h3>Delete Lead</h3>
          <p>
            Are you sure you want to delete <strong>{lead.name}</strong>?
            {lead.email && <span className="delete-lead-sub"> ({lead.email})</span>}
          </p>
          <p className="delete-warning-sub">This action cannot be undone.</p>
        </div>

        <div className="modal-footer delete-modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Lead'}
          </button>
        </div>
      </div>
    </div>
  );
}
