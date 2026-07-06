import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { SettingsPanel } from "./components/SettingsPanel";
import { type AppConfig, loadAppConfig } from "./config/env";
import { ChatPanel } from "./features/chat/ChatPanel";

export function App() {
  const [config, setConfig] = useState<AppConfig>(() => loadAppConfig());

  return (
    <AppShell>
      <div className="demo-layout">
        <SettingsPanel config={config} onConfigChange={setConfig} />
        <ChatPanel />
      </div>
    </AppShell>
  );
}
