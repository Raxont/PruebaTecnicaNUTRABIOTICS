import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NUTRABITICS',
  description: 'Frontend para el sistema de prescripciones médicas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
