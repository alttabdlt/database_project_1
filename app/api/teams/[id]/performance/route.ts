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
      `SELECT season, 
              AVG(pts) as avg_pts,
              COUNT(*) as games_played
       FROM player_seasons
       WHERE team_abbreviation = $1
       GROUP BY season
       ORDER BY season`,
      [id]
    )

    // This is a simplification. In a real scenario, you'd need actual win/loss data.
    const performance = rows.map(row => ({
      season: row.season,
      avg_pts: parseFloat(row.avg_pts),
      wins: Math.floor(row.games_played / 2),  // Dummy calculation
      losses: Math.ceil(row.games_played / 2)  // Dummy calculation
    }))

    return NextResponse.json(performance)
  } catch (error) {
    console.error('Error fetching team performance:', error)
    return NextResponse.json({ message: 'Error fetching team performance' }, { status: 500 })
  }
}