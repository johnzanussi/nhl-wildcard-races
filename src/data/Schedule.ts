const regSeasonGames = 82;

const getTeamSchedule = async (teamCode) => {
    const season = '20242025';
    const response = await fetch(`https://api-web.nhle.com/v1/club-schedule-season/${teamCode}/${season}`);

    if (!response.ok) {
        throw new Error('Failed to fetch standings');
    }

    return await response.json();

}

export const getLastGames = async (teamCode, numGames = 20) => {

    const schedule = await getTeamSchedule(teamCode);

    const lastGames = schedule.games.slice(-numGames).map((game, i) => {

        const isHome = game.homeTeam.abbrev === teamCode;

        const team = isHome ? game.homeTeam : game.awayTeam;
        const opponent = isHome ? game.awayTeam : game.homeTeam;

        const result = game.gameOutcome ? team.score > opponent.score ? 'win' : 'loss' : null;
        const lastPeriodType = game.gameOutcome ? game.gameOutcome.lastPeriodType : null; // REG, OT, SO

        const points = result === 'win' ? 2 : lastPeriodType === 'OT' || lastPeriodType === 'SO' ? 1 : 0;

        return {
            gameNum: regSeasonGames - numGames + (i+1), // Game number in the season (1 to 82)
            opponent: opponent.abbrev,
            score: game.gameOutcome ? `${team.score} - ${opponent.score}` : null,
            result: result,
            lastPeriodType: lastPeriodType,
            gamePoints: game.gameOutcome ? points : null,
        };

    });

    return lastGames;

};