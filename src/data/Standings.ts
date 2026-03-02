
import {
    type ConferenceAbbrev,
    type TeamCode,
    type DivisionAbbrev,
    fetchStandings,
    REGULAR_SEASON_GAMES,
    WILDCARD_SPOTS
} from '@/data/nhl';

export type DivisionShort = string;

export type TeamStanding = {
    teamCode: TeamCode;
    conferenceAbbrev: ConferenceAbbrev;
    conferencePlace: number;
    divisionName: string;
    divisionAbbrev: DivisionAbbrev;
    divisionPlace: number;
    divisionShort: DivisionShort;
    wildCardPlace: number;
    isInPlayoffs: boolean;
    isInWildCard: boolean;
    gamesPlayed: number;
    gamesRemaining: number;
    points: number;
    pointsBack: number;
    potentialPointsRemaining: number;
    regulationWins: number;
    isEliminated: boolean;
};

type Conference = {
    label: string;
    teams: TeamStanding[];
};

type Conferences = Record<ConferenceAbbrev, Conference>;

let STANDINGS_CACHE: Conferences;

export type ConferenceKey = 'east' | 'west';

const confMap: Record<ConferenceKey, ConferenceAbbrev> = {
    'east': 'E',
    'west': 'W',
} as const;

export const getConferences = () => {
    return [
        {
            abbrev: 'E',
            name: 'Eastern',
            label: 'East',
            key: 'east',
        },
        {
            abbrev: 'W',
            name: 'Western',
            label: 'West',
            key: 'west',
        },
    ];
};

export const getConfStandings = async (conference: ConferenceKey, isPlayoffs: boolean) => {
    if (!STANDINGS_CACHE) {
        STANDINGS_CACHE = await getStandings();
    }

    const confAbbrev = confMap[conference];

    return STANDINGS_CACHE[confAbbrev].teams.filter(team => !team.isInPlayoffs || isPlayoffs);
}

export const getStandings = async () => {
    const standings = await fetchStandings();

    const divisionBuckets: Record<DivisionAbbrev, TeamStanding[]> = {
        A: [],
        M: [],
        C: [],
        P: []
    };

    const wildcard2Points: Record<ConferenceAbbrev, number> = {
        E: 0,
        W: 0
    };

    standings.standings.forEach((team) => {
        if (team.wildcardSequence === 2) {
            wildcard2Points[team.conferenceAbbrev] = team.points;
        }
    });

    standings.standings.forEach((team) => {
        const isWildCard = !!(team.wildcardSequence && team.wildcardSequence <= WILDCARD_SPOTS);
        let pointsBack = 0;

        if (team.wildcardSequence && team.wildcardSequence > 2) {
            pointsBack = wildcard2Points[team.conferenceAbbrev] - team.points;
        }

        const teamObj: TeamStanding = {
            teamCode: team.teamAbbrev.default,
            divisionName: team.divisionName,
            divisionAbbrev: team.divisionAbbrev,
            divisionPlace: team.divisionSequence,
            divisionShort: team.divisionName.slice(0, 3).toUpperCase(),
            conferenceAbbrev: team.conferenceAbbrev,
            conferencePlace: team.conferenceSequence,
            isInPlayoffs: !team.wildcardSequence,
            isInWildCard: isWildCard,
            wildCardPlace: team.wildcardSequence,
            gamesPlayed: team.gamesPlayed,
            gamesRemaining: REGULAR_SEASON_GAMES - team.gamesPlayed,
            points: team.points,
            pointsBack: pointsBack,
            potentialPointsRemaining: (REGULAR_SEASON_GAMES - team.gamesPlayed) * 2,
            regulationWins: team.regulationWins,
            isEliminated: team.clinchIndicator === 'e',
        };

        divisionBuckets[team.divisionAbbrev].push(teamObj);
    });

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