# FuelWise

> Find the cheapest gas station near you — powered by Spain's official fuel price registry.

FuelWise is a React Native app (Expo) that gives drivers in Spain real-time access to fuel prices across every gas station in the country. Browse by province or municipality, filter by fuel type, and let your location do the work.

---

## Features

- **Live prices** — data pulled directly from the Spanish government's official MITECO API, updated multiple times per day
- **Search by location** — uses your GPS to find nearby stations
- **Filter by province or municipality** — narrow down results to your area
- **20+ fuel types** — Gasoline 95/98, Diesel, Premium Diesel, Biodiesel, LPG, CNG, LNG, Hydrogen, AdBlue, and more
- **Fuel log** — track your personal fill-up history
- **Stats** — visualize your spending over time
- **Offline-aware** — graceful handling when the network is unavailable
- **i18n ready** — English and Spanish supported

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native + Expo 54 |
| Language | TypeScript |
| State | Zustand |
| Data fetching | TanStack Query v5 |
| Navigation | React Navigation (bottom tabs) |
| Validation | Zod |
| HTTP | Axios |
| Icons | Lucide React Native |
| i18n | i18next |
| Location | expo-location |

---

## Getting Started

**Prerequisites:** Node.js 18+, Expo CLI, and either the Expo Go app or a local simulator.

```bash
# Clone the repo
git clone https://github.com/pabloconejero/fuelwise.git
cd fuelwise

# Install dependencies
npm install

# Copy the env template and fill in any values
cp .env.example .env

# Start the dev server
npm run start
```

Then scan the QR code with Expo Go, or press `a` for Android / `i` for iOS.

```bash
npm run android   # Android emulator
npm run ios       # iOS simulator
npm run test      # Jest test suite
npm run lint      # ESLint
```

---

## Data Source

FuelWise uses Spain's free public API maintained by the Ministry for Ecological Transition (MITECO):

```
https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/
```

No API key required. Data is public and updated throughout the day.

---

## Project Structure

```
src/
├── api/          # HTTP client, endpoint definitions, response types
├── services/     # Business logic and data mapping (minetur service layer)
├── hooks/        # Custom hooks — the bridge between services and UI
├── store/        # Zustand global stores
├── screens/      # One file per screen, composed from components
├── components/   # Reusable UI components
├── navigation/   # React Navigation setup
├── i18n/         # Translation files (es.json, en.json)
├── utils/        # Pure utility functions
└── config/       # Environment and app configuration
```

---

## Contributing

1. Fork the repo and create a branch: `feature/your-feature`, `fix/the-bug`, or `chore/task`
2. Make your changes — screens only compose components, logic lives in hooks or utils
3. All user-facing strings must use i18n keys — no hardcoded text
4. Run `npm run lint` and `npm run test` before opening a PR
5. Never commit `.env` values or API keys

---

## License

MIT
