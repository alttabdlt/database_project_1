'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ArrowLeft } from 'lucide-react'
import React from 'react'

type PlayerApiResponse = {
  player_name: string
  team_abbreviations: string[]
  seasons: string[]
}

type PlayerPerformanceApiResponse = {
  player_name: string
  team_abbreviations: string[]
  pts: number
  reb: number
  ast: number
  net_rating: number
  seasons: string[]
}

type PlayerSeasonalStatsApiResponse = {
  season: string
  pts: number
  reb: number
  ast: number
  net_rating: number
}

export function Page() {
  const [players, setPlayers] = useState<PlayerApiResponse[]>([])
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(['', ''])
  const [selectedPlayersData, setSelectedPlayersData] = useState<
    PlayerPerformanceApiResponse[]
  >([])
  const [seasonalStats, setSeasonalStats] = useState<{
    [key: string]: PlayerSeasonalStatsApiResponse[]
  }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const maxPlayers = 2

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/players')
      if (!response.ok) throw new Error('Failed to fetch players')
      const data = await response.json()
      setPlayers(data)
    } catch (error) {
      console.error('Error fetching players:', error)
      setError('Failed to load players')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayerSelect = (playerId: string, index: number) => {
    const updatedSelectedPlayers = [...selectedPlayerIds]
    updatedSelectedPlayers[index] = playerId
    setSelectedPlayerIds(updatedSelectedPlayers)
  }

  const handleCompare = async () => {
    if (selectedPlayerIds.some((id) => id === '')) {
      setError('Please select two players to compare.')
      return
    }
    setError(null)
    await fetchSelectedPlayersData()
    await fetchSeasonalStats()
  }

  const fetchSelectedPlayersData = async () => {
    try {
      const response = await fetch(
        `/api/players/compare?ids=${selectedPlayerIds.join(',')}`
      )
      if (!response.ok)
        throw new Error('Failed to fetch selected players data')
      const data = await response.json()
      setSelectedPlayersData(data)
    } catch (error) {
      console.error('Error fetching selected players data:', error)
      setError('Failed to load player comparison data')
    }
  }

  const fetchSeasonalStats = async () => {
    try {
      const stats: { [key: string]: PlayerSeasonalStatsApiResponse[] } = {}
      for (const id of selectedPlayerIds) {
        const response = await fetch(
          `/api/players/${encodeURIComponent(id)}/stats`
        )
        if (!response.ok)
          throw new Error(`Failed to fetch stats for player ${id}`)
        const data = await response.json()
        // Sort the data by season in ascending order
        data.sort((a: PlayerSeasonalStatsApiResponse, b: PlayerSeasonalStatsApiResponse) =>
          a.season.localeCompare(b.season)
        )
        stats[id] = data
      }
      setSeasonalStats(stats)
    } catch (error) {
      console.error('Error fetching seasonal stats:', error)
      setError('Failed to load seasonal stats')
    }
  }

  const calculateOverallScore = (player: PlayerPerformanceApiResponse) => {
    // Simple formula to calculate overall performance score
    return player.pts * 0.4 + player.reb * 0.3 + player.ast * 0.2 + player.net_rating * 0.1
  }

  const deduceBetterPlayer = () => {
    if (selectedPlayersData.length < 2) return null
    const [player1, player2] = selectedPlayersData
    const score1 = calculateOverallScore(player1)
    const score2 = calculateOverallScore(player2)
    if (score1 === score2) return 'Both players have equal performance.'
    const betterPlayer = score1 > score2 ? player1.player_name : player2.player_name
    return `${betterPlayer} is performing better based on the overall performance score.`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">Loading...</div>
    )
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
        <h1 className="text-5xl font-bold text-center mb-12 text-[#17408B]">
          Player Comparison
        </h1>

        {/* Player Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {Array.from({ length: maxPlayers }).map((_, index) => (
            <div key={index} className="mb-8">
              <label className="block text-lg font-medium text-[#17408B] mb-2">
                Select Player {index + 1}
              </label>
              <Select
                onValueChange={(value) => handlePlayerSelect(value, index)}
                value={selectedPlayerIds[index]}
              >
                <SelectTrigger className="w-full bg-white text-[#17408B]">
                  <SelectValue placeholder={`Select player ${index + 1}`} className="text-[#17408B]" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.player_name} value={player.player_name}>
                      {player.player_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 text-center text-red-500">{error}</div>
        )}

        {/* Compare Button */}
        {selectedPlayerIds.every((id) => id !== '') && (
          <div className="flex justify-center mb-12">
            <button
              onClick={handleCompare}
              className="px-6 py-3 bg-[#C9082A] hover:bg-[#17408B] text-white font-bold rounded"
            >
              Compare
            </button>
          </div>
        )}

        {selectedPlayersData.length === maxPlayers && (
          <>
            {/* Deduction */}
            <div className="mb-12 text-center">
              <p className="text-2xl font-bold text-[#17408B]">
                {deduceBetterPlayer()}
              </p>
            </div>

            {/* Comparison Table */}
            <Card className="bg-white border-[#17408B] mb-12">
              <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
                <CardTitle className="text-2xl font-bold text-white">
                  Player Stats Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      {selectedPlayersData.map((player) => (
                        <TableHead key={player.player_name}>{player.player_name}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Points</TableCell>
                      {selectedPlayersData.map((player) => (
                        <TableCell key={player.player_name}>{player.pts.toFixed(1)}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Rebounds</TableCell>
                      {selectedPlayersData.map((player) => (
                        <TableCell key={player.player_name}>{player.reb.toFixed(1)}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Assists</TableCell>
                      {selectedPlayersData.map((player) => (
                        <TableCell key={player.player_name}>{player.ast.toFixed(1)}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Net Rating</TableCell>
                      {selectedPlayersData.map((player) => (
                        <TableCell key={player.player_name}>{player.net_rating.toFixed(1)}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Overall Performance Score</TableCell>
                      {selectedPlayersData.map((player) => (
                        <TableCell key={player.player_name}>
                          {calculateOverallScore(player).toFixed(2)}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Performance Trends */}
            <Card className="bg-white border-[#17408B] mb-12">
              <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
                <CardTitle className="text-2xl font-bold text-white">
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="season" type="category" allowDuplicatedCategory={false} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {selectedPlayerIds.map((id, index) => (
                      <Line
                        key={id + '_pts'}
                        data={seasonalStats[id]}
                        dataKey="pts"
                        name={`${id} Points`}
                        stroke={['#8884d8', '#82ca9d'][index]}
                      />
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