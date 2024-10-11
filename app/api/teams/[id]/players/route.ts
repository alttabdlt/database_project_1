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
        player_name as id, 
        player_name, 
        team_abbreviation,
        AVG(pts) as pts, 
        AVG(reb) as reb, 
        AVG(ast) as ast,
        array_agg(DISTINCT season ORDER BY season DESC) as seasons
       FROM player_seasons
       WHERE team_abbreviation = $1
       GROUP BY team_abbreviation, player_name`,
      [id]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching team players:', error);
    return NextResponse.json({ message: 'Error fetching team players' }, { status: 500 });
  }
}
