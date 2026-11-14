# Live dispatch

PostgreSQL owns the reservation and assignment. Migration 009 records changes in a transactional outbox and wakes the projector after commit. Redis holds the current offer list and forwards room invalidations across API processes. Driver clients fetch a snapshot on entry, reconnect, location change or a relevant invalidation. Passenger clients fetch only their own reservation after an event.

1. Apply migration 009 using `npm run db:migrate:passenger`.
2. Configure `DISPATCH_REDIS_URL` on every API process with the same private Redis 6.2+ instance and `noeviction`. Configure authenticated access and TLS for deployments across hosts.
3. In production, set a private `JWT_SECRET` (at least 32 bytes) and set `DISPATCH_WEB_ORIGINS` to the exact origins of the driver and passenger web apps.
4. Forward WebSocket upgrades at `/dispatch/socket.io` through the HTTPS reverse proxy. The clients use WebSocket transport and re-fetch the API snapshot after reconnect.

While Redis or the socket is unavailable, snapshots fall back to PostgreSQL and clients use slower refreshes. The outbox catches up after Redis returns. During normal operation, clients stop periodic refreshes after the subscription succeeds. Driver rooms receive invalidation signals, and the API rechecks vehicle eligibility and radius before returning addresses. If Redis is flushed, the projector rebuilds the basket from PostgreSQL.

Track outbox depth and age, offer API latency, socket reconnect rate, and Redis memory before raising the rollout limit.

## Android chat push

Apply migration 011, then set `FCM_SERVICE_ACCOUNT_FILE` on the server to the service-account JSON for a Firebase project with Cloud Messaging HTTP v1 enabled. Keep this credential outside source control. Register both Android application IDs in the same project. Set `GOOGLE_SERVICES_JSON` to the corresponding Android app configuration when building each Expo app. Install the rebuilt Android apps and grant notification permission. The passenger app uses its existing notification preference and device registration. The driver app requests Android notification permission after sign-in.

Foreground chat uses authenticated dispatch sockets. Opening an Android notification from the background routes to the authorized conversation.
