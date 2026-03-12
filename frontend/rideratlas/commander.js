import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { google } from 'googleapis';

// --- Configuration ---
const GSC_PROPERTY_URL = 'https://jetmymoto.com/';
const CREDENTIALS_PATH = './credentials.json';
const MISSIONS_EUROPE_PATH = './missions-europe.csv';
const MISSIONS_NA_PATH = './missions-na.csv';
const DAYS_AGO = 90;

// --- Helper Functions ---

/**
 * Loads and parses a CSV file into an array of mission objects.
 * @param {string} filePath - The path to the CSV file.
 * @returns {Array<Object>} An array of mission objects.
 */
function loadMissionsFromCsv(filePath) {
    const fileContent = readFileSync(filePath, { encoding: 'utf-8' });
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true
    });
    return records; // Return raw records, fuzzyMatch will handle normalization
}

/**
 * Performs a fuzzy match between a search query and mission data.
 * Checks if the query contains any significant part of the Mission Name or Hub City.
 * @param {string} query - The search query from GSC.
 * @param {Object} mission - A mission object from the CSV.
 * @returns {boolean} True if a fuzzy match is found, false otherwise.
 */
function fuzzyMatch(query, mission) {
    const normalizedQuery = query.toLowerCase();

    const missionName = (mission['Mission Name'] || '').toLowerCase();
    const hubCity = (mission['Hub City'] || '').toLowerCase();

    // Check if the query contains the mission name or hub city
    if (missionName && normalizedQuery.includes(missionName)) {
        return true;
    }
    if (hubCity && normalizedQuery.includes(hubCity)) {
        return true;
    }

    // Advanced fuzzy match: check if significant words from the query are in mission name/hub city
    const queryWords = normalizedQuery.split(/\s+/).filter(word => word.length > 2);
    const missionKeywords = [missionName, hubCity].join(' ');
    const missionWords = missionKeywords.split(/\s+/).filter(word => word.length > 2);

    for (const qWord of queryWords) {
        if (missionWords.some(mWord => mWord.includes(qWord) || qWord.includes(mWord))) {
            return true;
        }
    }

    return false;
}

// --- Main Execution ---
async function runMissionAudit() {
    console.log('--- Initiating Tactical SEO Monitoring Agent ---');

    // 1. Load Mission Data
    const missionsEurope = loadMissionsFromCsv(MISSIONS_EUROPE_PATH);
    const missionsNA = loadMissionsFromCsv(MISSIONS_NA_PATH);
    const allMissions = [...missionsEurope, ...missionsNA];
    console.log(`Loaded ${allMissions.length} missions for analysis.`);

    // 2. Authenticate with GSC
    let auth;
    try {
        const credentials = JSON.parse(readFileSync(CREDENTIALS_PATH, 'utf8'));
        auth = new google.auth.JWT(
            credentials.client_email,
            null,
            credentials.private_key,
            ['https://www.googleapis.com/auth/webmasters.readonly']
        );
        await auth.authorize();
        console.log('GSC Authentication successful.');
    } catch (error) {
        console.error('ERROR: GSC Authentication failed. Ensure credentials.json is valid and correctly formatted.');
        console.error(error.message);
        process.exit(1);
    }

    const searchconsole = google.searchconsole({ version: 'v1', auth });

    // 3. Query GSC Data
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - DAYS_AGO);

    const formattedEndDate = endDate.toISOString().split('T')[0];
    const formattedStartDate = startDate.toISOString().split('T')[0];

    console.log(`Querying GSC for property: ${GSC_PROPERTY_URL} from ${formattedStartDate} to ${formattedEndDate}`);

    let gscData;
    try {
        const response = await searchconsole.searchanalytics.query({
            siteUrl: GSC_PROPERTY_URL,
            requestBody: {
                startDate: formattedStartDate,
                endDate: formattedEndDate,
                dimensions: ['query'],
                rowLimit: 5000 // Adjust as needed
            },
        });
        gscData = response.data.rows || [];
        console.log(`Received ${gscData.length} search queries from GSC.`);
    } catch (error) {
        console.error('ERROR: Failed to query GSC data. Check permissions and property URL.');
        console.error(error.message);
        process.exit(1);
    }

    // 4. Perform Fuzzy Matching and Generate Briefings
    console.log('\n--- Tactical Briefs ---');
    if (gscData.length === 0) {
        console.log('No search queries retrieved from GSC for analysis.');
    }

    for (const row of gscData) {
        const query = row.keys[0];
        let matched = false;

        for (const mission of allMissions) {
            if (fuzzyMatch(query, mission)) {
                console.log(`MISSION DETECTED: ${mission['Mission Name']} | TERRAIN: ${mission['Terrain']} | HAZARD ALERT: ${mission['Hazards'] || 'None specified'}`);
                matched = true;
                break; // Move to the next query once a match is found
            }
        }

        if (!matched) {
            console.log(`UNMAPPED INTENT: ${query}`);
        }
    }

    console.log('\n--- Mission Audit Complete ---');
}

runMissionAudit();
