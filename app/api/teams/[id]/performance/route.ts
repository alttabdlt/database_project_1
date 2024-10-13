import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

type Params = { params: { id: string } };

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  const id = params.id; // 'id' will now be the team name (e.g., 'Houston Rockets')
  console.log(id)

  try {
    console.log(id)
    const { rows } = await pool.query(
      `SELECT 
        CONCAT(t.from_years, '-', t.to_years) AS season_range,
        t.games_wins,
        t.games_losses,
        t.win_loss_percentage,
        t.games_played,
        SUM(ps.pts) AS total_points,
        SUM(ps.ast) AS total_assists,
        SUM(ps.reb) AS total_rebounds
      FROM nba_team_stats t
      JOIN player_seasons ps ON t.franchise = ps.team_name
      WHERE ps.team_abbreviation = $1
      GROUP BY t.from_years,t.to_years, t.games_wins, t.games_losses, t.win_loss_percentage, t.games_played
      ORDER BY t.to_years`,
      [id]
    );

    const performance = rows.map(row => ({
      season: row.season,
      games_wins: row.games_wins,
      games_losses: row.games_losses,
      win_loss_percentage: row.win_loss_percentage,
      games_played: row.games_played,
      total_points: row.total_points,
      total_assists: row.total_assists,
      total_rebounds: row.total_rebounds
    }));

    const total_wins = rows.reduce((sum, row) => sum + row.games_wins, 0);
    const total_losses = rows.reduce((sum, row) => sum + row.games_losses, 0);
    const total_games = rows.reduce((sum, row) => sum + row.games_played, 0);
    const all_time_win_loss_percentage = total_games > 0 ? total_wins / total_games : 0;

    const allTimePerformance = {
      total_wins,
      total_losses,
      total_games,
      all_time_win_loss_percentage: parseFloat(all_time_win_loss_percentage.toFixed(3))
    };

    const response = {
      performance,
      all_time_performance: allTimePerformance
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching team performance:', error);
    return NextResponse.json({ message: 'Error fetching team performance' }, { status: 500 });
  }
}
