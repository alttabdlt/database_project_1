'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Button } from '../components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowLeft, Users } from 'lucide-react'
import React from 'react'

type PlayerSeasonStats = {
  season: string;
  team_abbreviation: string;
  age: number;
  pts: number;
  reb: number;
  ast: number;
  net_rating: number;
  college: string | null;
};

type PlayerApiResponse = {
  player_name: string;
  draft_year: number | null;
  draft_round: number | null;
  draft_number: number | null;
  seasons: PlayerSeasonStats[];
};

export function Page() {
  const params = useParams()
  const id = params?.id as string
  const [player, setPlayer] = useState<PlayerApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchPlayerData()
    }
  }, [id])

  const fetchPlayerData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/players/${encodeURIComponent(id)}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Player not found')
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      // Sort the seasons data in ascending order
      data.seasons.sort((a: PlayerSeasonStats, b: PlayerSeasonStats) => a.season.localeCompare(b.season))
      setPlayer(data)
    } catch (error) {
      console.error('Error fetching player data:', error)
      setError(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error || !player) {
    return <div className="flex justify-center items-center h-screen">{error || 'Player not found'}</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-white to-red-900 text-gray-900">
      <header className="bg-[#17408B] text-white">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-3xl font-bold text-white flex items-center">
              NBA Stats
            </Link>
            <Link href="/players" className="text-gray-200 hover:text-white transition-colors">
              <ArrowLeft className="mr-2" />
              Back to Players
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-12 text-[#17408B]">{player.player_name}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-white border-[#17408B]">
            <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
              <CardTitle className="text-2xl font-bold text-white">Personal Info</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p><strong>College:</strong> {player.seasons[0]?.college || 'N/A'}</p>
              <p><strong>Seasons:</strong> {player.seasons.map(s => s.season).join(', ')}</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#17408B]">
            <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
              <CardTitle className="text-2xl font-bold text-white">Draft History</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p><strong>Year:</strong> {player.draft_year || 'N/A'}</p>
              <p><strong>Round:</strong> {player.draft_round || 'N/A'}</p>
              <p><strong>Pick:</strong> {player.draft_number || 'N/A'}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white border-[#17408B] mb-12">
          <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
            <CardTitle className="text-2xl font-bold text-white">Performance Stats</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Season</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Points</TableHead>
                  <TableHead>Rebounds</TableHead>
                  <TableHead>Assists</TableHead>
                  <TableHead>Net Rating</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {player.seasons.map((season, index) => (
                  <TableRow key={index}>
                    <TableCell>{season.season}</TableCell>
                    <TableCell>{season.team_abbreviation}</TableCell>
                    <TableCell>{season.age}</TableCell>
                    <TableCell>{season.pts.toFixed(1)}</TableCell>
                    <TableCell>{season.reb.toFixed(1)}</TableCell>
                    <TableCell>{season.ast.toFixed(1)}</TableCell>
                    <TableCell>{season.net_rating.toFixed(1)}</TableCell>
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
              <LineChart data={player.seasons}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="season" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="pts" stroke="#8884d8" name="Points" />
                <Line type="monotone" dataKey="reb" stroke="#82ca9d" name="Rebounds" />
                <Line type="monotone" dataKey="ast" stroke="#ffc658" name="Assists" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Link href={`/players/compare?player1=${encodeURIComponent(player.player_name)}`}>
            <Button className="bg-[#C9082A] hover:bg-[#17408B] text-white">
              <Users className="mr-2" />
              Compare with Other Players
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}