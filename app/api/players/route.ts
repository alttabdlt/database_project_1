import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type SearchParams = {
  limit?: string;
  search?: string;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const { limit, search } = Object.fromEntries(searchParams) as SearchParams;

  try {
    let query = `
      SELECT
        p.player_name,
        array_agg(DISTINCT t.team_abbreviation) AS team_abbreviations,
        array_agg(DISTINCT ps.season ORDER BY ps.season DESC) AS seasons
      FROM players p
      JOIN player_seasons ps ON p.id = ps.player_id
      JOIN teams t ON ps.team_id = t.id
      WHERE 1=1
    `;

    const values: any[] = [];

    if (search && search.trim() !== '') {
      query += ` AND p.player_name ILIKE $${values.length + 1}`;
      values.push(`${search}%`);
    }

    query += `
      GROUP BY p.player_name
      ORDER BY p.player_name
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