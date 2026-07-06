import type { AppConfig } from "../config/env";

export type HttpClient = {
  config: AppConfig;
};

export function createHttpClient(config: AppConfig): HttpClient {
  return { config };
}
