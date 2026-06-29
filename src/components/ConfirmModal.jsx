import { useEffect, useRef } from 'react';

export default function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    confirmRef.current?.focus();
    function handleKey(e) {
      if (e.key === 'Escape') onCancel();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <div
      className="confirm-overlay"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="confirm-modal receipt receipt--torn-top"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="receipt__body">
          <div className="receipt__section-label" id="confirm-title">
            {title}
          </div>
          <p className="confirm-modal__message" id="confirm-message">
            {message}
          </p>
          <hr className="receipt__divider receipt__divider--light" />
          <div className="confirm-modal__actions btn-row">
            <button type="button" className="btn btn--ghost" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button
              ref={confirmRef}
              type="button"
              className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
