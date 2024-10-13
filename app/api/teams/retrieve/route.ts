import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { teams, attributes, topN, sortBy, sortOrder, fromYear, toYear } = await request.json()

    const teamsArray = Array.isArray(teams) ? teams : []
    const selectedAttributes = attributes && attributes.length > 0 ? attributes : [
      'team_abbreviation',
      'team_name',
      'wins',
      'losses',
      'win_loss_percentage',
      'playoffs',
      'division_titles',
      'conference_titles',
      'championships',
      'years'
    ]

    // Build the SELECT clause dynamically
    const selectClause = selectedAttributes
      .map((attr: string) => {
        if (['team_abbreviation', 'team_name'].includes(attr)) {
          return `t.${attr}`
        } else if (attr === 'years') {
          return `COUNT(DISTINCT ts.from_year) as years`
        } else {
          // For all other attributes, we'll use COALESCE with SUM
          return `COALESCE(SUM(ts.${attr}), 0) as ${attr}`
        }
      })
      .join(', ')

    // Build the base query
    let query = `
      SELECT ${selectClause}
      FROM teams t
      LEFT JOIN franchises f ON f.id = t.franchise_id
      LEFT JOIN team_stats ts ON ts.franchise_id = f.id
    `

    const values: any[] = []
    const whereClauses: string[] = []

    // Filter by teams if provided
    if (teamsArray.length > 0) {
      whereClauses.push(`t.team_abbreviation = ANY($${values.length + 1})`)
      values.push(teamsArray)
    }

    // Filter by fromYear if provided
    if (fromYear) {
      whereClauses.push(`ts.from_year >= $${values.length + 1}`)
      values.push(fromYear)
    }

    // Filter by toYear if provided
    if (toYear) {
      whereClauses.push(`ts.to_year <= $${values.length + 1}`)
      values.push(toYear)
    }

    // Append WHERE clause if any filters are applied
    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ')
    }

    // Add GROUP BY clause
    query += ' GROUP BY t.team_abbreviation, t.team_name'

    // Handle sorting
    if (sortBy) {
      const order = sortOrder && sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC'
      query += ` ORDER BY ${sortBy} ${order}`
    }

    // Handle limiting results
    if (topN) {
      query += ` LIMIT ${topN}`
    }

    console.log('Query:', query)
    console.log('Params:', values)

    const { rows } = await pool.query(query, values)

    // Add debugging information
    const debugInfo = {
      query,
      params: values,
      rowCount: rows.length,
      columns: rows.length > 0 ? Object.keys(rows[0]) : []
    }

    return NextResponse.json({ results: rows, debug: debugInfo })
  } catch (error) {
    console.error('Error retrieving teams:', error)
    return NextResponse.json(
      { message: 'Error retrieving teams', error: (error as Error).message },
      { status: 500 }
    )
  }
}
