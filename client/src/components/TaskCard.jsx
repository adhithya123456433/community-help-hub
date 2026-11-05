import React from 'react';
import { Link } from 'react-router-dom';

export function getCategoryBadgeClass(category) {
  switch (category) {
    case 'Education':
      return 'badge-cat-education';
    case 'Food distribution':
      return 'badge-cat-food';
    case 'Environment':
      return 'badge-cat-environment';
    case 'Elder support':
      return 'badge-cat-elder';
    case 'Disaster support':
      return 'badge-cat-disaster';
    case 'Community service':
      return 'badge-cat-community';
    default:
      return 'badge-category';
  }
}

export function getCategoryAccentColor(category) {
  switch (category) {
    case 'Education':
      return '#2563eb';
    case 'Food distribution':
      return '#ea580c';
    case 'Environment':
      return '#059669';
    case 'Elder support':
      return '#9333ea';
    case 'Disaster support':
      return '#dc2626';
    case 'Community service':
      return '#0d9488';
    default:
      return '#047857';
  }
}

export default function TaskCard({ task, onApply, appliedApp }) {
  const ngoName = task.createdBy && task.createdBy.orgName ? task.createdBy.orgName : 'Community Partner';
  const catBadgeClass = getCategoryBadgeClass(task.category);
  const accentColor = getCategoryAccentColor(task.category);

  let statusBadgeClass = 'badge-open';
  if (task.status === 'In Progress') statusBadgeClass = 'badge-assigned';
  if (task.status === 'Completed') statusBadgeClass = 'badge-completed';
  if (task.status === 'Cancelled') statusBadgeClass = 'badge-danger';

  const isQuotaFull = (task.volunteersAssigned || 0) >= task.volunteersRequired;

  const formattedDate = new Date(task.dateTime).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  let matchBadge = null;
  if (typeof task.isLocalMatch !== 'undefined') {
    if (task.isLocalMatch) {
      matchBadge = (
        <span
          className="badge"
          style={{
            marginBottom: '0.5rem',
            backgroundColor: '#059669',
            color: '#ffffff',
            border: 'none',
            fontWeight: 800
          }}
        >
          [LOCAL MATCH: {task.city ? task.city.toUpperCase() : ''}]
        </span>
      );
    } else {
      matchBadge = (
        <span
          className="badge"
          style={{
            marginBottom: '0.5rem',
            backgroundColor: '#475569',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700
          }}
        >
          [OTHER CITY: {task.city ? task.city.toUpperCase() : ''}]
        </span>
      );
    }
  } else if (typeof task.matchScore !== 'undefined') {
    matchBadge = (
      <span
        className="badge"
        style={{ marginBottom: '0.5rem', backgroundColor: '#059669', color: '#ffffff', border: 'none', fontWeight: 800 }}
      >
        [{task.matchScore}% SKILL MATCH]
      </span>
    );
  } else if (typeof task.recommendationScore !== 'undefined') {
    matchBadge = (
      <span
        className="badge"
        style={{ marginBottom: '0.5rem', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', fontWeight: 800 }}
      >
        [RECOMMENDED: {task.recommendationScore} PTS]
      </span>
    );
  }

  const isApplied = !!appliedApp;

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderTop: `4.5px solid ${accentColor}`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '0.65rem',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span className={`badge ${catBadgeClass}`}>{task.category}</span>
            {task.urgency === 'Urgent' && (
              <span className="badge badge-danger" style={{ fontWeight: 800 }}>
                [URGENT]
              </span>
            )}
            {task.urgency === 'High Priority' && (
              <span className="badge" style={{ backgroundColor: '#ea580c', color: '#ffffff', border: 'none', fontWeight: 800 }}>
                [HIGH PRIORITY]
              </span>
            )}
          </div>
          <span className={`badge ${statusBadgeClass}`}>[{task.status.toUpperCase()}]</span>
        </div>

        {isApplied ? (
          <span className="badge badge-assigned" style={{ marginBottom: '0.5rem', fontWeight: 800 }}>
            [APPLIED: {appliedApp.status.toUpperCase()}]
          </span>
        ) : (
          matchBadge
        )}

        <h3 style={{ marginTop: '0.25rem' }}>
          <Link to={`/tasks/${task._id}`} style={{ color: 'var(--text-main)', fontWeight: 800 }}>
            {task.title}
          </Link>
        </h3>

        <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>
          Organized by: <strong style={{ color: 'var(--primary-dark)', fontWeight: 700 }}>{ngoName}</strong>
        </p>

        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: '0.85rem' }}>
          {task.description.length > 120 ? `${task.description.slice(0, 120)}...` : task.description}
        </p>

        <div
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-muted)',
            marginBottom: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            background: '#f1f5f9',
            padding: '0.8rem 0.95rem',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid #cbd5e1'
          }}
        >
          <div>
            <strong>Location:</strong>{' '}
            <span style={{ color: 'var(--text-main)' }}>
              {task.location}, {task.city}
            </span>
          </div>
          <div>
            <strong>Schedule:</strong>{' '}
            <span style={{ color: 'var(--text-main)' }}>
              {formattedDate} ({task.hours} Hours)
            </span>
          </div>
          <div>
            <strong>Volunteers:</strong>{' '}
            <span
              style={{
                color: isQuotaFull ? '#059669' : 'var(--primary)',
                fontWeight: 700
              }}
            >
              {task.volunteersAssigned || 0} / {task.volunteersRequired} Filled
              {isQuotaFull && (
                <span
                  style={{
                    fontSize: '0.74rem',
                    marginLeft: '0.4rem',
                    color: '#059669',
                    fontWeight: 800,
                    letterSpacing: '0.3px'
                  }}
                >
                  [FULL CAPACITY]
                </span>
              )}
            </span>
          </div>
          {task.targetBeneficiaries && (
            <div>
              <strong>Target Community:</strong>{' '}
              <span style={{ color: 'var(--secondary)', fontWeight: 600 }}>
                {task.targetBeneficiaries}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.1rem' }}>
          {(task.requiredSkills || []).map((skill, idx) => (
            <span key={idx} className="badge badge-skill">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          borderTop: '1.5px solid var(--border-color)',
          paddingTop: '0.95rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Link to={`/tasks/${task._id}`} className="btn btn-outline btn-sm">
          View Details
        </Link>
        {isApplied ? (
          <Link
            to={`/tasks/${task._id}`}
            className="btn btn-sm"
            style={{ backgroundColor: '#7e22ce', color: '#ffffff', border: '1.5px solid #6b21a8', fontWeight: 700 }}
          >
            Applied ({appliedApp.status})
          </Link>
        ) : task.status === 'Completed' ? (
          <button
            type="button"
            disabled
            className="btn btn-sm"
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              opacity: 0.85,
              cursor: 'not-allowed',
              fontWeight: 700
            }}
          >
            Drive Completed
          </button>
        ) : task.status === 'Cancelled' ? (
          <button
            type="button"
            disabled
            className="btn btn-sm"
            style={{
              backgroundColor: '#ef4444',
              color: '#ffffff',
              opacity: 0.85,
              cursor: 'not-allowed',
              fontWeight: 700
            }}
          >
            Drive Cancelled
          </button>
        ) : isQuotaFull ? (
          <button
            type="button"
            disabled
            className="btn btn-sm"
            style={{
              backgroundColor: '#64748b',
              color: '#ffffff',
              opacity: 0.9,
              cursor: 'not-allowed',
              fontWeight: 700
            }}
          >
            Quota Filled
          </button>
        ) : (
          <button type="button" onClick={() => onApply(task)} className="btn btn-primary btn-sm">
            Apply for Task
          </button>
        )}
      </div>
    </div>
  );
}
