import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { players, data } = await request.json()

    if (!players || players.length === 0) {
      return NextResponse.json({ message: 'No players specified for update' }, { status: 400 });
    }

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
    }

    // Map 'gp' to 'games_played' if present in the data
    if (data.gp) {
      data.games_played = data.gp;
      delete data.gp;
    }

    const setClause = Object.keys(data)
      .map((key, i) => `${key} = $${i + 1}`)
      .join(', ')

    const query = `
      UPDATE player_seasons
      SET ${setClause}
      WHERE player_id IN (
        SELECT id FROM players WHERE player_name IN (${players
          .map((_: any, i: number) => `$${Object.keys(data).length + i + 1}`)
          .join(', ')})
      )
      RETURNING *
    `

    const values = [...Object.values(data), ...players]
    const { rows } = await pool.query(query, values)

    return NextResponse.json({
      message: `${rows.length} player seasons updated successfully`,
      player_seasons: rows,
    })
  } catch (error) {
    console.error('Error updating players:', error)
    return NextResponse.json(
      { message: 'Error updating players', error: (error as Error).message },
      { status: 500 }
    )
  }
}
