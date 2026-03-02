# API Cache Toolbar

Caches API responses during development to avoid hitting live APIs repeatedly. Provides an Astro dev toolbar panel to inspect cached entries, clear the cache, and toggle between cached and live data.

## Setup

### 1. Add the integration to `astro.config.mjs`

```javascript
import apiCacheToolbar from './integrations/nhl-cache-toolbar/index.ts';

export default defineConfig({
    integrations: [
        apiCacheToolbar({ cacheDir: 'nhl' }),  // or 'api' for generic use
    ],
});
```

### 2. Wrap your ky instance with `withCache`

```javascript
import ky from 'ky';
import { withCache } from './integrations/nhl-cache-toolbar/cache';

const api = withCache(ky.create({ prefixUrl: 'https://api.example.com' }));
```

All requests made through this instance will be cached in development. Production builds ignore the cache.

## Options

| Option     | Default   | Description                                      |
| ---------- | --------- | ------------------------------------------------ |
| `cacheDir` | `'api'`   | Subdirectory under `baseDir` for cache files      |
| `baseDir`  | `'.cache'`| Root directory for the cache                     |
| `ttl`      | 4 hours   | Max age in ms before treating entries as stale   |

## URL-to-filename

API URLs are converted into readable, filesystem-safe filenames:

- **Path:** Pathname segments are sanitized and joined with `-`
- **Query string:** Each param becomes `key-value`; params are joined with `_`

Examples:

- `https://api.example.com/v1/users/123` → `v1-users-123`
- `https://api.example.com/search?q=foo&limit=10` → `search-q-foo_limit-10`
- `https://api.example.com/users?page=2&sort=name` → `users-page-2_sort-name`

## Toolbar

When the dev server is running, the toolbar shows an API Cache icon. Click it to:

- **Live/Cache toggle** — Bypass cache reads and fetch from the live API (responses are still written to cache)
- **Clear All** — Delete all cached entries
- **Per-entry Clear** — Remove a single cached response

**Badge states:**

- **Info** — Live mode is active
- **Warning** — Cache is empty (first run)
- **None** — Cache has entries and cache mode is active
