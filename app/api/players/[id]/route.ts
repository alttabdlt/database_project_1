import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type Params = { params: { id: string } };

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  const id = decodeURIComponent(params.id)

  try {
    const { rows } = await pool.query(
      `SELECT player_name, draft_year, draft_round, draft_number, 
       json_agg(json_build_object(
         'season', season,
         'team_abbreviation', team_abbreviation,
         'age', age,
         'pts', pts,
         'reb', reb,
         'ast', ast,
         'net_rating', net_rating,
         'college', college
       ) ORDER BY season DESC) as seasons
       FROM player_seasons 
       WHERE player_name = $1 
       GROUP BY player_name, draft_year, draft_round, draft_number`,
      [id]
    )

    if (rows.length > 0) {
      return NextResponse.json(rows[0])
    } else {
      return NextResponse.json({ message: 'Player not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error fetching player data:', error)
    return NextResponse.json({ message: 'Error fetching player data' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id)
  const data = await request.json()

  try {
    const query = `
      UPDATE player_seasons
      SET draft_year = $1, draft_round = $2, draft_number = $3
      WHERE player_name = $4
      RETURNING *
    `
    const values = [data.draft_year, data.draft_round, data.draft_number, id]
    const { rows } = await pool.query(query, values)

    if (rows.length > 0) {
      return NextResponse.json(rows[0])
    } else {
      return NextResponse.json({ message: 'Player not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json({ message: 'Error updating player' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = decodeURIComponent(params.id)

  try {
    const query = `
      DELETE FROM player_seasons
      WHERE player_name = $1
      RETURNING *
    `
    const { rows } = await pool.query(query, [id])

    if (rows.length > 0) {
      return NextResponse.json({ message: 'Player deleted successfully' })
    } else {
      return NextResponse.json({ message: 'Player not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json({ message: 'Error deleting player' }, { status: 500 })
  }
}