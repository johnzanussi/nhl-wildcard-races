import { type TeamCode } from './teams';

// NHL Unified TypeScript Types

// ======== SHARED TYPES ========

/**
 * Represents text that might have translations in different languages
 */
export interface LocalizedText {
  default: string;
  fr?: string;   // French
  cs?: string;   // Czech
  fi?: string;   // Finnish
  sk?: string;   // Slovak
  sv?: string;   // Swedish
}

/**
 * Common properties for identifying a team across different NHL data sources
 */
export interface TeamIdentifier {
  id: number;
  commonName: LocalizedText;
  placeName: LocalizedText;
  abbrev: TeamCode;
  logo: string;
  darkLogo?: string;
}

/**
 * Possible game states
 */
export type GameState = "FINAL" | "LIVE" | "OFF" | "FUT";

/**
 * Period types in a hockey game
 */
export type PeriodType = "REG" | "OT" | "SO";

// ======== SCHEDULE TYPES ========

export interface NHLScheduleData {
  previousSeason: number;
  currentSeason: number;
  clubTimezone: string;
  clubUTCOffset: string;
  games: Game[];
}

export interface Game {
  id: number;
  season: number;
  gameType: number;
  gameDate: string;
  venue: Venue;
  neutralSite: boolean;
  startTimeUTC: string;
  easternUTCOffset: string;
  venueUTCOffset: string;
  venueTimezone: string;
  gameState: GameState;
  gameScheduleState: string;
  tvBroadcasts: TVBroadcast[];
  alternateBroadcasts?: AlternateBroadcast[];
  awayTeam: Team;
  homeTeam: Team;
  periodDescriptor: PeriodDescriptor;
  gameOutcome?: GameOutcome;
  winningGoalie?: PlayerInfo;
  winningGoalScorer?: PlayerInfo;
  threeMinRecap?: string;
  threeMinRecapFr?: string;
  condensedGame?: string;
  condensedGameFr?: string;
  gameCenterLink: string;
  ticketsLink?: string;
  ticketsLinkFr?: string;
}

export interface Venue {
  default: string;
  fr?: string;
  es?: string;
}

export interface TVBroadcast {
  id: number;
  market: string;
  countryCode: string;
  network: string;
  sequenceNumber: number;
}

export interface AlternateBroadcast {
  country: string;
  descriptions: AlternateBroadcastDescription[];
}

export interface AlternateBroadcastDescription {
  default: string;
}

export interface Team extends TeamIdentifier {
  placeNameWithPreposition: LocalizedText;
  awaySplitSquad: boolean;
  homeSplitSquad?: boolean;
  score?: number;
  airlineLink?: string;
  airlineDesc?: string;
  hotelLink?: string;
  hotelDesc?: string;
  radioLink?: string;
}

export interface PeriodDescriptor {
  periodType: PeriodType;
  maxRegulationPeriods: number;
}

export interface GameOutcome {
  lastPeriodType: PeriodType;
}

export interface PlayerInfo {
  playerId: number;
  firstInitial: LocalizedText;
  lastName: LocalizedText;
}

// ======== STANDINGS TYPES ========

export interface NHLStandingsData {
  wildCardIndicator: boolean;
  standingsDateTimeUtc: string;
  standings: TeamStanding[];
}

export const Conferences = {
  'E': 'Eastern',
  'W': 'Western',
} as const;

export const Divisions = {
  'A': 'Atlantic',
  'M': 'Metropolitan',
  'C': 'Central',
  'P': 'Pacific',
} as const;

export type ConferenceName = (typeof Conferences)[keyof typeof Conferences];
export type ConferenceAbbrev = keyof typeof Conferences;

export type DivisionName = (typeof Divisions)[keyof typeof Divisions];
export type DivisionAbbrev = keyof typeof Divisions;

export interface TeamStanding {
  // Team identification (partial overlap with TeamIdentifier)
  teamName: LocalizedText;
  teamCommonName: LocalizedText;
  teamAbbrev: {
    default: TeamCode;
  };
  teamLogo: string;
  placeName: LocalizedText;

  // Division and conference info
  clinchIndicator?: string; // e.g., "x" for clinched playoff spot, "e" for eliminated
  conferenceAbbrev: ConferenceAbbrev;
  conferenceName: ConferenceName;
  divisionAbbrev: DivisionAbbrev;
  divisionName: DivisionName;

  // Ranking sequences
  conferenceHomeSequence: number;
  conferenceL10Sequence: number;
  conferenceRoadSequence: number;
  conferenceSequence: number;
  divisionHomeSequence: number;
  divisionL10Sequence: number;
  divisionRoadSequence: number;
  divisionSequence: number;
  leagueHomeSequence: number;
  leagueL10Sequence: number;
  leagueRoadSequence: number;
  leagueSequence: number;
  waiversSequence: number;
  wildcardSequence: number;

  // Date and season info
  date: string;
  gameTypeId: number;
  seasonId: number;

  // Overall stats
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  ties: number;
  points: number;
  pointPctg: number;
  winPctg: number;
  regulationWins: number;
  regulationWinPctg: number;
  regulationPlusOtWins: number;
  regulationPlusOtWinPctg: number;
  shootoutWins: number;
  shootoutLosses: number;

  // Goal stats
  goalFor: number;
  goalAgainst: number;
  goalDifferential: number;
  goalDifferentialPctg: number;
  goalsForPctg: number;

  // Home stats
  homeGamesPlayed: number;
  homeWins: number;
  homeLosses: number;
  homeOtLosses: number;
  homeTies: number;
  homePoints: number;
  homeRegulationWins: number;
  homeRegulationPlusOtWins: number;
  homeGoalsFor: number;
  homeGoalsAgainst: number;
  homeGoalDifferential: number;

  // Road stats
  roadGamesPlayed: number;
  roadWins: number;
  roadLosses: number;
  roadOtLosses: number;
  roadTies: number;
  roadPoints: number;
  roadRegulationWins: number;
  roadRegulationPlusOtWins: number;
  roadGoalsFor: number;
  roadGoalsAgainst: number;
  roadGoalDifferential: number;

  // Last 10 games stats
  l10GamesPlayed: number;
  l10Wins: number;
  l10Losses: number;
  l10OtLosses: number;
  l10Ties: number;
  l10Points: number;
  l10RegulationWins: number;
  l10RegulationPlusOtWins: number;
  l10GoalsFor: number;
  l10GoalsAgainst: number;
  l10GoalDifferential: number;

  // Streak information
  streakCode: string; // e.g., "W" for winning streak, "L" for losing streak, "OT" for overtime loss streak
  streakCount: number;
}

// ======== UTILITY TYPES ========

/**
 * Converts a Team (from Schedule) to a partial TeamStanding with common fields
 */
export type TeamToStanding = Pick<Team, 'id' | 'commonName' | 'placeName' | 'abbrev' | 'logo'> & {
  // Additional fields required to create a TeamStanding
};

/**
 * Helper to extract a team from standings
 */
export interface StandingsTeam {
  id: number;
  name: string;
  abbrev: TeamCode;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  division: string;
  conference: string;
}