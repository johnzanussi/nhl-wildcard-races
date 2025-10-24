// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://nhlwildcard.com',
    output: 'static',
    integrations: [sitemap()],
    vite: {
        plugins: [tailwindcss()],
    },
    image: {
        domains: [
            'assets.nhle.com',
        ]
    }
});
