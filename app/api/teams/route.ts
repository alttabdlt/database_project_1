import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { rows } = await pool.query(
      `SELECT team_abbreviation, team_name FROM teams`
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ message: 'Error fetching teams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { team_abbreviation, team_name } = data

    const query = `
      INSERT INTO teams (
        team_abbreviation, 
        team_name
      ) VALUES ($1, $2)
      ON CONFLICT (team_abbreviation) DO UPDATE 
      SET team_name = EXCLUDED.team_name
      RETURNING *
    `
    const values = [team_abbreviation, team_name]
    const { rows } = await pool.query(query, values)
    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json({ message: 'Error creating team' }, { status: 500 })
  }
}
