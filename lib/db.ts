require('dotenv').config();
const { Pool } = require("pg");


/* const { Pool } = pg
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'nba_stats',
  password: 'Pr311VgW7738',
  port: 5432,
}) */

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export default pool

export async function getTeamComparison(teamIds: string[]) {
  const client = await pool.connect()
  try {
    const query = `
      SELECT 
        team_abbreviation,
        AVG(pts) as avg_pts,
        AVG(reb) as avg_reb,
        AVG(ast) as avg_ast,
        AVG(net_rating) as avg_net_rating,
        COUNT(DISTINCT season) as seasons_played,
        COUNT(DISTINCT CASE WHEN pts > (SELECT AVG(pts) FROM player_seasons) THEN player_name END) as above_avg_scorers
      FROM player_seasons
      WHERE team_abbreviation = ANY($1)
      GROUP BY team_abbreviation
    `
    const result = await client.query(query, [teamIds])
    return result.rows
  } finally {
    client.release()
  }
}