import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { generateId } from '../utils/constants';
import ConfirmModal from '../components/ConfirmModal';

const UIContext = createContext(null);

const TOAST_DURATION_MS = 3500;

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const confirmResolver = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      confirmResolver.current = resolve;
      setConfirmState(options);
    });
  }, []);

  function closeConfirm(result) {
    setConfirmState(null);
    confirmResolver.current?.(result);
    confirmResolver.current = null;
  }

  return (
    <UIContext.Provider value={{ showToast, confirm }}>
      {children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
      {confirmState && (
        <ConfirmModal
          title={confirmState.title}
          message={confirmState.message}
          confirmLabel={confirmState.confirmLabel}
          cancelLabel={confirmState.cancelLabel}
          danger={confirmState.danger}
          onConfirm={() => closeConfirm(true)}
          onCancel={() => closeConfirm(false)}
        />
      )}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error('useUI must be used within UIProvider');
  }
  return ctx;
}
