import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type AggregateFunction = {
  [key: string]: string;
}

export async function POST(request: NextRequest) {
  try {
    const { teams, attributes, topN, sortBy, sortOrder, fromYear, toYear } = await request.json()

    const teamsArray = Array.isArray(teams) ? teams : []
    const selectedAttributes = attributes && attributes.length > 0 ? attributes : ['*']
    const orderClause = sortBy ? `ORDER BY ${sortBy} ${sortOrder || 'ASC'}` : ''
    const limitClause = topN ? `LIMIT ${topN}` : ''

    const groupByColumns = ['t.team_abbreviation', 't.team_name', 't.id', 'f.id']
    const aggregateFunctions: AggregateFunction = {
      'wins': 'SUM(ts.wins)',
      'losses': 'SUM(ts.losses)',
      'win_loss_percentage': 'AVG(ts.win_loss_percentage)',
      'playoffs': 'SUM(ts.playoffs)',
      'division_titles': 'SUM(ts.division_titles)',
      'conference_titles': 'SUM(ts.conference_titles)',
      'championships': 'SUM(ts.championships)',
      'years': 'COUNT(DISTINCT ts.from_year)'
    }

    const validTeamAttributes = ['team_abbreviation', 'team_name', 'wins', 'losses', 'win_loss_percentage', 'playoffs', 'division_titles', 'conference_titles', 'championships', 'years']

    const selectClause = ['t.team_abbreviation', 't.team_name']
      .concat(selectedAttributes
        .filter((attr: string) => validTeamAttributes.includes(attr))
        .map((attr: string) => {
          if (attr === '*') return 't.*, f.*, ts.*'
          if (attr in aggregateFunctions) return `${aggregateFunctions[attr]} as ${attr}`
          return `t.${attr}`
        })
      )
      .join(', ')

    let whereClause = teamsArray.length > 0 ? 'WHERE t.team_abbreviation = ANY($1)' : ''
    const params: any[] = teamsArray.length > 0 ? [teamsArray] : []

    if (selectedAttributes.includes('years') && fromYear) {
      whereClause += whereClause ? ' AND ' : 'WHERE '
      whereClause += 'ts.from_year <= $' + (params.length + 1)
      params.push(fromYear)
    }

    if (selectedAttributes.includes('years') && toYear) {
      whereClause += whereClause ? ' AND ' : 'WHERE '
      whereClause += 'ts.to_year >= $' + (params.length + 1)
      params.push(toYear)
    }

    const query = `
      SELECT ${selectClause}
      FROM teams t
      LEFT JOIN franchises f ON f.id = t.franchise_id
      LEFT JOIN team_stats ts ON ts.franchise_id = f.id
      ${whereClause}
      GROUP BY ${groupByColumns.join(', ')}
      ${orderClause}
      ${limitClause}
    `

    console.log('Query:', query);
    console.log('Params:', params);

    const { rows } = params.length > 0 
      ? await pool.query(query, params)
      : await pool.query(query)

    console.log('Rows returned:', rows.length);

    return NextResponse.json({ results: rows, query, params })
  } catch (error) {
    console.error('Error retrieving teams:', error)
    return NextResponse.json(
      {
        message: 'Error retrieving teams',
        error: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
