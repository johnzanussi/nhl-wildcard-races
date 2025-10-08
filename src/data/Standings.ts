
import {
    type ConferenceAbbrev,
    type TeamCode,
    fetchStandings,
    REGULAR_SEASON_GAMES,
    WILDCARD_SPOTS
} from '@/data/nhl';

export type TeamStanding = {
    teamCode: TeamCode;
    wildcardPlace: number;
    isInWildcard: boolean;
    gamesPlayed: number;
    gamesRemaining: number;
    points: number;
    pointsBack: number;
    regulationWins: number;
    isEliminated: boolean;
};

type Conference = {
    label: string;
    teams: TeamStanding[]
}

type Conferences = Record<ConferenceAbbrev, Conference>;

export const getWildcardStandings = async () => {

    // @todo: this is the last day of the season
    const standings = await fetchStandings();

    const conferences: Conferences = {
        E: {
            label: 'East',
            teams: [],
        },
        W: {
            label: 'West',
            teams: [],
        },
    };

    const wildcardPoints = {
        E: 0,
        W: 0,
    };

    // Extract the wild card teams from the standings data
    const wildcardTeams = standings.standings.reduce((accum, team) => {

        if (team.wildcardSequence !== 0) {

            const conf = team.conferenceAbbrev;

            if (team.wildcardSequence === 2) {
                wildcardPoints[conf] = team.points;
            }

            accum[conf].teams.push({
                teamCode: team.teamAbbrev.default,
                wildcardPlace: team.wildcardSequence,
                isInWildcard: team.wildcardSequence <= WILDCARD_SPOTS,
                gamesPlayed: team.gamesPlayed,
                gamesRemaining: REGULAR_SEASON_GAMES - team.gamesPlayed,
                points: team.points,
                pointsBack: team.wildcardSequence <= 2 ? 0 : wildcardPoints[conf] - team.points,
                regulationWins: team.regulationWins,
                isEliminated: team.clinchIndicator === 'e',
            });
        }

        return accum;

    }, conferences);

    return wildcardTeams;

};