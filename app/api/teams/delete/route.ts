import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function DELETE(request: NextRequest) {
  try {
    const { teams } = await request.json()

    if (!teams || teams.length === 0) {
      return NextResponse.json({ message: 'No teams specified for deletion' }, { status: 400 })
    }

    const query = `
      DELETE FROM teams
      WHERE team_abbreviation IN (${teams.map((_: any, i: number) => `$${i + 1}`).join(', ')})
      RETURNING *
    `

    const { rows } = await pool.query(query, teams)

    return NextResponse.json({ message: `${rows.length} teams deleted successfully`, teams: rows })
  } catch (error) {
    console.error('Error deleting teams:', error)
    return NextResponse.json(
      { message: 'Error deleting teams', error: (error as Error).message },
      { status: 500 }
    )
  }
}
