export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

const STORAGE_KEY = 'nutrabitics_auth';

export interface AuthState {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

function getStorage() {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function getAuthState(): AuthState | null {
  try {
    const storage = getStorage();
    if (!storage) return null;
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function setAuthState(state: AuthState) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearAuthState() {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(STORAGE_KEY);
}

function decodeToken(token: string) {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string) {
  const decoded = decodeToken(token);
  if (!decoded || typeof decoded.exp !== 'number') return true;
  return decoded.exp * 1000 <= Date.now();
}

export function getAccessToken(): string | null {
  const state = getAuthState();
  if (!state) return null;
  if (isTokenExpired(state.accessToken)) {
    clearAuthState();
    return null;
  }
  return state.accessToken;
}

export function getCurrentUser(): AuthUser | null {
  const state = getAuthState();
  if (!state) return null;
  if (isTokenExpired(state.accessToken)) {
    clearAuthState();
    return null;
  }
  return state.user;
}

export function isLoggedIn() {
  return Boolean(getAccessToken());
}
