const scrollToLastGame = () => {
    const panel = document.querySelector('.tab-panel');

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

scrollToLastGame();