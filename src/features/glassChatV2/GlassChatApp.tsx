import { useMemo, useState, type FormEvent } from "react";
import {
  createBackendV2Client,
  type DemoUserResponse,
} from "../../api/v2Client";
import { loadStoredConfig } from "../../config/storage";
import "./glassChat.css";

const activeUserStorageKey = "messaging-web-front:glass-chat-v2:active-user";

const previewContacts = [
  {
    id: "mira",
    name: "Mira Chen",
    username: "@mira",
    status: "online",
    lastMessage: "The new samples look good.",
    tone: "normal",
  },
  {
    id: "akash",
    name: "Akash Rahman",
    username: "@akash",
    status: "offline",
    lastMessage: "I will check the order notes.",
    tone: "normal",
  },
  {
    id: "nora",
    name: "Nora Silva",
    username: "@nora",
    status: "online",
    lastMessage: "Potential policy warning preview.",
    tone: "warning",
  },
];

const previewMessages = [
  {
    id: "msg-1",
    direction: "other",
    body: "Morning. Can you send the updated delivery window?",
    time: "10:24",
    tone: "normal",
  },
  {
    id: "msg-2",
    direction: "own",
    body: "Yes. I am pulling the latest details now.",
    time: "10:25",
    tone: "normal",
    receipt: "delivered",
  },
  {
    id: "msg-3",
    direction: "other",
    body: "This message is a visual warning placeholder for V2 moderation states.",
    time: "10:26",
    tone: "warning",
  },
  {
    id: "msg-4",
    direction: "own",
    body: "Flagged or blocked backend states will use this alert treatment.",
    time: "10:27",
    tone: "alert",
    receipt: "seen",
  },
];

export function GlassChatApp() {
  const [activeUser, setActiveUser] = useState<DemoUserResponse | null>(() =>
    loadActiveUser(),
  );
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
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
    setIdentityStatus({ state: "idle", label: "" });
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

          <label className="glass-search">
            <span>Add contact</span>
            <input
              aria-label="Add contact by email or username"
              disabled
              placeholder="email or username"
              type="text"
            />
          </label>

          <div className="glass-contact-list" aria-label="Contact previews">
            <article className="glass-empty-contact">
              <strong>Contacts arrive next</strong>
              <span>Add and open direct chats in the next phase.</span>
            </article>
            {previewContacts.map((contact) => (
              <article
                className={`glass-contact ${
                  contact.id === "mira" ? "glass-contact--active" : ""
                }`}
                key={contact.id}
              >
                <div className="glass-avatar">
                  <span>{getInitials(contact.name)}</span>
                  <span
                    className={`glass-presence glass-presence--${contact.status}`}
                  />
                </div>
                <div className="glass-contact__body">
                  <div className="glass-contact__line">
                    <strong>{contact.name}</strong>
                    <span>{contact.username}</span>
                  </div>
                  <p
                    className={
                      contact.tone === "warning"
                        ? "glass-contact__preview glass-contact__preview--warning"
                        : "glass-contact__preview"
                    }
                  >
                    {contact.lastMessage}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </aside>

        <section className="glass-conversation" aria-label="Conversation">
          <header className="glass-conversation__header">
            <div className="glass-conversation__identity">
              <div className="glass-avatar glass-avatar--large">
                <span>MC</span>
                <span className="glass-presence glass-presence--online" />
              </div>
              <div>
                <p className="glass-kicker">Direct conversation</p>
                <h2>Mira Chen</h2>
                <span>Signed in as @{activeUser.username}</span>
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
            <div className="glass-day-chip">Today</div>
            {previewMessages.map((message) => (
              <article
                className={`glass-message-row glass-message-row--${message.direction}`}
                key={message.id}
              >
                <div
                  className={`glass-message glass-message--${message.tone} ${
                    message.id === "msg-4" ? "glass-message--latest" : ""
                  }`}
                >
                  <p>{message.body}</p>
                  <footer>
                    <time>{message.time}</time>
                    {message.receipt ? (
                      <span className="glass-receipt">{message.receipt}</span>
                    ) : null}
                  </footer>
                </div>
              </article>
            ))}
          </div>

          <form className="glass-composer" aria-label="Message composer">
            <span className="glass-composer__tool" aria-hidden="true">
              +
            </span>
            <input
              aria-label="Message preview input"
              disabled
              placeholder="Message Mira"
              type="text"
            />
            <span className="glass-composer__send" aria-hidden="true">
              Go
            </span>
          </form>
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
