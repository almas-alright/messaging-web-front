import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { SettingsPanel } from "./components/SettingsPanel";
import type { AppConfig } from "./config/env";
import { loadStoredConfig, saveStoredConfig } from "./config/storage";
import { ChatPanel } from "./features/chat/ChatPanel";

export function App() {
  const [config, setConfig] = useState<AppConfig>(() => loadStoredConfig());

  function handleConfigChange(nextConfig: AppConfig) {
    setConfig(nextConfig);
    saveStoredConfig(nextConfig);
  }

  return (
    <AppShell>
      <div className="demo-layout">
        <SettingsPanel config={config} onConfigChange={handleConfigChange} />
        <ChatPanel />
      </div>
    </AppShell>
  );
}
