import { AppShell } from "./components/AppShell";
import { ChatPreview } from "./features/chat/ChatPreview";

export function App() {
  return (
    <AppShell>
      <ChatPreview />
    </AppShell>
  );
}
