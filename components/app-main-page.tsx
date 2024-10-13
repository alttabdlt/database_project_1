'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Input } from './ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from './ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Button } from './ui/button'
import React from 'react'

type Player = {
    id: number
    player_name: string
  }
  
  type Team = {
    id: number
    team_abbreviation: string
  }
  
export function Page() {
    const [showCrudInterface, setShowCrudInterface] = useState(false)
    const [crudAction, setCrudAction] = useState<string>('Create')
    const [entity, setEntity] = useState<string>('Player')
    const [players, setPlayers] = useState<Player[]>([])
    const [teams, setTeams] = useState<Team[]>([])
    const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null)
    const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
    const [playerFormData, setPlayerFormData] = useState<Partial<Player>>({})
    const [teamFormData, setTeamFormData] = useState<Partial<Team>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedPlayerName, setSelectedPlayerName] = useState<string | null>(null)
    const [selectedTeamAbbreviation, setSelectedTeamAbbreviation] = useState<string | null>(null)
    const [playerDetails, setPlayerDetails] = useState<any>(null)
    const [teamDetails, setTeamDetails] = useState<any>(null)
  
    useEffect(() => {
      if (entity === 'Player') {
        fetchPlayers()
      } else if (entity === 'Team') {
        fetchTeams()
      }
    }, [entity])
  
    const fetchPlayers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/players')
        if (!response.ok) {
          throw new Error('Failed to fetch players')
        }
        const data = await response.json()
        setPlayers(data)
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError(String(error))
        }
      } finally {
        setIsLoading(false)
      }
    }
      
      const fetchTeams = async () => {
        try {
          setIsLoading(true)
          setError(null)
          const response = await fetch('/api/teams')
          if (!response.ok) {
            throw new Error('Failed to fetch teams')
          }
          const data = await response.json()
          setTeams(data)
        } catch (error) {
          if (error instanceof Error) {
            setError(error.message)
          } else {
            setError(String(error))
          }
        } finally {
          setIsLoading(false)
        }
      }
  
    // Handlers for CRUD actions
    const handleCrudActionChange = (value: string) => {
      setCrudAction(value)
      resetForm()
    }
  
    const handleEntityChange = (value: string) => {
      setEntity(value)
      resetForm()
      if (value === 'Player') {
        fetchPlayers()
      } else if (value === 'Team') {
        fetchTeams()
      }
    }
  
    const resetForm = () => {
      setSelectedPlayerId(null)
      setSelectedTeamId(null)
      setPlayerFormData({})
      setTeamFormData({})
    }
  
    const handlePlayerFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setPlayerFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  
    const handleTeamFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target
      setTeamFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }))
    }
  
    const handleSubmit = async () => {
      if (entity === 'Player') {
        if (crudAction === 'Create') return await handleCreatePlayer()
        if (crudAction === 'Update' && selectedPlayerName) return await handleUpdatePlayer()
        if (crudAction === 'Delete' && selectedPlayerName) return await handleDeletePlayer()
        if (crudAction === 'Retrieve' && selectedPlayerName) return await fetchPlayerDetails(selectedPlayerName)
      }

      if (entity === 'Team') {
        if (crudAction === 'Create') return await handleCreateTeam()
        if (crudAction === 'Update' && selectedTeamAbbreviation) return await handleUpdateTeam()
        if (crudAction === 'Delete' && selectedTeamAbbreviation) return await handleDeleteTeam()
        if (crudAction === 'Retrieve' && selectedTeamAbbreviation) return await fetchTeamDetails(selectedTeamAbbreviation)
      }
    }
  
    const handlePlayerSubmit = async () => {
      try {
        let response
        if (crudAction === 'Create') {
          response = await fetch('/api/players', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(playerFormData),
          })
        } else if (crudAction === 'Update' && selectedPlayerId) {
          response = await fetch(`/api/players/${selectedPlayerId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(playerFormData),
          })
        } else if (crudAction === 'Delete' && selectedPlayerId) {
          const confirmDelete = confirm('Are you sure you want to delete this player?')
          if (!confirmDelete) return
          response = await fetch(`/api/players/${selectedPlayerId}`, {
            method: 'DELETE',
          })
        }
        if (!response?.ok) throw new Error('Failed to perform action')
        alert('Action completed successfully')
        resetForm()
        fetchPlayers()
      } catch (error) {
        console.error('Error performing action:', error)
        alert('An error occurred')
      }
    }
  
    const handleTeamSubmit = async () => {
      try {
        let response
        if (crudAction === 'Create') {
          response = await fetch('/api/teams', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(teamFormData),
          })
        } else if (crudAction === 'Update' && selectedTeamId) {
          response = await fetch(`/api/teams/${selectedTeamId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(teamFormData),
          })
        } else if (crudAction === 'Delete' && selectedTeamId) {
          const confirmDelete = confirm('Are you sure you want to delete this team?')
          if (!confirmDelete) return
          response = await fetch(`/api/teams/${selectedTeamId}`, {
            method: 'DELETE',
          })
        }
        if (!response?.ok) throw new Error('Failed to perform action')
        alert('Action completed successfully')
        resetForm()
        fetchTeams()
      } catch (error) {
        console.error('Error performing action:', error)
        alert('An error occurred')
      }
    }
  
    const handleCreatePlayer = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playerFormData),
        })
        if (!response.ok) {
          throw new Error('Failed to create player')
        }
        await fetchPlayers()
        resetForm()
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError(String(error))
        }
      } finally {
        setIsLoading(false)
      }
    }
  
    const handleDeletePlayer = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/players/${selectedPlayerId}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete player')
        }
        await fetchPlayers()
        resetForm()
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError(String(error))
        }
      } finally {
        setIsLoading(false)
      }
    }
  
    const handleCreateTeam = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teamFormData),
        })
        if (!response.ok) {
          throw new Error('Failed to create team')
        }
        await fetchTeams()
        resetForm()
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError(String(error))
        }
      } finally {
        setIsLoading(false)
      }
    }
  
    const handleUpdateTeam = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/teams/${selectedTeamId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teamFormData),
        })
        if (!response.ok) {
          throw new Error('Failed to update team')
        }
        await fetchTeams()
        resetForm()
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError(String(error))
        }
      } finally {
        setIsLoading(false)
      }
    }
  
    const handleDeleteTeam = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/teams/${selectedTeamId}`, {
          method: 'DELETE',
        })
        if (!response.ok) {
          throw new Error('Failed to delete team')
        }
        await fetchTeams()
        resetForm()
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError(String(error))
        }
      } finally {
        setIsLoading(false)
      }
    }
  
    const handleUpdatePlayer = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/players/${selectedPlayerId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playerFormData),
        })
        if (!response.ok) {
          throw new Error('Failed to update player')
        }
        await fetchPlayers()
        resetForm()
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError(String(error))
        }
      } finally {
        setIsLoading(false)
      }
    }
  
    const fetchPlayerDetails = async (playerName: string) => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/players/${encodeURIComponent(playerName)}`)
        if (!response.ok) {
          throw new Error('Failed to fetch player details')
        }
        const data = await response.json()
        setPlayerDetails(data)
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError(String(error))
        }
      } finally {
        setIsLoading(false)
      }
    }
  
    const fetchTeamDetails = async (teamAbbreviation: string) => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/teams/${encodeURIComponent(teamAbbreviation)}`)
        if (!response.ok) {
          throw new Error('Failed to fetch team details')
        }
        const data = await response.json()
        setTeamDetails(data)
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message)
        } else {
          setError(String(error))
        }
      } finally {
        setIsLoading(false)
      }
    }
  
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-white to-red-900 text-gray-900">
          <header className="bg-[#17408B] text-white">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex justify-center">
                <Link href="/" className="text-3xl font-bold text-white">
                  NBA Stats
                </Link>
              </nav>
            </div>
          </header>
      
          <main className="container mx-auto px-4 py-12">
            {!showCrudInterface ? (
              <>
                <motion.h1 
                  initial={{ opacity: 0, y: -50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-5xl font-bold text-center mb-12 text-[#17408B]"
                >
                  Explore NBA Statistics
                </motion.h1>
      
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link href="/players">
                        <Card className="bg-white border-[#17408B] hover:border-[#C9082A] transition-all overflow-hidden group">
                        <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
                            <CardTitle className="text-2xl font-bold text-white">View Player Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-gray-700">Explore statistics for NBA players.</p>
                        </CardContent>
                        </Card>
                    </Link>
                    <Link href="/teams">
                        <Card className="bg-white border-[#17408B] hover:border-[#C9082A] transition-all overflow-hidden group">
                        <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
                            <CardTitle className="text-2xl font-bold text-white">View Team Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-gray-700">Explore statistics for NBA teams.</p>
                        </CardContent>
                        </Card>
                    </Link>
                    <Link href="/teams/compare">
                        <Card className="bg-white border-[#17408B] hover:border-[#C9082A] transition-all overflow-hidden group">
                        <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
                            <CardTitle className="text-2xl font-bold text-white">Compare Team Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-gray-700">Compare statistics between NBA teams.</p>
                        </CardContent>
                        </Card>
                    </Link>
                    <Link href="/players/compare">
                        <Card className="bg-white border-[#17408B] hover:border-[#C9082A] transition-all overflow-hidden group">
                        <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
                            <CardTitle className="text-2xl font-bold text-white">Compare Player Statistics</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-gray-700">Compare statistics between NBA players.</p>
                        </CardContent>
                        </Card>
                    </Link>
                    </div>
                </div>
      
                <Button 
                  onClick={() => setShowCrudInterface(true)} 
                  className="mt-8 bg-[#C9082A] hover:bg-[#17408B] text-white"
                >
                  Manage Data
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => setShowCrudInterface(false)} 
                  className="mb-4 bg-[#17408B] hover:bg-[#C9082A] text-white"
                >
                  Back to Exploration
                </Button>
                <Card className="bg-white border-[#17408B] mb-12">
                  <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91]">
                    <CardTitle className="text-2xl font-bold text-white">
                      Manage {entity}s
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {/* CRUD Action Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-lg font-medium text-[#17408B] mb-2">
                          Select Action
                        </label>
                        <Select
                          value={crudAction}
                          onValueChange={handleCrudActionChange}
                        >
                          <SelectTrigger className="w-full bg-white text-[#17408B]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Create">Create</SelectItem>
                            <SelectItem value="Retrieve">Retrieve</SelectItem>
                            <SelectItem value="Update">Update</SelectItem>
                            <SelectItem value="Delete">Delete</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
            
                      <div>
                        <label className="block text-lg font-medium text-[#17408B] mb-2">
                          Select Entity
                        </label>
                        <Select
                          value={entity}
                          onValueChange={handleEntityChange}
                        >
                          <SelectTrigger className="w-full bg-white text-[#17408B]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Player">Player</SelectItem>
                            <SelectItem value="Team">Team</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
          
                    {/* Dynamic Form based on CRUD Action and Entity */}
                    {/* For 'Create' action */}
                    {crudAction === 'Create' && entity === 'Player' && (
                      <div className="mt-8">
                        <h2 className="text-xl font-bold text-[#17408B] mb-4">Create New Player</h2>
                        <form>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              name="player_name"
                              placeholder="Player Name"
                              onChange={handlePlayerFormChange}
                            />
                            <Input
                              name="draft_year"
                              placeholder="Draft Year"
                              type="number"
                              onChange={handlePlayerFormChange}
                            />
                            <Input
                              name="draft_round"
                              placeholder="Draft Round"
                              type="number"
                              onChange={handlePlayerFormChange}
                            />
                            <Input
                              name="draft_number"
                              placeholder="Draft Number"
                              type="number"
                              onChange={handlePlayerFormChange}
                            />
                            {/* Add other input fields as necessary */}
                          </div>
                          <Button onClick={handleSubmit} className="mt-4 bg-green-500 text-white hover:bg-green-600">
                            Save
                          </Button>
                        </form>
                      </div>
                    )}
          
                    {crudAction === 'Create' && entity === 'Team' && (
                      <div className="mt-8">
                        <h2 className="text-xl font-bold text-[#17408B] mb-4">Create New Team</h2>
                        <form>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                              name="Franchise"
                              placeholder="Franchise"
                              onChange={handleTeamFormChange}
                            />
                            <Input
                              name="Lg"
                              placeholder="League"
                              onChange={handleTeamFormChange}
                            />
                            {/* Add other input fields as necessary */}
                          </div>
                          <Button onClick={handleSubmit} className="mt-4 bg-green-500 text-white hover:bg-green-600">
                            Save
                          </Button>
                        </form>
                      </div>
                    )}
          
                    {(crudAction === 'Update' || crudAction === 'Delete') && (
                      <div className="mt-8">
                        <h2 className="text-xl font-bold text-[#17408B] mb-4">
                          {crudAction} {entity}
                        </h2>
                        <Select
                          value={entity === 'Player' ? selectedPlayerId?.toString() : selectedTeamId?.toString()}
                          onValueChange={(value) => entity === 'Player' ? setSelectedPlayerId(Number(value)) : setSelectedTeamId(Number(value))}
                        >
                          <SelectTrigger className="w-full bg-white text-[#17408B]">
                            <SelectValue placeholder={`Select ${entity}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {entity === 'Player'
                              ? players.map((player) => player && player.id ? (
                                  <SelectItem key={player.id} value={player.id.toString()}>
                                    {player.player_name}
                                  </SelectItem>
                                ) : null)
                              : null}
                          </SelectContent>
                        </Select>
        
                        {crudAction === 'Update' && (
                          <form className="mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {entity === 'Player' ? (
                                <>
                                  <Input
                                    name="draft_year"
                                    placeholder="Draft Year"
                                    type="number"
                                    onChange={handlePlayerFormChange}
                                  />
                                  <Input
                                    name="draft_round"
                                    placeholder="Draft Round"
                                    type="number"
                                    onChange={handlePlayerFormChange}
                                  />
                                  <Input
                                    name="draft_number"
                                    placeholder="Draft Number"
                                    type="number"
                                    onChange={handlePlayerFormChange}
                                  />
                                </>
                              ) : (
                                <Input
                                  name="team_name"
                                  placeholder="Team Name"
                                  onChange={handleTeamFormChange}
                                />
                              )}
                            </div>
                          </form>
                        )}
        
                        <Button onClick={handleSubmit} className="mt-4" aria-label={`${crudAction} ${entity}`}>
                          {crudAction}
                        </Button>
                      </div>
                    )}

                    {/* Selection Dropdown for 'Retrieve', 'Update', and 'Delete' Actions */}
                    {(crudAction === 'Retrieve' || crudAction === 'Update' || crudAction === 'Delete') && (
                      <div className="mt-4">
                        {entity === 'Player' ? (
                          <>
                            <Select
                              value={selectedPlayerName || ''}
                              onValueChange={(value) => setSelectedPlayerName(value)}
                            >
                              <SelectTrigger className="w-full bg-white text-[#17408B]">
                                <SelectValue placeholder="Select Player" />
                              </SelectTrigger>
                              <SelectContent>
                                {players.map((player) => (
                                  <SelectItem key={player.player_name} value={player.player_name}>
                                    {player.player_name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </>
                        ) : (
                          <>
                            <Select
                              value={selectedTeamAbbreviation || ''}
                              onValueChange={(value) => setSelectedTeamAbbreviation(value)}
                            >
                              <SelectTrigger className="w-full bg-white text-[#17408B]">
                                <SelectValue placeholder="Select Team" />
                              </SelectTrigger>
                              <SelectContent>
                                {teams.map((team) => (
                                  <SelectItem key={team.team_abbreviation} value={team.team_abbreviation}>
                                    {team.team_abbreviation}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </>
                        )}
                      </div>
                    )}

                    {/* Display Player Details */}
                    {crudAction === 'Retrieve' && entity === 'Player' && playerDetails && (
                      <div className="mt-4 bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-bold text-[#17408B] mb-4">Player Details</h2>
                        <p><strong>Name:</strong> {playerDetails.player_name}</p>
                        <p><strong>Team:</strong> {playerDetails.team_abbreviation}</p>
                        <p><strong>Age:</strong> {playerDetails.age}</p>
                        <p><strong>Height:</strong> {playerDetails.player_height}</p>
                        <p><strong>Weight:</strong> {playerDetails.player_weight}</p>
                        <p><strong>College:</strong> {playerDetails.college}</p>
                        {/* Add other details as needed */}
                      </div>
                    )}

                    {/* Display Team Details */}
                    {crudAction === 'Retrieve' && entity === 'Team' && teamDetails && (
                      <div className="mt-4 bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-bold text-[#17408B] mb-4">Team Details</h2>
                        <p><strong>Name:</strong> {teamDetails.team_name}</p>
                        <p><strong>League:</strong> {teamDetails.Lg}</p>
                        <p><strong>From:</strong> {teamDetails.From}</p>
                        <p><strong>To:</strong> {teamDetails.To}</p>
                        <p><strong>Games Played:</strong> {teamDetails.G}</p>
                        <p><strong>Wins:</strong> {teamDetails.W}</p>
                        <p><strong>Losses:</strong> {teamDetails.L}</p>
                        {/* Add other details as needed */}
                      </div>
                    )}
        
                  </CardContent>
                </Card>
              </>
            )}
          </main>
        </div>
      )
}