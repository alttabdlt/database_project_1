import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type SearchParams = {
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  fromYear?: string;
  toYear?: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const {
    limit,
    search,
    sortBy,
    sortOrder,
    fromYear,
    toYear,
  } = Object.fromEntries(searchParams) as SearchParams;

  try {
    let query = `
      SELECT
        t.team_abbreviation,
        t.team_name,
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
      LEFT JOIN team_stats ts ON t.id = ts.franchise_id
      WHERE 1=1
    `;

    const values: any[] = [];

    if (search && search.trim() !== '') {
      query += ` AND t.team_name ILIKE $${values.length + 1}`;
      values.push(`%${search}%`);
    }

    if (fromYear) {
      query += ` AND ts.from_year >= $${values.length + 1}`;
      values.push(parseInt(fromYear));
    }

    if (toYear) {
      query += ` AND ts.to_year <= $${values.length + 1}`;
      values.push(parseInt(toYear));
    }

    if (sortBy) {
      const order = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      query += ` ORDER BY ${sortBy} ${order}`;
    } else {
      query += ' ORDER BY t.team_name';
    }

    if (limit) {
      query += ` LIMIT $${values.length + 1}`;
      values.push(parseInt(limit));
    }

    const { rows } = await pool.query(query, values);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ message: 'Error fetching teams' }, { status: 500 });
  }
}