import { authApi } from "./api.js";

const TOKEN_KEY = "org_session_token";
const USER_KEY = "org_user";

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function getUser() {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY) || "null");
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken() && getUser());
}

export function setAuth(result) {
  sessionStorage.setItem(TOKEN_KEY, result.token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(result.user));
}

export function clearAuth() {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
}

export async function login(username, password) {
  const result = await authApi.login(username, password);
  setAuth(result);
  return result;
}

export async function restoreSession() {
  if (!getToken()) return null;
  try {
    const result = await authApi.session();
    const user = { ...result.user, role: result.role };
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  } catch {
    clearAuth();
    return null;
  }
}

export async function logout() {
  try {
    if (getToken()) await authApi.logout();
  } finally {
    clearAuth();
  }
}
