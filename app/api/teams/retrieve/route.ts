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
    const orderClause = sortBy ? `ORDER BY ${sortBy} IS NULL, ${sortBy} ${sortOrder || 'ASC'}` : ''
    const limitClause = topN ? `LIMIT ${topN}` : ''

    const groupByColumns = ['t.team_abbreviation', 't.team_name', 't.id', 'ts.championships']
    const aggregateFunctions: AggregateFunction = {
      'wins': 'COALESCE(SUM(wins), 0)',
      'losses': 'COALESCE(SUM(losses), 0)',
      'win_loss_percentage': 'COALESCE(AVG(win_loss_percentage), 0)',
      'playoffs': 'COALESCE(SUM(playoffs), 0)',
      'division_titles': 'COALESCE(SUM(division_titles), 0)',
      'conference_titles': 'COALESCE(SUM(conference_titles), 0)',
      'championships': 'COALESCE(SUM(championships), 0)',
      'years': 'COUNT(DISTINCT from_year)'
    }

    const validTeamAttributes = ['team_abbreviation', 'team_name', 'wins', 'losses', 'win_loss_percentage', 'playoffs', 'division_titles', 'conference_titles', 'championships', 'years']

    const selectClause = ['t.team_abbreviation', 't.team_name']
      .concat(selectedAttributes
        .filter((attr: string) => validTeamAttributes.includes(attr))
        .map((attr: string) => {
          if (attr === '*') return 't.team_abbreviation, t.team_name, ts.*'
          if (attr in aggregateFunctions) return `ts.${attr}`
          return `t.${attr}`
        })
      )
      .join(', ')

    let whereClause = teamsArray.length > 0 ? 'WHERE t.team_abbreviation = ANY($1)' : ''
    const params: any[] = teamsArray.length > 0 ? [teamsArray] : []

    const query = `
      SELECT ${selectClause}
      FROM teams t
      LEFT JOIN franchises f ON f.id = t.franchise_id
      LEFT JOIN (
        SELECT franchise_id, 
               ${Object.entries(aggregateFunctions).map(([key, value]) => `${value} as ${key}`).join(', ')}
        FROM team_stats
        ${fromYear || toYear ? 'WHERE ' : ''}
        ${fromYear ? `from_year <= ${fromYear}` : ''}
        ${fromYear && toYear ? ' AND ' : ''}
        ${toYear ? `to_year >= ${toYear}` : ''}
        GROUP BY franchise_id
      ) ts ON ts.franchise_id = f.id
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
