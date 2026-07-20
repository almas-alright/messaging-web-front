import type { StartSupportSessionResponse } from "./apiClient";

const storagePrefix = "messaging-web-front:support-widget";

export type SupportVisitorSession = {
  sessionId: string;
  tenantId: string;
  conversationId: string;
  accessToken: string;
  tokenType: string;
  status: string;
  expiresAt: string;
};

export function saveSupportVisitorSession(
  tenantId: string,
  response: StartSupportSessionResponse,
) {
  const session: SupportVisitorSession = {
    sessionId: response.session_id,
    tenantId: response.tenant_id,
    conversationId: response.conversation_id,
    accessToken: response.access_token,
    tokenType: response.token_type,
    status: response.status,
    expiresAt: response.expires_at,
  };
  validateSession(tenantId, session);
  try {
    window.localStorage.setItem(storageKey(tenantId), JSON.stringify(session));
  } catch {
    throw new Error("The browser could not store the support session.");
  }
  return session;
}

export function loadSupportVisitorSession(tenantId: string) {
  if (!tenantId.trim()) return null;
  try {
    const stored = window.localStorage.getItem(storageKey(tenantId));
    if (!stored) return null;
    const session = JSON.parse(stored) as SupportVisitorSession;
    validateSession(tenantId, session);
    if (isSupportVisitorSessionExpired(session)) {
      clearSupportVisitorSession(tenantId);
      return null;
    }
    return session;
  } catch {
    clearSupportVisitorSession(tenantId);
    return null;
  }
}

export function clearSupportVisitorSession(tenantId: string) {
  if (!tenantId.trim()) return;
  try {
    window.localStorage.removeItem(storageKey(tenantId));
  } catch {
    // Storage cleanup is best-effort; in-memory state is still cleared.
  }
}

export function isSupportVisitorSessionExpired(session: SupportVisitorSession) {
  const expiresAt = Date.parse(session.expiresAt);
  return !Number.isFinite(expiresAt) || expiresAt <= Date.now();
}

function storageKey(tenantId: string) {
  return `${storagePrefix}:${encodeURIComponent(tenantId.trim())}:visitor-session`;
}

function validateSession(tenantId: string, session: SupportVisitorSession) {
  if (
    !session ||
    typeof session !== "object" ||
    !tenantId.trim() ||
    session.tenantId !== tenantId.trim() ||
    !session.sessionId ||
    !session.conversationId ||
    !session.accessToken ||
    !session.expiresAt
  ) {
    throw new Error("The support session response was incomplete.");
  }
}
