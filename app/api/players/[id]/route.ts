import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type Params = { params: { id: string } };

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  const id = decodeURIComponent(params.id);

  try {
    const { rows } = await pool.query(
      `SELECT p.player_name, p.draft_year, p.draft_round, p.draft_number, p.college, p.country,
       json_agg(json_build_object(
         'season', ps.season,
         'team_abbreviation', t.team_abbreviation,
         'age', ps.age,
         'pts', ps.pts,
         'reb', ps.reb,
         'ast', ps.ast,
         'net_rating', ps.net_rating
       ) ORDER BY ps.season DESC) AS seasons
       FROM players p
       JOIN player_seasons ps ON p.id = ps.player_id
       JOIN teams t ON ps.team_id = t.id
       WHERE p.player_name = $1 
       GROUP BY p.player_name, p.draft_year, p.draft_round, p.draft_number, p.college, p.country`,
      [id]
    );

    if (rows.length > 0) {
      return NextResponse.json(rows[0]);
    } else {
      return NextResponse.json({ message: 'Player not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching player data:', error);
    return NextResponse.json({ message: 'Error fetching player data' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = decodeURIComponent(params.id);
  const data = await request.json();

  try {
    const query = `
      UPDATE players
      SET draft_year = $1, draft_round = $2, draft_number = $3,
          college = $4, country = $5
      WHERE player_name = $6
      RETURNING *
    `;
    const values = [
      data.draft_year,
      data.draft_round,
      data.draft_number,
      data.college,
      data.country,
      id,
    ];
    const { rows } = await pool.query(query, values);

    if (rows.length > 0) {
      return NextResponse.json(rows[0]);
    } else {
      return NextResponse.json({ message: 'Player not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error updating player:', error);
    return NextResponse.json({ message: 'Error updating player' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = decodeURIComponent(params.id);

  try {
    // Delete from player_seasons
    await pool.query(
      `DELETE FROM player_seasons
       WHERE player_id = (SELECT id FROM players WHERE player_name = $1)`,
      [id]
    );

    // Delete from players
    const { rows } = await pool.query(
      `DELETE FROM players
       WHERE player_name = $1
       RETURNING *`,
      [id]
    );

    if (rows.length > 0) {
      return NextResponse.json({ message: 'Player deleted successfully' });
    } else {
      return NextResponse.json({ message: 'Player not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting player:', error);
    return NextResponse.json({ message: 'Error deleting player' }, { status: 500 });
  }
}
