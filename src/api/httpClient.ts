import type { AppConfig } from "../config/env";

export type HttpClient = {
  config: AppConfig;
  getHealth: () => Promise<BackendCheckResponse>;
  getReady: () => Promise<BackendCheckResponse>;
  getCurrentUser: (jwtToken: string) => Promise<CurrentUserResponse>;
  getModerationPolicies: (
    jwtToken: string,
  ) => Promise<ModerationPolicyListResponse>;
  getAdminModerationFlags: (
    jwtToken: string,
  ) => Promise<AdminModerationFlagResponse[]>;
  updateAdminModerationFlag: (
    jwtToken: string,
    flagId: string,
    update: AdminModerationFlagUpdateRequest,
  ) => Promise<AdminModerationFlagResponse>;
  createModerationFlag: (
    jwtToken: string,
    flag: ModerationFlagCreateRequest,
  ) => Promise<ModerationFlagResponse>;
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

export type ModerationFlagCreateRequest = {
  conversation_id: string;
  client_message_id?: string;
  policy_id: string;
  matched_type: string;
  matched_text?: string;
  matched_text_hash?: string;
  message_excerpt: string;
  detected_at: string;
};

export type ModerationFlagResponse = {
  id: string;
  conversation_id: string;
  sender_id: string;
  client_message_id?: string;
  policy_id: string;
  matched_type: string;
  matched_text_hash?: string;
  message_excerpt: string;
  status: string;
  detected_by: string;
  detected_at: string;
  created_at: string;
};

export type AdminModerationFlagStatus =
  | "open"
  | "reviewed"
  | "ignored"
  | "escalated";

export type AdminModerationFlagResponse = {
  id: string;
  conversation_id: string;
  sender_id: string;
  policy_id?: string;
  matched_type: string;
  message_excerpt?: string;
  severity: "low" | "medium" | "high" | "critical";
  status: AdminModerationFlagStatus;
  detected_by?: string;
  detected_at?: string;
  created_at: string;
};

export type AdminModerationFlagUpdateRequest = {
  status: Exclude<AdminModerationFlagStatus, "open">;
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
    getAdminModerationFlags: (jwtToken: string) =>
      getAdminModerationFlags(config.apiBaseUrl, jwtToken),
    updateAdminModerationFlag: (
      jwtToken: string,
      flagId: string,
      update: AdminModerationFlagUpdateRequest,
    ) => updateAdminModerationFlag(config.apiBaseUrl, jwtToken, flagId, update),
    createModerationFlag: (
      jwtToken: string,
      flag: ModerationFlagCreateRequest,
    ) => createModerationFlag(config.apiBaseUrl, jwtToken, flag),
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

async function createModerationFlag(
  apiBaseUrl: string,
  jwtToken: string,
  flag: ModerationFlagCreateRequest,
) {
  const response = await fetch(`${apiBaseUrl}/moderation/flags`, {
    body: JSON.stringify(flag),
    headers: {
      Authorization: `Bearer ${jwtToken.trim()}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`/moderation/flags returned ${response.status}`);
  }
  return response.json() as Promise<ModerationFlagResponse>;
}

async function getAdminModerationFlags(apiBaseUrl: string, jwtToken: string) {
  const response = await fetch(`${apiBaseUrl}/admin/moderation/flags`, {
    headers: {
      Authorization: `Bearer ${jwtToken.trim()}`,
    },
  });
  if (!response.ok) {
    throw new Error(`/admin/moderation/flags returned ${response.status}`);
  }
  return response.json() as Promise<AdminModerationFlagResponse[]>;
}

async function updateAdminModerationFlag(
  apiBaseUrl: string,
  jwtToken: string,
  flagId: string,
  update: AdminModerationFlagUpdateRequest,
) {
  const response = await fetch(
    `${apiBaseUrl}/admin/moderation/flags/${encodeURIComponent(flagId)}`,
    {
      body: JSON.stringify(update),
      headers: {
        Authorization: `Bearer ${jwtToken.trim()}`,
        "Content-Type": "application/json",
      },
      method: "PATCH",
    },
  );
  if (!response.ok) {
    throw new Error(
      `/admin/moderation/flags/${flagId} returned ${response.status}`,
    );
  }
  return response.json() as Promise<AdminModerationFlagResponse>;
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
