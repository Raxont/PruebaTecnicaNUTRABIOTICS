'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, type?: ToastType) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    clearTimeout(timers.current[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

/* ── Toast container UI ── */
const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <>
      <div className="toast-stack">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">{ICONS[t.type]}</span>
            <span className="toast-msg">{t.message}</span>
            <button className="toast-close" onClick={() => dismiss(t.id)} aria-label="Cerrar">
              ×
            </button>
          </div>
        ))}
      </div>

      <style jsx global>{`
        .toast-stack {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
          max-width: min(380px, calc(100vw - 32px));
        }

        .toast {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 16px;
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 500;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.14);
          pointer-events: all;
          animation: toast-in 0.28s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          border: 1px solid transparent;
        }

        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .toast-success {
          background: #f0fdf4;
          color: #166534;
          border-color: #bbf7d0;
        }
        .toast-error {
          background: #fef2f2;
          color: #991b1b;
          border-color: #fecaca;
        }
        .toast-info {
          background: #eef2ff;
          color: #3730a3;
          border-color: #c7d2fe;
        }

        .toast-icon {
          flex-shrink: 0;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .toast-success .toast-icon { background: #dcfce7; }
        .toast-error   .toast-icon { background: #fee2e2; }
        .toast-info    .toast-icon { background: #e0e7ff; }

        .toast-msg {
          flex: 1;
          line-height: 1.4;
        }

        .toast-close {
          flex-shrink: 0;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.1rem;
          line-height: 1;
          opacity: 0.5;
          padding: 2px 4px;
          border-radius: 6px;
          transition: opacity 0.15s;
          color: inherit;
        }
        .toast-close:hover { opacity: 1; }

        @media (max-width: 480px) {
          .toast-stack {
            bottom: 16px;
            right: 16px;
            left: 16px;
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}