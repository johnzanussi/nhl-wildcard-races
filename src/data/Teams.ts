import { teams, type TeamCode } from '@/data/nhl';

export type BaseGame = {
    id: number;
    date: string;
    team: TeamCode;
    opponent: TeamCode;
}

export type GamePlayed = BaseGame & {
    score: string;
    result: 'win' | 'loss';
    points: 0 | 1 | 2;
    totalPoints: number;
    gameEnd: 'REG' | 'OT' | 'SO';
    isComplete: true;
}

export type GameUnplayed = BaseGame & {
    isComplete: false;
}

export type Game = GameUnplayed | GamePlayed;

export type Schedule = {
    teamCode: TeamCode;
    teamName: string;
    logoUrl: string;
    games: Game[];
};

export type Team = {
    id: number;
    code: string;
    name: string;
    logoUrl: string;
    games: Game[];
};

export const getTeamName = (code: TeamCode) => {
    return teams[code].name;
};

export const getEspnTeamCode = (code: TeamCode) => {
    const team = teams[code];
    return 'codeEspn' in team ? team.codeEspn : code;
}

export type LogoProvider = 'nhl' | 'espn';

export type LogoType = 'light' | 'dark';

export const getTeamLogoUrl = (
    teamCode: TeamCode,
    provider: LogoProvider = 'espn',
    type: LogoType = 'light'
): string => {
    if (provider === 'espn') {
        return `https://a.espncdn.com/i/teamlogos/nhl/500/${getEspnTeamCode(teamCode)}.png`;
    }
    if (provider === 'nhl') {
        return `https://assets.nhle.com/logos/nhl/svg/${teamCode}_${type}.svg`;
    }
    return `https://a.espncdn.com/i/teamlogos/nhl/500/${getEspnTeamCode(teamCode)}.png`;
};
