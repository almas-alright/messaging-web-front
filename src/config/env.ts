export type AppConfig = {
  apiBaseUrl: string;
  wsBaseUrl: string;
};

export const defaultConfig: AppConfig = {
  apiBaseUrl: "http://localhost:8080",
  wsBaseUrl: "ws://localhost:8080/ws",
};
