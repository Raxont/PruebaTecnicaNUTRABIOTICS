/**
 * @file ProtectedPage.test.tsx
 * Tests de integración para frontend/src/components/ProtectedPage.tsx
 *
 * Verifica las tres ramas principales:
 *  1. Sin sesión  → redirige a /login
 *  2. Rol incorrecto → redirige a /login
 *  3. Sesión válida + rol correcto → renderiza children
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProtectedPage from '@/components/ProtectedPage';
import * as auth from '@/lib/auth';

// ─── mock next/navigation ───────────────────────────────────────────────────

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

// ─── helpers ────────────────────────────────────────────────────────────────

function makeJwt(exp: number): string {
  const payload = btoa(JSON.stringify({ sub: 'u1', role: 'DOCTOR', exp }));
  return `h.${payload}.s`;
}

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600;

const DOCTOR_USER: auth.AuthUser = {
  id:        'u1',
  email:     'doc@nutrabitics.com',
  firstName: 'Ana',
  lastName:  'García',
  role:      'DOCTOR',
};

// ─── setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.restoreAllMocks();
  mockReplace.mockClear();
});

// ─── tests ──────────────────────────────────────────────────────────────────

describe('ProtectedPage', () => {
  // 1 ─ sin sesión
  it('redirige a /login cuando no hay token', async () => {
    jest.spyOn(auth, 'getAccessToken').mockReturnValue(null);
    jest.spyOn(auth, 'getCurrentUser').mockReturnValue(null);

    render(
      <ProtectedPage allowedRoles={['DOCTOR']}>
        <p>Contenido protegido</p>
      </ProtectedPage>,
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });

    expect(screen.queryByText('Contenido protegido')).not.toBeInTheDocument();
  });

  // 2 ─ rol incorrecto
  it('redirige a /login cuando el usuario tiene un rol no permitido', async () => {
    const patientToken = makeJwt(FUTURE_EXP);

    jest.spyOn(auth, 'getAccessToken').mockReturnValue(patientToken);
    jest.spyOn(auth, 'getCurrentUser').mockReturnValue({
      ...DOCTOR_USER,
      role: 'PATIENT',   // intenta acceder a una ruta DOCTOR
    });

    render(
      <ProtectedPage allowedRoles={['DOCTOR']}>
        <p>Solo para médicos</p>
      </ProtectedPage>,
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });

    expect(screen.queryByText('Solo para médicos')).not.toBeInTheDocument();
  });

  // 3 ─ sesión válida
  it('renderiza los children cuando la sesión y el rol son correctos', async () => {
    const validToken = makeJwt(FUTURE_EXP);

    jest.spyOn(auth, 'getAccessToken').mockReturnValue(validToken);
    jest.spyOn(auth, 'getCurrentUser').mockReturnValue(DOCTOR_USER);

    render(
      <ProtectedPage allowedRoles={['DOCTOR']}>
        <p>Panel de médico</p>
      </ProtectedPage>,
    );

    await waitFor(() => {
      expect(screen.getByText('Panel de médico')).toBeInTheDocument();
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  // 4 ─ sin restricción de roles
  it('renderiza los children cuando no se especifican allowedRoles', async () => {
    const validToken = makeJwt(FUTURE_EXP);

    jest.spyOn(auth, 'getAccessToken').mockReturnValue(validToken);
    jest.spyOn(auth, 'getCurrentUser').mockReturnValue(DOCTOR_USER);

    render(
      <ProtectedPage>
        <p>Contenido abierto</p>
      </ProtectedPage>,
    );

    await waitFor(() => {
      expect(screen.getByText('Contenido abierto')).toBeInTheDocument();
    });
  });

  // 5 ─ estado de carga
  it('muestra el estado de carga antes de resolver la autenticación', () => {
    // Nunca resuelve → se queda en "Cargando ..."
    jest.spyOn(auth, 'getAccessToken').mockReturnValue(null);
    jest.spyOn(auth, 'getCurrentUser').mockReturnValue(null);

    const { container } = render(
      <ProtectedPage allowedRoles={['ADMIN']}>
        <p>Admin panel</p>
      </ProtectedPage>,
    );

    // En el primer render, antes del useEffect, el componente
    // muestra el spinner de carga (checked=false)
    expect(container.textContent).toContain('Cargando');
  });
});