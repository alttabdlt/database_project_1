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
        player_name,
        array_agg(DISTINCT team_abbreviation) AS team_abbreviations,
        AVG(pts) AS pts,
        AVG(reb) AS reb,
        AVG(ast) AS ast,
        AVG(net_rating) AS net_rating,
        array_agg(DISTINCT season ORDER BY season) AS seasons
      FROM player_seasons
      WHERE player_name = ANY($1)
      GROUP BY player_name
    `;

    const { rows } = await pool.query(query, [playerNames]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching player comparison data:', error);
    return NextResponse.json({ message: 'Error fetching player comparison data' }, { status: 500 });
  }
}