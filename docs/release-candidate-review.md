# Release Candidate Review

Date: 2026-07-06

## 11.01 Build Checks

- `npm install --loglevel=error`: passed.
- `npm run build -- --clearScreen false`: passed.
- `docker compose config`: passed.
- `docker build --build-arg VITE_API_BASE_URL=http://10.10.33.97:8080 --build-arg VITE_WS_BASE_URL=ws://10.10.33.97:8080/ws -t messaging-web-front:rc .`: passed.
- `npm run lint`: not configured; `package.json` has no `lint` script.
