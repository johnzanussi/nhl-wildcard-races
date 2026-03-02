import ky from 'ky';
import { withCache } from '../../../integrations/nhl-cache-toolbar/cache';
import { type NHLScheduleData, type NHLStandingsData } from '@/data/nhl/types';
import { type TeamCode } from '@/data/nhl/teams';

export * from './types';
export * from './teams';

export const REGULAR_SEASON_GAMES = 82;
export const WILDCARD_SPOTS = 2;

const NHL_API_BASE_URL = 'https://api-web.nhle.com/v1';

const getCurrentSeason = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const startYear = month >= 10 ? year : year - 1;
    return `${startYear}${startYear + 1}`;
};

const nhlApi = withCache(ky.create({
    prefixUrl: NHL_API_BASE_URL,
}));

export const getTeamSchedule = async (teamCode: TeamCode, season = getCurrentSeason()) => {
    const response = await nhlApi.get(`club-schedule-season/${teamCode}/${season}`);
    return response.json<NHLScheduleData>();
};

export const fetchStandings = async (date: string = new Date().toISOString().split('T')[0] || '') => {
    const response = await nhlApi.get(`standings/${date}`);
    return response.json<NHLStandingsData>();
};
