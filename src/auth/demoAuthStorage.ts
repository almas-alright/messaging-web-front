const jwtStorageKey = "messaging-web-front:demo-jwt";

export function loadStoredJwt() {
  try {
    return window.localStorage.getItem(jwtStorageKey) ?? "";
  } catch {
    return "";
  }
}

export function saveStoredJwt(token: string) {
  window.localStorage.setItem(jwtStorageKey, token);
}
