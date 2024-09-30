import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT team_abbreviation
       FROM player_seasons
       ORDER BY team_abbreviation`
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ message: 'Error fetching teams' }, { status: 500 })
  }
}