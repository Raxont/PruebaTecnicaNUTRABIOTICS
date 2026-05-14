'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  open: boolean;
  onClose: () => void;
}

export default function Toast({ message, type = 'success', open, onClose }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timeout = window.setTimeout(() => {
      onClose();
    }, 3500);
    return () => window.clearTimeout(timeout);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`toast toast-${type}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
