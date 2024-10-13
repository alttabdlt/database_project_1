import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type SearchParams = {
  limit: string | null;
  search: string | null;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const { limit, search } = Object.fromEntries(searchParams) as SearchParams;

  try {
    let query = `
      SELECT p.player_name, 
        array_agg(DISTINCT t.team_abbreviation) AS team_abbreviations, 
        array_agg(DISTINCT ps.season ORDER BY ps.season DESC) AS seasons
      FROM players p
      JOIN player_seasons ps ON p.id = ps.player_id
      JOIN teams t ON ps.team_id = t.id
      WHERE 1=1
    `;

    const values: any[] = [];

    if (search && search.trim() !== '') {
      query += ` AND p.player_name ILIKE $${values.length + 1}`;
      values.push(`${search}%`);
    }

    query += `
      GROUP BY p.player_name
      ORDER BY p.player_name
    `;

    if (limit) {
      query += ` LIMIT $${values.length + 1}`;
      values.push(parseInt(limit));
    }

    const { rows } = await pool.query(query, values);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching players:', error);
    return NextResponse.json({ message: 'Error fetching players' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const {
      player_name,
      draft_year,
      draft_round,
      draft_number,
      college,
      country,
      team_abbreviation,
      season,
    } = data;

    // Insert or update player
    const playerResult = await pool.query(
      `INSERT INTO players (
        player_name, draft_year, draft_round, draft_number, college, country
      )
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (player_name) DO UPDATE SET
         draft_year = EXCLUDED.draft_year,
         draft_round = EXCLUDED.draft_round,
         draft_number = EXCLUDED.draft_number,
         college = EXCLUDED.college,
         country = EXCLUDED.country
       RETURNING id`,
      [player_name, draft_year, draft_round, draft_number, college, country]
    );
    const playerId = playerResult.rows[0].id;

    // Insert or get team
    const teamResult = await pool.query(
      `INSERT INTO teams (team_abbreviation)
       VALUES ($1)
       ON CONFLICT (team_abbreviation) DO NOTHING
       RETURNING id`,
      [team_abbreviation]
    );
    let teamId = teamResult.rows[0]?.id;
    if (!teamId) {
      const existingTeam = await pool.query(
        `SELECT id FROM teams WHERE team_abbreviation = $1`,
        [team_abbreviation]
      );
      teamId = existingTeam.rows[0].id;
    }

    // Insert into player_seasons
    await pool.query(
      `INSERT INTO player_seasons (player_id, team_id, season)
       VALUES ($1, $2, $3)
       ON CONFLICT (player_id, season) DO NOTHING`,
      [playerId, teamId, season]
    );

    return NextResponse.json(
      { message: 'Player and season inserted successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating player:', error);
    return NextResponse.json({ message: 'Error creating player' }, { status: 500 });
  }
}