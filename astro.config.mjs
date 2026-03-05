// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import apiCacheToolbar from './integrations/nhl-cache-toolbar/index.ts';
import captureScreenshots from './integrations/capture-screenshots/index.ts';

// https://astro.build/config
export default defineConfig({
    site: 'https://nhlwildcard.com',
    output: 'static',
    integrations: [
        sitemap({
            filter: (page) => page !== 'https://nhlwildcard.com/',
            serialize(item) {
                item.lastmod = new Date().toISOString();
                return item;
            },
        }),
        apiCacheToolbar({ cacheDir: 'nhl' }),
        captureScreenshots(),
    ],
    experimental: {
        fonts: [{
            provider: fontProviders.google(),
            name: 'Inter',
            cssVariable: '--font-inter',
            weights: [400, 500, 600, 700],
        }],
    },
    vite: {
        plugins: [tailwindcss()],
    },
    image: {
        domains: [
            'assets.nhle.com',
            'a.espncdn.com',
        ]
    }
});
