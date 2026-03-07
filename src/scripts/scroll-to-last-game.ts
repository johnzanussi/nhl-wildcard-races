const scroller = document.querySelector<HTMLElement>('.schedule-scroll');
if (scroller) {
    const scrollToLastGame = () => {
        const played = scroller.querySelectorAll<HTMLElement>('.result-played');
        const lastGame = played[played.length - 1];
        if (!lastGame) {
            return;
        }

        const scrollerRect = scroller.getBoundingClientRect();
        const gameRect = lastGame.getBoundingClientRect();
        const absoluteLeft = gameRect.left - scrollerRect.left + scroller.scrollLeft;
        const scrollPos = absoluteLeft + lastGame.offsetWidth / 2 - scroller.clientWidth / 2;
        scroller.scrollLeft = Math.max(0, scrollPos);
    };

    requestAnimationFrame(scrollToLastGame);
}

export {};
