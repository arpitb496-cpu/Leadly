import React from 'react';

const STATUS_LIST = ['New', 'Contacted', 'Qualified', 'Lost'];

// Helper to compute lead initials (e.g., "John Doe" -> "JD", "Sarah" -> "SA")
const getInitials = (name) => {
  if (!name) return '?';
  const clean = name.trim();
  if (!clean) return '?';
  const parts = clean.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Deterministic pastel avatar background color based on name string
const getAvatarColor = (name = '') => {
  const colors = [
    { bg: '#e0e7ff', text: '#3730a3' }, // Indigo
    { bg: '#e0f2fe', text: '#0369a1' }, // Sky
    { bg: '#f3e8ff', text: '#6b21a8' }, // Purple
    { bg: '#dcfce7', text: '#15803d' }, // Emerald
    { bg: '#fef3c7', text: '#b45309' }, // Amber
    { bg: '#fee2e2', text: '#b91c1c' }, // Rose
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function LeadList({
  leads,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  sortOrder,
  onSortChange,
  page,
  totalPages,
  totalItems,
  perPage,
  onPageChange,
  onPerPageChange,
  onEditLead,
  onDeleteLead,
  onQuickStatusChange,
}) {
  const handleHeaderClick = (field) => {
    if (sortBy === field) {
      onSortChange(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(field, 'asc');
    }
  };

  const renderSortIndicator = (field) => {
    if (sortBy !== field) return <span className="sort-indicator neutral">⇅</span>;
    return <span className="sort-indicator active">{sortOrder === 'asc' ? '▲' : '▼'}</span>;
  };

  // Helper for pagination range
  const startItem = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, totalItems);

  // Generate page numbers for pagination buttons
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div>
      {/* Search by Name & Status Filter Bar */}
      <div className="controls-bar">
        <div className="filter-group">
          {/* Search Box (by name) */}
          <div className="search-input-wrapper">
            <svg
              className="search-icon"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="search-input"
              placeholder="Search leads by name..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search leads by name"
            />
            {searchQuery && (
              <button
                className="search-clear-btn"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <select
            className="status-select"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            {STATUS_LIST.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Rows Per Page */}
        <div className="pagination-per-page">
          <label htmlFor="per-page-select" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Rows per page:
          </label>
          <select
            id="per-page-select"
            className="status-select"
            style={{ padding: '0.4rem 0.6rem' }}
            value={perPage}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      {leads.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No leads found</h3>
          <p>
            {searchQuery || statusFilter !== 'All'
              ? 'No leads match your current search or filter criteria.'
              : 'Get started by adding your first lead to the system.'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th onClick={() => handleHeaderClick('name')} className="sortable-th">
                  Name {renderSortIndicator('name')}
                </th>
                <th onClick={() => handleHeaderClick('email')} className="sortable-th">
                  Email {renderSortIndicator('email')}
                </th>
                <th>Phone</th>
                <th onClick={() => handleHeaderClick('company')} className="sortable-th">
                  Company {renderSortIndicator('company')}
                </th>
                <th onClick={() => handleHeaderClick('source')} className="sortable-th">
                  Source {renderSortIndicator('source')}
                </th>
                <th onClick={() => handleHeaderClick('status')} className="sortable-th">
                  Status {renderSortIndicator('status')}
                </th>
                <th onClick={() => handleHeaderClick('created_at')} className="sortable-th">
                  Created {renderSortIndicator('created_at')}
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const avatar = getAvatarColor(lead.name);
                return (
                  <tr key={lead.id}>
                    {/* Name with Avatar Initials */}
                    <td>
                      <div className="lead-name-cell">
                        <div
                          className="lead-avatar"
                          style={{ backgroundColor: avatar.bg, color: avatar.text }}
                          aria-hidden="true"
                        >
                          {getInitials(lead.name)}
                        </div>
                        <span className="lead-name">{lead.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td>
                      <span className="lead-email">{lead.email}</span>
                    </td>

                    {/* Phone */}
                    <td>
                      <span className="lead-phone">{lead.phone || '-'}</span>
                    </td>

                    {/* Company */}
                    <td>
                      <span>{lead.company || '-'}</span>
                    </td>

                    {/* Source */}
                    <td>
                      <span className="lead-source-tag">{lead.source || '-'}</span>
                    </td>

                    {/* Status Coloured Badge with Quick Changer */}
                    <td>
                      <div className="status-badge-wrapper">
                        <span className={`status-badge status-${lead.status}`} title={`Status: ${lead.status}`}>
                          <span className="status-dot"></span>
                          {lead.status}
                        </span>

                        {/* Inline quick change dropdown */}
                        <select
                          className="status-quick-select"
                          value={lead.status}
                          onChange={(e) => onQuickStatusChange(lead.id, e.target.value)}
                          title="Change status"
                        >
                          {STATUS_LIST.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Created Date */}
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : '-'}
                    </td>

                    {/* Actions: Clean Edit & Delete Buttons with Icons */}
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-action btn-action-edit"
                          onClick={() => onEditLead(lead)}
                          title="Edit lead details and status"
                          aria-label={`Edit ${lead.name}`}
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-action-delete"
                          onClick={() => onDeleteLead(lead)}
                          title="Delete lead"
                          aria-label={`Delete ${lead.name}`}
                        >
                          <svg
                            width="14"
                            height="14"
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
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Full Pagination Controls */}
          <div className="pagination-bar">
            <span className="pagination-info">
              Showing <strong>{startItem}</strong> – <strong>{endItem}</strong> of <strong>{totalItems}</strong> leads (Page {page} of {totalPages || 1})
            </span>

            <div className="pagination-actions">
              {/* First Page */}
              <button
                className="btn btn-secondary btn-sm pagination-btn"
                disabled={page <= 1}
                onClick={() => onPageChange(1)}
                title="First Page"
              >
                «
              </button>

              {/* Previous Page */}
              <button
                className="btn btn-secondary btn-sm pagination-btn"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                title="Previous Page"
              >
                ‹ Prev
              </button>

              {/* Numbered Page Buttons */}
              <div className="pagination-numbers">
                {getPageNumbers().map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`pagination-num-btn ${num === page ? 'active' : ''}`}
                    onClick={() => onPageChange(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Next Page */}
              <button
                className="btn btn-secondary btn-sm pagination-btn"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                title="Next Page"
              >
                Next ›
              </button>

              {/* Last Page */}
              <button
                className="btn btn-secondary btn-sm pagination-btn"
                disabled={page >= totalPages}
                onClick={() => onPageChange(totalPages)}
                title="Last Page"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
