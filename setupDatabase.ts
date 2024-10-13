import pg from 'pg';
import fs from 'fs';
import { parse } from 'csv-parse';

const dbConfig = {
  host: 'localhost',
  user: 'postgres',
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
  team_name: string;
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
    // Drop dependent tables first
    await client.query(`DROP TABLE IF EXISTS player_seasons;`);
    await client.query(`DROP TABLE IF EXISTS players CASCADE;`);

    // Create players table with unique constraint
    await client.query(`
      CREATE TABLE players (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(255) UNIQUE NOT NULL,
        team_abbreviation VARCHAR(10),
        age INTEGER,
        player_height REAL,
        player_weight REAL,
        college VARCHAR(255),
        country VARCHAR(255),
        draft_year VARCHAR(10),
        draft_round VARCHAR(10),
        draft_number VARCHAR(10),
        gp INTEGER,
        pts REAL,
        reb REAL,
        ast REAL,
        net_rating REAL,
        oreb_pct REAL,
        dreb_pct REAL,
        usg_pct REAL,
        ts_pct REAL,
        ast_pct REAL,
        season VARCHAR(20),
        team_name VARCHAR(255),
        UNIQUE (player_name, team_abbreviation, season)
      )
    `);

    // Create teams table
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        team_abbreviation VARCHAR(10) UNIQUE NOT NULL,
        team_name VARCHAR(255) NOT NULL,
        franchise_id INTEGER REFERENCES franchises(id)
      )
    `);

    // Create player_seasons table (modified)
    await client.query(`
      CREATE TABLE IF NOT EXISTS player_seasons (
        id SERIAL PRIMARY KEY,
        player_id INT REFERENCES players(id),
        team_id INT REFERENCES teams(id),
        age INT,
        player_height REAL,
        player_weight REAL,
        games_played INT,
        pts REAL,
        reb REAL,
        ast REAL,
        net_rating REAL,
        oreb_pct REAL,
        dreb_pct REAL,
        usg_pct REAL,
        ts_pct REAL,
        ast_pct REAL,
        season VARCHAR(9),
        team_name VARCHAR(255),
        UNIQUE (player_id, season)
      );
    `);

    // Create franchises table
    await client.query(`
      CREATE TABLE IF NOT EXISTS franchises (
        id SERIAL PRIMARY KEY,
        franchise_name VARCHAR(255) UNIQUE NOT NULL,
        league VARCHAR(10)
      )
    `);

    // Create team_stats table (modified)
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_stats (
        id SERIAL PRIMARY KEY,
        franchise_id INTEGER REFERENCES franchises(id),
        from_year INTEGER,
        to_year INTEGER,
        years INTEGER,
        games INTEGER,
        wins INTEGER,
        losses INTEGER,
        win_loss_percentage FLOAT,
        playoffs INTEGER,
        division_titles INTEGER,
        conference_titles INTEGER,
        championships INTEGER
      )
    `);

    // Create nba_salaries table (unchanged)
    await client.query(`
      CREATE TABLE IF NOT EXISTS nba_salaries (
        id SERIAL PRIMARY KEY,
        rank INTEGER,
        name VARCHAR(255),
        position VARCHAR(10),
        team VARCHAR(255),
        salary NUMERIC,
        season INTEGER
      )
    `);

    // Import data
    await importPlayers(client);
    await processTeamStats(client);
    await importCSV(client, '/Users/axel/Desktop/Personal Projects/nba-comparison-project-1/nba-salaries.csv', 'nba_salaries');

    console.log('Data import and processing completed');
  } catch (err) {
    console.error('Error during setup:', err);
  } finally {
    await client.end();
  }
}

async function importPlayers(client: pg.Client) {
  const fileStream = fs.createReadStream('all_seasons_1.csv');
  const parser = parse({ columns: true, skip_empty_lines: true });
  const csvStream = fileStream.pipe(parser);

  for await (const row of csvStream) {
    // Parse numeric fields
    const age = parseNumeric(row.age);
    const player_height = parseNumeric(row.player_height);
    const player_weight = parseNumeric(row.player_weight);
    const draft_year = parseNumeric(row.draft_year);
    const draft_round = parseNumeric(row.draft_round);
    const draft_number = parseNumeric(row.draft_number);

    try {
      // Insert or get team
      const teamResult = await client.query(
        `INSERT INTO teams (team_abbreviation, team_name)
         VALUES ($1, $2)
         ON CONFLICT (team_abbreviation) DO UPDATE SET team_name = EXCLUDED.team_name
         RETURNING id`,
        [row.team_abbreviation, row.team_name]
      );
      const teamId = teamResult.rows[0].id;

      // Insert or update player
      const playerResult = await client.query(
        `INSERT INTO players (
          player_name, college, country, draft_year, draft_round, draft_number
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (player_name) DO UPDATE SET
          college = EXCLUDED.college,
          country = EXCLUDED.country,
          draft_year = EXCLUDED.draft_year,
          draft_round = EXCLUDED.draft_round,
          draft_number = EXCLUDED.draft_number
        RETURNING id`,
        [
          row.player_name,
          row.college || null,
          row.country || null,
          parseNumeric(row.draft_year),
          parseNumeric(row.draft_round),
          parseNumeric(row.draft_number)
        ]
      );
      let playerId = playerResult.rows[0]?.id;

      // If player already exists, fetch their ID
      if (!playerId) {
        const existingPlayer = await client.query(
          `SELECT id FROM players WHERE player_name = $1`,
          [row.player_name]
        );
        playerId = existingPlayer.rows[0].id;
      }

      // Insert into player_seasons
      await client.query(
        `INSERT INTO player_seasons (
          player_id, team_id, age, player_height, player_weight,
          games_played, pts, reb, ast, net_rating, oreb_pct, dreb_pct,
          usg_pct, ts_pct, ast_pct, season, team_name
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        ON CONFLICT (player_id, season) DO NOTHING`,
        [
          playerId,
          teamId,
          parseNumeric(row.age),
          parseNumeric(row.player_height),
          parseNumeric(row.player_weight),
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
          row.team_name
        ]
      );
    } catch (error) {
      console.error('Error importing player:', row.player_name, error);
    }
  }
}

async function processTeamStats(client: pg.Client) {
  const fileStream = fs.createReadStream('team_stats.csv');
  const parser = parse({
    columns: (header) => header.map((col: string) => col.trim()),
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });
  const csvStream = fileStream.pipe(parser);

  // Updated teamAbbreviations with historical franchises
  const teamAbbreviations: { [key: string]: string } = {
    // Existing teams
    'Atlanta Hawks': 'ATL',
    'Boston Celtics': 'BOS',
    'Brooklyn Nets': 'BKN',
    'Charlotte Hornets': 'CHA',
    'Chicago Bulls': 'CHI',
    'Cleveland Cavaliers': 'CLE',
    'Dallas Mavericks': 'DAL',
    'Denver Nuggets': 'DEN',
    'Detroit Pistons': 'DET',
    'Golden State Warriors': 'GSW',
    'Houston Rockets': 'HOU',
    'Indiana Pacers': 'IND',
    'Los Angeles Clippers': 'LAC',
    'Los Angeles Lakers': 'LAL',
    'Memphis Grizzlies': 'MEM',
    'Miami Heat': 'MIA',
    'Milwaukee Bucks': 'MIL',
    'Minnesota Timberwolves': 'MIN',
    'New Orleans Pelicans': 'NOP',
    'New York Knicks': 'NYK',
    'Oklahoma City Thunder': 'OKC',
    'Orlando Magic': 'ORL',
    'Philadelphia 76ers': 'PHI',
    'Phoenix Suns': 'PHX',
    'Portland Trail Blazers': 'POR',
    'Sacramento Kings': 'SAC',
    'San Antonio Spurs': 'SAS',
    'Toronto Raptors': 'TOR',
    'Utah Jazz': 'UTA',
    'Washington Wizards': 'WAS',
    
    // Historical franchises
    'Texas Chaparrals': 'TEX',
    'Dallas Chaparrals': 'DLC',
    'New Orleans Jazz': 'NOJ',
    'Washington Bullets': 'WSB',
    'Capital Bullets': 'CAP',
    'Baltimore Bullets': 'BAL',
    'Chicago Zephyrs': 'CHZ',
    'Chicago Packers': 'CHP',
    'Denver Rockets': 'DEN',
    'New Jersey Americans': 'NJN',
    'Rochester Royals': 'ROC',
    'Seattle SuperSonics': 'SEA',
    'San Diego Rockets': 'SDR',
    'St. Louis Hawks': 'STL',
    'Milwaukee Hawks': 'MIL',
    'Tri-Cities Blackhawks': 'TRC',
    'New Jersey Nets': 'NJN',
    'New York Nets': 'NYN',
    'Charlotte Bobcats': 'CHA',
    'Fort Wayne Pistons': 'FNP',
    'San Francisco Warriors': 'SFW',
    'Philadelphia Warriors': 'PHW',
    'San Diego Clippers': 'SDC',
    'Buffalo Braves': 'BUF',
    'Minneapolis Lakers': 'MLK',
    'Vancouver Grizzlies': 'VAN',
    'NO/Oklahoma City Hornets': 'NOK',
    'New Orleans/Oklahoma City Hornets': 'NOK',
    'Syracuse Nationals': 'SYR',
    'Kansas City Kings': 'KCK',
    'Kansas City-Omaha Kings': 'KCO',
    'Cincinnati Royals': 'CIN',
    // Add any other missing franchises
  };

  for await (const row of csvStream) {
    console.log('Row keys:', Object.keys(row)); // Debugging line

    try {
      const franchiseName = row['Franchise'];
      if (!franchiseName) {
        console.warn(`Franchise name is undefined in row:`, row);
        continue; // Skip if franchiseName is undefined
      }

      const team_abbreviation = teamAbbreviations[franchiseName];

      if (!team_abbreviation) {
        console.warn(`No abbreviation found for franchise: ${franchiseName}`);
        continue; // Skip if abbreviation is not found
      }

      // Insert or get franchise
      const franchiseResult = await client.query(
        'INSERT INTO franchises (franchise_name, league) VALUES ($1, $2) ON CONFLICT (franchise_name) DO UPDATE SET league = EXCLUDED.league RETURNING id',
        [franchiseName, row['Lg']]
      );
      const franchiseId = franchiseResult.rows[0].id;

      // Insert or update team
      await client.query(
        `INSERT INTO teams (team_abbreviation, team_name, franchise_id)
         VALUES ($1, $2, $3)
         ON CONFLICT (team_abbreviation) DO UPDATE SET
           team_name = EXCLUDED.team_name,
           franchise_id = EXCLUDED.franchise_id`,
        [team_abbreviation, franchiseName, franchiseId]
      );

      // Insert team_stats
      await client.query(
        `INSERT INTO team_stats (
          franchise_id, from_year, to_year, years, games, wins, losses,
          win_loss_percentage, playoffs, division_titles, conference_titles, championships
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          franchiseId,
          parseInt(row['From'].split('-')[0]),
          parseInt(row['To'].split('-')[0]),
          parseInt(row['Yrs']),
          parseInt(row['G']),
          parseInt(row['W']),
          parseInt(row['L']),
          parseFloat(row['W/L%']),
          parseInt(row['Plyfs']),
          parseInt(row['Div']),
          parseInt(row['Conf']),
          parseInt(row['Champ']),
        ]
      );

      console.log(`Processed team: ${franchiseName}`);
    } catch (error) {
      console.error(`Error processing team ${row['Franchise']}:`, error);
    }
  }
}

async function importCSV(client: pg.Client, filePath: string, tableName: string) {
  const fileStream = fs.createReadStream(filePath);
  const parser = parse({ columns: true, skip_empty_lines: true });
  const csvStream = fileStream.pipe(parser);

  for await (const row of csvStream) {
    const columns = Object.keys(row);
    const values = Object.values(row);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

    const query = `
      INSERT INTO ${tableName} (${columns.join(', ')})
      VALUES (${placeholders})
    `;

    await client.query(query, values);
  }
}

setupDatabase();