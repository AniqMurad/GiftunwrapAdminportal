import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Modal from './Modal';
import Button from './Button';

const ConfirmContext = createContext(null);

const DEFAULTS = {
  title: 'Are you sure?',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  danger: false,
};

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, ...DEFAULTS });
  const resolveRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    setState({ open: true, ...DEFAULTS, ...options });
    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const close = (result) => {
    setState((prev) => ({ ...prev, open: false }));
    resolveRef.current?.(result);
    resolveRef.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={state.open}
        onClose={() => close(false)}
        title={state.title}
        footer={
          <>
            <Button variant="secondary" onClick={() => close(false)}>
              {state.cancelLabel}
            </Button>
            <Button variant={state.danger ? 'danger' : 'primary'} onClick={() => close(true)}>
              {state.confirmLabel}
            </Button>
          </>
        }
      >
        <div className={`confirm-icon ${state.danger ? 'confirm-icon-danger' : 'confirm-icon-info'}`} style={{ margin: '0 0 var(--space-3)' }}>
          <i className={`bi ${state.danger ? 'bi-exclamation-triangle' : 'bi-question-circle'}`} aria-hidden="true" />
        </div>
        {state.message}
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
