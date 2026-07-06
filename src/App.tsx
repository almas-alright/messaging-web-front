import { useState } from "react";
import { createHttpClient } from "./api/httpClient";
import { loadStoredJwt, saveStoredJwt } from "./auth/demoAuthStorage";
import { AppShell } from "./components/AppShell";
import { SettingsPanel } from "./components/SettingsPanel";
import type { AppConfig } from "./config/env";
import { loadStoredConfig, saveStoredConfig } from "./config/storage";
import { ChatPanel } from "./features/chat/ChatPanel";

type BackendStatus = {
  state: "idle" | "checking" | "ok" | "error";
  label: string;
};

export function App() {
  const [config, setConfig] = useState<AppConfig>(() => loadStoredConfig());
  const [jwtToken, setJwtToken] = useState(() => loadStoredJwt());
  const [backendStatus, setBackendStatus] = useState<BackendStatus>({
    state: "idle",
    label: "Not checked",
  });

  function handleConfigChange(nextConfig: AppConfig) {
    setConfig(nextConfig);
    saveStoredConfig(nextConfig);
  }

  function handleJwtTokenChange(nextToken: string) {
    setJwtToken(nextToken);
    saveStoredJwt(nextToken);
  }

  async function handleHealthCheck() {
    await runBackendCheck("Health", () => createHttpClient(config).getHealth());
  }

  async function handleReadyCheck() {
    await runBackendCheck("Ready", () => createHttpClient(config).getReady());
  }

  async function handleCurrentUserCheck() {
    await createHttpClient(config).getCurrentUser(jwtToken);
  }

  async function runBackendCheck(
    label: string,
    check: () => Promise<{ status: string; service: string }>,
  ) {
    setBackendStatus({ state: "checking", label: `${label} check running` });
    try {
      const result = await check();
      setBackendStatus({
        state: "ok",
        label: `${label}: ${result.service} is ${result.status}`,
      });
    } catch (error) {
      setBackendStatus({
        state: "error",
        label: error instanceof Error ? error.message : `${label} check failed`,
      });
    }
  }

  return (
    <AppShell>
      <div className="demo-layout">
        <SettingsPanel
          config={config}
          backendStatus={backendStatus}
          jwtToken={jwtToken}
          onConfigChange={handleConfigChange}
          onJwtTokenChange={handleJwtTokenChange}
          onCheckCurrentUser={handleCurrentUserCheck}
          onCheckHealth={handleHealthCheck}
          onCheckReady={handleReadyCheck}
        />
        <ChatPanel />
      </div>
    </AppShell>
  );
}
