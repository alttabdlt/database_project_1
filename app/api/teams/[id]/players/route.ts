import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type Params = { params: { id: string } };

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  const id = params.id

  try {
    const { rows } = await pool.query(
      `SELECT player_name as id, player_name, 
        AVG(pts) as pts, AVG(reb) as reb, AVG(ast) as ast,
        array_agg(DISTINCT season ORDER BY season DESC) as seasons
       FROM player_seasons
       WHERE team_abbreviation = $1
       GROUP BY player_name`,
      [id]
    )
    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching team players:', error)
    return NextResponse.json({ message: 'Error fetching team players' }, { status: 500 })
  }
}