import React, { useState, useEffect } from 'react';

export default function PromptModal({
  isOpen,
  title = 'Submit Note',
  message = '',
  placeholder = '',
  submitText = 'Submit',
  onSubmit,
  onCancel
}) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <div className="app-modal-backdrop" onClick={onCancel}>
      <div className="app-modal-card" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="app-modal-header">
            <h3>{title}</h3>
            <button type="button" className="toast-close-btn" onClick={onCancel}>
              &times;
            </button>
          </div>
          <div className="app-modal-body">
            {message && <p style={{ marginTop: 0, marginBottom: '0.85rem' }}>{message}</p>}
            <textarea
              className="form-control"
              placeholder={placeholder}
              style={{ minHeight: '100px', fontSize: '0.95rem' }}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
          </div>
          <div className="app-modal-footer">
            <button type="button" className="btn btn-outline btn-sm" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
