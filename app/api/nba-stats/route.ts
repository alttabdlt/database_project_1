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
      SELECT player_name, team_abbreviation, array_agg(DISTINCT season ORDER BY season DESC) as seasons
      FROM player_seasons
      WHERE player_name ILIKE $1 || '%'
      GROUP BY player_name, team_abbreviation
      ORDER BY player_name
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