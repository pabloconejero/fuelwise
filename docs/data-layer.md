# Data Layer — Usage Guide

This document covers how to use the minetur API integration in screens and components.

## Contents

1. [Quick start](#quick-start)
2. [Hooks](#hooks)
   - [useStationsByMunicipality](#usestationsbymunicipality)
   - [useStationsByProvince](#usestationsbyprovince)
   - [useProvinces](#useprovinces)
   - [useMunicipalities](#usemunicipalities)
   - [useFuelProducts](#usefuelproducts)
   - [useCommunities](#usecommunities)
3. [AsyncResource shape](#asyncresource-shape)
4. [Types reference](#types-reference)
5. [Caching](#caching)
6. [Error handling](#error-handling)
7. [Direct facade access](#direct-facade-access)
8. [Utility functions](#utility-functions)

---

## Quick start

```tsx
import { useStationsByMunicipality } from '../hooks/useStations';
import { useFuelProducts } from '../hooks/useFuelProducts';

export default function HomeScreen() {
  const { data, loading, error, refresh } = useStationsByMunicipality('4554');

  if (loading) return <ActivityIndicator />;
  if (error)   return <Text>{error.message}</Text>;

  return (
    <FlatList
      data={data?.stations}
      refreshing={false}
      onRefresh={refresh}
      renderItem={({ item }) => <StationCard station={item} />}
    />
  );
}
```

---

## Hooks

All hooks return an [`AsyncResource<T>`](#asyncresource-shape) object. Pass `null` as an ID to keep the hook idle (useful before the user has made a selection).

### useStationsByMunicipality

Fetches all gas stations in a municipality, optionally filtered to a single fuel type.

```ts
import { useStationsByMunicipality } from '../hooks/useStations';

const resource = useStationsByMunicipality(
  municipalityId: string | null,
  fuel?: FuelCode,
)
// → AsyncResource<StationsResult>
```

| Parameter | Type | Description |
|---|---|---|
| `municipalityId` | `string \| null` | Municipality ID from the `/Listados/` endpoints. `null` = idle. |
| `fuel` | `FuelCode` (optional) | Filter to one fuel type. Uses a smaller API payload when set. |

**Examples:**

```tsx
// All fuels for municipality 4554 (Ajalvir, Madrid)
const { data } = useStationsByMunicipality('4554');

// Only Diesel A stations
const { data } = useStationsByMunicipality('4554', 'GOA');

// Idle — no request sent until user picks a municipality
const { data } = useStationsByMunicipality(null);
```

---

### useStationsByProvince

Same as above but at province scope. Useful for a map or stats view across an entire province.

```ts
import { useStationsByProvince } from '../hooks/useStations';

const resource = useStationsByProvince(
  provinceId: string | null,
  fuel?: FuelCode,
)
// → AsyncResource<StationsResult>
```

```tsx
// All stations in Madrid province (ID "28")
const { data } = useStationsByProvince('28');

// 98 E5 stations in Cataluña province (ID "08")
const { data } = useStationsByProvince('08', 'G98E5');
```

---

### useProvinces

Fetches the list of all 52 Spanish provinces. Cached for 30 days.

```ts
import { useProvinces } from '../hooks/useProvinces';

const { data } = useProvinces();
// data: Province[] | undefined
```

```tsx
// Typical usage: populate a province picker
const { data: provinces, loading } = useProvinces();

<Picker>
  {provinces?.map(p => (
    <Picker.Item key={p.id} label={p.name} value={p.id} />
  ))}
</Picker>
```

---

### useMunicipalities

Fetches municipalities within a province. Pass the province ID from `useProvinces`. Cached 30 days per province.

```ts
import { useMunicipalities } from '../hooks/useMunicipalities';

const resource = useMunicipalities(provinceId: string | null)
// → AsyncResource<Municipality[]>
```

```tsx
const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
const { data: municipalities } = useMunicipalities(selectedProvince);
// municipalities is undefined while selectedProvince is null
```

---

### useFuelProducts

Fetches the master list of all fuel products from the API (IDs, full names, abbreviations). Cached 30 days.

```ts
import { useFuelProducts } from '../hooks/useFuelProducts';

const { data: products } = useFuelProducts();
// data: FuelProduct[] | undefined
```

```tsx
// Populate a fuel selector
const { data: products } = useFuelProducts();

<Picker>
  {products?.map(p => (
    <Picker.Item key={p.id} label={p.name} value={p.id} />
  ))}
</Picker>
```

---

### useCommunities

Fetches the 19 autonomous communities. Cached 30 days.

```ts
import { useCommunities } from '../hooks/useCommunities';

const { data: communities } = useCommunities();
// data: Community[] | undefined
```

---

## AsyncResource shape

Every hook returns this object:

```ts
interface AsyncResource<T> {
  data:       T | undefined;   // undefined until first successful load
  error:      Error | null;    // last error, or null
  loading:    boolean;         // true only on the initial fetch (no data yet)
  refreshing: boolean;         // true when refresh() is in flight
  refresh:    () => Promise<void>;
}
```

**`loading` vs `refreshing`:**

- `loading === true` — no data has been fetched yet. Show a full-screen spinner.
- `refreshing === true` — data exists but a refresh is in flight. Use this for pull-to-refresh indicators (`<FlatList refreshing={refreshing} onRefresh={refresh} />`).

```tsx
const { data, loading, refreshing, error, refresh } = useStationsByMunicipality(id);

// Full-screen spinner on first load
if (loading) return <ActivityIndicator size="large" />;

// Inline error (data may still be shown underneath)
if (error && !data) return <ErrorView message={error.message} />;

return (
  <FlatList
    data={data?.stations}
    refreshing={refreshing}
    onRefresh={refresh}
    renderItem={...}
  />
);
```

---

## Types reference

### `Station`

```ts
interface Station {
  id:           string;        // IDEESS from the API
  brand:        string;        // e.g. "REPSOL", "CEPSA", "BP"
  address:      string;
  postalCode:   string;
  schedule:     string;        // raw string, e.g. "L-D: 24H"
  latitude:     number;
  longitude:    number;
  side:         'left' | 'right' | 'center' | 'unknown';
  locality:     string;
  municipality: { id: string; name: string };
  province:     { id: string; name: string };
  community:    { id: string };
  saleType:     'public' | 'restricted' | 'unknown';
  bioethanolPct: number | null;
  biodieselPct:  number | null;
  prices:       FuelPrices;    // see below
}
```

### `FuelPrices`

A partial record of `FuelCode → number` (euros per litre). **Absence of a key means the station does not sell that fuel** — never assume `0` means not sold.

```ts
type FuelPrices = Partial<Record<FuelCode, number>>;

// Access examples:
const g95 = station.prices.G95E5;        // number | undefined
const diesel = station.prices.GOA;        // number | undefined
const hasDiesel = 'GOA' in station.prices;
```

### `FuelCode`

All supported fuel codes:

| Code | Fuel |
|---|---|
| `G95E5` | Gasoline 95 E5 |
| `G95E10` | Gasoline 95 E10 |
| `G95E25` | Gasoline 95 E25 |
| `G95E85` | Gasoline 95 E85 |
| `G95E5_PREMIUM` | Gasoline 95 E5 Premium |
| `G98E5` | Gasoline 98 E5 |
| `G98E10` | Gasoline 98 E10 |
| `GOA` | Diesel A (gasoleo A habitual) |
| `GOA_PREMIUM` | Diesel Premium |
| `GOB` | Diesel B |
| `GLP` | LPG |
| `GNC` | CNG |
| `GNL` | LNG |
| `BIE` | Bioethanol |
| `BIO` | Biodiesel |
| `H2` | Hydrogen |
| `ADB` | AdBlue |
| `AMO` | Ammonia |
| `MET` | Methanol |
| `DREN` | Renewable Diesel |
| `GREN` | Renewable Gasoline |
| `BGNC` | Compressed Biogas |
| `BGNL` | Liquefied Biogas |

### `StationsResult`

```ts
interface StationsResult {
  fetchedAt: Date;       // timestamp from the API server (Europe/Madrid)
  stations:  Station[];
  note:      string;     // informational note from the API, usually empty
  resultOk:  boolean;    // false if the API returned a non-OK status
}
```

### `Province`

```ts
interface Province {
  id:            string;  // e.g. "28"
  communityId:   string;  // e.g. "13"
  name:          string;  // e.g. "MADRID"
  communityName: string;  // e.g. "Madrid"
}
```

### `Municipality`

```ts
interface Municipality {
  id:            string;  // e.g. "4554"
  provinceId:    string;
  communityId:   string;
  name:          string;  // e.g. "Ajalvir"
  provinceName:  string;
  communityName: string;
}
```

### `FuelProduct`

```ts
interface FuelProduct {
  id:           string;  // API product ID, e.g. "3" for G95 E5
  name:         string;  // "Gasolina 95 E5"
  abbreviation: string;  // "G95E5"
}
```

---

## Caching

The cache is transparent — hooks and the facade handle it automatically.

### Station prices (daily invalidation)

Station data is cached once per **Madrid calendar day** (Europe/Madrid timezone). On the first call of any new day, a fresh fetch is made regardless of the device's local timezone. This matches Spain's official price-update schedule.

Cache key pattern: `fuelwise:v1:minetur:stations:municipality:<id>[:<FuelCode>]`

### Reference data (30-day TTL)

Provinces, municipalities, communities, and fuel products rarely change. They are cached for 30 days.

Cache key pattern: `fuelwise:v1:minetur:<kind>[:<id>]`

### Force refresh

Use `refresh()` from a hook to force a network fetch (bypasses cache):

```tsx
const { data, refresh } = useStationsByMunicipality('4554');

// e.g. inside pull-to-refresh handler:
<FlatList onRefresh={refresh} refreshing={refreshing} />
```

To force-refresh from outside a hook, use the facade directly:

```ts
import { minetur } from '../api/minetur';

await minetur.getStationsByMunicipality('4554', { force: true });
```

### Clear all cached data

```ts
import { createCache } from '../api/minetur/cache';
import AsyncStorage from '@react-native-async-storage/async-storage';

const cache = createCache(AsyncStorage);
await cache.clearAll(); // removes all fuelwise:v1:minetur:* keys
```

---

## Error handling

All errors from the API layer are typed:

| Class | When thrown |
|---|---|
| `MineturApiError` | Non-2xx HTTP response, or API returns `ResultadoConsulta !== "OK"` |
| `MineturTimeoutError` | Request exceeded 10 000ms |
| `MineturNetworkError` | Network failure or JSON parse error |

In hooks, errors are caught and stored in the `error` field — they never propagate uncaught to React. For direct facade calls, wrap in try/catch:

```ts
import { minetur } from '../api/minetur';
import { MineturTimeoutError, MineturApiError } from '../api/minetur/errors';

try {
  const result = await minetur.getStationsByMunicipality('4554');
} catch (err) {
  if (err instanceof MineturTimeoutError) {
    // show offline / slow connection message
  } else if (err instanceof MineturApiError) {
    console.error('API error', err.status, err.body);
  }
}
```

---

## Direct facade access

Hooks are the preferred interface. For one-off calls (e.g. background tasks, navigation guards), use the facade directly:

```ts
import { minetur } from '../api/minetur';

// Reference data
const provinces     = await minetur.getProvinces();
const municipalities = await minetur.getMunicipalities('28');
const products      = await minetur.getFuelProducts();
const communities   = await minetur.getCommunities();

// Station prices — respects cache by default
const result = await minetur.getStationsByMunicipality('4554');
const byFuel = await minetur.getStationsByMunicipality('4554', { fuel: 'GOA' });
const fresh  = await minetur.getStationsByMunicipality('4554', { force: true });
const prov   = await minetur.getStationsByProvince('28');
```

All concurrent calls to the same endpoint are deduplicated — if two screens mount simultaneously and both request the same municipality, only one HTTP request is made.

---

## Utility functions

These are internal helpers used by the API layer, but they're usable anywhere:

### `parseSpanishNumber(value: string): number | null`

Converts a comma-decimal string to a JS number. Returns `null` for empty or invalid input.

```ts
import { parseSpanishNumber } from '../utils/parseSpanishNumber';

parseSpanishNumber('1,659')   // → 1.659
parseSpanishNumber('40,5280') // → 40.528
parseSpanishNumber('')        // → null
parseSpanishNumber('N/A')     // → null
```

### `parseSpanishDate(value: string): Date | null`

Parses the `"DD/MM/YYYY H:MM:SS"` format used by the minetur API.

```ts
import { parseSpanishDate } from '../utils/parseSpanishDate';

parseSpanishDate('14/04/2026 0:28:19') // → Date(2026-04-14 00:28:19)
parseSpanishDate('')                   // → null
```

### `dayKey(date: Date, tz?: string): string`

Returns a `"YYYY-MM-DD"` string in the given timezone (default: `'Europe/Madrid'`).

```ts
import { dayKey } from '../utils/dayKey';

dayKey(new Date())                          // → "2026-04-14" (in Madrid)
dayKey(new Date(), 'America/New_York')      // may return previous day
```
