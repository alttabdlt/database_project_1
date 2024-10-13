import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function PUT(request: NextRequest) {
  try {
    const { teams, data } = await request.json()
    console.log('Received update data:', { teams, data });

    if (!teams || teams.length === 0 || !data) {
      return NextResponse.json({ message: 'No teams specified or no data provided for update' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Prepare stats update query and values
      const fieldMappings = {
        'From': 'from_year',
        'To': 'to_year',
        'Yrs': 'years',
        'G': 'games',
        'W': 'wins',
        'L': 'losses',
        'W/L%': 'win_loss_percentage',
        'Plyfs': 'playoffs',
        'Div': 'division_titles',
        'Conf': 'conference_titles',
        'Champ': 'championships'
      };

      const statsUpdateValues: any[] = [];
      const statsUpdateSetClauses: string[] = [];

      Object.entries(fieldMappings).forEach(([inputField, dbField]) => {
        if (data[inputField] !== undefined && data[inputField] !== null && data[inputField] !== '') {
          statsUpdateValues.push(data[inputField]);
          statsUpdateSetClauses.push(`${dbField} = $${statsUpdateValues.length}`);
        }
      });

      // Only update if there are fields to update
      let statsUpdateResult;
      if (statsUpdateSetClauses.length > 0) {
        const statsUpdateQuery = `
          UPDATE team_stats ts
          SET ${statsUpdateSetClauses.join(', ')}
          FROM teams t
          WHERE t.franchise_id = ts.franchise_id
            AND t.team_abbreviation = ANY($${statsUpdateValues.length + 1})
          RETURNING *
        `;
        statsUpdateValues.push(teams);
        
        console.log('Stats update query:', statsUpdateQuery);
        console.log('Stats update values:', statsUpdateValues);
        statsUpdateResult = await client.query(statsUpdateQuery, statsUpdateValues);
        console.log('Stats update result:', statsUpdateResult.rows);
      }

      await client.query('COMMIT')

      return NextResponse.json({ 
        message: `Teams and stats updated successfully`, 
        stats: statsUpdateResult ? statsUpdateResult.rows : []
      })
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating teams:', error)
    return NextResponse.json(
      { message: 'Error updating teams', error: (error as Error).message },
      { status: 500 }
    )
  }
}
