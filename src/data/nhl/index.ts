export * from './types';
export * from './teams';

export const REGULAR_SEASON_GAMES = 82;
export const WILDCARD_SPOTS = 2;

import { type NHLScheduleData, type NHLStandingsData } from '@/data/nhl/types';

export const getTeamSchedule = async (teamCode: string, season = '20242025') => {

    const response = await fetch(`https://api-web.nhle.com/v1/club-schedule-season/${teamCode}/${season}`);

    if (!response.ok) {
        throw new Error('Failed to fetch standings');
    }

    return await response.json() as NHLScheduleData;

};

export const fetchStandings = async () => {
    const date = new Date().toISOString().split('T')[0];
    const response = await fetch(`https://api-web.nhle.com/v1/standings/${date}`);

    if (!response.ok) {
        throw new Error('Failed to fetch standings');
    }

    return await response.json() as NHLStandingsData;
};
