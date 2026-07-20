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

function storageKey(tenantId: string) {
  return `${storagePrefix}:${encodeURIComponent(tenantId.trim())}:visitor-session`;
}

function validateSession(tenantId: string, session: SupportVisitorSession) {
  if (
    !tenantId.trim() ||
    session.tenantId !== tenantId.trim() ||
    !session.sessionId ||
    !session.conversationId ||
    !session.accessToken
  ) {
    throw new Error("The support session response was incomplete.");
  }
}
