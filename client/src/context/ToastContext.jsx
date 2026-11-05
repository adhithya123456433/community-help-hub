import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 220);
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const normalizedType = type === 'danger' ? 'error' : type;

    setToasts((prev) => [...prev, { id, message, type: normalizedType, isExiting: false }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" id="toast-container">
        {toasts.map((toast) => {
          let tagLabel = 'INFO';
          if (toast.type === 'success') tagLabel = 'SUCCESS';
          if (toast.type === 'error') tagLabel = 'ERROR';
          if (toast.type === 'warning') tagLabel = 'WARNING';

          return (
            <div
              key={toast.id}
              className={`toast toast-${toast.type} ${toast.isExiting ? 'toast-fade-out' : ''}`}
            >
              <div className="toast-content">
                <span className={`toast-tag toast-tag-${toast.type}`}>{tagLabel}</span>
                <div className="toast-msg">{toast.message}</div>
              </div>
              <button
                type="button"
                className="toast-close-btn"
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                &times;
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
