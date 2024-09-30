import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type SearchParams = {
  limit: string | null;
  search: string | null;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const { limit, search } = Object.fromEntries(searchParams) as SearchParams;

  try {
    let query = `
      SELECT player_name, array_agg(DISTINCT team_abbreviation) as team_abbreviations, array_agg(DISTINCT season ORDER BY season DESC) as seasons
      FROM player_seasons
      WHERE 1=1
    `;

    const values: any[] = [];

    if (search && search.trim() !== '') {
      query += ` AND player_name ILIKE $${values.length + 1}`;
      values.push(`${search}%`);
    }

    query += `
      GROUP BY player_name
      ORDER BY player_name
    `;

    if (limit) {
      query += ` LIMIT $${values.length + 1}`;
      values.push(parseInt(limit));
    }

    const { rows } = await pool.query(query, values)
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json({ message: 'Error fetching players' }, { status: 500 })
  }
}