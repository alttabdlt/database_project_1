'use client'

import { useState, useEffect } from 'react'
import { Input } from './ui/input'
import Link from 'next/link'
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
  const [crudAction, setCrudAction] = useState<string>('Create')
  const [entity, setEntity] = useState<string>('Player')
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null)
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null)
  const [playerFormData, setPlayerFormData] = useState<any>({})
  const [teamFormData, setTeamFormData] = useState<any>({})

  useEffect(() => {
    if (entity === 'Player') {
      fetchPlayers()
    } else if (entity === 'Team') {
      fetchTeams()
    }
  }, [entity])

  const fetchPlayers = async () => {
    try {
      const response = await fetch('/api/players')
      if (!response.ok) throw new Error('Failed to fetch players')
      const data = await response.json()
      setPlayers(data)
    } catch (error) {
      console.error('Error fetching players:', error)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (!response.ok) throw new Error('Failed to fetch teams')
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error('Error fetching teams:', error)
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
  }

  const resetForm = () => {
    setSelectedPlayer(null)
    setSelectedTeam(null)
    setPlayerFormData({})
    setTeamFormData({})
  }

  const handlePlayerFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerFormData({
      ...playerFormData,
      [e.target.name]: e.target.value,
    })
  }

  const handleTeamFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamFormData({
      ...teamFormData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async () => {
    if (entity === 'Player') {
      await handlePlayerSubmit()
    } else if (entity === 'Team') {
      await handleTeamSubmit()
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
      } else if (crudAction === 'Update' && selectedPlayer) {
        response = await fetch(`/api/players/${selectedPlayer}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(playerFormData),
        })
      } else if (crudAction === 'Delete' && selectedPlayer) {
        const confirmDelete = confirm('Are you sure you want to delete this player?')
        if (!confirmDelete) return
        response = await fetch(`/api/players/${selectedPlayer}`, {
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
      } else if (crudAction === 'Update' && selectedTeam) {
        response = await fetch(`/api/teams/${selectedTeam}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(teamFormData),
        })
      } else if (crudAction === 'Delete' && selectedTeam) {
        const confirmDelete = confirm('Are you sure you want to delete this team?')
        if (!confirmDelete) return
        response = await fetch(`/api/teams/${selectedTeam}`, {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-white to-red-900 text-gray-900">
      <header className="bg-[#17408B] text-white">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-center">
            <Link href="/" className="text-3xl font-bold text-white">
              NBA Stats CRUD
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
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
                  </div>
                  <Button onClick={handleSubmit} className="mt-4">Save</Button>
                </form>
              </div>
            )}

            {crudAction === 'Create' && entity === 'Team' && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-[#17408B] mb-4">Create New Team</h2>
                <form>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="team_abbreviation"
                      placeholder="Team Abbreviation"
                      onChange={handleTeamFormChange}
                    />
                    <Input
                      name="team_name"
                      placeholder="Team Name"
                      onChange={handleTeamFormChange}
                    />
                  </div>
                  <Button onClick={handleSubmit} className="mt-4">Save</Button>
                </form>
              </div>
            )}

            {(crudAction === 'Update' || crudAction === 'Delete') && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-[#17408B] mb-4">
                  {crudAction} {entity}
                </h2>
                <Select
                  value={entity === 'Player' ? selectedPlayer?.toString() : selectedTeam?.toString()}
                  onValueChange={(value) => entity === 'Player' ? setSelectedPlayer(Number(value)) : setSelectedTeam(Number(value))}
                >
                  <SelectTrigger className="w-full bg-white text-[#17408B]">
                    <SelectValue placeholder={`Select ${entity}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {entity === 'Player'
                      ? players.map((player) => (
                          <SelectItem key={player.id} value={player.id.toString()}>
                            {player.player_name}
                          </SelectItem>
                        ))
                      : teams.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.team_abbreviation}
                          </SelectItem>
                        ))}
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

                <Button onClick={handleSubmit} className="mt-4">
                  {crudAction}
                </Button>
              </div>
            )}

          </CardContent>
        </Card>
      </main>
    </div>
  )
}