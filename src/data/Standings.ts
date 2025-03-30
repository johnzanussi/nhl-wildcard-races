
import { fetchStandings, type ConferenceAbbrev, type TeamCode } from '@/data/nhl';

type Standings = {
    teamCode: TeamCode;
    wildcardPlace: number;
    gamesPlayed: number;
    points: number;
};

type Conferences = Record<ConferenceAbbrev, Standings[]>;

export const getWildcardTeams = async () => {

    const standings = await fetchStandings();

    const conferences: Conferences = {
        E: [],
        W: [],
    };

    // Extract the wild card teams from the standings data
    const wildcardTeams = standings.standings.reduce((accum, team) => {

        if (team.wildcardSequence !== 0 && team.clinchIndicator !== 'e') {
            accum[team.conferenceAbbrev].push({
                teamCode: team.teamAbbrev.default,
                wildcardPlace: team.wildcardSequence,
                gamesPlayed: team.gamesPlayed,
                points: team.points,
            });
        }

        return accum;

    }, conferences);

    return wildcardTeams;

};