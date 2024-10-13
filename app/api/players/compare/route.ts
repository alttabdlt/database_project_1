import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get('ids');
  if (!ids) {
    return NextResponse.json({ message: 'Player IDs are required' }, { status: 400 });
  }

  const playerNames = ids.split(',');

  try {
    const query = `
      SELECT
        p.player_name,
        array_agg(DISTINCT t.team_abbreviation) AS team_abbreviations,
        AVG(ps.pts) AS pts,
        AVG(ps.reb) AS reb,
        AVG(ps.ast) AS ast,
        AVG(ps.net_rating) AS net_rating,
        array_agg(DISTINCT ps.season ORDER BY ps.season) AS seasons,
        p.draft_year,
        p.draft_round,
        p.draft_number
      FROM players p
      JOIN player_seasons ps ON p.id = ps.player_id
      JOIN teams t ON ps.team_id = t.id
      WHERE p.player_name = ANY($1)
      GROUP BY p.player_name, p.draft_year, p.draft_round, p.draft_number
    `;

    const { rows } = await pool.query(query, [playerNames]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching player comparison data:', error);
    return NextResponse.json({ message: 'Error fetching player comparison data' }, { status: 500 });
  }
}
