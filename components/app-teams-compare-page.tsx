'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowLeft } from 'lucide-react'
import React from 'react'

type Team = {
  team_abbreviation: string
}

type TeamPerformance = {
  team_abbreviation: string
  wins: number
  losses: number
  avg_pts: number
}

type TeamSeasonalPerformance = {
  season: string
  wins: number
  losses: number
  avg_pts: number
}

type TeamApiResponse = {
  team_abbreviation: string
}

type TeamPerformanceApiResponse = {
  team_abbreviation: string
  wins: number
  losses: number
  avg_pts: number
}

type TeamSeasonalPerformanceApiResponse = {
  season: string
  wins: number
  losses: number
  avg_pts: number
}

export function Page() {
  const searchParams = useSearchParams()
  const [teams, setTeams] = useState<TeamApiResponse[]>([])
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([searchParams?.get('team1') ?? ''])
  const [selectedTeamsData, setSelectedTeamsData] = useState<TeamPerformanceApiResponse[]>([])
  const [seasonalPerformance, setSeasonalPerformance] = useState<{ [key: string]: TeamSeasonalPerformanceApiResponse[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeams()
  }, [])

  useEffect(() => {
    if (selectedTeamIds.length > 0) {
      // Parallelize API calls
      Promise.all([fetchSelectedTeamsData(), fetchSeasonalPerformance()])
        .then(() => setLoading(false))
        .catch((err) => setError(err.message))
    }
  }, [selectedTeamIds])

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (!response.ok) throw new Error('Failed to fetch teams')
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error('Error fetching teams:', error)
      setError('Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

  const fetchSelectedTeamsData = async () => {
    try {
      const response = await fetch(`/api/teams/compare?ids=${selectedTeamIds.join(',')}`);
      if (!response.ok) throw new Error('Failed to fetch selected teams data');
      const data = await response.json();
  
      console.log('Selected Teams Data:', data);  // Check if data contains wins/losses
      setSelectedTeamsData(data);
    } catch (error) {
      console.error('Error fetching selected teams data:', error);
      setError('Failed to load team comparison data');
    }
  };

  const fetchSeasonalPerformance = async () => {
    try {
      const performance: { [key: string]: TeamSeasonalPerformanceApiResponse[] } = {}
      await Promise.all(
        selectedTeamIds.map(async (id) => {
          const response = await fetch(`/api/teams/${id}/performance`)
          if (!response.ok) throw new Error(`Failed to fetch performance data for team ${id}`)
          const data = await response.json()
          performance[id] = data
        })
      )
      setSeasonalPerformance(performance)
    } catch (error) {
      console.error('Error fetching seasonal performance:', error)
      setError('Failed to load team performance data')
    }
  }

  const handleTeamSelect = (teamId: string) => {
    // Prevent adding the same team repeatedly
    if (!selectedTeamIds.includes(teamId)) {
      if (selectedTeamIds.length < 2) {
        setSelectedTeamIds([...selectedTeamIds, teamId]);
      }
    } else {
      // If the team is clicked again, remove it to avoid repetition
      setSelectedTeamIds(selectedTeamIds.filter(id => id !== teamId));
    }
  };
  

  // Memoize the chart data to avoid re-calculation on every render
  const chartData = useMemo(() => {
    const seasons = Array.from(
      new Set(
        Object.values(seasonalPerformance)
          .flatMap(stats => Array.isArray(stats) ? stats.map(s => s.season) : []) // Safeguard check for array
      )
    );

    return seasons.map(season => {
      const data: any = { season };
      selectedTeamIds.forEach(id => {
        const teamStats = Array.isArray(seasonalPerformance[id])
          ? seasonalPerformance[id].find(s => s.season === season)
          : null;
        if (teamStats) {
          data[`${id}_wins`] = teamStats.wins;
          data[`${id}_losses`] = teamStats.losses;
          data[`${id}_avg_pts`] = teamStats.avg_pts;
        }
      });
      return data;
    });
  }, [seasonalPerformance, selectedTeamIds]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-white to-red-900 text-gray-900">
      <header className="bg-[#17408B] text-white">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-3xl font-bold text-white flex items-center">
              NBA Stats
            </Link>
            <Link href="/teams" className="text-gray-200 hover:text-white transition-colors">
              <ArrowLeft className="mr-2" />
              Back to Teams
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-12 text-[#17408B]">Team Comparison</h1>

        <div className="mb-8">
          <Select onValueChange={handleTeamSelect}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select teams to compare (max 2)" />
            </SelectTrigger>
            <SelectContent>
              {teams.map(team => (
                <SelectItem key={team.team_abbreviation} value={team.team_abbreviation}>
                  {team.team_abbreviation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedTeamsData.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {selectedTeamsData.map((team, index) => (
                <Card key={`${team.team_abbreviation}-${index}`} className="bg-white border-[#17408B]">
                  <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
                    <CardTitle className="text-2xl font-bold text-white">{team.team_abbreviation}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p><strong>Abbreviation:</strong> {team.team_abbreviation}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-white border-[#17408B] mb-12">
              <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
                <CardTitle className="text-2xl font-bold text-white">Team Stats Comparison</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead>Wins</TableHead>
                      <TableHead>Losses</TableHead>
                      <TableHead>Average Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTeamsData.map(team => (
                      <TableRow key={team.team_abbreviation}>
                        <TableCell>{team.team_abbreviation}</TableCell>
                        <TableCell>{team.wins}</TableCell>
                        <TableCell>{team.losses}</TableCell>
                        <TableCell>{team.avg_pts.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-white border-[#17408B] mb-12">
              <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
                <CardTitle className="text-2xl font-bold text-white">Performance Trends</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={chartData}  // Use memoized chartData
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="season" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    {selectedTeamIds.map((id, index) => (
                      <React.Fragment key={id}>
                        <Line
                          type="monotone"
                          dataKey={`${id}_wins`}
                          stroke={['#8884d8', '#82ca9d'][index]}
                          yAxisId="left"
                          name={`${selectedTeamsData.find(t => t.team_abbreviation === id)?.team_abbreviation} (Wins)`}
                        />
                        <Line
                          type="monotone"
                          dataKey={`${id}_avg_pts`}
                          stroke={['#ffc658', '#ff7300'][index]}
                          yAxisId="right"
                          name={`${selectedTeamsData.find(t => t.team_abbreviation === id)?.team_abbreviation} (Avg Points)`}
                        />
                      </React.Fragment>
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  )
}
