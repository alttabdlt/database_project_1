'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { motion } from "framer-motion"
import React from "react"

type PlayerApiResponse = {
  player_name: string;
  team_abbreviations: string[];
  seasons: string[];
};

export function Page() {
  const [players, setPlayers] = useState<PlayerApiResponse[]>([])
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerApiResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null)
  const playersPerPage = 21

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/players')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setPlayers(data)
      setFilteredPlayers(data)
    } catch (error) {
      console.error('Error fetching players:', error)
      setError('Failed to load players')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)
    filterPlayers(term, selectedLetter)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleLetterClick = (letter: string) => {
    const newLetter = selectedLetter === letter ? null : letter
    setSelectedLetter(newLetter)
    filterPlayers(searchTerm, newLetter)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const filterPlayers = (search: string, letter: string | null) => {
    let filtered = players

    if (search.trim() !== '') {
      const lowerCaseSearch = search.toLowerCase()
      filtered = filtered.filter(player =>
        player.player_name.toLowerCase().includes(lowerCaseSearch)
      )
    }

    if (letter) {
      filtered = filtered.filter(player =>
        player.player_name.startsWith(letter)
      )
    }

    setFilteredPlayers(filtered)
  }

  // Calculate total pages
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage)

  // Get current players to display
  const indexOfLastPlayer = currentPage * playersPerPage
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage
  const currentPlayers = filteredPlayers.slice(indexOfFirstPlayer, indexOfLastPlayer)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('')

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = []
    let startPage = 1
    let endPage = Math.min(10, totalPages)

    if (currentPage > 6) {
      startPage = currentPage - 5
      endPage = currentPage + 4
      if (endPage > totalPages) {
        endPage = totalPages
        startPage = totalPages - 9 > 0 ? totalPages - 9 : 1
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }
    return pageNumbers
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-white to-red-900 text-gray-900">
      <header className="bg-[#17408B] text-white">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-3xl font-bold text-white flex items-center">
              NBA Stats
            </Link>
            <Link href="/" className="text-gray-200 hover:text-white transition-colors">
              Back to Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-6 text-[#17408B]">NBA Players</h1>

        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-2 border border-[#17408B] rounded"
          />
        </div>

        {/* A-Z Filter Bar */}
        <div className="flex flex-wrap justify-center mb-6">
          {letters.map(letter => (
            <button
              key={letter}
              className={`mx-1 my-1 px-2 py-1 border ${selectedLetter === letter ? 'bg-[#17408B] text-white' : 'bg-white text-[#17408B]'} rounded`}
              onClick={() => handleLetterClick(letter)}
            >
              {letter}
            </button>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {currentPlayers.map((player, index) => (
            <motion.div
              key={player.player_name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: (index % playersPerPage) * 0.1 }}
            >
              <Link href={`/players/${encodeURIComponent(player.player_name)}`}>
                <Card className="bg-white border-[#17408B] hover:border-[#C9082A] transition-all overflow-hidden group">
                  <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
                    <CardTitle className="text-2xl font-bold text-white">{player.player_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-gray-700">
                      Teams: <span className="font-semibold text-[#C9082A]">
                        {player.team_abbreviations.join(', ')}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      Seasons: <span className="font-semibold text-[#C9082A]">
                        {player.seasons.join(', ')}
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          {pageNumbers[0] > 1 && (
            <button
              className="mx-1 px-3 py-1 border bg-white text-[#17408B] rounded"
              onClick={() => setCurrentPage(pageNumbers[0] - 1)}
            >
              &lt;&lt;
            </button>
          )}
          {pageNumbers.map(pageNumber => (
            <button
              key={pageNumber}
              className={`mx-1 px-3 py-1 border ${currentPage === pageNumber ? 'bg-[#17408B] text-white underline' : 'bg-white text-[#17408B]'} rounded`}
              onClick={() => paginate(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          {pageNumbers[pageNumbers.length -1] < totalPages && (
            <button
              className="mx-1 px-3 py-1 border bg-white text-[#17408B] rounded"
              onClick={() => setCurrentPage(pageNumbers[pageNumbers.length -1] +1)}
            >
              &gt;&gt;
            </button>
          )}
        </div>
      </main>
    </div>
  )
}