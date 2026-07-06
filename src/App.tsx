import { AppShell } from "./components/AppShell";
import { loadAppConfig } from "./config/env";
import { ChatPreview } from "./features/chat/ChatPreview";

export function App() {
  const config = loadAppConfig();

  return (
    <AppShell>
      <ChatPreview config={config} />
    </AppShell>
  );
}
