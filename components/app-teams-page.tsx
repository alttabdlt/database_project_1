'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { motion } from "framer-motion"
import React from "react"

type Team = {
  team_abbreviation: string
  team_name: string
}

type TeamApiResponse = {
  team_abbreviation: string
  team_name: string
}

export function Page() {
  const [teams, setTeams] = useState<TeamApiResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTeams()
  }, [])

  const fetchTeams = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/teams')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: TeamApiResponse[] = await response.json()
      
      // Remove duplicates based on team_abbreviation
      const uniqueTeams = data.reduce((acc, current) => {
        if (!acc.find(team => team.team_abbreviation === current.team_abbreviation)) {
          acc.push(current)
        }
        return acc
      }, [] as TeamApiResponse[])

      setTeams(uniqueTeams)
    } catch (error) {
      console.error('Error fetching teams:', error)
      setError('Failed to load teams')
    } finally {
      setLoading(false)
    }
  }

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
            <Link href="/" className="text-gray-200 hover:text-white transition-colors">
              Back to Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-12 text-[#17408B]">NBA Teams</h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {teams.map((team, index) => (
            <motion.div
              key={team.team_abbreviation}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={`/teams/${encodeURIComponent(team.team_abbreviation)}`}>
                <Card className="bg-white border-[#17408B] hover:border-[#C9082A] transition-all overflow-hidden group">
                  <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
                    <CardTitle className="text-2xl font-bold text-white">{team.team_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="text-gray-700">Abbreviation: <span className="font-semibold text-[#C9082A]">{team.team_abbreviation}</span></p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  )
}
