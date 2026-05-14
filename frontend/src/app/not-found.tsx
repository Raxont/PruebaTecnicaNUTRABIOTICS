import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="main-shell">
      <div className="card" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Página no encontrada</h1>
        <p>La ruta solicitada no existe. Regresa al inicio o inicia sesión nuevamente.</p>
        <Link className="button button-primary" href="/">
          Ir al inicio
        </Link>
      </div>
    </main>
  );
}
