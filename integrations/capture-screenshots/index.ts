import captureWebsite from 'capture-website';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import type { AstroIntegration } from 'astro';

export default function captureScreenshots(): AstroIntegration {
    return {
        name: 'capture-screenshots',
        hooks: {
            'astro:build:done': async ({ pages }) => {
                if (!process.env.CAPTURE_SCREENSHOTS) {
                    return;
                }

                const pathnames = pages.map(p => `/${p.pathname}`).filter(p => p !== '/');
                const PORT = 4323;
                const BASE = `http://localhost:${PORT}`;

                const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], { stdio: 'ignore' });

                const deadline = Date.now() + 30000;
                while (Date.now() < deadline) {
                    try { await fetch(BASE); break; } catch { await new Promise(r => setTimeout(r, 500)); }
                }

                try {
                    for (const pathname of pathnames) {
                        const slug = pathname.replace(/^\/+|\/+$/g, '').replace(/\//g, '-');
                        console.log(`📸 ${pathname} → screenshot-${slug}.jpg`);
                        await captureWebsite.file(`${BASE}${pathname}`, resolve('./public', `screenshot-${slug}.jpg`), {
                            width: 1200, height: 630, type: 'jpeg', quality: 0.9, scaleFactor: 1, delay: 1,
                        });
                    }
                } finally {
                    server.kill();
                }
                console.log('✅ Screenshots saved to public/');
            },
        },
    };
}
