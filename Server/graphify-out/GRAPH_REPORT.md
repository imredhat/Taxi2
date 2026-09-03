# Graph Report - .  (2026-07-10)

## Corpus Check
- Corpus is ~14,312 words - fits in a single context window. You may not need a graph.

## Summary
- 146 nodes · 146 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 1% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Driver Management
- Database Schema
- Package Metadata
- Ride Management
- Auth & Database
- App Entry Point
- User Management
- File Upload
- NPM Dependencies
- Port Cleanup
- NPM Scripts
- Database Config

## God Nodes (most connected - your core abstractions)
1. `Pooyesh Taxi Platform` - 12 edges
2. `scripts` - 6 edges
3. `Drivers Table` - 4 edges
4. `Ride Requests Table` - 4 edges
5. `repository` - 3 edges
6. `Trip Workflow` - 3 edges
7. `Rides Table` - 3 edges
8. `bugs` - 2 edges
9. `Dynamic Pricing Algorithm` - 2 edges
10. `Passengers Table` - 2 edges

## Surprising Connections (you probably didn't know these)
- `Uploaded Image Asset` --references--> `Pooyesh Taxi Platform`  [AMBIGUOUS]
  uploads/322e33d9d5640986c31ed0433d9b44b7.png → IDEA.md
- `Passengers Table` --implements--> `Pooyesh Taxi Platform`  [INFERRED]
  app/database/README.md → IDEA.md
- `Drivers Table` --implements--> `Pooyesh Taxi Platform`  [INFERRED]
  app/database/README.md → IDEA.md
- `Ride Requests Table` --references--> `Trip Workflow`  [INFERRED]
  app/database/README.md → IDEA.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Four-Portal Platform Architecture** — idea_md_website_portal, idea_md_admin_dashboard, idea_md_passenger_app, idea_md_driver_app [EXTRACTED 1.00]
- **Ride Lifecycle Data Flow** — app_database_readme_ride_requests_table, app_database_readme_ride_request_offers_table, app_database_readme_rides_table, app_database_readme_payments_table, app_database_readme_ratings_table [EXTRACTED 1.00]

## Communities (12 total, 2 thin omitted)

### Community 1 - "Database Schema"
Cohesion: 0.10
Nodes (22): Driver Locations Table (PostGIS), Drivers Table, Passengers Table, Payments Table, Ratings Table, Ride Request Offers Table, Ride Requests Table, Rides Table (+14 more)

### Community 2 - "Package Metadata"
Cohesion: 0.12
Nodes (15): author, bugs, url, description, devDependencies, nodemon, homepage, license (+7 more)

### Community 3 - "Ride Management"
Cohesion: 0.13
Nodes (4): pool, ctrl, express, router

### Community 4 - "Auth & Database"
Cohesion: 0.15
Nodes (8): bcrypt, pool, { Pool }, authController, express, router, bcrypt, pool

### Community 5 - "App Entry Point"
Cohesion: 0.15
Nodes (11): app, authRoutes, driverRoutes, express, path, rideRoutes, uploadRoutes, userRoutes (+3 more)

### Community 6 - "User Management"
Cohesion: 0.20
Nodes (4): pool, express, router, userController

### Community 7 - "File Upload"
Cohesion: 0.22
Nodes (7): crypto, express, multer, path, router, storage, upload

### Community 8 - "NPM Dependencies"
Cohesion: 0.25
Nodes (8): dependencies, bcrypt, dotenv, express, @mimo-ai/mimocode-windows-x64, @mimo-ai/mimocode-windows-x64-baseline, multer, pg

### Community 9 - "Port Cleanup"
Cohesion: 0.29
Nodes (5): { execSync }, here, pidsToKill, PORTS, wmic

### Community 10 - "NPM Scripts"
Cohesion: 0.33
Nodes (6): scripts, db:migrate, dev, kill, start, test

## Ambiguous Edges - Review These
- `Pooyesh Taxi Platform` → `Uploaded Image Asset`  [AMBIGUOUS]
  uploads/322e33d9d5640986c31ed0433d9b44b7.png · relation: references

## Knowledge Gaps
- **79 isolated node(s):** `{ Pool }`, `pool`, `bcrypt`, `pool`, `bcrypt` (+74 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Pooyesh Taxi Platform` and `Uploaded Image Asset`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `dependencies` connect `NPM Dependencies` to `Package Metadata`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `scripts` connect `NPM Scripts` to `Package Metadata`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Pooyesh Taxi Platform` (e.g. with `Drivers Table` and `Passengers Table`) actually correct?**
  _`Pooyesh Taxi Platform` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `{ Pool }`, `pool`, `bcrypt` to the rest of the system?**
  _80 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Driver Management` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Database Schema` be split into smaller, more focused modules?**
  _Cohesion score 0.09956709956709957 - nodes in this community are weakly interconnected._