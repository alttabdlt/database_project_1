import pg from 'pg';
import fs from 'fs';
import { parse } from 'csv-parse';

const dbConfig = {
  host: 'localhost',
  user: 'axel',
  password: 'axel',
  database: 'nba_stats',
  port: 5432,
};

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
    await client.query(`DROP TABLE IF EXISTS player_seasons CASCADE`);

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
        UNIQUE (player_name, season)
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_player_name ON player_seasons(player_name)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_team_abbreviation ON player_seasons(team_abbreviation)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_season ON player_seasons(season)`);

    const parser = parse({ columns: true });
    const fileStream = fs.createReadStream('/Users/axel/Desktop/Personal Projects/nba-comparison-project-1/all_seasons.csv');
    const csvStream = fileStream.pipe(parser);

    let batch: CsvRow[] = [];
    const batchSize = 100; // Adjust batch size as needed

    for await (const row of csvStream) {
      batch.push(row);

      if (batch.length >= batchSize) {
        await processBatch(client, batch);
        batch = [];
      }
    }

    // Process any remaining rows
    if (batch.length > 0) {
      await processBatch(client, batch);
    }

    console.log('Data import completed');
  } catch (err) {
    console.error('Error during setup:', err);
  } finally {
    await client.end(); // Close the client connection
  }
}

async function processBatch(client: pg.Client, batch: CsvRow[]) {
  try {
    await client.query('BEGIN'); // Start a transaction

    const query = `
      INSERT INTO player_seasons (
        player_name, team_abbreviation, age, player_height, player_weight,
        college, country, draft_year, draft_round, draft_number,
        gp, pts, reb, ast, net_rating,
        oreb_pct, dreb_pct, usg_pct, ts_pct, ast_pct, season
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21
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
        ast_pct = EXCLUDED.ast_pct
    `;

    for (const row of batch) {
      const values = [
        row.player_name,
        row.team_abbreviation,
        parseNumeric(row.age),
        parseNumeric(row.player_height),
        parseNumeric(row.player_weight),
        row.college || null,
        row.country || null,
        row.draft_year === 'Undrafted' ? null : parseNumeric(row.draft_year),
        row.draft_round === 'Undrafted' ? null : parseNumeric(row.draft_round),
        row.draft_number === 'Undrafted' ? null : parseNumeric(row.draft_number),
        parseNumeric(row.gp),
        parseNumeric(row.pts),
        parseNumeric(row.reb),
        parseNumeric(row.ast),
        parseNumeric(row.net_rating),
        parseNumeric(row.oreb_pct),
        parseNumeric(row.dreb_pct),
        parseNumeric(row.usg_pct),
        parseNumeric(row.ts_pct),
        parseNumeric(row.ast_pct),
        row.season,
      ];

      await client.query(query, values);
    }

    await client.query('COMMIT'); // Commit the transaction
  } catch (err) {
    await client.query('ROLLBACK'); // Rollback on error
    console.error('Error processing batch:', err);
  }
}

setupDatabase();