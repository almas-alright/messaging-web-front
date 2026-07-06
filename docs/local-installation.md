# Local Installation Guide

This guide explains the intended local setup after implementation.

## Target Setup

Both apps run on the same Ubuntu PC:

```text
Ubuntu PC
├── messaging-service       # backend, port 8080
└── messaging-web-front     # frontend, port 5173
```

Other office computers access the frontend through the Ubuntu PC local IP.

## Backend

```bash
git clone https://github.com/almas-alright/messaging-service.git
cd messaging-service
cp .env.example .env
docker compose up --build
```

Check backend:

```bash
curl http://localhost:8080/health
curl http://localhost:8080/ready
```

## Frontend

After Phase 02 implementation:

```bash
git clone https://github.com/almas-alright/messaging-web-front.git
cd messaging-web-front
cp .env.example .env
npm install
npm run dev -- --host 0.0.0.0
```

## Environment

Example `.env` for same machine:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8080/ws
```

Example `.env` for LAN testing from other computers:

```env
VITE_API_BASE_URL=http://192.168.1.10:8080
VITE_WS_BASE_URL=ws://192.168.1.10:8080/ws
```

Replace `192.168.1.10` with your Ubuntu PC IP.

## Find Ubuntu IP

```bash
hostname -I
```

## Access From Another Computer

Open:

```text
http://192.168.1.10:5173
```

## Backend CORS

Backend must allow the frontend origin during local LAN testing.

Example allowed origins:

```text
http://localhost:5173
http://127.0.0.1:5173
http://192.168.1.10:5173
```

## Demo Inputs

Use backend README demo JWT tokens.

Default conversation:

```text
conv-001
```
