'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { setAuthState } from '@/lib/auth';
import { apiFetch } from '@/lib/api';
import SiteHeader from '@/components/SiteHeader';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@test.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setAuthState(response);
      const role = response.user.role;

      if (role === 'DOCTOR') {
        router.push('/doctor/prescriptions');
      } else if (role === 'PATIENT') {
        router.push('/patient/prescriptions');
      } else {
        router.push('/admin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-shell">
      <SiteHeader />
      <div className="card" style={{ maxWidth: 520, margin: '0 auto' }}>
        <h1 className="page-title">Iniciar sesión</h1>
        <p>Usa una cuenta de prueba o tu propio usuario para acceder al sistema.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Contraseña
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <div className="alert">{error}</div>}
          <div className="page-actions">
            <button className="button button-primary" type="submit" disabled={loading}>
              {loading ? 'Validando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
