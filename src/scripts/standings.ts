const switchConference = (conference: string) => {
    document.querySelector(`a.tab-conference.tab-active`)?.classList.remove('tab-active');
    document.querySelector(`a.tab-conference[data-conference="${conference}"]`)?.classList.add('tab-active');
    document.documentElement.setAttribute('data-active-tab', conference);
};

const switchPlayoffs = (isPlayoffs: boolean) => {
    document.documentElement.setAttribute('data-show-playoffs', isPlayoffs.toString());
    document.querySelector('input[name="toggle-playoff-teams"]')?.setAttribute('checked', isPlayoffs.toString());
};

const changePage = (conference: string | null, isPlayoffs: boolean) => {

    if (!conference) {
        conference = 'east';
    }

    history.pushState(null, '', `/${conference}${isPlayoffs ? '/playoffs' : ''}`);

    switchConference(conference);
    switchPlayoffs(isPlayoffs);
};

const scrollToLastGame = () => {
    const activeTab = document.documentElement.getAttribute('data-active-tab') || 'east';
    const panel = document.querySelector(`.tab-panel[data-tab="${activeTab}"]`);

    if (panel) {
        const schedules = panel.querySelectorAll('.schedule');
        const firstSchedule = schedules[0];

        if (firstSchedule) {
            const results = firstSchedule.querySelectorAll('.result-played');
            const lastGame = results[results.length - 1];

            if (lastGame) {
                const leftPos = lastGame.getBoundingClientRect().left + panel.scrollLeft;
                const scrollPos = leftPos - (document.documentElement.clientWidth / 2);

                panel.scroll({
                    left: scrollPos,
                });
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // theme (done in head)
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const conference = pathParts[0] || 'east';
    const isPlayoffs = pathParts[1] === 'playoffs';

    switchConference(conference);
    switchPlayoffs(isPlayoffs);
    scrollToLastGame();

    console.log('DOMContentLoaded');
    document.body.style.opacity = '1';

    // Conference Toggles
    const conferenceToggles = document.querySelectorAll('a.tab-conference');
    conferenceToggles.forEach(toggle => {
        toggle.addEventListener('click', (e: Event) => {
            e.preventDefault();
            if (!toggle.classList.contains('tab-active')) {
                const conference = toggle.getAttribute('data-conference');
                const playoffs = document.documentElement.getAttribute('data-show-playoffs') === 'true';
                changePage(conference, playoffs);
            }
        });
    });

    // Playoff Toggle
    const playoffToggle = document.querySelector('input[name="toggle-playoff-teams"]') as HTMLInputElement;

    // Update playoff toggle to navigate
    playoffToggle?.addEventListener('change', (e: Event) => {
        e.preventDefault();
        console.log('playoff toggle changed');
        const isPlayoffs = playoffToggle.checked;

        const conference = document.documentElement.getAttribute('data-active-tab');
        changePage(conference, isPlayoffs);
    });


});


