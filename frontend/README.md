# Weather App Frontend

React + Vite + TypeScript frontend for the Weather App. The app talks to the NestJS backend only; it never calls OpenWeather directly and does not expose an OpenWeather API key.

## Install

```bash
npm install
```

## Environment

Create a `.env` file in `frontend/`:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

## Run

Start the backend first, then run:

```bash
npm run dev
```

Vite will print the local frontend URL, usually `http://localhost:5173`.

## Test

```bash
npm test
```

## Build

```bash
npm run build
```
