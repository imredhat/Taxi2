Requirements Document for "Pooyesh Taxi" Platform (3V_Pooyesh)
🎯 Project Grand Objective
Design and develop the new version of the "Pooyesh Taxi" platform, including website, admin panel, passenger app, and driver app.

Goal: Transition from a semi-intelligent system to a fully automated, scalable platform with professional UI and smooth UX, even in poor internet conditions.

Prerequisite: Design database architecture, operational flowcharts, and integrated documentation.

🧩 Overall Architecture (4 Portals Connected to a Single Database)
1. Website (Public Portal)
Fare inquiry without registration

Trip request with details: origin/destination on map, date, time, passenger count, cargo volume, special conditions (pets, smoking), vehicle category selection

Payment gateway integration (Recommended: Sertap)

SEO compliance, fully responsive, fast loading

2. Admin Dashboard
Dispatching: Fare inquiry, service registration by support staff, assignment to driver, map monitoring with color coding and Tooltips

Support staff sends location link and address to driver

User management: Document verification, driver approval, activation after approval

Data migration: Transfer existing data (drivers, services, customers)

Financial module: Wallet, multi-accounts, invoice, revenue sharing (platform, personnel, driver), Excel/PDF reports

Dynamic settings: Rate management (traffic, distance, time, tolls, vehicle category) without code changes

CMS: Publish articles and pages from dashboard (WordPress replacement)

Discount system: Auto-generate and assign discount codes

Complete logging of all user and service activities

3. Single Sign-On (SSO)
Unique identifier: National ID + mobile number for OTP

Customer profile: User type (individual/corporate), organization name, national ID card image, date of birth, email, address, profile picture

Driver profile (mandatory): Secondary contact number, exact address (city separate), live selfie, live vehicle image, vehicle registration card (both sides), VIN code, insurance, rules acceptance confirmation

4. Passenger App (Android, iOS, WebApp)
Simultaneous fare inquiry across different categories, booking, wallet top-up, trip history, invoices

During-trip features: Live tracking, driver details, support chat, location sharing, SOS button

Prioritization: Select drivers from previous trips

5. Driver App (Android, iOS)
Status toggle (offline/online), background push notifications

Built-in navigation or third-party navigation integration

Wallet and income history viewing (only their share, not total fare)

Register multiple vehicles per driver

⚙️ Base Definitions and Workflow
Definitions:

Standard trip: 1–3 passengers + 2 handbags + 1 suitcase + 1 origin and 1 destination (more = extra charge)

Customer = Registrar and Payer (may not be the passenger; if so, passenger details are entered in the form)

Vehicle Categories:

Eco Urban (City): Pride, Tiba, 206, Quick

Eco (Intercity): Samand, Peugeot, Pars

Eco+: Ario, Brilliance

VIP: Prius, Fluence, Accent

VIP+: Sonata, Camry, Krowal

SUV VIP: Santa Fe, Rav4

Van C: Hiace, Hyundai H350

🔄 Workflow
Passenger submits request

System reviews and accepts

Dispatch to qualified drivers

Driver accepts and issues pro-forma invoice

Down payment (platform share + percentage of driver share)

Exchange of contact info (call/SMS)

Passenger boarding (trip begins)

Trip completion and remaining balance settlement

Rating submission

Cancellation Rules:

Up to 1 hour before departure: 20% penalty

Less than 1 hour: 50% penalty

More than 15 minutes delay at origin = extra charge

After boarding, payment is non-refundable

🧮 Pricing Algorithm (Dynamic Engine)
Intercity Trips:

text
Fare = (B + (D × P_d) + (T × P_t)) × M_c × M_s + E
B: Base cost

D: Distance (km), P_d: Rate per km

T: Estimated time (minutes), P_t: Rate per minute

M_c: Vehicle category coefficient (ECO=1.0, VIP=1.4 to 1.6)

M_s: Dynamic coefficient (weather, route conditions; 1.0 to 2.0)

E: Additional costs (tolls, stops, possible return route)

Intracity Trips:

text
Fare = (B + (D × P_d) + (T_e × P_t)) × S_m + Z + E
T_e: Estimated time with real-time traffic (from map API)

S_m: Surge coefficient based on supply/demand in the area (Geohash), starting from 1.0 and up

Z: Entry fee for traffic restriction zone/pollution scheme

Round Trip: Distance doubled, base cost charged once, discount on return route

Note: B, P_d, and P_t values must be configurable per city/province through the dashboard.

🛠️ Technical and Infrastructure Requirements
Security: Security protocols to prevent breaches; protect national IDs and images

Real-Time: WebSockets for fleet tracking and request delivery without delay

Optimization: Minimize internet and battery consumption on driver devices

Server Cost: MVP architecture with low-cost servers but built-in scalability for future growth

Data Migration: Secure migration without data loss (drivers, customers, active services)

UI/UX: Modeled after Snap/Uber for simplicity and ease of use across all sections

🔮 Future Phase Vision
Add carpooling capability

Expand urban economical fleet (Eco Urban)

✅ How to Use This Memory
This document serves as the permanent reference for the AI. All responses, suggestions, analyses, and code related to this project will be based on it. This memory is editable if changes or updates are needed.

🚀 Full Tech Stack
Component	Technology
Website	Nuxt 3 (Vue.js) + Tailwind CSS
Admin Dashboard	Nuxt 3 (Vue.js) + Tailwind CSS
Backend	Node.js + Express.js + Prisma
Mobile App	React Native + TypeScript
Database	PostgreSQL + Redis
Real-Time	Socket.io
File Management	MinIO / S3
DevOps	Docker + Nginx
