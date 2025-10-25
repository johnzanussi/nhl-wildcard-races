import ky from 'ky';
import { withCache } from '@/lib/ky-cache';

export * from './types';
export * from './teams';

export const REGULAR_SEASON_GAMES = 82;
export const WILDCARD_SPOTS = 2;

import { type NHLScheduleData, type NHLStandingsData } from '@/data/nhl/types';

const BASE_URL = 'https://api-web.nhle.com/v1';

const nhlApi = withCache(ky.create({
    prefixUrl: BASE_URL,
}), {
    cacheDir: 'nhl',
});

export const getTeamSchedule = async (teamCode: string, season = '20252026') => {
    const response = await nhlApi.get(`club-schedule-season/${teamCode}/${season}`);
    return response.json<NHLScheduleData>();

};

export const fetchStandings = async (date: string = new Date().toISOString().split('T')[0] || '') => {
    const response = await nhlApi.get(`standings/${date}`);
    return response.json<NHLStandingsData>();
};
