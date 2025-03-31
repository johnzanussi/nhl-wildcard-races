// scripts/track-games.ts
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import gameOutcomesJson from './game-outcomes.json';
import { type Game } from '../src/data/nhl';

// Set the file path relative to this script
const OUTCOMES_FILE = resolve(__dirname, './game-outcomes.json');

// Import game outcomes directly
const gameOutcomes: Record<string, string> = gameOutcomesJson;

// Function to fetch data from NHL API
const fetchScores = async () => {
    const response = await fetch('https://api-web.nhle.com/v1/score/now');

    if (!response.ok) {
        throw new Error('Failed to fetch scores');
    }

    const scores = await response.json();

    return scores.games as Game[];
};

// Function to send a request to Vercel deploy hook
const triggerVercelDeploy = async (deployHook: string) => {
    try {
        const response = await fetch(deployHook, { method: 'POST' });
        console.log(`Vercel deploy status: ${response.status}`);
        return response.ok;
    } catch (error) {
        console.error(`Error triggering deploy: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
};

// Main function to check games and trigger deploys if needed
const checkGames = async () => {
    try {
        // Get deploy hook from environment variable
        const deployHook = process.env.VERCEL_DEPLOY_HOOK;
        if (!deployHook) {
            throw new Error('VERCEL_DEPLOY_HOOK environment variable is not set');
        }

        console.log(`Checking NHL games at ${new Date().toISOString()}`);

        let hasChanged = false;
        let triggerDeploy = false;

        // Fetch current scores
        const scores = await fetchScores();

        // Process each game
        scores.forEach((game) => {
            const gameId = game.id.toString();

            // Track new games
            if (!gameOutcomes[gameId]) {
                console.log(`Tracking new game: ${gameId} - ${game.awayTeam.abbrev} @ ${game.homeTeam.abbrev}`);
                hasChanged = true;
                gameOutcomes[gameId] = '';
            }

            // Check for completed games with new outcomes
            if (
                game.gameOutcome &&
                game.gameOutcome.lastPeriodType &&
                gameOutcomes[gameId] !== game.gameOutcome.lastPeriodType
            ) {
                console.log(`Game ${gameId} completed with outcome: ${game.gameOutcome.lastPeriodType}`);
                console.log(`${game.awayTeam.abbrev} ${game.awayTeam.score} - ${game.homeTeam.score} ${game.homeTeam.abbrev}`);

                gameOutcomes[gameId] = game.gameOutcome.lastPeriodType;
                hasChanged = true;
                triggerDeploy = true;
            }
        });

        // Save changes if needed
        if (hasChanged) {
            console.log('Saving updated game outcomes');
            await writeFile(OUTCOMES_FILE, JSON.stringify(gameOutcomes));
        }

        // Trigger deployment if needed
        if (triggerDeploy) {
            console.log('Triggering Vercel deployment');

            // Set the output for GitHub Actions
            if (process.env.GITHUB_OUTPUT) {
                await writeFile(
                    process.env.GITHUB_OUTPUT,
                    'trigger_deploy=true\n',
                );
            }

            const deploySuccess = await triggerVercelDeploy(deployHook);
            console.log(`Deployment triggered: ${deploySuccess ? 'Success' : 'Failed'}`);
        } else {
            console.log('No new game completions, skipping deployment');

            // Set output for GitHub Actions
            if (process.env.GITHUB_OUTPUT) {
                await writeFile(
                    process.env.GITHUB_OUTPUT,
                    'trigger_deploy=false\n',
                );
            }
        }
    } catch (error) {
        console.error(`Error in NHL tracker: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
};

// Run the main function
checkGames().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
