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
    if (!raw) {
      console.log('No auth state found in localStorage'); // Debug
      return null;
    }
    const state = JSON.parse(raw) as AuthState;
    console.log('Auth state loaded:', { hasToken: !!state.accessToken, role: state.user?.role }); // Debug
    return state;
  } catch (error) {
    console.error('Error loading auth state:', error); // Debug
    return null;
  }
}

export function setAuthState(state: AuthState) {
  try {
    const storage = getStorage();
    if (!storage) {
      console.error('localStorage not available'); // Debug
      return;
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log('Auth state saved:', { role: state.user?.role }); // Debug
  } catch (error) {
    console.error('Error saving auth state:', error); // Debug
  }
}

export function clearAuthState() {
  try {
    const storage = getStorage();
    if (!storage) return;
    storage.removeItem(STORAGE_KEY);
    console.log('Auth state cleared'); // Debug
  } catch (error) {
    console.error('Error clearing auth state:', error); // Debug
  }
}

function decodeToken(token: string) {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

export function isTokenExpired(token: string) {
  const decoded = decodeToken(token);
  if (!decoded) {
    console.log('Token could not be decoded');
    return true;
  }
  
  if (typeof decoded.exp !== 'number') {
    console.log('Token has no expiration');
    return true;
  }
  
  const expirationTime = decoded.exp * 1000;
  const currentTime = Date.now();
  const isExpired = expirationTime <= currentTime;
  
  console.log('Token validation:', {
    exp: decoded.exp,
    expirationTime: new Date(expirationTime).toISOString(),
    currentTime: new Date(currentTime).toISOString(),
    isExpired,
    timeUntilExpiry: Math.round((expirationTime - currentTime) / 1000) + 's'
  });
  
  return isExpired;
}

export function getAccessToken(): string | null {
  const state = getAuthState();
  if (!state) return null;
  if (isTokenExpired(state.accessToken)) {
    console.log('Token expired, clearing auth'); // Debug
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
  const loggedIn = Boolean(getAccessToken());
  console.log('isLoggedIn:', loggedIn); // Debug
  return loggedIn;
}