import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type AggregateFunction = {
  [key: string]: string;
}

export async function POST(request: NextRequest) {
  try {
    const { players, attributes, topN, sortBy, sortOrder, fromYear, toYear } = await request.json()

    const playersArray = Array.isArray(players) ? players : []
    const selectedAttributes = attributes && attributes.length > 0 ? attributes : ['*']
    const orderClause = sortBy ? `ORDER BY ${sortBy} ${sortOrder || 'ASC'}` : ''
    const limitClause = topN ? `LIMIT ${topN}` : ''

    const groupByColumns = ['p.player_name', 'p.id']
    const aggregateFunctions: AggregateFunction = {
      'games_played': 'SUM(ps.games_played)',
      'pts': 'AVG(ps.pts)',
      'reb': 'AVG(ps.reb)',
      'ast': 'AVG(ps.ast)',
      'years': 'COUNT(DISTINCT ps.season)',
      'gp': 'SUM(ps.games_played)'
    }

    const validPlayerAttributes = ['player_name', 'team_abbreviation', 'age', 'player_height', 'player_weight', 'college', 'country', 'draft_year', 'draft_round', 'draft_number', 'games_played', 'gp', 'pts', 'reb', 'ast', 'years']

    const selectClause = ['p.player_name']
      .concat(selectedAttributes
        .filter((attr: string) => validPlayerAttributes.includes(attr))
        .map((attr: string) => {
          if (attr === '*') return 'p.*, ps.*, t.*'
          if (attr in aggregateFunctions) return `${aggregateFunctions[attr]} as ${attr}`
          if (attr === 'team_abbreviation') return 't.team_abbreviation'
          if (attr === 'age' || attr === 'player_height' || attr === 'player_weight') return `AVG(ps.${attr}) as ${attr}`
          if (attr === 'gp') return `SUM(ps.games_played) as gp`
          return `p.${attr}`
        })
      )
      .join(', ')

    let whereClause = playersArray.length > 0 ? 'WHERE p.player_name = ANY($1)' : ''
    const params: any[] = playersArray.length > 0 ? [playersArray] : []

    if (selectedAttributes.includes('years') && fromYear) {
      whereClause += whereClause ? ' AND ' : 'WHERE '
      whereClause += 'ps.season >= $' + (params.length + 1)
      params.push(fromYear)
    }

    if (selectedAttributes.includes('years') && toYear) {
      whereClause += whereClause ? ' AND ' : 'WHERE '
      whereClause += 'ps.season <= $' + (params.length + 1)
      params.push(toYear)
    }

    const query = `
      SELECT ${selectClause}
      FROM players p
      LEFT JOIN player_seasons ps ON p.id = ps.player_id
      LEFT JOIN teams t ON ps.team_id = t.id
      ${whereClause}
      GROUP BY ${groupByColumns.join(', ')}, t.team_abbreviation
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
