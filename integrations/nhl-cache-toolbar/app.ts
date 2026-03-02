import { defineToolbarApp } from 'astro/toolbar';

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

const formatAge = (ageMs: number): string => {
    const minutes = Math.floor(ageMs / 60_000);
    if (minutes < 1) { return 'just now'; }
    if (minutes < 60) { return `${minutes}m ago`; }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) { return `${hours}h ago`; }
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const styles = `
    :host {
        font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
    }
    .panel {
        padding: 16px;
        min-width: 420px;
        max-width: 540px;
        color: #fff;
    }
    .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        gap: 12px;
    }
    .header-left {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    .title {
        font-size: 14px;
        font-weight: 600;
        color: #fff;
    }
    .subtitle {
        font-size: 11px;
        color: #888;
    }
    .mode-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        margin-bottom: 14px;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(255,255,255,0.1);
    }
    .mode-label {
        flex: 1;
        font-size: 13px;
        color: #ccc;
    }
    .mode-value {
        font-size: 12px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 4px;
    }
    .mode-live {
        background: rgba(59, 130, 246, 0.25);
        color: #60a5fa;
        border: 1px solid rgba(59, 130, 246, 0.4);
    }
    .mode-cache {
        background: rgba(34, 197, 94, 0.15);
        color: #4ade80;
        border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .actions-row {
        display: flex;
        gap: 8px;
        margin-bottom: 14px;
    }
    .entry-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-height: 320px;
        overflow-y: auto;
    }
    .entry-list::-webkit-scrollbar {
        width: 4px;
    }
    .entry-list::-webkit-scrollbar-track {
        background: transparent;
    }
    .entry-list::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.15);
        border-radius: 2px;
    }
    .entry {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 7px 10px;
        border-radius: 6px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.07);
        transition: background 0.1s;
    }
    .entry:hover {
        background: rgba(255,255,255,0.08);
    }
    .entry.expired {
        opacity: 0.55;
    }
    .entry-label {
        flex: 1;
        font-size: 12px;
        color: #e2e8f0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .entry-meta {
        display: flex;
        gap: 8px;
        font-size: 11px;
        color: #666;
        white-space: nowrap;
    }
    .entry-meta .expired-tag {
        color: #f59e0b;
        font-weight: 600;
    }
    .empty-state {
        text-align: center;
        padding: 24px 16px;
        color: #555;
        font-size: 13px;
    }
    .empty-state .empty-icon {
        font-size: 28px;
        margin-bottom: 8px;
    }
    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
    }
    .section-title {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #555;
    }
    .reload-notice {
        margin-top: 12px;
        padding: 8px 12px;
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.25);
        border-radius: 6px;
        font-size: 11px;
        color: #d97706;
        display: none;
    }
    .reload-notice.visible {
        display: block;
    }
    .reload-link {
        color: #f59e0b;
        cursor: pointer;
        text-decoration: underline;
        background: none;
        border: none;
        padding: 0;
        font-size: 11px;
        font-family: inherit;
    }
`;

export default defineToolbarApp({
    init(canvas, app, server) {
        const styleEl = document.createElement('style');
        styleEl.textContent = styles;
        canvas.appendChild(styleEl);

        const win = document.createElement('astro-dev-toolbar-window');
        canvas.appendChild(win);

        const panel = document.createElement('div');
        panel.className = 'panel';
        win.appendChild(panel);

        let pendingReload = false;

        const render = (status: CacheStatus) => {
            panel.innerHTML = '';

            // Header
            const header = document.createElement('div');
            header.className = 'header';

            const headerLeft = document.createElement('div');
            headerLeft.className = 'header-left';

            const title = document.createElement('div');
            title.className = 'title';
            title.textContent = 'NHL Cache';

            const subtitle = document.createElement('div');
            subtitle.className = 'subtitle';
            subtitle.textContent = status.entries.length > 0
                ? `${status.entries.length} entr${status.entries.length === 1 ? 'y' : 'ies'} · ${status.totalSizeKb} KB total`
                : 'No cached entries';

            headerLeft.appendChild(title);
            headerLeft.appendChild(subtitle);
            header.appendChild(headerLeft);
            panel.appendChild(header);

            // Mode row
            const modeRow = document.createElement('div');
            modeRow.className = 'mode-row';

            const modeLabel = document.createElement('div');
            modeLabel.className = 'mode-label';
            modeLabel.textContent = status.isLive
                ? 'Live mode — cache reads bypassed, fresh data still written'
                : 'Cache mode — serving from local cache when available';

            const modeValue = document.createElement('div');
            modeValue.className = `mode-value ${status.isLive ? 'mode-live' : 'mode-cache'}`;
            modeValue.textContent = status.isLive ? 'LIVE' : 'CACHED';

            const modeBtn = document.createElement('astro-dev-toolbar-button') as HTMLElement & {
                buttonStyle: string;
                size: string;
            };
            modeBtn.buttonStyle = status.isLive ? 'gray' : 'blue';
            modeBtn.size = 'small';
            modeBtn.textContent = status.isLive ? 'Use Cache' : 'Go Live';
            modeBtn.addEventListener('click', () => {
                server.send('nhl-cache:toggle-bypass', {});
                pendingReload = true;
            });

            modeRow.appendChild(modeLabel);
            modeRow.appendChild(modeValue);
            modeRow.appendChild(modeBtn);
            panel.appendChild(modeRow);

            // Actions row
            if (status.entries.length > 0) {
                const actionsRow = document.createElement('div');
                actionsRow.className = 'actions-row';

                const clearAllBtn = document.createElement('astro-dev-toolbar-button') as HTMLElement & {
                    buttonStyle: string;
                    size: string;
                };
                clearAllBtn.buttonStyle = 'red';
                clearAllBtn.size = 'small';
                clearAllBtn.textContent = `Clear All (${status.entries.length})`;
                clearAllBtn.addEventListener('click', () => {
                    server.send('nhl-cache:clear-all', {});
                    pendingReload = true;
                });

                actionsRow.appendChild(clearAllBtn);
                panel.appendChild(actionsRow);
            }

            // Entry list
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'section-header';
            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'section-title';
            sectionTitle.textContent = 'Cached Entries';
            sectionHeader.appendChild(sectionTitle);
            panel.appendChild(sectionHeader);

            if (status.entries.length === 0) {
                const emptyState = document.createElement('div');
                emptyState.className = 'empty-state';
                const emptyIcon = document.createElement('div');
                emptyIcon.className = 'empty-icon';
                emptyIcon.textContent = '○';
                const emptyText = document.createElement('div');
                emptyText.textContent = status.isLive
                    ? 'Cache is empty — reload the page to populate it'
                    : 'No cached entries — reload the page to fetch and cache data';
                emptyState.appendChild(emptyIcon);
                emptyState.appendChild(emptyText);
                panel.appendChild(emptyState);
            } else {
                const entryList = document.createElement('div');
                entryList.className = 'entry-list';

                for (const entry of status.entries) {
                    const row = document.createElement('div');
                    row.className = `entry${entry.expired ? ' expired' : ''}`;

                    const label = document.createElement('div');
                    label.className = 'entry-label';
                    label.textContent = entry.label;
                    label.title = entry.filename;

                    const meta = document.createElement('div');
                    meta.className = 'entry-meta';

                    if (entry.expired) {
                        const expiredTag = document.createElement('span');
                        expiredTag.className = 'expired-tag';
                        expiredTag.textContent = 'expired';
                        meta.appendChild(expiredTag);
                    }

                    const sizeSpan = document.createElement('span');
                    sizeSpan.textContent = `${entry.sizeKb} KB`;

                    const ageSpan = document.createElement('span');
                    ageSpan.textContent = formatAge(entry.ageMs);

                    meta.appendChild(sizeSpan);
                    meta.appendChild(ageSpan);

                    const clearBtn = document.createElement('astro-dev-toolbar-button') as HTMLElement & {
                        buttonStyle: string;
                        size: string;
                    };
                    clearBtn.buttonStyle = 'ghost';
                    clearBtn.size = 'small';
                    clearBtn.textContent = 'Clear';
                    clearBtn.addEventListener('click', () => {
                        server.send('nhl-cache:clear-entry', { filename: entry.filename });
                        pendingReload = true;
                    });

                    row.appendChild(label);
                    row.appendChild(meta);
                    row.appendChild(clearBtn);
                    entryList.appendChild(row);
                }

                panel.appendChild(entryList);
            }

            // Reload notice
            const reloadNotice = document.createElement('div');
            reloadNotice.className = `reload-notice${pendingReload ? ' visible' : ''}`;

            const noticeText = document.createTextNode('Cache changed — ');
            const reloadBtn = document.createElement('button');
            reloadBtn.className = 'reload-link';
            reloadBtn.textContent = 'reload the page';
            reloadBtn.addEventListener('click', () => {
                window.location.reload();
            });
            const noticeText2 = document.createTextNode(' to apply changes.');

            reloadNotice.appendChild(noticeText);
            reloadNotice.appendChild(reloadBtn);
            reloadNotice.appendChild(noticeText2);
            panel.appendChild(reloadNotice);
        };

        // Request status when panel is opened
        app.onToggled(({ state }) => {
            if (state) {
                pendingReload = false;
                server.send('nhl-cache:get-status', {});
            }
        });

        // Handle status updates from server
        server.on('nhl-cache:status', (status: CacheStatus) => {
            render(status);
        });

        // Handle badge commands from server
        server.on('nhl-cache:badge', (data: { state: boolean; level?: 'error' | 'warning' | 'info' }) => {
            if (data.state && data.level) {
                app.toggleNotification({ state: true, level: data.level });
            } else if (data.state) {
                app.toggleNotification({ state: true });
            } else {
                app.toggleNotification({ state: false });
            }
        });

        // Initial load — show empty panel while waiting for status
        panel.innerHTML = '<div style="padding:24px;color:#555;font-size:13px;text-align:center;">Loading...</div>';
        server.send('nhl-cache:get-status', {});
    },
});
