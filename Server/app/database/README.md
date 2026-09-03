# Taxi2 Database Schema

## Tables Overview

### Core Tables

| Table | Description |
|-------|-------------|
| `drivers` | Driver accounts with status, rating, verification |
| `vehicles` | Vehicle details linked to drivers |
| `driver_locations` | Real-time driver GPS tracking (PostGIS) |
| `passengers` | Passenger/rider accounts |
| `passenger_locations` | Passenger location tracking |
| `ride_requests` | Ride booking requests |
| `ride_request_offers` | Driver offers for ride requests |
| `rides` | Active and completed trips |
| `ride_locations` | GPS tracking during rides |
| `ratings` | Driver/passenger ratings |
| `payments` | Payment records |
| `favorite_locations` | Saved places for users |

## Entity Relationships

```
drivers (1) ──── (1) vehicles
drivers (1) ──── (1) driver_locations
drivers (1) ──── (many) ride_request_offers
drivers (1) ──── (many) rides
drivers (1) ──── (many) ratings

passengers (1) ── (1) passenger_locations
passengers (1) ── (many) ride_requests
passengers (1) ── (many) rides

ride_requests (1) ── (many) ride_request_offers
ride_requests (1) ── (0..1) rides

rides (1) ── (many) ride_locations
rides (1) ── (many) payments
rides (1) ── (many) ratings
```

## Key Features

- **PostGIS Integration**: Geospatial queries for nearby drivers and location-based matching
- **UUID Primary Keys**: Better for distributed systems
- **Automatic Timestamps**: `created_at` and `updated_at` with triggers
- **Soft Deletion**: `is_active` flags instead of hard deletes
- **Status Enums**: CHECK constraints for valid status values

## Status Values

### Driver Status
- `offline` - Not available
- `online` - Available for rides
- `busy` - On an active ride

### Ride Request Status
- `pending` - Awaiting driver acceptance
- `accepted` - Driver accepted
- `expired` - No driver accepted in time
- `cancelled` - Passenger cancelled

### Ride Status
- `accepted` - Driver accepted the request
- `arriving` - Driver heading to pickup
- `in_progress` - Ride in progress
- `completed` - Ride finished
- `cancelled` - Ride cancelled

## Migration

```bash
psql -U your_user -d taxi2 -f src/database/migrations/001_initial_schema.sql
```
