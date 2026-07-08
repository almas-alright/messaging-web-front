import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  createBackendV2Client,
  type ContactConversationResponse,
  type ContactResponse,
  type DemoUserResponse,
} from "../../api/v2Client";
import { loadStoredJwt } from "../../auth/demoAuthStorage";
import { loadStoredConfig } from "../../config/storage";
import {
  createMessagingWebSocket,
  type MessageCreatedEvent,
  type MessagingWebSocket,
  type ServerEvent,
} from "../../realtime/webSocketClient";
import "./glassChat.css";

const activeUserStorageKey = "messaging-web-front:glass-chat-v2:active-user";

type GlassMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  policyStatus: "clean" | "flagged" | "blocked";
};

export function GlassChatApp() {
  const webSocketRef = useRef<MessagingWebSocket | null>(null);
  const [activeUser, setActiveUser] = useState<DemoUserResponse | null>(() =>
    loadActiveUser(),
  );
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [contacts, setContacts] = useState<ContactResponse[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    null,
  );
  const [activeConversation, setActiveConversation] =
    useState<ContactConversationResponse | null>(null);
  const [messages, setMessages] = useState<GlassMessage[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [socketStatus, setSocketStatus] = useState<{
    state: "idle" | "connecting" | "joined" | "error";
    label: string;
  }>({
    state: "idle",
    label: "Select a contact to connect.",
  });
  const [conversationStatus, setConversationStatus] = useState<{
    state: "idle" | "resolving" | "open" | "error";
    label: string;
  }>({
    state: "idle",
    label: "",
  });
  const [contactDraft, setContactDraft] = useState("");
  const [contactStatus, setContactStatus] = useState<{
    state: "idle" | "loading" | "adding" | "ok" | "error";
    label: string;
  }>({
    state: "idle",
    label: "",
  });
  const [identityStatus, setIdentityStatus] = useState<{
    state: "idle" | "creating" | "error";
    label: string;
  }>({
    state: "idle",
    label: "",
  });
  const v2Client = useMemo(
    () => createBackendV2Client(loadStoredConfig()),
    [],
  );
  const selectedContact =
    contacts.find((contact) => contact.id === selectedContactId) ?? null;

  useEffect(() => {
    return () => {
      webSocketRef.current?.disconnect();
      webSocketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!activeUser) {
      setContacts([]);
      setSelectedContactId(null);
      setActiveConversation(null);
      setMessages([]);
      setMessageDraft("");
      disconnectGlassSocket();
      setConversationStatus({ state: "idle", label: "" });
      setContactStatus({ state: "idle", label: "" });
      return;
    }

    void refreshContacts(activeUser.id);
  }, [activeUser?.id]);

  useEffect(() => {
    if (!activeUser || !activeConversation) {
      disconnectGlassSocket();
      setSocketStatus({
        state: "idle",
        label: activeUser ? "Select a contact to connect." : "",
      });
      return;
    }

    connectGlassSocket(activeConversation.conversation_id);
  }, [activeConversation?.conversation_id, activeUser?.id]);

  async function handleIdentitySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIdentityStatus({
      state: "creating",
      label: "Creating your demo identity...",
    });

    try {
      const created = await v2Client.createDemoUser({
        email: email.trim(),
        username: username.trim(),
        display_name: displayName.trim() || undefined,
      });
      saveActiveUser(created);
      setActiveUser(created);
      setContacts([]);
      setSelectedContactId(null);
      setActiveConversation(null);
      setMessages([]);
      setMessageDraft("");
      setConversationStatus({ state: "idle", label: "" });
      setContactStatus({ state: "idle", label: "" });
      setEmail("");
      setUsername("");
      setDisplayName("");
      setIdentityStatus({ state: "idle", label: "" });
    } catch (error) {
      setIdentityStatus({
        state: "error",
        label: friendlyIdentityError(error),
      });
    }
  }

  function handleIdentityReset() {
    clearActiveUser();
    setActiveUser(null);
    setContacts([]);
    setSelectedContactId(null);
    setActiveConversation(null);
    setMessages([]);
    setMessageDraft("");
    disconnectGlassSocket();
    setConversationStatus({ state: "idle", label: "" });
    setContactDraft("");
    setContactStatus({ state: "idle", label: "" });
    setIdentityStatus({ state: "idle", label: "" });
  }

  async function refreshContacts(ownerUserId: string) {
    setContactStatus({ state: "loading", label: "Loading contacts..." });
    try {
      const response = await v2Client.listContacts(ownerUserId);
      setContacts(uniqueContacts(response.contacts));
      setSelectedContactId((current) => {
        if (
          current &&
          response.contacts.some((contact) => contact.id === current)
        ) {
          return current;
        }
        return null;
      });
      setActiveConversation(null);
      setConversationStatus({ state: "idle", label: "" });
      setContactStatus({
        state: "ok",
        label: response.contacts.length
          ? `${response.contacts.length} contact${response.contacts.length === 1 ? "" : "s"} loaded.`
          : "",
      });
    } catch (error) {
      setContactStatus({
        state: "error",
        label: friendlyContactError(error),
      });
    }
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeUser || !contactDraft.trim()) {
      return;
    }

    setContactStatus({ state: "adding", label: "Adding contact..." });
    try {
      const created = await v2Client.addContact({
        owner_user_id: activeUser.id,
        contact: contactDraft.trim(),
      });
      setContacts((current) => uniqueContacts([...current, created]));
      setContactDraft("");
      setContactStatus({ state: "ok", label: "Contact added." });
      await refreshContacts(activeUser.id);
      await handleContactSelect(created);
    } catch (error) {
      setContactStatus({
        state: "error",
        label: friendlyContactError(error),
      });
    }
  }

  async function handleContactSelect(contact: ContactResponse) {
    if (!activeUser) {
      return;
    }

    setSelectedContactId(contact.id);
    setActiveConversation(null);
    setMessages([]);
    setMessageDraft("");
    disconnectGlassSocket();
    setConversationStatus({
      state: "resolving",
      label: `Opening chat with ${contact.display_name}...`,
    });

    try {
      const resolved = await v2Client.resolveContactConversation(contact.id, {
        owner_user_id: activeUser.id,
      });
      setActiveConversation(resolved);
      setConversationStatus({
        state: "open",
        label: "Direct conversation ready.",
      });
    } catch (error) {
      setActiveConversation(null);
      setConversationStatus({
        state: "error",
        label: friendlyConversationError(error),
      });
    }
  }

  function connectGlassSocket(conversationId: string) {
    const jwtToken = loadStoredJwt().trim();
    if (!jwtToken) {
      setSocketStatus({
        state: "error",
        label: "Local demo JWT is missing. Use the current demo once to store a token.",
      });
      return;
    }

    disconnectGlassSocket();
    setSocketStatus({ state: "connecting", label: "Connecting to chat..." });

    const client = createMessagingWebSocket(loadStoredConfig(), jwtToken, {
      onOpen: () => {
        setSocketStatus({ state: "connecting", label: "Joining conversation..." });
      },
      onMessage: (event) => handleGlassSocketMessage(event, conversationId),
      onClose: () => {
        setSocketStatus({ state: "idle", label: "Chat disconnected." });
      },
      onError: () => {
        setSocketStatus({
          state: "error",
          label: "Could not connect to chat. Check the backend and demo token.",
        });
      },
    });

    webSocketRef.current = client;
    client.connect();
  }

  function disconnectGlassSocket() {
    webSocketRef.current?.disconnect();
    webSocketRef.current = null;
  }

  function handleGlassSocketMessage(event: ServerEvent, conversationId: string) {
    if (event.type === "connection.ready") {
      try {
        webSocketRef.current?.send({
          type: "conversation.join",
          conversation_id: conversationId,
        });
      } catch (error) {
        setSocketStatus({
          state: "error",
          label: error instanceof Error ? error.message : "Conversation join failed.",
        });
      }
      return;
    }

    if (
      event.type === "conversation.joined" &&
      event.conversation_id === conversationId
    ) {
      setSocketStatus({ state: "joined", label: "Live chat connected." });
      return;
    }

    if (isMessageCreatedEvent(event) && event.conversation_id === conversationId) {
      setMessages((current) => appendMessageIfNew(current, messageFromEvent(event)));
      setSocketStatus({ state: "joined", label: "Live chat connected." });
      return;
    }

    if (event.type === "error") {
      setSocketStatus({
        state: "error",
        label: typeof event.error === "string" ? event.error : "Chat error.",
      });
    }
  }

  function handleMessageSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = messageDraft.trim();
    if (!activeConversation || !body) {
      return;
    }

    try {
      webSocketRef.current?.send({
        type: "message.send",
        conversation_id: activeConversation.conversation_id,
        client_message_id: createClientMessageId(),
        body,
      });
      setMessageDraft("");
      setSocketStatus({ state: "joined", label: "Message sent." });
    } catch (error) {
      setSocketStatus({
        state: "error",
        label: error instanceof Error ? error.message : "Message send failed.",
      });
    }
  }

  if (!activeUser) {
    return (
      <main className="glass-chat-page glass-chat-page--setup">
        <section className="glass-identity-card" aria-labelledby="identity-title">
          <div className="glass-identity-card__copy">
            <p className="glass-kicker">Glass chat v2</p>
            <h1 id="identity-title">Create your demo identity</h1>
            <p>
              Use an email and unique username to preview the next chat
              experience.
            </p>
          </div>

          <form className="glass-identity-form" onSubmit={handleIdentitySubmit}>
            <label>
              <span>Email</span>
              <input
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="akash@example.com"
                required
                type="email"
                value={email}
              />
            </label>
            <label>
              <span>Username</span>
              <input
                autoComplete="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="akash"
                required
                type="text"
                value={username}
              />
            </label>
            <label>
              <span>Display name</span>
              <input
                autoComplete="name"
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Akash"
                type="text"
                value={displayName}
              />
            </label>

            {identityStatus.label ? (
              <p
                className={`glass-identity-status glass-identity-status--${identityStatus.state}`}
                role={identityStatus.state === "error" ? "alert" : "status"}
              >
                {identityStatus.label}
              </p>
            ) : null}

            <button
              className="glass-primary-button"
              disabled={identityStatus.state === "creating"}
              type="submit"
            >
              {identityStatus.state === "creating" ? "Creating..." : "Continue"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="glass-chat-page">
      <section className="glass-chat-shell" aria-label="Glass chat preview">
        <aside className="glass-sidebar" aria-label="Contacts">
          <div className="glass-sidebar__profile">
            <div className="glass-avatar glass-avatar--large">
              <span>{getInitials(activeUser.display_name)}</span>
              <span className="glass-presence glass-presence--online" />
            </div>
            <div>
              <p className="glass-kicker">Glass chat v2</p>
              <h1>{activeUser.display_name}</h1>
              <span>@{activeUser.username}</span>
            </div>
          </div>

          <form className="glass-contact-form" onSubmit={handleContactSubmit}>
            <label className="glass-search">
              <span>Add contact</span>
              <input
                aria-label="Add contact by email or username"
                disabled={contactStatus.state === "adding"}
                onChange={(event) => setContactDraft(event.target.value)}
                placeholder="email or username"
                type="text"
                value={contactDraft}
              />
            </label>
            <button
              className="glass-contact-form__button"
              disabled={!contactDraft.trim() || contactStatus.state === "adding"}
              type="submit"
            >
              Add
            </button>
          </form>

          {contactStatus.label ? (
            <p
              className={`glass-contact-status glass-contact-status--${contactStatus.state}`}
              role={contactStatus.state === "error" ? "alert" : "status"}
            >
              {contactStatus.label}
            </p>
          ) : null}

          <div className="glass-contact-list" aria-label="Contacts">
            {contacts.length === 0 && contactStatus.state !== "loading" ? (
              <article className="glass-empty-contact">
                <strong>No contacts yet</strong>
                <span>Add someone by email or username to start the list.</span>
              </article>
            ) : null}
            {contacts.map((contact) => (
              <button
                className={`glass-contact ${
                  contact.id === selectedContactId ? "glass-contact--active" : ""
                }`}
                key={contact.id}
                onClick={() => void handleContactSelect(contact)}
                type="button"
              >
                <div className="glass-avatar">
                  <span>{getInitials(contact.display_name)}</span>
                  <span className="glass-presence glass-presence--offline" />
                </div>
                <div className="glass-contact__body">
                  <div className="glass-contact__line">
                    <strong>{contact.display_name}</strong>
                    <span>@{contact.username}</span>
                  </div>
                  <p className="glass-contact__preview">{contact.email}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="glass-conversation" aria-label="Conversation">
          <header className="glass-conversation__header">
            <div className="glass-conversation__identity">
              <div className="glass-avatar glass-avatar--large">
                <span>
                  {selectedContact
                    ? getInitials(selectedContact.display_name)
                    : "--"}
                </span>
                <span className="glass-presence glass-presence--offline" />
              </div>
              <div>
                <p className="glass-kicker">
                  {activeConversation ? "Direct conversation" : "Contact preview"}
                </p>
                <h2>
                  {selectedContact
                    ? selectedContact.display_name
                    : "Select a contact"}
                </h2>
                <span>
                  {selectedContact
                    ? `@${selectedContact.username} | ${selectedContact.email}`
                    : `Signed in as @${activeUser.username}`}
                </span>
              </div>
            </div>
            <div className="glass-header-actions">
              <button type="button" onClick={handleIdentityReset}>
                Reset identity
              </button>
              <a className="glass-demo-link" href="/">
                Current demo
              </a>
            </div>
          </header>

          <div className="glass-message-stage" aria-label="Message preview">
            <div className="glass-day-chip">
              {activeConversation
                ? activeConversation.conversation_id
                : selectedContact
                  ? "Opening conversation"
                  : "Choose a contact"}
            </div>
            {!selectedContact ? (
              <article className="glass-conversation-empty">
                <strong>No contact selected</strong>
                <span>
                  Select someone from the sidebar to open a direct conversation.
                </span>
              </article>
            ) : null}
            {selectedContact && conversationStatus.label ? (
              <article
                className={`glass-conversation-empty glass-conversation-empty--${conversationStatus.state}`}
                role={conversationStatus.state === "error" ? "alert" : "status"}
              >
                <strong>
                  {conversationStatus.state === "resolving"
                    ? "Opening conversation"
                    : conversationStatus.state === "error"
                      ? "Conversation unavailable"
                      : "Conversation ready"}
                </strong>
                <span>{conversationStatus.label}</span>
              </article>
            ) : null}
            {selectedContact && activeConversation && messages.length === 0 ? (
              <article className="glass-conversation-empty">
                <strong>No messages yet</strong>
                <span>Send the first message in this direct conversation.</span>
              </article>
            ) : null}
            {selectedContact && activeConversation
              ? messages.map((message, index) => (
                  <article
                    className={`glass-message-row ${
                      message.senderId === activeUser.id
                        ? "glass-message-row--own"
                        : "glass-message-row--other"
                    }`}
                    key={message.id}
                  >
                    <div
                      className={`glass-message glass-message--${messageTone(
                        message,
                      )} ${
                        index === messages.length - 1
                          ? "glass-message--latest"
                          : ""
                      }`}
                    >
                      <p>{message.body}</p>
                      <footer>
                        <time>{formatMessageTime(message.createdAt)}</time>
                        {message.policyStatus !== "clean" ? (
                          <span className="glass-receipt">
                            {message.policyStatus}
                          </span>
                        ) : null}
                      </footer>
                    </div>
                  </article>
                ))
              : null}
          </div>

          <form
            className="glass-composer"
            aria-label="Message composer"
            onSubmit={handleMessageSubmit}
          >
            <span className="glass-composer__tool" aria-hidden="true">
              +
            </span>
            <input
              aria-label="Message preview input"
              disabled={!activeConversation || socketStatus.state !== "joined"}
              onChange={(event) => setMessageDraft(event.target.value)}
              placeholder={
                activeConversation && selectedContact
                  ? `Message ${selectedContact.display_name}`
                  : selectedContact
                    ? "Conversation is opening"
                    : "Select a contact first"
              }
              type="text"
              value={messageDraft}
            />
            <button
              className="glass-composer__send"
              disabled={
                !activeConversation ||
                socketStatus.state !== "joined" ||
                !messageDraft.trim()
              }
              type="submit"
            >
              Go
            </button>
          </form>
          <p
            className={`glass-socket-status glass-socket-status--${socketStatus.state}`}
            role={socketStatus.state === "error" ? "alert" : "status"}
          >
            {socketStatus.label}
          </p>
        </section>
      </section>
    </main>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
}

function loadActiveUser() {
  try {
    const raw = window.localStorage.getItem(activeUserStorageKey);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as DemoUserResponse;
    if (!parsed.id || !parsed.email || !parsed.username) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveActiveUser(user: DemoUserResponse) {
  window.localStorage.setItem(activeUserStorageKey, JSON.stringify(user));
}

function clearActiveUser() {
  window.localStorage.removeItem(activeUserStorageKey);
}

function uniqueContacts(contacts: ContactResponse[]) {
  const seen = new Set<string>();
  const result: ContactResponse[] = [];
  for (const contact of contacts) {
    if (seen.has(contact.id)) {
      continue;
    }
    seen.add(contact.id);
    result.push(contact);
  }
  return result;
}

function appendMessageIfNew(messages: GlassMessage[], nextMessage: GlassMessage) {
  if (messages.some((message) => message.id === nextMessage.id)) {
    return messages;
  }
  return [...messages, nextMessage];
}

function messageFromEvent(event: MessageCreatedEvent): GlassMessage {
  return {
    id: event.message_id,
    conversationId: event.conversation_id,
    senderId: event.sender_id,
    body: event.body,
    createdAt: event.created_at || new Date().toISOString(),
    policyStatus: event.policy_status,
  };
}

function messageTone(message: GlassMessage) {
  if (message.policyStatus === "flagged" || message.policyStatus === "blocked") {
    return "alert";
  }
  return "normal";
}

function formatMessageTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createClientMessageId() {
  if ("crypto" in window && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isMessageCreatedEvent(event: ServerEvent): event is MessageCreatedEvent {
  return (
    event.type === "message.created" &&
    "message_id" in event &&
    typeof event.message_id === "string" &&
    "conversation_id" in event &&
    typeof event.conversation_id === "string" &&
    "sender_id" in event &&
    typeof event.sender_id === "string" &&
    "body" in event &&
    typeof event.body === "string"
  );
}

function friendlyIdentityError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("email already exists")) {
    return "That email is already in use. Try a different email for this demo.";
  }
  if (message.includes("username already exists")) {
    return "That username is already taken. Choose another username.";
  }
  if (message.includes("400")) {
    return "Check the email and username fields, then try again.";
  }
  if (message.includes("failed to fetch")) {
    return "The backend is not reachable. Start the backend and try again.";
  }
  return "Could not create this demo identity. Try again in a moment.";
}

function friendlyContactError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (message.includes("contact user not found") || message.includes("404")) {
    return "No demo user was found for that email or username.";
  }
  if (message.includes("cannot add self")) {
    return "You cannot add yourself as a contact.";
  }
  if (message.includes("owner user not found")) {
    return "Your active demo identity was not found. Reset and create it again.";
  }
  if (message.includes("failed to fetch")) {
    return "The backend is not reachable. Start the backend and try again.";
  }
  return "Could not update contacts. Try again in a moment.";
}

function friendlyConversationError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  if (
    message.includes("contact relationship required") ||
    message.includes("403")
  ) {
    return "This user is not in your contacts yet.";
  }
  if (message.includes("contact user not found") || message.includes("404")) {
    return "That contact no longer exists in the demo backend.";
  }
  if (message.includes("owner user not found")) {
    return "Your active demo identity was not found. Reset and create it again.";
  }
  if (message.includes("failed to fetch")) {
    return "The backend is not reachable. Start the backend and try again.";
  }
  return "Could not open this direct conversation. Try again in a moment.";
}
