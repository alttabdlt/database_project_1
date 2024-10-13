import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      player_name,
      team_abbreviation,
      team_name,
      season,
      age,
      player_height,
      player_weight,
      college,
      country,
      draft_year,
      draft_round,
      draft_number,
      games_played,
      pts,
      reb,
      ast,
      net_rating,
      oreb_pct,
      dreb_pct,
      usg_pct,
      ts_pct,
      ast_pct,
    } = data

    // Validate required fields
    if (!player_name) {
      return NextResponse.json({ message: 'Player name is required' }, { status: 400 })
    }
    if (!team_abbreviation) {
      return NextResponse.json({ message: 'Team abbreviation is required' }, { status: 400 })
    }
    if (!team_name) {
      // Attempt to fetch existing team_name from the database
      const teamResult = await pool.query(
        'SELECT team_name FROM teams WHERE team_abbreviation = $1',
        [team_abbreviation]
      )

      if (teamResult.rows.length > 0) {
        data.team_name = teamResult.rows[0].team_name
      } else {
        return NextResponse.json(
          { message: 'Team name is required for new teams' },
          { status: 400 }
        )
      }
    }

    const playerResult = await pool.query(
      `
      INSERT INTO players (
        player_name,
        age,
        player_height,
        player_weight,
        college,
        country,
        draft_year,
        draft_round,
        draft_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (player_name) DO UPDATE SET
        age = EXCLUDED.age,
        player_height = EXCLUDED.player_height,
        player_weight = EXCLUDED.player_weight,
        college = EXCLUDED.college,
        country = EXCLUDED.country,
        draft_year = EXCLUDED.draft_year,
        draft_round = EXCLUDED.draft_round,
        draft_number = EXCLUDED.draft_number
      RETURNING id
      `,
      [
        player_name,
        age || null,
        player_height || null,
        player_weight || null,
        college || null,
        country || null,
        draft_year || null,
        draft_round || null,
        draft_number || null,
      ]
    )
    const playerId = playerResult.rows[0].id

    const teamResult = await pool.query(
      `
      INSERT INTO teams (team_abbreviation, team_name)
      VALUES ($1, $2)
      ON CONFLICT (team_abbreviation) DO UPDATE SET
        team_name = EXCLUDED.team_name
      RETURNING id
      `,
      [team_abbreviation, team_name]
    )
    const teamId = teamResult.rows[0].id

    // Insert into player_seasons
    await pool.query(
      `
      INSERT INTO player_seasons (
        player_id,
        team_id,
        season,
        age,
        player_height,
        player_weight,
        games_played,
        pts,
        reb,
        ast,
        net_rating,
        oreb_pct,
        dreb_pct,
        usg_pct,
        ts_pct,
        ast_pct
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `,
      [
        playerId,
        teamId,
        season || null,
        age || null,
        player_height || null,
        player_weight || null,
        games_played || null,
        pts || null,
        reb || null,
        ast || null,
        net_rating || null,
        oreb_pct || null,
        dreb_pct || null,
        usg_pct || null,
        ts_pct || null,
        ast_pct || null,
      ]
    )

    return NextResponse.json(
      { message: 'Player created successfully', player: playerResult.rows[0] },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { message: 'Error creating player', error: (error as Error).message },
      { status: 500 }
    )
  }
}