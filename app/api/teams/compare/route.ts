import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type SearchParams = {
  ids: string | null;
};

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const { ids } = Object.fromEntries(searchParams) as SearchParams;

  if (!ids) {
    return NextResponse.json({ message: 'Invalid team IDs' }, { status: 400 });
  }

  const teamIds = ids.split(',')

  try {
    const query = `
      SELECT 
        t.team_abbreviation,
        t.team_name,
        AVG(ps.pts) as avg_pts,
        AVG(ps.reb) as avg_reb,
        AVG(ps.ast) as avg_ast,
        AVG(ps.net_rating) as avg_net_rating,
        COUNT(DISTINCT p.id) as num_players
      FROM teams t
      JOIN player_seasons ps ON t.id = ps.team_id
      JOIN players p ON ps.player_id = p.id
      WHERE t.team_abbreviation = ANY($1)
      GROUP BY t.team_abbreviation, t.team_name
    `
    const { rows } = await pool.query(query, [teamIds])
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching team comparison data:', error)
    return NextResponse.json({ message: 'Error fetching team comparison data' }, { status: 500 })
  }
}
