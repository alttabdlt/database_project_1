import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { teams } = await request.json()

    const query = `
      SELECT 
        t.team_abbreviation,
        t.team_name,
        f.franchise_name,
        f.league,
        ts.from_year,
        ts.to_year,
        ts.years,
        ts.games,
        ts.wins,
        ts.losses,
        ts.win_loss_percentage,
        ts.playoffs,
        ts.division_titles,
        ts.conference_titles,
        ts.championships
      FROM teams t
      JOIN franchises f ON t.id = f.team_id
      JOIN team_stats ts ON f.id = ts.franchise_id
      WHERE t.team_abbreviation = ANY($1)
      ORDER BY t.team_abbreviation
    `

    const { rows } = await pool.query(query, [teams])

    return NextResponse.json({ results: rows, query })
  } catch (error) {
    console.error('Error retrieving teams:', error)
    return NextResponse.json(
      {
        message: 'Error retrieving teams',
        error: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
