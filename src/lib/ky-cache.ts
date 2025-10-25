import { type KyInstance } from 'ky';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

type Options = {
    baseDir?: string;
    cacheDir?: string;
}

const normalizeUrl = (url: string) => {
    return crypto.createHash('md5').update(url).digest('hex');
};

const getCacheFilePath = (url: string, cacheDir: string) => {
    return path.join(cacheDir, `${normalizeUrl(url)}.json`);
};

const getCacheDir = (
    baseDir: string,
    cacheDir: string = ''
) => {
    return path.join(baseDir, cacheDir);
};

export const withCache = (
    kyInstance: KyInstance,
    options: Options,
) => {

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

                    const cacheFilePath = getCacheFilePath(request.url, cacheDir);
                    if (cacheFilePath) {
                        if (fs.existsSync(cacheFilePath)) {
                            const cachedData = fs.readFileSync(cacheFilePath, 'utf-8');
                            return new Response(cachedData, {
                                status: 200,
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            });
                        }
                    }

                    return undefined;
                },
            ],
            afterResponse: [
                async (request, _options, response) => {
                    if (!import.meta.env.DEV) {
                        return;
                    }

                    const cacheFileName = getCacheFilePath(request.url, cacheDir);
                    if (cacheFileName) {
                        const responseData = await response.clone().text();
                        fs.writeFileSync(cacheFileName, responseData, 'utf-8');
                    }
                },
            ],
        }
    });
};