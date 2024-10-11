'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { Button } from "../components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Users } from 'lucide-react';
import React from 'react';

type PlayerApiResponse = {
  player_name: string;
  pts: number;
  reb: number;
  ast: number;
  seasons: string[];
}

type TeamPerformanceApiResponse = {
  season: string;
  wins: number;
  losses: number;
  avg_pts: number;
}

type TeamApiResponse = {
  team_abbreviation: string;
  players: PlayerApiResponse[];
  performance: TeamPerformanceApiResponse[];
  team_name: string;
  avg_weight: number;
  avg_age: number;
  avg_height: number;
  total_gp: number;
  total_points: number;
  total_assists: number;
  total_rebounds: number;
}

export function Page() {
  const params = useParams();
  const id = params?.id as string;
  const [team, setTeam] = useState<TeamApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchTeamData(id);
    }
  }, [id]);

  const fetchTeamData = async (teamId: string) => {
    try {
      setLoading(true);
      const teamResponse = await fetch(`/api/teams/${encodeURIComponent(teamId)}`);
      if (!teamResponse.ok) {
        if (teamResponse.status === 404) {
          throw new Error('Team not found');
        }
        throw new Error(`HTTP error! status: ${teamResponse.status}`);
      }
      const teamData = await teamResponse.json();

      const playersResponse = await fetch(`/api/teams/${encodeURIComponent(teamId)}/players`);
      if (!playersResponse.ok) {
        if (playersResponse.status === 404) {
          throw new Error('Players not found');
        }
        throw new Error(`HTTP error! status: ${playersResponse.status}`);
      }
      const playersData = await playersResponse.json();

      // Extract unique years from players' seasons
      const years = new Set<string>();
      playersData.forEach((player: PlayerApiResponse) => {
        player.seasons.forEach((season) => {
          const year = season.split('-')[0];
          years.add(year);
        });
      });

      setAvailableYears(Array.from(years).sort().reverse());
      setTeam({ ...teamData, players: playersData });
    } catch (error) {
      console.error('Error fetching team data:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredPlayers = selectedYear
    ? team?.players.filter((player) =>
        player.seasons.some((season) => season.startsWith(selectedYear))
      )
    : team?.players;

  const handleYearClick = (year: string) => {
    setSelectedYear(year === selectedYear ? null : year);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error || !team) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error || 'Team not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-white to-red-900 text-gray-900">
      <header className="bg-[#17408B] text-white">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-3xl font-bold text-white flex items-center">
              NBA Stats
            </Link>
            <Link href="/" className="text-gray-200 hover:text-white transition-colors">
              <ArrowLeft className="mr-2" />
              Back to Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-12 text-[#17408B]">{team.team_name}</h1>

        <Card className="bg-white border-[#17408B] mb-12 shadow-lg rounded-lg">
          <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91] rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-white">Team Info</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2">
            <p><strong>Abbreviation:</strong> {team.team_abbreviation}</p>
            <p><strong>Average Weight:</strong> {team.avg_weight?.toFixed(1)} kg</p>
            <p><strong>Average Height:</strong> {team.avg_height?.toFixed(1)} cm</p>
            <p><strong>Average Age:</strong> {team.avg_age?.toFixed(1)} years</p>
            <p><strong>Total Games Played:</strong> {team.total_gp}</p>
          </CardContent>
        </Card>

        {/* Year Filter Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          {availableYears.map((year) => (
            <button
              key={year}
              className={`px-4 py-2 rounded-full border ${selectedYear === year ? 'bg-[#17408B] text-white' : 'bg-white text-[#17408B] border-[#17408B] hover:bg-[#17408B] hover:text-white'}`}
              onClick={() => handleYearClick(year)}
            >
              {year}
            </button>
          ))}
        </div>

        <Card className="bg-white border-[#17408B] mb-12">
          <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
            <CardTitle className="text-2xl font-bold text-white">Player Roster</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Rebounds</TableHead>
                  <TableHead>Assists</TableHead>
                  <TableHead>Seasons</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredPlayers && filteredPlayers.length > 0 ? (
                  filteredPlayers.map((player) => (
                    <TableRow key={player.player_name}>
                      <TableCell>
                        <Link href={`/players/${encodeURIComponent(player.player_name)}`} className="text-[#17408B] hover:text-[#C9082A]">
                          {player.player_name}
                        </Link>
                      </TableCell>
                      <TableCell>{player.pts?.toFixed(1) || 'N/A'}</TableCell>
                      <TableCell>{player.reb?.toFixed(1) || 'N/A'}</TableCell>
                      <TableCell>{player.ast?.toFixed(1) || 'N/A'}</TableCell>
                      <TableCell>{player.seasons.join(', ') || 'N/A'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      No players available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Team statistics below player roster */}
            <div className="mt-8 space-y-2">
              <p><strong>Total Points Scored:</strong> {team.total_points?.toFixed(1)}</p>
              <p><strong>Total Assists:</strong> {team.total_assists?.toFixed(1)}</p>
              <p><strong>Total Rebounds:</strong> {team.total_rebounds?.toFixed(1)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#17408B] mb-12">
          <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
            <CardTitle className="text-2xl font-bold text-white">Team Performance</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={team.performance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="season" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="wins" stroke="#8884d8" name="Wins" />
                <Line yAxisId="left" type="monotone" dataKey="losses" stroke="#82ca9d" name="Losses" />
                <Line yAxisId="right" type="monotone" dataKey="avg_pts" stroke="#ffc658" name="Avg Points" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Link href={`/teams/compare?team1=${encodeURIComponent(team.team_abbreviation)}`}>
            <Button className="bg-[#C9082A] hover:bg-[#17408B] text-white">
              <Users className="mr-2" />
              Compare with Other Teams
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
