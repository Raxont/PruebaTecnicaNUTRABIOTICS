import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';

export default function PatientHomePage() {
  return (
    <main className="main-shell">
      <SiteHeader />
      <div className="card">
        <h1 className="page-title">Paciente</h1>
        <p>Accede a tus prescripciones desde el siguiente enlace.</p>
        <div className="page-actions">
          <Link className="button button-primary" href="/patient/prescriptions">
            Mis prescripciones
          </Link>
        </div>
      </div>
    </main>
  );
}
