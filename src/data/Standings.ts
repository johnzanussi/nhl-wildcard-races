
export const fetchStandings = async () => {
    const date = new Date().toISOString().split('T')[0];
    const response = await fetch(`https://api-web.nhle.com/v1/standings/${date}`);

    if (!response.ok) {
        throw new Error('Failed to fetch standings');
    }

    return await response.json();
};

export const getWildcardTeams = async () => {

    const standings = await fetchStandings();

    const conferences =  {
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