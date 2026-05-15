/**
 * @file auth.test.ts
 * Tests unitarios para frontend/src/lib/auth.ts
 *
 * Cubre los helpers críticos de autenticación:
 *  - getAuthState / setAuthState / clearAuthState
 *  - isTokenExpired
 *  - getAccessToken
 *  - getCurrentUser
 */

import {
  getAuthState,
  setAuthState,
  clearAuthState,
  isTokenExpired,
  getAccessToken,
  getCurrentUser,
  type AuthState,
} from '@/lib/auth';

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Genera un JWT mínimo con la expiración indicada.
 * El header/signature son ficticios; sólo importa el payload.
 */
function makeJwt(exp: number): string {
  const payload = btoa(JSON.stringify({ sub: 'user-1', role: 'PATIENT', exp }));
  return `header.${payload}.signature`;
}

const FUTURE_EXP = Math.floor(Date.now() / 1000) + 3600; // +1 h
const PAST_EXP   = Math.floor(Date.now() / 1000) - 3600; // -1 h

const MOCK_STATE: AuthState = {
  accessToken:  makeJwt(FUTURE_EXP),
  refreshToken: makeJwt(FUTURE_EXP + 86400),
  user: {
    id:        'user-1',
    email:     'test@nutrabitics.com',
    firstName: 'Test',
    lastName:  'User',
    role:      'PATIENT',
  },
};

// ─── setup ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
});

// ─── 1. Storage helpers ──────────────────────────────────────────────────────

describe('setAuthState / getAuthState / clearAuthState', () => {
  it('persiste el estado en localStorage', () => {
    setAuthState(MOCK_STATE);
    const loaded = getAuthState();
    expect(loaded).not.toBeNull();
    expect(loaded!.user.email).toBe(MOCK_STATE.user.email);
    expect(loaded!.accessToken).toBe(MOCK_STATE.accessToken);
  });

  it('devuelve null cuando localStorage está vacío', () => {
    expect(getAuthState()).toBeNull();
  });

  it('clearAuthState elimina el estado', () => {
    setAuthState(MOCK_STATE);
    clearAuthState();
    expect(getAuthState()).toBeNull();
  });

  it('devuelve null y no lanza excepción si localStorage contiene JSON inválido', () => {
    localStorage.setItem('nutrabitics_auth', '{broken json');
    expect(() => getAuthState()).not.toThrow();
    expect(getAuthState()).toBeNull();
  });
});

// ─── 2. isTokenExpired ───────────────────────────────────────────────────────

describe('isTokenExpired', () => {
  it('devuelve false para un token válido (exp en el futuro)', () => {
    const token = makeJwt(FUTURE_EXP);
    expect(isTokenExpired(token)).toBe(false);
  });

  it('devuelve true para un token expirado (exp en el pasado)', () => {
    const token = makeJwt(PAST_EXP);
    expect(isTokenExpired(token)).toBe(true);
  });

  it('devuelve true si el token está malformado', () => {
    expect(isTokenExpired('not.a.jwt')).toBe(true);
  });

  it('devuelve true si el payload no contiene campo exp', () => {
    const noExp = btoa(JSON.stringify({ sub: 'user-1', role: 'PATIENT' }));
    expect(isTokenExpired(`h.${noExp}.s`)).toBe(true);
  });
});

// ─── 3. getAccessToken ───────────────────────────────────────────────────────

describe('getAccessToken', () => {
  it('devuelve el token cuando hay sesión válida', () => {
    setAuthState(MOCK_STATE);
    expect(getAccessToken()).toBe(MOCK_STATE.accessToken);
  });

  it('devuelve null cuando no hay sesión', () => {
    expect(getAccessToken()).toBeNull();
  });

  it('limpia el estado y devuelve null si el token está expirado', () => {
    const expiredState: AuthState = {
      ...MOCK_STATE,
      accessToken: makeJwt(PAST_EXP),
    };
    setAuthState(expiredState);

    const token = getAccessToken();

    expect(token).toBeNull();
    // El estado debería haberse limpiado
    expect(getAuthState()).toBeNull();
  });
});

// ─── 4. getCurrentUser ───────────────────────────────────────────────────────

describe('getCurrentUser', () => {
  it('devuelve el usuario cuando la sesión es válida', () => {
    setAuthState(MOCK_STATE);
    const user = getCurrentUser();
    expect(user).not.toBeNull();
    expect(user!.id).toBe('user-1');
    expect(user!.role).toBe('PATIENT');
  });

  it('devuelve null cuando no hay sesión', () => {
    expect(getCurrentUser()).toBeNull();
  });

  it('devuelve null y limpia el estado si el token expiró', () => {
    setAuthState({ ...MOCK_STATE, accessToken: makeJwt(PAST_EXP) });
    expect(getCurrentUser()).toBeNull();
    expect(localStorage.getItem('nutrabitics_auth')).toBeNull();
  });

  it('preserva todos los campos del usuario', () => {
    setAuthState(MOCK_STATE);
    const user = getCurrentUser()!;
    expect(user.email).toBe('test@nutrabitics.com');
    expect(user.firstName).toBe('Test');
    expect(user.lastName).toBe('User');
  });
});