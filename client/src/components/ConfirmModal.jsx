import React from 'react';

export default function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', isDanger = false, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="app-modal-backdrop" onClick={onCancel}>
      <div className="app-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="app-modal-header">
          <h3>{title}</h3>
          <button type="button" className="toast-close-btn" onClick={onCancel}>
            &times;
          </button>
        </div>
        <div className="app-modal-body">
          <p style={{ margin: 0 }}>{message}</p>
        </div>
        <div className="app-modal-footer">
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn btn-sm ${isDanger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
