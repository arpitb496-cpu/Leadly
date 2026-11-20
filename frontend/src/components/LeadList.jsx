import React from 'react';

const STATUS_LIST = ['New', 'Contacted', 'Qualified', 'Lost'];

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
              {leads.map((lead) => (
                <tr key={lead.id}>
                  {/* Name */}
                  <td>
                    <span className="lead-name">{lead.name}</span>
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

                      {/* Dropdown to quickly update status directly from table */}
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

                  {/* Actions: Edit & Delete */}
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onEditLead(lead)}
                        title="Edit lead details and status"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onDeleteLead(lead)}
                        title="Delete lead"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
