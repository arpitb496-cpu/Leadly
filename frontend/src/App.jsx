import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import LeadList from './components/LeadList';
import LeadFormModal from './components/LeadFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { api } from './services/api';
import './App.css';

export default function App() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    qualified: 0,
    lost: 0,
    by_status: { New: 0, Contacted: 0, Qualified: 0, Lost: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isApiDown, setIsApiDown] = useState(false);

  // Search and status filter (both call API)
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states for Create/Edit and Delete Confirmation
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search input (300ms) before querying API
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch status counts via GET /api/leads/stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await api.getLeadStats();
      if (statsData) {
        setStats(statsData);
      }
    } catch (err) {
      // Handled silently or consolidated with main error
    }
  }, []);

  // Fetch leads from backend API: GET /api/leads
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setIsApiDown(false);

      const [leadsData] = await Promise.all([
        api.getLeads({
          status: statusFilter,
          search: debouncedSearch,
          page,
          per_page: perPage,
          sort: sortBy,
          order: sortOrder,
        }),
        fetchStats(),
      ]);

      if (leadsData && Array.isArray(leadsData.leads)) {
        setLeads(leadsData.leads);
        setTotalItems(leadsData.total);
        setTotalPages(leadsData.total_pages);
      } else if (Array.isArray(leadsData)) {
        setLeads(leadsData);
        setTotalItems(leadsData.length);
        setTotalPages(1);
      }
    } catch (err) {
      const isDown =
        err.isApiDown ||
        err.message?.toLowerCase().includes('connect') ||
        err.message?.toLowerCase().includes('fetch');
      setIsApiDown(isDown);
      setError(
        isDown
          ? 'Cannot connect to the Flask API. Make sure the backend server is running on http://localhost:5001.'
          : err.message || 'Failed to load leads from server.'
      );
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, page, perPage, sortBy, sortOrder, fetchStats]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Search and status filter handlers
  const handleSearchChange = (val) => {
    setSearchQuery(val);
  };

  const handleStatusFilterChange = (val) => {
    setStatusFilter(val);
    setPage(1);
  };

  // Click on a dashboard card to toggle filter by that status
  const handleSelectStatCard = (statusKey) => {
    if (statusKey === 'All' || statusFilter === statusKey) {
      setStatusFilter('All');
    } else {
      setStatusFilter(statusKey);
    }
    setPage(1);
  };

  const handleSortChange = (newSort, newOrder) => {
    setSortBy(newSort);
    setSortOrder(newOrder);
  };

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  // Open modal for creating new lead
  const handleOpenCreateModal = () => {
    setEditingLead(null);
    setIsFormModalOpen(true);
  };

  // Open modal for editing an existing lead
  const handleOpenEditModal = (lead) => {
    setEditingLead(lead);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingLead(null);
  };

  // Handle Save (Create or Update)
  const handleSaveLead = async (formData, leadId) => {
    if (leadId) {
      // Update existing lead via PUT /api/leads/<id>
      await api.updateLead(leadId, formData);
      setSuccessMessage('Lead updated successfully!');
    } else {
      // Create new lead via POST /api/leads
      await api.createLead(formData);
      setSuccessMessage('Lead created successfully!');
    }
    await fetchLeads();
    setTimeout(() => setSuccessMessage(''), 3500);
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (lead) => {
    setLeadToDelete(lead);
  };

  const handleCloseDeleteModal = () => {
    setLeadToDelete(null);
    setIsDeleting(false);
  };

  // Confirm delete via DELETE /api/leads/<id>
  const handleConfirmDelete = async () => {
    if (!leadToDelete) return;
    try {
      setIsDeleting(true);
      await api.deleteLead(leadToDelete.id);
      setSuccessMessage(`Lead "${leadToDelete.name}" deleted successfully.`);
      handleCloseDeleteModal();
      await fetchLeads();
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      setError(err.message || 'Failed to delete lead.');
      handleCloseDeleteModal();
    }
  };

  // Quick status update dropdown directly from table
  const handleQuickStatusChange = async (leadId, newStatus) => {
    try {
      await api.updateLead(leadId, { status: newStatus });
      await fetchLeads();
    } catch (err) {
      setError(err.message || 'Failed to update lead status.');
    }
  };

  return (
    <div className="app-container">
      <Navbar onOpenCreateModal={handleOpenCreateModal} />

      <main className="main-content">
        {/* Small Dashboard Cards (showing counts from GET /api/leads/stats) */}
        <DashboardStats
          stats={stats}
          activeStatus={statusFilter}
          onSelectStatus={handleSelectStatCard}
        />

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="alert alert-success">
            <span>✓ {successMessage}</span>
            <button className="alert-close" onClick={() => setSuccessMessage('')}>
              &times;
            </button>
          </div>
        )}

        {/* Global Error Banner */}
        {error && !isApiDown && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button className="alert-close" onClick={() => setError('')}>
              &times;
            </button>
          </div>
        )}

        {/* Main View Area: Loading State, Error State, or Leads Table */}
        {loading && leads.length === 0 ? (
          <div className="state-card loading-card">
            <div className="spinner"></div>
            <h3>Loading leads...</h3>
            <p>Connecting to backend API at <code>http://localhost:5001/api</code></p>
          </div>
        ) : isApiDown ? (
          <div className="state-card error-card">
            <div className="state-card-icon">⚡</div>
            <h3>API Connection Unavailable</h3>
            <p>{error}</p>
            <div className="state-card-code">
              <span>Start the Flask backend server:</span>
              <code>cd backend &amp;&amp; python app.py</code>
            </div>
            <button className="btn btn-primary" onClick={fetchLeads} style={{ marginTop: '0.75rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Retry Connection
            </button>
          </div>
        ) : (
          <LeadList
            leads={leads}
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            page={page}
            totalPages={totalPages}
            totalItems={totalItems}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={handlePerPageChange}
            onEditLead={handleOpenEditModal}
            onDeleteLead={handleOpenDeleteModal}
            onQuickStatusChange={handleQuickStatusChange}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Lead Manager &bull; Flask + SQLite &amp; React (Vite)</p>
      </footer>

      {/* Add / Edit Lead Form Modal */}
      <LeadFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSaveLead}
        leadToEdit={editingLead}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(leadToDelete)}
        lead={leadToDelete}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
