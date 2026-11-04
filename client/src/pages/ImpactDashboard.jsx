import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { apiRequest } from '../api/client';
import { useToast } from '../context/ToastContext';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function ImpactDashboard() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [impactData, setImpactData] = useState({
    metrics: {
      totalVolunteers: 0,
      totalNGOs: 0,
      totalTasks: 0,
      totalHoursServed: 0
    },
    categoryData: [],
    cityData: []
  });
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    loadAllImpactData();
  }, []);

  const loadAllImpactData = async () => {
    setLoading(true);
    await Promise.all([fetchImpactStats(), fetchRankings()]);
    setLoading(false);
  };

  const fetchImpactStats = async () => {
    const res = await apiRequest('/dashboard/impact', 'GET');
    if (res.ok && res.data && res.data.success) {
      setImpactData(res.data);
    } else {
      showToast(res.data?.message || 'Failed to load impact metrics', 'error');
    }
  };

  const fetchRankings = async () => {
    const res = await apiRequest('/dashboard/rankings', 'GET');
    if (res.ok && res.data && res.data.success) {
      setRankings(res.data.rankings || []);
    }
  };

  const { metrics, categoryData, cityData } = impactData;

  // Prepare Doughnut Chart Data
  const doughnutData = {
    labels: categoryData.map((c) => c.category),
    datasets: [
      {
        data: categoryData.map((c) => c.count),
        backgroundColor: [
          '#2563eb', // Education - Blue
          '#ea580c', // Food distribution - Orange
          '#059669', // Environment - Emerald Green
          '#9333ea', // Elder support - Purple
          '#dc2626', // Disaster support - Crimson Red
          '#0d9488'  // Community service - Teal
        ],
        borderColor: '#ffffff',
        borderWidth: 3
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 14,
          font: { size: 13, weight: '600' },
          padding: 15
        }
      }
    }
  };

  // Prepare Bar Chart Data
  const barData = {
    labels: cityData.map((c) => c._id || 'Other'),
    datasets: [
      {
        label: 'Active Community Tasks',
        data: cityData.map((c) => c.count),
        backgroundColor: '#059669',
        borderColor: '#047857',
        borderWidth: 1.5,
        borderRadius: 6
      }
    ]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { size: 12, weight: '600' } }
      },
      x: {
        ticks: { font: { size: 12, weight: '600' } }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  const renderTierBadge = (points) => {
    if (points >= 80) {
      return (
        <span
          className="badge"
          style={{
            backgroundColor: '#fef08a',
            color: '#854d0e',
            border: '1.5px solid #eab308'
          }}
        >
          [GOLD CHAMPION]
        </span>
      );
    }
    if (points >= 40) {
      return (
        <span
          className="badge"
          style={{
            backgroundColor: '#e2e8f0',
            color: '#1e293b',
            border: '1.5px solid #cbd5e1'
          }}
        >
          [SILVER TIER]
        </span>
      );
    }
    return (
      <span
        className="badge"
        style={{
          backgroundColor: '#fef3c7',
          color: '#92400e',
          border: '1.5px solid #fde68a'
        }}
      >
        [BRONZE TIER]
      </span>
    );
  };

  return (
    <>
      <section className="page-banner">
        <div className="container">
          <span className="badge badge-primary" style={{ marginBottom: '0.6rem' }}>PLATFORM ANALYTICS</span>
          <h1>Community Impact & Volunteer Rankings</h1>
          <p style={{ marginBottom: 0, fontSize: '1.1rem' }}>
            Live metrics illustrating volunteer mobilization, category contributions, and top community contributors.
          </p>
        </div>
      </section>
      <main style={{ padding: '2.75rem 0', flex: 1 }}>
        <div className="container">
          <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
            <div className="stat-box">
              <div className="stat-label">Registered Volunteers</div>
              <div className="stat-value" style={{ color: 'var(--primary)' }}>
                {loading ? '...' : metrics.totalVolunteers || 0}
              </div>
              <div className="stat-meta">Active individuals</div>
            </div>
            <div className="stat-box stat-blue">
              <div className="stat-label">Partner NGOs</div>
              <div className="stat-value" style={{ color: 'var(--secondary)' }}>
                {loading ? '...' : metrics.totalNGOs || 0}
              </div>
              <div className="stat-meta">Grassroots organizations</div>
            </div>
            <div className="stat-box stat-amber">
              <div className="stat-label">Total Tasks Published</div>
              <div className="stat-value" style={{ color: 'var(--accent)' }}>
                {loading ? '...' : metrics.totalTasks || 0}
              </div>
              <div className="stat-meta">Community drives</div>
            </div>
            <div className="stat-box stat-purple">
              <div className="stat-label">Hours Served</div>
              <div className="stat-value" style={{ color: '#7e22ce' }}>
                {loading ? '...' : `${metrics.totalHoursServed || 0} Hrs`}
              </div>
              <div className="stat-meta">Verified volunteer hours</div>
            </div>
          </div>

          {/* Chart.js Visualizations Grid */}
          <div className="grid-2" style={{ marginBottom: '3rem' }}>
            {/* Category Doughnut Chart */}
            <div className="card">
              <h3>Task Distribution by Category</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>
                Allocation across all 6 social-service categories
              </p>
              <div style={{ height: '280px', position: 'relative' }}>
                {categoryData.length > 0 ? (
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                    {loading ? 'Loading category data...' : 'No task category data available.'}
                  </div>
                )}
              </div>
            </div>

            {/* City Distribution Chart */}
            <div className="card">
              <h3>Task Distribution by City</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>
                Community opportunities categorized by city
              </p>
              <div style={{ height: '280px', position: 'relative' }}>
                {cityData.length > 0 ? (
                  <Bar data={barData} options={barOptions} />
                ) : (
                  <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
                    {loading ? 'Loading city data...' : 'No city distribution data available.'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Volunteer Rankings Leaderboard */}
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <span className="badge badge-category" style={{ marginBottom: '0.3rem' }}>LEADERBOARD</span>
              <h2>Volunteer Ranking & Recognition</h2>
              <p>Recognizing top volunteers ranked by completed social-service activities and verified service hours.</p>
            </div>

            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Volunteer Name & City</th>
                    <th>Tasks Completed</th>
                    <th>Service Hours</th>
                    <th>Recognition Level & Points</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1.5rem' }}>
                        Loading volunteer leaderboard...
                      </td>
                    </tr>
                  ) : rankings.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1.5rem' }}>
                        No ranking records available yet.
                      </td>
                    </tr>
                  ) : (
                    rankings.map((vol, index) => (
                      <tr key={vol._id || index}>
                        <td>
                          <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>
                            #{index + 1}
                          </strong>
                        </td>
                        <td>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.98rem' }}>
                            {vol.fullName}
                          </strong>{' '}
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>({vol.city})</span>
                          <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {(vol.skills || []).map((s, idx) => (
                              <span key={idx} className="badge badge-skill" style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem' }}>
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>
                            {vol.completedTasksCount}
                          </span>{' '}
                          Completed
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                            {vol.totalHours}
                          </span>{' '}
                          Hours Logged
                        </td>
                        <td>
                          {renderTierBadge(vol.rankingPoints || 0)}{' '}
                          <span style={{ fontWeight: 800, color: 'var(--text-main)', marginLeft: '0.45rem' }}>
                            {vol.rankingPoints || 0} Pts
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
