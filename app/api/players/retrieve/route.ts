import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { players } = await request.json()

    const query = `
      SELECT 
        player_name, 
        array_agg(DISTINCT team_abbreviation) as team_abbreviations,
        array_agg(DISTINCT season ORDER BY season DESC) as seasons,
        AVG(pts) as avg_pts,
        AVG(reb) as avg_reb,
        AVG(ast) as avg_ast,
        draft_year,
        draft_round,
        draft_number
      FROM player_seasons
      WHERE player_name = ANY($1)
      GROUP BY player_name, draft_year, draft_round, draft_number
      ORDER BY player_name
    `

    const { rows } = await pool.query(query, [players])

    return NextResponse.json({ results: rows, query })
  } catch (error) {
    console.error('Error retrieving players:', error)
    return NextResponse.json({ message: 'Error retrieving players' }, { status: 500 })
  }
}

