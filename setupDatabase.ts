require('dotenv').config();
const { Pool } = require("pg");
import pg from 'pg';

import fs from 'fs';
import { parse } from 'csv-parse';

const dbConfig = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
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
  const client = new pg.Client(dbConfig);
  await client.connect();

  try {
    // Drop existing tables
    await client.query(`DROP TABLE IF EXISTS player_seasons CASCADE`);
    await client.query(`DROP TABLE IF EXISTS nba_salaries CASCADE`);
    await client.query(`DROP TABLE IF EXISTS nba_team_stats CASCADE`);

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

    // Index creation for player_seasons
    await client.query(`CREATE INDEX IF NOT EXISTS idx_player_name ON player_seasons(player_name)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_team_abbreviation ON player_seasons(team_abbreviation)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_season ON player_seasons(season)`);

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
    if (!fs.existsSync('all_seasons_1.csv')) {
      console.error('CSV file not found');
      process.exit(1);
    }    
    const fileStream = fs.createReadStream('all_seasons_1.csv');
    const csvStream = fileStream.pipe(parser);

    let batch: CsvRow[] = [];
    const batchSize = 100;

    for await (const row of csvStream) {
      batch.push(row);
      if (batch.length >= batchSize) {
        await processBatch(client, batch);
        batch = [];
      }
    }
    if (batch.length > 0) {
      await processBatch(client, batch);
    }

    // Load and process nba_salaries CSV
    const salaryParser = parse({ columns: true });
    const salaryFileStream = fs.createReadStream('/Users/nithiyapriyaramesh/Desktop/database_project_1/nba-salaries.csv');
    const salaryCsvStream = salaryFileStream.pipe(salaryParser);

    let salaryBatch: SalaryRow[] = [];
    for await (const row of salaryCsvStream) {
      salaryBatch.push(row);
      if (salaryBatch.length >= batchSize) {
        await processSalaryBatch(client, salaryBatch);
        salaryBatch = [];
      }
    }
    if (salaryBatch.length > 0) {
      await processSalaryBatch(client, salaryBatch);
    }

    // Load and process nba_team_stats CSV
    const teamStatsParser = parse({ columns: true });
    const teamStatsFileStream = fs.createReadStream('/Users/nithiyapriyaramesh/Desktop/database_project_1/team_stats.csv');
    const teamStatsCsvStream = teamStatsFileStream.pipe(teamStatsParser);

    let teamStatsBatch: TeamStatsRow[] = [];
    const teamStatsBatchSize = 100;

    for await (const row of teamStatsCsvStream) {
      teamStatsBatch.push(row);
      if (teamStatsBatch.length >= teamStatsBatchSize) {
        await processTeamStatsBatch(client, teamStatsBatch);
        teamStatsBatch = [];
      }
    }
    if (teamStatsBatch.length > 0) {
      await processTeamStatsBatch(client, teamStatsBatch);
    }

    console.log('Data import completed');
  } catch (err) {
    console.error('Error during setup:', err);
  } finally {
    await client.end(); // Close the client connection
  }
}

// Batch processing for player_seasons
async function processBatch(client: pg.Client, batch: CsvRow[]) {
  try {
    await client.query('BEGIN'); // Start a transaction
    const query = `
      INSERT INTO player_seasons (
        player_name, team_abbreviation, age, player_height, player_weight,
        college, country, draft_year, draft_round, draft_number,
        gp, pts, reb, ast, net_rating,
        oreb_pct, dreb_pct, usg_pct, ts_pct, ast_pct, season, team_name, year
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23
      )
      ON CONFLICT (player_name, season) DO UPDATE SET
        team_abbreviation = EXCLUDED.team_abbreviation,
        age = EXCLUDED.age,
        player_height = EXCLUDED.player_height,
        player_weight = EXCLUDED.player_weight,
        college = EXCLUDED.college,
        country = EXCLUDED.country,
        draft_year = EXCLUDED.draft_year,
        draft_round = EXCLUDED.draft_round,
        draft_number = EXCLUDED.draft_number,
        gp = EXCLUDED.gp,
        pts = EXCLUDED.pts,
        reb = EXCLUDED.reb,
        ast = EXCLUDED.ast,
        net_rating = EXCLUDED.net_rating,
        oreb_pct = EXCLUDED.oreb_pct,
        dreb_pct = EXCLUDED.dreb_pct,
        usg_pct = EXCLUDED.usg_pct,
        ts_pct = EXCLUDED.ts_pct,
        ast_pct = EXCLUDED.ast_pct,
        team_name = EXCLUDED.team_name,
        year = EXCLUDED.year
    `;
    for (const row of batch) {
      const values = [
        row.player_name, row.team_abbreviation, parseNumeric(row.age),
        parseNumeric(row.player_height), parseNumeric(row.player_weight),
        row.college, row.country, parseNumeric(row.draft_year), parseNumeric(row.draft_round),
        parseNumeric(row.draft_number), parseNumeric(row.gp), parseNumeric(row.pts),
        parseNumeric(row.reb), parseNumeric(row.ast), parseNumeric(row.net_rating),
        parseNumeric(row.oreb_pct), parseNumeric(row.dreb_pct), parseNumeric(row.usg_pct),
        parseNumeric(row.ts_pct), parseNumeric(row.ast_pct), row.season, row.team_name, parseNumeric(row.year)
      ];
      await client.query(query, values);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error processing batch:', err);
  }
}

// Batch processing for nba_salaries
async function processSalaryBatch(client: pg.Client, batch: SalaryRow[]) {
  try {
    await client.query('BEGIN'); // Start a transaction
    const query = `
      INSERT INTO nba_salaries (rank, player_name, position, team, salary, season)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (rank) DO UPDATE SET
        player_name = EXCLUDED.player_name,
        position = EXCLUDED.position,
        team = EXCLUDED.team,
        salary = EXCLUDED.salary,
        season = EXCLUDED.season
    `;
    for (const row of batch) {
      const values = [
        parseInt(row.rank), row.name, row.position, row.team,
        parseFloat(row.salary), parseInt(row.season)
      ];
      await client.query(query, values);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error processing salary batch:', err);
  }
}

// Batch processing for nba_team_stats
async function processTeamStatsBatch(client: pg.Client, batch: TeamStatsRow[]) {
  try {
    await client.query('BEGIN'); // Start a transaction
    const query = `
      INSERT INTO nba_team_stats (
        franchise, league, from_years, to_years, number_of_years, games_played, games_wins,
        games_losses, win_loss_percentage, playoff_appearances, division_titles, conference_titles, championships
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
    `;
    for (const row of batch) {
      const values = [
        row.franchise, row.league, row.from_years, row.to_years,
        parseNumeric(row.number_of_years), parseNumeric(row.games_played), parseNumeric(row.games_wins),
        parseNumeric(row.games_losses), parseNumeric(row.win_loss_percentage), parseNumeric(row.playoff_appearances),
        parseNumeric(row.division_titles), parseNumeric(row.conference_titles), parseNumeric(row.championships)
      ];
      await client.query(query, values);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error processing team stats batch:', err);
  }
}

// Run setup
setupDatabase();
