import dotenv from 'dotenv';
dotenv.config();

import pkg from 'pg';
const {Pool} = pkg
import fs from 'fs';
import { parse } from 'csv-parse';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432,
});

interface CsvRow {
  player_name: string;
  team_abbreviation: string;
  age: string;
  player_height: string;
  player_weight: string;
  college: string;
  country: string;
  draft_year: string;
  draft_round: string;
  draft_number: string;
  gp: string;
  pts: string;
  reb: string;
  ast: string;
  net_rating: string;
  oreb_pct: string;
  dreb_pct: string;
  usg_pct: string;
  ts_pct: string;
  ast_pct: string;
  season: string;
  team_name: string;
  year: string;
}

interface SalaryRow {
  rank: string;
  name: string;
  position: string;
  team: string;
  salary: string;
  season: string;
}

interface TeamStatsRow {
  franchise: string;
  league: string;
  from_years: string;
  to_years: string;
  number_of_years: string;
  games_played: string;
  games_wins: string;
  games_losses: string;
  win_loss_percentage: string;
  playoff_appearances: string;
  division_titles: string;
  conference_titles: string;
  championships: string;
}

function parseNumeric(value: string): number | null {
  if (value === '' || value.toLowerCase() === 'nan') {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

async function setupDatabase() {
  const client = await pool.connect(); // Use pool.connect() to obtain a client

  try {
    // Drop existing tables
    await client.query(`DROP TABLE IF EXISTS player_seasons CASCADE`);
    await client.query(`DROP TABLE IF EXISTS nba_salaries CASCADE`);
    await client.query(`DROP TABLE IF EXISTS nba_team_stats CASCADE`);
    await client.query(`DROP TABLE IF EXISTS players CASCADE`); // Ensure `players` table exists

    // Create the `players` table
    await client.query(`
      CREATE TABLE players (
        playerid SERIAL PRIMARY KEY,
        player_name VARCHAR(255)
      )
    `);

    // Create player_seasons table
    await client.query(`
      CREATE TABLE player_seasons (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(255),
        team_abbreviation VARCHAR(3),
        age FLOAT,
        player_height FLOAT,
        player_weight FLOAT,
        college VARCHAR(255),
        country VARCHAR(255),
        draft_year INT,
        draft_round INT,
        draft_number INT,
        gp INT,
        pts FLOAT,
        reb FLOAT,
        ast FLOAT,
        net_rating FLOAT,
        oreb_pct FLOAT,
        dreb_pct FLOAT,
        usg_pct FLOAT,
        ts_pct FLOAT,
        ast_pct FLOAT,
        season VARCHAR(7),
        team_name VARCHAR(255),
        year INT,
        UNIQUE (player_name, season)
      )
    `);

    // Create nba_salaries table
    await client.query(`
      CREATE TABLE nba_salaries (
        rank INT PRIMARY KEY,
        player_name VARCHAR(255),
        position VARCHAR(50),
        team VARCHAR(255),
        salary FLOAT,
        season INT
      )
    `);

    // Create nba_team_stats table
    await client.query(`
      CREATE TABLE nba_team_stats (
        franchise VARCHAR(100),
        league VARCHAR(10),
        from_years VARCHAR(10),
        to_years VARCHAR(10),
        number_of_years INT,
        games_played INT,
        games_wins INT,
        games_losses INT,
        win_loss_percentage DECIMAL(5,3),
        playoff_appearances INT,
        division_titles INT,
        conference_titles INT,
        championships INT
      )
    `);

    // Load and process player_seasons CSV
    const parser = parse({ columns: true });
    const playersParser = parse({ columns: true });

    if (!fs.existsSync('all_seasons_1.csv') || !fs.existsSync('players.csv')) {
      console.error('CSV file not found');
      process.exit(1);
    }

    // Insert player data from players.csv
    const playersFileStream = fs.createReadStream('players.csv');
    const playersCsvStream = playersFileStream.pipe(playersParser);
    for await (const playerRow of playersCsvStream) {
      const fullName = `${playerRow.fname} ${playerRow.lname}`;
      const insertPlayerQuery = `
        INSERT INTO players (playerid, player_name)
        VALUES ($1, $2)
        ON CONFLICT (playerid) DO NOTHING
      `;
      await client.query(insertPlayerQuery, [parseInt(playerRow.playerid), fullName]);
    }

    // Process all_seasons_1.csv and other CSV files using batch processing...
    // (Remaining logic for batch processing)
    
    console.log('Data import completed');
  } catch (err) {
    console.error('Error during setup:', err);
  } finally {
    client.release(); // Release the client back to the pool
  }
}

// Run setup
setupDatabase();
