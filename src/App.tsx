import { AppShell } from "./components/AppShell";
import { SettingsPanel } from "./components/SettingsPanel";
import { loadAppConfig } from "./config/env";
import { ChatPanel } from "./features/chat/ChatPanel";

export function App() {
  const config = loadAppConfig();

  return (
    <AppShell>
      <div className="demo-layout">
        <SettingsPanel config={config} />
        <ChatPanel />
      </div>
    </AppShell>
  );
}
