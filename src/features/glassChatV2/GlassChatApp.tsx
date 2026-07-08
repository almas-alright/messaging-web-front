import "./glassChat.css";

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
  return (
    <main className="glass-chat-page">
      <section className="glass-chat-shell" aria-label="Glass chat preview">
        <aside className="glass-sidebar" aria-label="Contacts">
          <div className="glass-sidebar__profile">
            <div className="glass-avatar glass-avatar--large">
              <span>AD</span>
              <span className="glass-presence glass-presence--online" />
            </div>
            <div>
              <p className="glass-kicker">Glass chat v2</p>
              <h1>Akash Demo</h1>
              <span>@akash</span>
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
                <span>online now</span>
              </div>
            </div>
            <a className="glass-demo-link" href="/">
              Current demo
            </a>
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
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
