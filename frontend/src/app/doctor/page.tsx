import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';

export default function DoctorHomePage() {
  return (
    <main className="main-shell">
      <SiteHeader />
      <div className="card">
        <h1 className="page-title">Médico</h1>
        <p>Gestiona tus prescripciones desde el panel.</p>
        <div className="page-actions">
          <Link className="button button-primary" href="/doctor/prescriptions">
            Ver prescripciones
          </Link>
        </div>
      </div>
    </main>
  );
}
