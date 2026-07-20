import type { AppConfig } from "../config/env";

export type HttpClient = {
  config: AppConfig;
  getHealth: () => Promise<BackendCheckResponse>;
  getReady: () => Promise<BackendCheckResponse>;
  getCurrentUser: (jwtToken: string) => Promise<CurrentUserResponse>;
  getConversationMessages: (
    jwtToken: string,
    conversationId: string,
    query?: ConversationMessagesQuery,
  ) => Promise<ConversationMessagesResponse>;
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
  getAttachment: (
    jwtToken: string,
    attachmentId: string,
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

export type ConversationMessagesQuery = {
  limit?: number;
  before?: string;
  after?: string;
  from?: string;
  to?: string;
};

export type ConversationMessageResponse = {
  id: string;
  conversation_id: string;
  sender_id: string;
  client_message_id?: string;
  body: string;
  message_type: "text" | "file" | "system";
  policy_status: "clean" | "flagged" | "blocked";
  attachment_id?: string;
  receipt_status?: "sent" | "delivered" | "seen";
  created_at: string;
};

export type ConversationMessagesResponse = {
  conversation_id: string;
  messages: ConversationMessageResponse[];
  pagination: {
    limit: number;
    has_more: boolean;
    next_before?: string;
    next_cursor?: string;
  };
};

export type ModerationPolicyType =
  | "system_detector"
  | "word"
  | "phrase"
  | "platform_name"
  | "communication_app"
  | "blocked_word"
  | "blocked_phrase";

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
  download_url?: string;
  url?: string;
};

export class HttpApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpApiError";
    this.status = status;
  }
}

export function createHttpClient(config: AppConfig): HttpClient {
  return {
    config,
    getHealth: () => getBackendCheck(config.apiBaseUrl, "/health"),
    getReady: () => getBackendCheck(config.apiBaseUrl, "/ready"),
    getCurrentUser: (jwtToken: string) =>
      getCurrentUser(config.apiBaseUrl, jwtToken),
    getConversationMessages: (
      jwtToken: string,
      conversationId: string,
      query?: ConversationMessagesQuery,
    ) => getConversationMessages(config.apiBaseUrl, jwtToken, conversationId, query),
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
    getAttachment: (jwtToken: string, attachmentId: string) =>
      getAttachment(config.apiBaseUrl, jwtToken, attachmentId),
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

async function getConversationMessages(
  apiBaseUrl: string,
  jwtToken: string,
  conversationId: string,
  query: ConversationMessagesQuery = {},
) {
  const params = new URLSearchParams();
  if (query.limit) {
    params.set("limit", String(query.limit));
  }
  if (query.before) {
    params.set("before", query.before);
  }
  if (query.after) {
    params.set("after", query.after);
  }
  if (query.from) {
    params.set("from", query.from);
  }
  if (query.to) {
    params.set("to", query.to);
  }

  const queryString = params.toString();
  const response = await fetch(
    `${apiBaseUrl}/conversations/${encodeURIComponent(
      conversationId,
    )}/messages${queryString ? `?${queryString}` : ""}`,
    {
      headers: {
        Authorization: `Bearer ${jwtToken.trim()}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error(
      `/conversations/${conversationId}/messages returned ${response.status}`,
    );
  }
  return response.json() as Promise<ConversationMessagesResponse>;
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
    throw new HttpApiError(
      `attachment upload returned ${response.status}`,
      response.status,
    );
  }

  return response.json() as Promise<AttachmentResponse>;
}

async function getAttachment(
  apiBaseUrl: string,
  jwtToken: string,
  attachmentId: string,
) {
  const response = await fetch(
    `${apiBaseUrl}/attachments/${encodeURIComponent(attachmentId)}`,
    {
      headers: { Authorization: `Bearer ${jwtToken.trim()}` },
    },
  );
  if (!response.ok) {
    throw new HttpApiError(
      `attachment metadata returned ${response.status}`,
      response.status,
    );
  }
  return response.json() as Promise<AttachmentResponse>;
}
