'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAuthState, getCurrentUser, isLoggedIn } from '@/lib/auth';

export default function SiteHeader() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<{ firstName: string; role: string } | null>(null);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUser(getCurrentUser());
  }, []);

  const handleLogout = () => {
    clearAuthState();
    router.push('/login');
  };

  return (
    <header className="main-shell">
      <div className="topbar">
        <div>
          <Link href="/" className="site-link">
            NUTRABITICS
          </Link>
        </div>

        <div className="site-nav">
          {!loggedIn && <Link className="site-link" href="/login">Login</Link>}
          {user?.role === 'DOCTOR' && <Link className="site-link" href="/doctor/prescriptions">Mis prescripciones</Link>}
          {user?.role === 'PATIENT' && <Link className="site-link" href="/patient/prescriptions">Mis prescripciones</Link>}
          {user?.role === 'ADMIN' && <Link className="site-link" href="/admin">Dashboard</Link>}
          {loggedIn && (
            <button className="button button-secondary" onClick={handleLogout}>
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
      {user && (
        <div className="card" style={{ marginBottom: 24 }}>
          <strong>Usuario:</strong> {user.firstName} · <strong>Rol:</strong> {user.role}
        </div>
      )}
    </header>
  );
}
