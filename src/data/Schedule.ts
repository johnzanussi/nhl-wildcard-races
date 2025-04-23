import { type TeamCode, getTeamSchedule } from '@/data/nhl';
import { type GamePlayed, type GameUnplayed, type Game } from '@/data/Teams';

export const getLastGames = async (teamCode: TeamCode, numGames = 20): Promise<Game[]> => {

    const schedule = await getTeamSchedule(teamCode);

    const regSeasonGames = schedule.games.filter(game => game.gameType !== 3)

    const lastGames = regSeasonGames.slice(-numGames).map((apiGame) => {

        const isHome = apiGame.homeTeam.abbrev === teamCode;

        const team = isHome ? apiGame.homeTeam : apiGame.awayTeam;
        const opponent = isHome ? apiGame.awayTeam : apiGame.homeTeam;

        const baseGame: GameUnplayed = {
            id: apiGame.id,
            date: apiGame.gameDate,
            team: team.abbrev,
            opponent: opponent.abbrev,
            isComplete: false,
        };

        if (apiGame.gameOutcome) {

            const result = (team.score || 0) > (opponent.score || 0) ? 'win' : 'loss';
            const gameEnd = apiGame.gameOutcome.lastPeriodType;
            const points = result === 'win' ? 2 : gameEnd === 'OT' || gameEnd === 'SO' ? 1 : 0;

            const game: GamePlayed = {
                ...baseGame,
                isComplete: true,
                score: `${team.score} - ${opponent.score}`,
                result: result,
                points: points,
                gameEnd: gameEnd,
                totalPoints: 0,
            };

            return game;
        }

        return baseGame;

    });

    return lastGames;

};