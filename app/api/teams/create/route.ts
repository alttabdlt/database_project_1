import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    console.log('Received data:', data);

    const {
      team_abbreviation,
      team_name,
      franchise_id,
      From: from_year,
      To: to_year,
      Yrs: years,
      G: games,
      W: wins,
      L: losses,
      'W/L%': win_loss_percentage,
      Plyfs: playoffs,
      Div: division_titles,
      Conf: conference_titles,
      Champ: championships,
    } = data

    // Insert or update the team
    const teamResult = await pool.query(
      `
      INSERT INTO teams (
        team_abbreviation,
        team_name,
        franchise_id
      ) VALUES ($1, $2, $3)
      ON CONFLICT (team_abbreviation) DO UPDATE 
      SET team_name = EXCLUDED.team_name,
          franchise_id = EXCLUDED.franchise_id
      RETURNING *
      `,
      [team_abbreviation, team_name, franchise_id]
    )

    console.log('Team insert/update result:', teamResult.rows[0]);

    // Insert or update data in team_stats
    const statsQuery = `
      INSERT INTO team_stats (
        franchise_id,
        from_year,
        to_year,
        years,
        games,
        wins,
        losses,
        win_loss_percentage,
        playoffs,
        division_titles,
        conference_titles,
        championships
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (franchise_id) DO UPDATE SET
        from_year = EXCLUDED.from_year,
        to_year = EXCLUDED.to_year,
        years = EXCLUDED.years,
        games = EXCLUDED.games,
        wins = EXCLUDED.wins,
        losses = EXCLUDED.losses,
        win_loss_percentage = EXCLUDED.win_loss_percentage,
        playoffs = EXCLUDED.playoffs,
        division_titles = EXCLUDED.division_titles,
        conference_titles = EXCLUDED.conference_titles,
        championships = EXCLUDED.championships
      RETURNING *
    `;

    const statsValues = [
      franchise_id,
      from_year,
      to_year,
      years,
      games,
      wins,
      losses,
      win_loss_percentage,
      playoffs,
      division_titles,
      conference_titles,
      championships,
    ];

    console.log('Stats query:', statsQuery);
    console.log('Stats values:', statsValues);

    const statsResult = await pool.query(statsQuery, statsValues);

    console.log('Inserted/Updated team_stats:', statsResult.rows[0]);

    return NextResponse.json({ 
      message: 'Team created successfully', 
      team: teamResult.rows[0],
      stats: statsResult.rows[0]
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json({ message: 'Error creating team', error: (error as Error).message }, { status: 500 })
  }
}
