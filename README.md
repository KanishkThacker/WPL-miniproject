# SomSat Mission Operations

The Vite app contains the SomSat mission landing page and a `/dashboard` mission console. The dashboard stores operator events in MongoDB through the Express API.

## Run locally

1. Install dependencies with `npm install`.
2. Start MongoDB. Use an installed MongoDB service, or run `docker compose up -d mongo`.
3. Copy `.env.example` to `.env` and set `MONGODB_URI` if your MongoDB address differs. The default is `mongodb://127.0.0.1:27017/somsat_mission_ops`.
4. In one terminal run `npm run server`. It starts the API on port 4000 and connects to MongoDB.
5. In another terminal run `npm run dev`. Open the `/dashboard` URL on the local address Vite prints; Vite may choose a port other than 5173 if that port is already in use.

Keep both processes running while using the dashboard. Vite proxies `/api` requests to the API server. If Vite was already running before the proxy was configured, restart it so it reloads `vite.config.js`.

### If mission records do not load

Check that MongoDB is running, then check the API health endpoint:

```sh
curl http://127.0.0.1:4000/api/health
```

It should return `{"status":"ok","database":"connected"}`. If the API is unavailable, start it with `npm run server`. If the API responds but MongoDB is disconnected, start MongoDB and restart the API. If the dashboard still shows a 404 or an API error, restart the Vite process and reload `/dashboard`.

To add sample mission events to an empty collection, run `npm run seed`. The seed command leaves existing records unchanged.

## API

The API listens on port 4000 by default. Vite proxies `/api` requests to it while developing.

| Method | Endpoint | Action |
| --- | --- | --- |
| GET | `/api/health` | Check API and MongoDB connection state |
| GET | `/api/events` | List mission events |
| GET | `/api/events/:id` | Read one mission event |
| POST | `/api/events` | Create a mission event |
| PATCH | `/api/events/:id` | Update a mission event |
| DELETE | `/api/events/:id` | Delete a mission event |

The server can serve the built frontend after `npm run build` by running `npm start`. It binds to `127.0.0.1` by default; set `HOST=0.0.0.0` in the deployment environment when the host needs to accept external connections.

Telemetry cards are clearly marked as simulated; mission event records are read from MongoDB.
