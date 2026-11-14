# UserApp

Expo application for passengers, supporting web and Android.

## Map setup

Copy `.env.example` to `.env` and supply `EXPO_PUBLIC_NESHAN_MAP_KEY` with a Neshan **Web SDK** key (`web.`). Set `EXPO_PUBLIC_NESHAN_SERVICE_KEY` to the separate `service.` key for search and reverse geocoding. This key is separate from the map key; it cannot render map tiles. `.env` is ignored by Git. Expo public environment variables are included in the application bundle.

Android/iOS render the official Neshan Leaflet SDK in `react-native-webview`. The SDK and map tiles need an internet connection. If the Web SDK key has domain restrictions, set `EXPO_PUBLIC_NESHAN_MAP_BASE_URL` to an HTTPS origin permitted by that key; the default is `https://localhost/`. Verify it in the Neshan panel before a release. SDK setup: https://platform.neshan.org/docs/sdk/web/leaflet/neshan-leaflet-sdk/

Restart Metro after changing environment variables:

```sh
npm install
npx expo start --clear
```

Use a compatible Expo Go app on Android, or create a new native build with `npm run android` (requires Java, Android SDK and a device/emulator). An older custom APK must be rebuilt to include `react-native-webview`.

Native selection supports multiple origins, then destinations, with drag-to-move numbered markers, pinch zoom and +/− buttons. Search only moves the camera. Addresses, removal and row ordering are shared with web. Moving a marker refreshes its address; stale responses for previous coordinates are discarded.

## Checks

```sh
node --test tests/*.test.cjs
npx tsc --noEmit
npx expo export --platform android --output-dir .expo/android-check
npx expo export --platform web --output-dir .expo/web-check
```

Exports validate JavaScript packaging. They do not produce an APK or verify touch interaction on a physical Android device.

## Passenger APIs and navigation

All screens use AppHeader and its hamburger drawer. Dedicated passenger APIs are documented in `../Server/docs/passenger-api.md` and the OpenAPI JSON alongside it. Set `EXPO_PUBLIC_API_URL` to the backend origin (the development defaults are port 3001 on the web host, 10.0.2.2:3001 on Android emulator, and localhost:3001 on iOS simulator). Physical devices require a reachable LAN address or HTTPS origin.

OTP login now calls the server and stores a verified JWT. Old `otp-session-*` demo sessions cannot register a reservation. The fleet comes from `/api/passenger/packages`, never the admin base-fares endpoint. Saving a draft and registering a reservation are separate actions; successful server registration stores its tracking ID and pending status. The final confirmation action in draft details uses the same idempotent server API.

Drafts are saved to the passenger account and cached locally. Failed saves keep the local copy for retry. Account refresh follows all result pages for drafts, reservations and notifications. Reservation details load current server state and allow cancellation while pending/searching. Assigned trips have their own details, driver information, paginated messages, completed-trip ratings and wallet/bank payment actions.

Wallet shows real balances, frozen funds, paginated ledger and bank payment history. Top-up input is in toman and converted to exact integer rial. Checkout uses a POST to Saman (a separate browser tab on web, a WebView on Android/iOS). Returning to the app allows server verification; client navigation never credits a wallet. Pending payments can be reopened from history. Completed payment refund requests open support tickets, not automatic refunds. `SEP_TERMINAL_ID` and `PUBLIC_API_URL` are still required on the server before live payment can start.

Profile supports name, email, gender and a Jalali birth date converted to the Gregorian API format. Settings read/write account preferences. Support includes ticket creation, history, paginated conversations and closing tickets. FAQ, about and terms use published CMS content; unpublished content is not replaced with invented information. Saved addresses use favorites CRUD and can be reused on the map.

Device-token registration and removal are connected through Settings, account restoration and logout. Native push uses `expo-notifications` with a real FCM/APNs token. A native development/production build and platform push credentials are required; Expo Go does not support remote push. Configure Firebase (`google-services.json` / Android config) or iOS push credentials before enabling device notifications. Web retains in-app notifications; web push is not configured. Reference: https://docs.expo.dev/versions/latest/sdk/notifications/

Passenger server migrations: `npm run db:migrate:passenger` from Server. Integration tests use a local database transaction, mock the Saman service and roll back fixtures. No live payment is made by tests.

## Server fare quotes

Booking uses `/api/passenger/fare-quotes` for available vehicle classes, from the seven-package catalog, with city ECO unavailable for intercity bookings, route duration/distance and fare breakdowns. Local arithmetic no longer calculates a fare. A quote belongs to one passenger and itinerary and expires after ten minutes; changed/expired trips must be quoted again. Server reservations store the quoted rial amount; UI displays toman. Detailed pricing precedence, rule scope and provider configuration: `../Server/docs/passenger-api.md`.
