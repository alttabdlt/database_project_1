import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

type Params = { params: { id: string } };

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  const id = params.id;

  try {
    const { rows } = await pool.query(
      `
      SELECT 
        t.team_abbreviation, 
        t.team_name,
        AVG(ps.player_weight) as avg_weight,
        AVG(ps.age) as avg_age,
        AVG(ps.player_height) as avg_height,
        SUM(ps.gp) as total_gp
      FROM teams t
      JOIN player_seasons ps ON t.id = ps.team_id
      WHERE t.team_abbreviation = $1
      GROUP BY t.team_abbreviation, t.team_name
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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const data = await request.json()

  try {
    const query = `
      UPDATE teams
      SET team_name = $1
      WHERE team_abbreviation = $2
      RETURNING *
    `
    const values = [data.team_name, id]
    const { rows } = await pool.query(query, values)

    if (rows.length > 0) {
      return NextResponse.json(rows[0])
    } else {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json({ message: 'Error updating team' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id

  try {
    const query = `
      DELETE FROM teams
      WHERE team_abbreviation = $1
      RETURNING *
    `
    const { rows } = await pool.query(query, [id])

    if (rows.length > 0) {
      return NextResponse.json({ message: 'Team deleted successfully' })
    } else {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json({ message: 'Error deleting team' }, { status: 500 })
  }
}
