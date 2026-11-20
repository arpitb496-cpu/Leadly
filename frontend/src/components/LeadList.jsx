import React from 'react';

const STATUS_LIST = ['New', 'Contacted', 'Qualified', 'Lost'];

// Helper to compute initials
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

// Deterministic neutral monochrome avatar based on name (NexBank style)
const getAvatarColor = (name = '') => {
  const colors = [
    { bg: '#f4f4f5', text: '#18181b', border: '#e4e4e7' },
    { bg: '#e4e4e7', text: '#09090b', border: '#d4d4d8' },
    { bg: '#18181b', text: '#ffffff', border: '#18181b' },
    { bg: '#f4f4f5', text: '#27272a', border: '#e4e4e7' },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

// Skeleton loading rows for table
function SkeletonRows({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={`skeleton-${i}`} className="skeleton-row">
          <td>
            <div className="lead-name-cell">
              <div className="skeleton skeleton-avatar"></div>
              <div className="skeleton skeleton-text" style={{ width: '110px' }}></div>
            </div>
          </td>
          <td><div className="skeleton skeleton-text" style={{ width: '140px' }}></div></td>
          <td><div className="skeleton skeleton-text" style={{ width: '90px' }}></div></td>
          <td><div className="skeleton skeleton-text" style={{ width: '80px' }}></div></td>
          <td><div className="skeleton skeleton-pill" style={{ width: '65px' }}></div></td>
          <td><div className="skeleton skeleton-pill" style={{ width: '85px' }}></div></td>
          <td><div className="skeleton skeleton-text" style={{ width: '70px' }}></div></td>
          <td>
            <div className="action-buttons">
              <div className="skeleton skeleton-btn"></div>
              <div className="skeleton skeleton-btn"></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

export default function LeadList({
  leads,
  loading,
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
  onOpenCreateModal,
  onClearFilters,
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

  const startItem = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, totalItems);

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

  const hasActiveFilters = Boolean(searchQuery.trim() || statusFilter !== 'All');

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
                type="button"
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

          {/* Clear Filters Button if filters active */}
          {hasActiveFilters && onClearFilters && (
            <button
              type="button"
              className="btn btn-secondary btn-sm clear-filters-btn"
              onClick={onClearFilters}
              title="Reset search and status filter"
            >
              Clear filters
            </button>
          )}
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

      {/* Table & Empty State */}
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
            {loading ? (
              <SkeletonRows rows={perPage > 5 ? 5 : perPage} />
            ) : leads.length === 0 ? null : (
              leads.map((lead) => {
                const avatar = getAvatarColor(lead.name);
                return (
                  <tr key={lead.id}>
                    {/* Name with Avatar Initials */}
                    <td>
                      <div className="lead-name-cell">
                        <div
                          className="lead-avatar"
                          style={{ backgroundColor: avatar.bg, color: avatar.text, borderColor: avatar.border }}
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

                        <select
                          className="status-quick-select"
                          value={lead.status}
                          onChange={(e) => onQuickStatusChange(lead.id, e.target.value)}
                          title="Quick change status"
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

                    {/* Actions: Edit & Delete (Icon-only with tooltips) */}
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn-action btn-action-edit"
                          onClick={() => onEditLead(lead)}
                          title="Edit lead"
                          aria-label={`Edit ${lead.name}`}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="btn-action btn-action-delete"
                          onClick={() => onDeleteLead(lead)}
                          title="Delete lead"
                          aria-label={`Delete ${lead.name}`}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Empty State when not loading and leads array is empty */}
        {!loading && leads.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">
              {hasActiveFilters ? (
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  <line x1="8" y1="11" x2="14" y2="11"></line>
                </svg>
              ) : (
                <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              )}
            </div>

            <h3>{hasActiveFilters ? 'No matching leads found' : 'No leads in your pipeline yet'}</h3>
            <p>
              {hasActiveFilters
                ? 'Try adjusting your search query or status filter to see other leads.'
                : 'Start tracking contacts, opportunities, and deals by adding your first lead.'}
            </p>

            <div className="empty-state-actions">
              {hasActiveFilters ? (
                <button type="button" className="btn btn-secondary" onClick={onClearFilters}>
                  Clear filters
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={onOpenCreateModal}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add your first lead
                </button>
              )}
            </div>
          </div>
        )}

        {/* Full Pagination Controls */}
        {!loading && leads.length > 0 && (
          <div className="pagination-bar">
            <span className="pagination-info">
              Showing <strong>{startItem}</strong> – <strong>{endItem}</strong> of <strong>{totalItems}</strong> leads (Page {page} of {totalPages || 1})
            </span>

            <div className="pagination-actions">
              <button
                className="btn btn-secondary btn-sm pagination-btn"
                disabled={page <= 1}
                onClick={() => onPageChange(1)}
                title="First Page"
              >
                «
              </button>
              <button
                className="btn btn-secondary btn-sm pagination-btn"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                title="Previous Page"
              >
                ‹ Prev
              </button>

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

              <button
                className="btn btn-secondary btn-sm pagination-btn"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                title="Next Page"
              >
                Next ›
              </button>
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
        )}
      </div>
    </div>
  );
}
