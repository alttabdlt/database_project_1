import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { players } = await request.json()

    const query = `
      SELECT 
        p.player_name, 
        array_agg(DISTINCT t.team_abbreviation) AS team_abbreviations,
        array_agg(DISTINCT ps.season ORDER BY ps.season DESC) AS seasons,
        AVG(ps.pts) AS avg_pts,
        AVG(ps.reb) AS avg_reb,
        AVG(ps.ast) AS avg_ast,
        p.draft_year,
        p.draft_round,
        p.draft_number
      FROM players p
      JOIN player_seasons ps ON p.id = ps.player_id
      JOIN teams t ON ps.team_id = t.id
      WHERE p.player_name = ANY($1)
      GROUP BY p.player_name, p.draft_year, p.draft_round, p.draft_number
      ORDER BY p.player_name
    `

    const { rows } = await pool.query(query, [players])

    return NextResponse.json({ results: rows, query })
  } catch (error) {
    console.error('Error retrieving players:', error)
    return NextResponse.json({ message: 'Error retrieving players' }, { status: 500 })
  }
}
