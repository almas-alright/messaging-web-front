import { useState } from "react";
import { createHttpClient, type CurrentUserResponse } from "./api/httpClient";
import {
  clearStoredJwt,
  loadStoredJwt,
  saveStoredJwt,
} from "./auth/demoAuthStorage";
import { AppShell } from "./components/AppShell";
import { SettingsPanel } from "./components/SettingsPanel";
import type { AppConfig } from "./config/env";
import { loadStoredConfig, saveStoredConfig } from "./config/storage";
import { ChatPanel } from "./features/chat/ChatPanel";

type BackendStatus = {
  state: "idle" | "checking" | "ok" | "error";
  label: string;
};

type AuthStatus = {
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
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    state: "idle",
    label: "JWT not checked",
  });
  const [currentUser, setCurrentUser] = useState<CurrentUserResponse | null>(
    null,
  );

  function handleConfigChange(nextConfig: AppConfig) {
    setConfig(nextConfig);
    saveStoredConfig(nextConfig);
  }

  function handleJwtTokenChange(nextToken: string) {
    setJwtToken(nextToken);
    saveStoredJwt(nextToken);
  }

  function handleJwtClear() {
    setJwtToken("");
    setCurrentUser(null);
    setAuthStatus({ state: "idle", label: "JWT cleared" });
    clearStoredJwt();
  }

  async function handleHealthCheck() {
    await runBackendCheck("Health", () => createHttpClient(config).getHealth());
  }

  async function handleReadyCheck() {
    await runBackendCheck("Ready", () => createHttpClient(config).getReady());
  }

  async function handleCurrentUserCheck() {
    setAuthStatus({ state: "checking", label: "Checking JWT" });
    setCurrentUser(null);
    try {
      const user = await createHttpClient(config).getCurrentUser(jwtToken);
      setCurrentUser(user);
      setAuthStatus({ state: "ok", label: "JWT accepted" });
    } catch (error) {
      setAuthStatus({
        state: "error",
        label:
          error instanceof Error ? error.message : "Current user check failed",
      });
    }
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
          authStatus={authStatus}
          jwtToken={jwtToken}
          currentUser={currentUser}
          onConfigChange={handleConfigChange}
          onJwtTokenChange={handleJwtTokenChange}
          onJwtClear={handleJwtClear}
          onCheckCurrentUser={handleCurrentUserCheck}
          onCheckHealth={handleHealthCheck}
          onCheckReady={handleReadyCheck}
        />
        <ChatPanel />
      </div>
    </AppShell>
  );
}
