import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

type Params = { params: { id: string } };

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  const id = decodeURIComponent(params.id)

  try {
    const { rows } = await pool.query(
      `SELECT 
    ps.player_name, 
    ps.draft_year, 
    ps.draft_round, 
    ps.draft_number, 
    json_agg(
        json_build_object(
            'season', ps.season, -- Use season from player_seasons
            'team_abbreviation', ps.team_abbreviation,
            'age', ps.age,
            'pts', ps.pts,
            'reb', ps.reb,
            'ast', ps.ast,
            'net_rating', ps.net_rating,
            'college', ps.college,
            'salary', COALESCE(ns.salary, 0) -- Merge salary from nba_salaries or default to 0
        ) ORDER BY ps.season DESC
    ) as seasons
FROM player_seasons ps
LEFT JOIN nba_salaries ns 
ON ps.player_name = ns.name 
AND ps.year = CAST(ns.season AS NUMERIC) -- Cast season to string
WHERE ps.player_name = $1
GROUP BY ps.player_name, ps.draft_year, ps.draft_round, ps.draft_number;
`,
      [id]
    )

    if (rows.length > 0) {
      return NextResponse.json(rows[0])
    } else {
      return NextResponse.json({ message: 'Player not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Error fetching player data:', error)
    return NextResponse.json({ message: 'Error fetching player data' }, { status: 500 })
  }
}
