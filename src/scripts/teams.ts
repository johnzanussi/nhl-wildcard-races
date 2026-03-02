const selectTeamDivs = (teamCode?: string): NodeListOf<HTMLDivElement> => {
    return document.querySelectorAll<HTMLDivElement>(
        `[data-team-code${teamCode ? `="${teamCode}"` : ''}]`
    );
};

const toggleClass = (
    els: NodeListOf<HTMLDivElement>,
    className: string = 'bg-base-300'
) => {
    els.forEach(el => el.classList.toggle(className));
};

selectTeamDivs().forEach(el => {
    el.addEventListener('mouseenter', () => {
        toggleClass(selectTeamDivs(el.dataset.teamCode));
    });
    el.addEventListener('mouseleave', () => {
        toggleClass(selectTeamDivs(el.dataset.teamCode));
    });
});