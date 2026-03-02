import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration } from 'astro';
import { configure, getConfig, type CacheOptions } from './cache.ts';

type CacheEntry = {
    filename: string;
    label: string;
    sizeKb: number;
    ageMs: number;
    expired: boolean;
};

type CacheStatus = {
    entries: CacheEntry[];
    isLive: boolean;
    totalSizeKb: number;
};

const getCacheStatus = (): CacheStatus => {
    const config = getConfig();
    const cacheDir = path.join(config.baseDir, config.cacheDir);
    const isLive = fs.existsSync(config.bypassFile);

    if (!fs.existsSync(cacheDir)) {
        return { entries: [], isLive, totalSizeKb: 0 };
    }

    const now = Date.now();
    const files = fs.readdirSync(cacheDir).filter((f) => f.endsWith('.json'));

    const entries: CacheEntry[] = files.map((file) => {
        const filepath = path.join(cacheDir, file);
        const stat = fs.statSync(filepath);
        const filename = file.replace(/\.json$/, '');
        const ageMs = now - stat.mtimeMs;
        return {
            filename,
            label: filename.replace(/-/g, ' '),
            sizeKb: Math.round(stat.size / 1024),
            ageMs,
            expired: ageMs > config.ttl,
        };
    });

    entries.sort((a, b) => a.label.localeCompare(b.label));

    const totalSizeKb = entries.reduce((sum, e) => sum + e.sizeKb, 0);

    return { entries, isLive, totalSizeKb };
};

export default function apiCacheToolbar(options?: CacheOptions): AstroIntegration {
    configure(options);

    return {
        name: 'api-cache-toolbar',
        hooks: {
            'astro:config:setup': ({ addDevToolbarApp }) => {
                addDevToolbarApp({
                    id: 'api-cache',
                    name: 'API Cache',
                    icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/>
                    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
                    <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
                </svg>`,
                    entrypoint: fileURLToPath(new URL('./app.ts', import.meta.url)),
                });
            },

            'astro:server:setup': ({ toolbar }) => {
                toolbar.onAppInitialized('api-cache', () => {
                    const status = getCacheStatus();
                    toolbar.send('nhl-cache:status', status);

                    if (status.isLive) {
                        toolbar.send('nhl-cache:badge', { state: true, level: 'info' });
                    } else if (status.entries.length === 0) {
                        toolbar.send('nhl-cache:badge', { state: true, level: 'warning' });
                    } else {
                        toolbar.send('nhl-cache:badge', { state: false });
                    }
                });

                toolbar.on('nhl-cache:get-status', () => {
                    toolbar.send('nhl-cache:status', getCacheStatus());
                });

                toolbar.on('nhl-cache:clear-all', () => {
                    const config = getConfig();
                    const cacheDir = path.join(config.baseDir, config.cacheDir);
                    if (fs.existsSync(cacheDir)) {
                        const files = fs.readdirSync(cacheDir).filter((f) => f.endsWith('.json'));
                        for (const file of files) {
                            try {
                                fs.unlinkSync(path.join(cacheDir, file));
                            } catch {
                            }
                        }
                    }
                    const status = getCacheStatus();
                    toolbar.send('nhl-cache:status', status);
                    toolbar.send('nhl-cache:badge', { state: status.entries.length === 0 && !status.isLive, level: 'warning' });
                });

                toolbar.on('nhl-cache:clear-entry', (data: { filename: string }) => {
                    const config = getConfig();
                    const cacheDir = path.join(config.baseDir, config.cacheDir);
                    const filepath = path.join(cacheDir, `${data.filename}.json`);
                    try {
                        if (fs.existsSync(filepath)) {
                            fs.unlinkSync(filepath);
                        }
                    } catch {
                        // ignore
                    }
                    toolbar.send('nhl-cache:status', getCacheStatus());
                });

                toolbar.on('nhl-cache:toggle-bypass', () => {
                    const config = getConfig();
                    const cacheDir = path.join(config.baseDir, config.cacheDir);
                    if (fs.existsSync(config.bypassFile)) {
                        fs.unlinkSync(config.bypassFile);
                    } else {
                        if (!fs.existsSync(cacheDir)) {
                            fs.mkdirSync(cacheDir, { recursive: true });
                        }
                        fs.writeFileSync(config.bypassFile, '', 'utf-8');
                    }
                    const status = getCacheStatus();
                    toolbar.send('nhl-cache:status', status);
                    toolbar.send('nhl-cache:badge', {
                        state: status.isLive || status.entries.length === 0,
                        level: status.isLive ? 'info' : 'warning',
                    });
                });
            },
        },
    };
}
