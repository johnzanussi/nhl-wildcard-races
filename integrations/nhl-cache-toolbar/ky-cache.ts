import { type KyInstance } from 'ky';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

type Options = {
    baseDir?: string;
    cacheDir?: string;
    ttl?: number;
    bypassFile?: string;
}

function urlToFilename(url: string): string {
    try {
        const u = new URL(url);
        const segments = u.pathname.replace(/^\/+|\/+$/g, '').split('/');
        const pathPart = segments
            .map((s) => s.replace(/[^a-zA-Z0-9_.-]/g, '_'))
            .filter(Boolean)
            .join('-');

        let queryPart = '';
        if (u.search) {
            const params = new URLSearchParams(u.search);
            const parts: string[] = [];
            for (const [key, value] of params) {
                const k = key.replace(/[^a-zA-Z0-9]/g, '_');
                const v = value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64) || '_';
                parts.push(`${k}-${v}`);
            }
            queryPart = '-' + parts.join('_');
        }

        const result = (pathPart || 'root') + queryPart;
        return result || crypto.createHash('md5').update(url).digest('hex');
    } catch {
        return crypto.createHash('md5').update(url).digest('hex');
    }
}

const getCacheFilePath = (url: string, cacheDir: string) => {
    const key = urlToFilename(url);
    return path.join(cacheDir, `${key}.json`);
};

const getCacheDir = (baseDir: string, cacheDir: string = '') => {
    return path.join(baseDir, cacheDir);
};

export const withCache = (kyInstance: KyInstance, options: Options) => {
    const cacheDir = getCacheDir(options.baseDir ?? '.cache', options.cacheDir ?? '');

    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }

    return kyInstance.extend({
        hooks: {
            beforeRequest: [
                (request) => {
                    if (!import.meta.env.DEV) {
                        return undefined;
                    }

                    if (options.bypassFile && fs.existsSync(options.bypassFile)) {
                        return undefined;
                    }

                    const cacheFilePath = getCacheFilePath(request.url, cacheDir);

                    if (!fs.existsSync(cacheFilePath)) {
                        return undefined;
                    }

                    if (options.ttl) {
                        try {
                            const { mtimeMs } = fs.statSync(cacheFilePath);
                            if (Date.now() - mtimeMs > options.ttl) {
                                return undefined;
                            }
                        } catch {
                            return undefined;
                        }
                    }

                    try {
                        const cachedData = fs.readFileSync(cacheFilePath, 'utf-8');
                        JSON.parse(cachedData);
                        return new Response(cachedData, {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        });
                    } catch {
                        console.warn(`[ky-cache] Deleting corrupt cache entry: ${cacheFilePath}`);
                        try {
                            fs.unlinkSync(cacheFilePath);
                        } catch {
                            // ignore if already deleted
                        }
                        return undefined;
                    }
                },
            ],
            afterResponse: [
                async (request, _options, response) => {
                    if (!import.meta.env.DEV) {
                        return;
                    }

                    if (!response.ok) {
                        console.warn(`[ky-cache] Skipping cache for failed response: ${response.status} ${request.url}`);
                        return;
                    }

                    if (!response.headers.get('content-type')?.includes('application/json')) {
                        return;
                    }

                    const cacheFilePath = getCacheFilePath(request.url, cacheDir);

                    try {
                        const responseData = await response.clone().text();
                        JSON.parse(responseData);
                        fs.writeFileSync(cacheFilePath, responseData, 'utf-8');
                    } catch (e) {
                        console.warn(`[ky-cache] Failed to write cache: ${e}`);
                    }
                },
            ],
        }
    });
};
