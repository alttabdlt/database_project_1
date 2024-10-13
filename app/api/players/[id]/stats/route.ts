import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const playerName = decodeURIComponent(params.id);

  try {
    const query = `
      SELECT ps.season, ps.pts, ps.reb, ps.ast, ps.net_rating
      FROM player_seasons ps
      JOIN players p ON p.id = ps.player_id
      WHERE p.player_name = $1
      ORDER BY ps.season
    `;

    const { rows } = await pool.query(query, [playerName]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    return NextResponse.json({ message: 'Error fetching player stats' }, { status: 500 });
  }
}
