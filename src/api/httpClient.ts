import type { AppConfig } from "../config/env";

export type HttpClient = {
  config: AppConfig;
  getHealth: () => Promise<BackendCheckResponse>;
  getReady: () => Promise<BackendCheckResponse>;
  getCurrentUser: (jwtToken: string) => Promise<CurrentUserResponse>;
  getModerationPolicies: (
    jwtToken: string,
  ) => Promise<ModerationPolicyListResponse>;
  uploadAttachment: (
    jwtToken: string,
    conversationId: string,
    file: File,
  ) => Promise<AttachmentResponse>;
};

export type BackendCheckResponse = {
  status: string;
  service: string;
};

export type CurrentUserResponse = {
  user_id: string;
  display_name: string;
  role: "buyer" | "seller" | "admin";
};

export type ModerationPolicyType =
  | "system_detector"
  | "word"
  | "phrase"
  | "platform_name"
  | "communication_app";

export type ModerationPolicyResponse = {
  key: string;
  label: string;
  type: ModerationPolicyType;
  value: string;
  severity: "low" | "medium" | "high" | "critical";
  action:
    | "allow"
    | "warn"
    | "flag"
    | "block"
    | "restrict_conversation"
    | "escalate_support";
};

export type ModerationPolicyListResponse = {
  version: string;
  policies: ModerationPolicyResponse[];
};

export type AttachmentResponse = {
  id: string;
  conversation_id: string;
  uploader_id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

export function createHttpClient(config: AppConfig): HttpClient {
  return {
    config,
    getHealth: () => getBackendCheck(config.apiBaseUrl, "/health"),
    getReady: () => getBackendCheck(config.apiBaseUrl, "/ready"),
    getCurrentUser: (jwtToken: string) =>
      getCurrentUser(config.apiBaseUrl, jwtToken),
    getModerationPolicies: (jwtToken: string) =>
      getModerationPolicies(config.apiBaseUrl, jwtToken),
    uploadAttachment: (jwtToken: string, conversationId: string, file: File) =>
      uploadAttachment(config.apiBaseUrl, jwtToken, conversationId, file),
  };
}

async function getBackendCheck(apiBaseUrl: string, path: string) {
  const response = await fetch(`${apiBaseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response.json() as Promise<BackendCheckResponse>;
}

async function getCurrentUser(apiBaseUrl: string, jwtToken: string) {
  const response = await fetch(`${apiBaseUrl}/auth/me`, {
    headers: {
      Authorization: `Bearer ${jwtToken.trim()}`,
    },
  });
  if (!response.ok) {
    throw new Error(`/auth/me returned ${response.status}`);
  }
  return response.json() as Promise<CurrentUserResponse>;
}

async function getModerationPolicies(apiBaseUrl: string, jwtToken: string) {
  const response = await fetch(`${apiBaseUrl}/moderation/policies`, {
    headers: {
      Authorization: `Bearer ${jwtToken.trim()}`,
    },
  });
  if (!response.ok) {
    throw new Error(`/moderation/policies returned ${response.status}`);
  }
  return response.json() as Promise<ModerationPolicyListResponse>;
}

async function uploadAttachment(
  apiBaseUrl: string,
  jwtToken: string,
  conversationId: string,
  file: File,
) {
  const formData = new FormData();
  formData.set("file", file);

  const response = await fetch(
    `${apiBaseUrl}/conversations/${encodeURIComponent(
      conversationId,
    )}/attachments`,
    {
      body: formData,
      headers: {
        Authorization: `Bearer ${jwtToken.trim()}`,
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error(`attachment upload returned ${response.status}`);
  }

  return response.json() as Promise<AttachmentResponse>;
}
