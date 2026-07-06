import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Betopia messaging</p>
          <h1>Local chat demo</h1>
        </div>
        <span className="status-pill">Skeleton</span>
      </header>
      {children}
    </main>
  );
}
