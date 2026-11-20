import React from 'react';

export default function DashboardStats({ stats, activeStatus, onSelectStatus }) {
  const cards = [
    {
      key: 'All',
      label: 'Total Leads',
      count: stats?.total ?? 0,
      colorClass: 'stat-total',
      dotColor: '#4f46e5',
    },
    {
      key: 'New',
      label: 'New',
      count: stats?.by_status?.New ?? stats?.new ?? 0,
      colorClass: 'stat-new',
      dotColor: '#1d4ed8',
    },
    {
      key: 'Contacted',
      label: 'Contacted',
      count: stats?.by_status?.Contacted ?? stats?.contacted ?? 0,
      colorClass: 'stat-contacted',
      dotColor: '#6d28d9',
    },
    {
      key: 'Qualified',
      label: 'Qualified',
      count: stats?.by_status?.Qualified ?? stats?.qualified ?? 0,
      colorClass: 'stat-qualified',
      dotColor: '#047857',
    },
    {
      key: 'Lost',
      label: 'Lost',
      count: stats?.by_status?.Lost ?? stats?.lost ?? 0,
      colorClass: 'stat-lost',
      dotColor: '#b91c1c',
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
            title={`Click to filter by ${card.label}`}
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
