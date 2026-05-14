'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { clearAuthState, getCurrentUser, isLoggedIn } from '@/lib/auth';

export default function SiteHeader() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<{ firstName: string; lastName: string; role: string } | null>(null);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setUser(getCurrentUser() as any);
  }, []);

  const handleLogout = () => {
    clearAuthState();
    router.push('/login');
  };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '';

  const roleLabel: Record<string, string> = {
    DOCTOR: 'Médico',
    PATIENT: 'Paciente',
    ADMIN: 'Admin',
  };

  return (
    <header style={{ marginBottom: 8 }}>
      {/* ── Nav bar ── */}
      <nav className="site-nav">
        <Link href="/" className="site-link" style={{ fontWeight: 700, fontSize: '1rem' }}>
          NUTRABITICS
        </Link>

        <span style={{ flex: 1 }} />

        {!loggedIn && (
          <Link className="site-link" href="/login">
            Iniciar sesión
          </Link>
        )}

        {user?.role === 'DOCTOR' && (
          <Link className="site-link" href="/doctor/prescriptions">
            Prescripciones
          </Link>
        )}

        {user?.role === 'PATIENT' && (
          <Link className="site-link" href="/patient/prescriptions">
            Mis recetas
          </Link>
        )}

        {user?.role === 'ADMIN' && (
          <>
            <Link className="site-link" href="/admin">
              Dashboard
            </Link>
            {/* <Link className="site-link" href="/admin/prescriptions">
              Prescripciones
            </Link> */}
          </>
        )}

        {loggedIn && (
          <button className="button button-ghost button-sm" onClick={handleLogout}>
            Salir
          </button>
        )}
      </nav>

      {/* ── User chip ── */}
      {user && (
        <div className="user-chip">
          <span className="user-chip-avatar">{initials}</span>
          <span className="user-chip-name">{user.firstName} {user.lastName}</span>
          <span className="user-chip-role">{roleLabel[user.role] ?? user.role}</span>
        </div>
      )}
    </header>
  );
}