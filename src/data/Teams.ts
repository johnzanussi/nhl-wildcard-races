import { teams, type TeamCode } from '@/data/nhl';

export type BaseGame = {
    id: number;
    date: string; // Date in YYYY-MM-DD format
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
    games: Game[]; // Array of games for the team
};

export type Team = {
    id: number;
    code: string;
    name: string;
    logoUrl: string;
    games: Game[]; // Array of games for the team
};

export const getTeamName = (code: TeamCode) => {
    return teams[code].name;
};

export type LogoType = 'light' | 'dark';

export const getTeamLogoUrl = (
    teamCode: TeamCode,
    type: LogoType = 'light'
) => {
    return `https://assets.nhle.com/logos/nhl/svg/${teamCode}_${type}.svg`;
}
