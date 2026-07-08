import type { AppConfig } from "../config/env";

export type BackendV2Client = {
  config: AppConfig;
  createDemoUser: (request: DemoUserCreateRequest) => Promise<DemoUserResponse>;
  searchUsers: (query: string) => Promise<UserSearchResponse>;
  getUser: (userId: string) => Promise<DemoUserResponse>;
  addContact: (request: AddContactRequest) => Promise<ContactResponse>;
  listContacts: (ownerUserId: string) => Promise<ContactListResponse>;
  deleteContact: (ownerUserId: string, contactId: string) => Promise<void>;
  resolveContactConversation: (
    contactUserId: string,
    request: ResolveContactConversationRequest,
  ) => Promise<ContactConversationResponse>;
  getUserPresence: (userId: string) => Promise<UserPresenceResponse>;
  getContactsPresence: (
    ownerUserId: string,
  ) => Promise<ContactPresenceListResponse>;
  markMessageSeen: (
    jwtToken: string,
    messageId: string,
  ) => Promise<MessageReceiptResponse>;
};

export type DemoUserCreateRequest = {
  email: string;
  username: string;
  display_name?: string;
};

export type DemoUserResponse = {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
};

export type UserSearchResponse = {
  users: DemoUserResponse[];
};

export type AddContactRequest = {
  owner_user_id: string;
  contact: string;
};

export type ContactResponse = {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string;
  availability_status?: PresenceStatus | null;
};

export type ContactListResponse = {
  owner_user_id: string;
  contacts: ContactResponse[];
};

export type ResolveContactConversationRequest = {
  owner_user_id: string;
};

export type ContactConversationResponse = {
  conversation_id: string;
  type: "direct";
  participants: ContactConversationParticipant[];
};

export type ContactConversationParticipant = {
  user_id: string;
  display_name: string;
  can_read: boolean;
  can_send: boolean;
};

export type PresenceStatus = "online" | "offline" | "away";

export type UserPresenceResponse = {
  user_id: string;
  status: PresenceStatus;
  last_active_at?: string;
};

export type ContactPresenceListResponse = {
  owner_user_id: string;
  contacts: ContactPresenceResponse[];
};

export type ContactPresenceResponse = {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string;
  status: PresenceStatus;
  last_active_at?: string;
};

export type MessageReceiptResponse = {
  message_id: string;
  conversation_id: string;
  user_id: string;
  status: "delivered" | "seen";
  created_at: string;
  updated_at: string;
};

type RequestOptions = {
  jwtToken?: string;
  body?: unknown;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
};

export function createBackendV2Client(config: AppConfig): BackendV2Client {
  return {
    config,
    createDemoUser: (request: DemoUserCreateRequest) =>
      requestJson<DemoUserResponse>(config.apiBaseUrl, "/demo/users", {
        body: request,
        method: "POST",
      }),
    searchUsers: (query: string) => {
      const params = new URLSearchParams({ query });
      return requestJson<UserSearchResponse>(
        config.apiBaseUrl,
        `/users/search?${params.toString()}`,
      );
    },
    getUser: (userId: string) =>
      requestJson<DemoUserResponse>(
        config.apiBaseUrl,
        `/users/${encodeURIComponent(userId)}`,
      ),
    addContact: (request: AddContactRequest) =>
      requestJson<ContactResponse>(config.apiBaseUrl, "/contacts", {
        body: request,
        method: "POST",
      }),
    listContacts: (ownerUserId: string) => {
      const params = new URLSearchParams({ owner_user_id: ownerUserId });
      return requestJson<ContactListResponse>(
        config.apiBaseUrl,
        `/contacts?${params.toString()}`,
      );
    },
    deleteContact: (ownerUserId: string, contactId: string) => {
      const params = new URLSearchParams({ owner_user_id: ownerUserId });
      return requestNoContent(
        config.apiBaseUrl,
        `/contacts/${encodeURIComponent(contactId)}?${params.toString()}`,
        { method: "DELETE" },
      );
    },
    resolveContactConversation: (
      contactUserId: string,
      request: ResolveContactConversationRequest,
    ) =>
      requestJson<ContactConversationResponse>(
        config.apiBaseUrl,
        `/contacts/${encodeURIComponent(contactUserId)}/conversation`,
        {
          body: request,
          method: "POST",
        },
      ),
    getUserPresence: (userId: string) =>
      requestJson<UserPresenceResponse>(
        config.apiBaseUrl,
        `/presence/users/${encodeURIComponent(userId)}`,
      ),
    getContactsPresence: (ownerUserId: string) => {
      const params = new URLSearchParams({ owner_user_id: ownerUserId });
      return requestJson<ContactPresenceListResponse>(
        config.apiBaseUrl,
        `/contacts/presence?${params.toString()}`,
      );
    },
    markMessageSeen: (jwtToken: string, messageId: string) =>
      requestJson<MessageReceiptResponse>(
        config.apiBaseUrl,
        `/messages/${encodeURIComponent(messageId)}/seen`,
        {
          jwtToken,
          method: "PATCH",
        },
      ),
  };
}

async function requestJson<T>(
  apiBaseUrl: string,
  path: string,
  options: RequestOptions = {},
) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: buildHeaders(options),
    method: options.method ?? "GET",
  });

  if (!response.ok) {
    throw await buildBackendV2Error(path, response);
  }

  return response.json() as Promise<T>;
}

async function requestNoContent(
  apiBaseUrl: string,
  path: string,
  options: RequestOptions = {},
) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    headers: buildHeaders(options),
    method: options.method ?? "GET",
  });

  if (!response.ok) {
    throw await buildBackendV2Error(path, response);
  }
}

function buildHeaders(options: RequestOptions) {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.jwtToken?.trim()) {
    headers.Authorization = `Bearer ${options.jwtToken.trim()}`;
  }
  return headers;
}

async function buildBackendV2Error(path: string, response: Response) {
  const detail = await response.text().catch(() => "");
  const message = detail.trim()
    ? `${path} returned ${response.status}: ${detail.trim()}`
    : `${path} returned ${response.status}`;
  return new Error(message);
}
