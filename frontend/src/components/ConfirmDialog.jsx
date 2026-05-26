import React from 'react';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'primary'
}) {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const isDanger = type === 'danger';

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'confirmFadeIn 0.2s ease-out',
    },
    modal: {
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      width: '90%',
      maxWidth: '440px',
      padding: '28px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      border: '1px solid rgba(226, 232, 240, 0.8)',
      animation: 'confirmScaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
      textAlign: 'left',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '16px',
    },
    iconContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      backgroundColor: isDanger ? '#fee2e2' : '#e0f2fe',
      color: isDanger ? '#ef4444' : '#0284c7',
      fontSize: '1.25rem',
      flexShrink: 0,
    },
    title: {
      margin: 0,
      fontSize: '1.25rem',
      fontWeight: '600',
      color: '#0f172a',
    },
    body: {
      fontSize: '0.975rem',
      color: '#475569',
      lineHeight: '1.6',
      marginBottom: '24px',
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '12px',
    },
    btnCancel: {
      padding: '10px 18px',
      borderRadius: '8px',
      border: '1px solid #cbd5e1',
      backgroundColor: '#ffffff',
      color: '#475569',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    btnConfirm: {
      padding: '10px 18px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: isDanger ? '#ef4444' : '#1e3a5f',
      color: '#ffffff',
      fontSize: '0.9rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: isDanger ? '0 4px 6px -1px rgba(239, 68, 68, 0.2)' : '0 4px 6px -1px rgba(30, 58, 95, 0.2)',
    }
  };

  return (
    <div style={styles.overlay} onClick={handleBackdropClick}>
      <style>{`
        @keyframes confirmFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes confirmScaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .confirm-btn-cancel:hover {
          background-color: #f8fafc !important;
          border-color: #94a3b8 !important;
          color: #0f172a !important;
        }
        .confirm-btn-confirm:hover {
          opacity: 0.95 !important;
          transform: translateY(-1px);
        }
      `}</style>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.iconContainer}>
            {isDanger ? '⚠️' : '❓'}
          </div>
          <h3 style={styles.title}>{title}</h3>
        </div>
        <div style={styles.body}>
          {message}
        </div>
        <div style={styles.actions}>
          <button
            type="button"
            className="confirm-btn-cancel"
            style={styles.btnCancel}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="confirm-btn-confirm"
            style={styles.btnConfirm}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
