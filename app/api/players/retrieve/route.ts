import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type AggregateFunction = {
  [key: string]: string;
}

export async function POST(request: NextRequest) {
  try {
    const { players, attributes, topN, sortBy, sortOrder } = await request.json()

    const playersArray = Array.isArray(players) ? players : []
    const selectedAttributes = attributes && attributes.length > 0 ? attributes : ['*']
    const orderClause = sortBy ? `ORDER BY ${sortBy} ${sortOrder || 'ASC'}` : ''
    const limitClause = topN ? `LIMIT ${topN}` : ''

    const groupByColumns = ['p.player_name', 'p.id']
    const aggregateFunctions: AggregateFunction = {
      'gp': 'SUM(ps.gp)',
      'pts': 'AVG(ps.pts)',
      'reb': 'AVG(ps.reb)',
      'ast': 'AVG(ps.ast)'
    }

    const validPlayerAttributes = ['player_name', 'team_abbreviation', 'age', 'player_height', 'player_weight', 'college', 'country', 'draft_year', 'draft_round', 'draft_number', 'gp', 'pts', 'reb', 'ast']

    const selectClause = ['p.player_name']
      .concat(selectedAttributes
        .filter((attr: string) => validPlayerAttributes.includes(attr))
        .map((attr: string) => {
          if (attr === '*') return 'p.*, ps.*, t.*'
          if (attr in aggregateFunctions) return `${aggregateFunctions[attr]} as ${attr}`
          return `p.${attr}`
        })
      )
      .join(', ')

    const query = `
      SELECT ${selectClause}
      FROM players p
      JOIN player_seasons ps ON p.id = ps.player_id
      JOIN teams t ON ps.team_id = t.id
      ${playersArray.length > 0 ? 'WHERE p.player_name = ANY($1)' : ''}
      GROUP BY ${groupByColumns.join(', ')}
      ${orderClause}
      ${limitClause}
    `

    const { rows } = playersArray.length > 0
      ? await pool.query(query, [playersArray])
      : await pool.query(query)

    return NextResponse.json({ results: rows, query })
  } catch (error) {
    console.error('Error retrieving players:', error)
    return NextResponse.json(
      {
        message: 'Error retrieving players',
        error: (error as Error).message,
      },
      { status: 500 }
    )
  }
}
