import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const { players } = await request.json();

    if (!players || players.length === 0) {
      return NextResponse.json({ message: 'No players specified for deletion' }, { status: 400 });
    }

    const query = `
      DELETE FROM players
      WHERE player_name IN (${players.map((_: any, i: number) => `$${i + 1}`).join(', ')})
      RETURNING *
    `;

    const { rows } = await pool.query(query, players);

    return NextResponse.json({ message: `${rows.length} players deleted successfully`, players: rows });
  } catch (error) {
    console.error('Error deleting players:', error);
    return NextResponse.json(
      { message: 'Error deleting players', error: (error as Error).message },
      { status: 500 }
    );
  }
}
