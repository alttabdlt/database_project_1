import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

type Params = { params: { id: string } };

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  const id = params.id;

  try {
    // Fetch team details along with avg_weight, avg_age, total_gp, and avg_height
    const { rows } = await pool.query(
      `
      SELECT 
        team_abbreviation, 
        team_name,
        AVG(player_weight) as avg_weight,
        AVG(age) as avg_age,
        AVG(player_height) as avg_height,
        SUM(gp) as total_gp
      FROM player_seasons
      WHERE team_abbreviation = $1
      GROUP BY team_abbreviation, team_name
      `,
      [id]
    );

    if (rows.length > 0) {
      return NextResponse.json(rows[0]);
    } else {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching team data:', error);
    return NextResponse.json({ message: 'Error fetching team data' }, { status: 500 });
  }
}
