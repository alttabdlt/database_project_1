import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

type Params = {
  params: {
    id: string;
  };
};

export async function GET(
  request: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  const id = params.id;

  try {
    const { rows } = await pool.query<{
      id: string;
      player_name: string;
      team_abbreviation: string;
      pts: number;
      reb: number;
      ast: number;
      seasons: string[];
    }>(
      `SELECT 
        p.player_name AS id, 
        p.player_name, 
        t.team_abbreviation,
        AVG(ps.pts) AS pts, 
        AVG(ps.reb) AS reb, 
        AVG(ps.ast) AS ast,
        array_agg(DISTINCT ps.season ORDER BY ps.season DESC) AS seasons
       FROM players p
       JOIN player_seasons ps ON p.id = ps.player_id
       JOIN teams t ON ps.team_id = t.id
       WHERE t.team_abbreviation = $1
       GROUP BY t.team_abbreviation, p.player_name`,
      [id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching team players:', error);
    return NextResponse.json({ message: 'Error fetching team players' }, { status: 500 });
  }
}
