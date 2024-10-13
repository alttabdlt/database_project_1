import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type SearchParams = {
  query: string | null;
  limit: string | null;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const { query: queryParam, limit } = Object.fromEntries(searchParams) as SearchParams;

  try {
    let sqlQuery = `
      SELECT p.player_name, t.team_abbreviation, array_agg(DISTINCT ps.season ORDER BY ps.season DESC) as seasons
      FROM players p
      JOIN player_seasons ps ON p.id = ps.player_id
      JOIN teams t ON ps.team_id = t.id
      WHERE p.player_name ILIKE $1 || '%'
      GROUP BY p.player_name, t.team_abbreviation
      ORDER BY p.player_name
      LIMIT 10
    `
    const values: any[] = [queryParam]

    if (limit) {
      sqlQuery += ' LIMIT $2'
      values.push(limit)
    }

    const { rows } = await pool.query(sqlQuery, values)
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error searching data:', error)
    return NextResponse.json({ message: 'Error searching data' }, { status: 500 })
  }
}