import React from 'react';

export default function DashboardStats({ stats, activeStatus, onSelectStatus }) {
  const cards = [
    {
      key: 'All',
      label: 'Total Leads',
      count: stats?.total ?? 0,
      colorClass: 'stat-total',
      dotColor: '#000000',
    },
    {
      key: 'New',
      label: 'New',
      count: stats?.by_status?.New ?? stats?.new ?? 0,
      colorClass: 'stat-new',
      dotColor: '#2563eb', // Blue
    },
    {
      key: 'Contacted',
      label: 'Contacted',
      count: stats?.by_status?.Contacted ?? stats?.contacted ?? 0,
      colorClass: 'stat-contacted',
      dotColor: '#f97316', // Orange
    },
    {
      key: 'Qualified',
      label: 'Qualified',
      count: stats?.by_status?.Qualified ?? stats?.qualified ?? 0,
      colorClass: 'stat-qualified',
      dotColor: '#16a34a', // Green
    },
    {
      key: 'Lost',
      label: 'Lost',
      count: stats?.by_status?.Lost ?? stats?.lost ?? 0,
      colorClass: 'stat-lost',
      dotColor: '#dc2626', // Red
    },
  ];

  return (
    <div className="dashboard-stats-grid">
      {cards.map((card) => {
        const isSelected = activeStatus === card.key;
        return (
          <button
            key={card.key}
            type="button"
            className={`dashboard-stat-card ${card.colorClass} ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelectStatus(card.key)}
            title={`Filter by ${card.label}`}
          >
            <div className="stat-card-header">
              <span className="stat-dot-indicator" style={{ backgroundColor: card.dotColor }} />
              <span className="stat-card-label">{card.label}</span>
            </div>
            <div className="stat-card-value">{card.count}</div>
          </button>
        );
      })}
    </div>
  );
}
