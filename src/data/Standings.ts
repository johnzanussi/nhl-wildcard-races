
import {
    type ConferenceAbbrev,
    type TeamCode,
    type DivisionAbbrev,
    fetchStandings,
    REGULAR_SEASON_GAMES,
    WILDCARD_SPOTS
} from '@/data/nhl';

export type TeamStanding = {
    teamCode: TeamCode;
    conferenceAbbrev: ConferenceAbbrev;
    conferencePlace: number;
    divisionName: string;
    divisionAbbrev: DivisionAbbrev;
    divisionPlace: number;
    wildCardPlace: number;
    isInPlayoffs: boolean;
    isInWildCard: boolean;
    gamesPlayed: number;
    gamesRemaining: number;
    points: number;
    pointsBack: number;
    regulationWins: number;
    isEliminated: boolean;
};

type Conference = {
    label: string;
    teams: TeamStanding[];
};

type Conferences = Record<ConferenceAbbrev, Conference>;

export const getWildCardStandings = async () => {
    const standings = await fetchStandings();

    // Pre-initialize division buckets to avoid conditional checks
    const divisionBuckets: Record<DivisionAbbrev, TeamStanding[]> = {
        A: [],
        M: [],
        C: [],
        P: []
    };

    // Track wildcard 2 points for each conference
    const wildcard2Points: Record<ConferenceAbbrev, number> = {
        E: 0,
        W: 0
    };

    // First pass: find wildcard 2 points for each conference
    standings.standings.forEach((team) => {
        if (team.wildcardSequence === 2) {
            wildcard2Points[team.conferenceAbbrev] = team.points;
        }
    });

    // Second pass: transform and bucket all teams by division
    standings.standings.forEach((team) => {
        const isWildCard = !!(team.wildcardSequence && team.wildcardSequence <= WILDCARD_SPOTS);
        let pointsBack = 0;

        // Calculate points back for wildcard contenders (not in top 2)
        if (team.wildcardSequence && team.wildcardSequence > 2) {
            pointsBack = wildcard2Points[team.conferenceAbbrev] - team.points;
        }

        const teamObj: TeamStanding = {
            teamCode: team.teamAbbrev.default,
            divisionName: team.divisionName,
            divisionAbbrev: team.divisionAbbrev,
            divisionPlace: team.divisionSequence,
            conferenceAbbrev: team.conferenceAbbrev,
            conferencePlace: team.conferenceSequence,
            isInPlayoffs: !team.wildcardSequence,
            isInWildCard: isWildCard,
            wildCardPlace: team.wildcardSequence,
            gamesPlayed: team.gamesPlayed,
            gamesRemaining: REGULAR_SEASON_GAMES - team.gamesPlayed,
            points: team.points,
            regulationWins: team.regulationWins,
            isEliminated: team.clinchIndicator === 'e',
            pointsBack: pointsBack,
        };

        divisionBuckets[team.divisionAbbrev].push(teamObj);
    });

    // Sort divisions and split into playoff (top 3) and non-playoff teams by conference
    type ConferenceTeams = {
        playoffs: TeamStanding[];
        teams: TeamStanding[];
    };

    const conferenceGroups = Object.values(divisionBuckets).reduce((accum, divisionTeams) => {
        if (divisionTeams.length === 0) {
            return accum;
        }

        const conf = divisionTeams[0]!.conferenceAbbrev;
        const sortedTeams = [...divisionTeams].sort((a, b) => a.divisionPlace - b.divisionPlace);

        accum[conf].playoffs.push(...sortedTeams.slice(0, 3));
        accum[conf].teams.push(...sortedTeams.slice(3));

        return accum;
    }, {
        E: {
            playoffs: [] as TeamStanding[],
            teams: [] as TeamStanding[],
        },
        W: {
            playoffs: [] as TeamStanding[],
            teams: [] as TeamStanding[],
        },
    } as Record<ConferenceAbbrev, ConferenceTeams>);

    // Combine playoff teams with remaining teams sorted by conference place
    conferenceGroups.E.teams.sort((a, b) => a.conferencePlace - b.conferencePlace);
    conferenceGroups.W.teams.sort((a, b) => a.conferencePlace - b.conferencePlace);

    const conferences: Conferences = {
        E: {
            label: 'East',
            teams: [
                ...conferenceGroups.E.playoffs,
                ...conferenceGroups.E.teams
            ],
        },
        W: {
            label: 'West',
            teams: [
                ...conferenceGroups.W.playoffs,
                ...conferenceGroups.W.teams
            ],
        },
    };

    return conferences;
};