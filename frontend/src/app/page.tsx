import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';

export default function HomePage() {
  return (
    <main className="main-shell">
      <SiteHeader />
      <div className="card">
        <h1 className="page-title">Bienvenido a NUTRABITICS</h1>
        <p>
          Frontend de administración de prescripciones médicas. Inicia sesión para acceder a los paneles de médico,
          paciente o admin.
        </p>
        <div className="page-actions">
          <Link className="button button-primary" href="/login">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </main>
  );
}
