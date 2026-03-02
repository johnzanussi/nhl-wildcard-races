import { type KyInstance } from 'ky';
import fs from 'node:fs';
import path from 'node:path';
import { withCache as baseWithCache } from './ky-cache';

export type CacheOptions = {
    cacheDir?: string;
    baseDir?: string;
    ttl?: number;
};

type ResolvedConfig = {
    cacheDir: string;
    baseDir: string;
    ttl: number;
    bypassFile: string;
};

const DEFAULTS: ResolvedConfig = {
    baseDir: '.cache',
    cacheDir: 'api',
    ttl: 4 * 60 * 60 * 1000,
    bypassFile: '',
};

const CONFIG_FILE = '.api-cache-config.json';

function getConfigPath(): string {
    return path.join(process.cwd(), CONFIG_FILE);
}

function resolveConfig(options?: CacheOptions): ResolvedConfig {
    const baseDir = options?.baseDir ?? DEFAULTS.baseDir;
    const cacheDir = options?.cacheDir ?? DEFAULTS.cacheDir;
    const ttl = options?.ttl ?? DEFAULTS.ttl;
    return {
        baseDir,
        cacheDir,
        ttl,
        bypassFile: path.join(baseDir, cacheDir, '.bypass'),
    };
}

export function configure(options?: CacheOptions): void {
    const config = resolveConfig(options);
    try {
        fs.writeFileSync(
            getConfigPath(),
            JSON.stringify({ baseDir: config.baseDir, cacheDir: config.cacheDir, ttl: config.ttl }),
            'utf-8'
        );
    } catch (e) {
        console.warn(`[api-cache] Failed to write config: ${e}`);
    }
}

export function getConfig(): ResolvedConfig {
    try {
        const configPath = getConfigPath();
        if (fs.existsSync(configPath)) {
            const raw = fs.readFileSync(configPath, 'utf-8');
            const opts = JSON.parse(raw) as Partial<CacheOptions>;
            return resolveConfig(opts);
        }
    } catch {
    }
    return resolveConfig({});
}

export const withCache = (kyInstance: KyInstance) => {
    const config = getConfig();
    return baseWithCache(kyInstance, {
        baseDir: config.baseDir,
        cacheDir: config.cacheDir,
        ttl: config.ttl,
        bypassFile: config.bypassFile,
    });
};
