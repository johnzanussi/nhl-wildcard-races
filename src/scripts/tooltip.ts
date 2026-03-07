const nhlTooltip = document.getElementById('nhl-tooltip');

function showTooltip(content: string, targetEl: Element) {
    if (!nhlTooltip) {
        return;
    }

    nhlTooltip.textContent = content;
    nhlTooltip.removeAttribute('hidden');

    const rect = targetEl.getBoundingClientRect();
    const ttRect = nhlTooltip.getBoundingClientRect();
    const placement = (targetEl as HTMLElement).dataset.tooltipPlacement ?? 'bottom';

    const top = placement === 'top'
        ? rect.top - ttRect.height - 6
        : rect.bottom + 6;

    const idealLeft = rect.left + rect.width / 2;
    const left = Math.max(
        ttRect.width / 2 + 4,
        Math.min(window.innerWidth - ttRect.width / 2 - 4, idealLeft),
    );

    nhlTooltip.style.top = `${top}px`;
    nhlTooltip.style.left = `${left}px`;
    nhlTooltip.style.transform = 'translateX(-50%)';
}

function hideTooltip() {
    nhlTooltip?.setAttribute('hidden', '');
}

document.querySelectorAll('[data-tooltip]').forEach((el) => {
    el.addEventListener('mouseenter', () => showTooltip((el as HTMLElement).dataset.tooltip ?? '', el));
    el.addEventListener('mouseleave', hideTooltip);
});

window.addEventListener('scroll', hideTooltip, { passive: true });

export {};
