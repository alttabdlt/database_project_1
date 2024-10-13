import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { teams } = await request.json()

    const query = `
      SELECT 
        franchise,
        lg,
        "from",
        "to",
        yrs,
        g,
        w,
        l,
        "w/l%",
        plyfs,
        div,
        conf,
        champ
      FROM team_stats
      WHERE franchise = ANY($1)
      ORDER BY franchise
    `

    const { rows } = await pool.query(query, [teams])

    return NextResponse.json({ results: rows, query })
  } catch (error) {
    console.error('Error retrieving teams:', error)
    return NextResponse.json({ 
      message: 'Error retrieving teams', 
      error: (error as Error).message 
    }, { status: 500 })
  }
}
