import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardStats from './components/DashboardStats';
import LeadList from './components/LeadList';
import LeadFormModal from './components/LeadFormModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import ToastContainer from './components/Toast';
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
  const [isApiDown, setIsApiDown] = useState(false);

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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
    } catch {
      // Handled silently
    }
  }, []);

  // Fetch leads from backend API: GET /api/leads
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
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
      const errMsg = isDown
        ? 'Cannot connect to the Flask API. Make sure the backend server is running on http://localhost:5001.'
        : err.message || 'Failed to load leads from server.';
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, page, perPage, sortBy, sortOrder, fetchStats, addToast]);

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

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
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
      const updated = await api.updateLead(leadId, formData);
      addToast(`Lead "${updated.name || formData.name}" updated successfully!`, 'success');
    } else {
      const created = await api.createLead(formData);
      addToast(`Lead "${created.name || formData.name}" added successfully!`, 'success');
    }
    await fetchLeads();
  };

  // Open styled delete confirmation modal
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
      addToast(`Lead "${leadToDelete.name}" deleted successfully.`, 'success');
      handleCloseDeleteModal();
      await fetchLeads();
    } catch (err) {
      addToast(err.message || 'Failed to delete lead.', 'error');
      handleCloseDeleteModal();
    }
  };

  // Quick status update dropdown directly from table
  const handleQuickStatusChange = async (leadId, newStatus) => {
    try {
      await api.updateLead(leadId, { status: newStatus });
      addToast(`Status updated to "${newStatus}".`, 'success');
      await fetchLeads();
    } catch (err) {
      addToast(err.message || 'Failed to update lead status.', 'error');
    }
  };

  return (
    <div className="app-container">
      <Navbar onOpenCreateModal={handleOpenCreateModal} />

      {/* Floating Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <main className="main-content">
        {/* Small Dashboard Cards (showing counts from GET /api/leads/stats) */}
        <DashboardStats
          stats={stats}
          activeStatus={statusFilter}
          onSelectStatus={handleSelectStatCard}
        />

        {/* API Down State */}
        {isApiDown ? (
          <div className="state-card error-card">
            <div className="state-card-icon">⚡</div>
            <h3>API Connection Unavailable</h3>
            <p>Cannot connect to the Flask API. Make sure the backend server is running on http://localhost:5001.</p>
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
            loading={loading}
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
            onOpenCreateModal={handleOpenCreateModal}
            onClearFilters={handleClearFilters}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Leadly &bull; Flask + SQLite &amp; React (Vite)</p>
      </footer>

      {/* Add / Edit Lead Form Modal */}
      <LeadFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSave={handleSaveLead}
        leadToEdit={editingLead}
      />

      {/* Styled Delete Confirmation Modal */}
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
