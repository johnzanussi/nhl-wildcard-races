import captureWebsite from 'capture-website';
import { spawn } from 'node:child_process';
import { unlink } from 'node:fs/promises';
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
                        const outPath = resolve('./public', `screenshot-${slug}.jpg`);
                        console.log(`📸 ${pathname} → screenshot-${slug}.jpg`);
                        try {
                            await unlink(outPath);
                        } catch (err) {
                            if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
                                throw err;
                            }
                        }
                        await captureWebsite.file(`${BASE}${pathname}`, outPath, {
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
