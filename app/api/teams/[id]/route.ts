import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type Params = { params: { id: string } };

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  const id = params.id

  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT team_abbreviation
       FROM player_seasons
       WHERE team_abbreviation = $1`,
      [id]
    )

    if (rows.length > 0) {
      return NextResponse.json(rows[0])
    } else {
      return NextResponse.json({ message: 'Team not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error fetching team data:', error)
    return NextResponse.json({ message: 'Error fetching team data' }, { status: 500 })
  }
}