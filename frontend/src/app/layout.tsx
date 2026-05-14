import './globals.css';
import type { Metadata } from 'next';
import { ToastProvider } from '@/components/ToastContext';

export const metadata: Metadata = {
  title: 'NUTRABITICS',
  description: 'Frontend para el sistema de prescripciones médicas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}