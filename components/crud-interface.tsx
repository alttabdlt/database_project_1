'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Checkbox } from './ui/checkbox'
import React from 'react'
import { Slider } from "./ui/slider"
import { Label } from "./ui/label"

type Player = {
  player_name: string
  team_abbreviation: string
  age: number
  player_height: number
  player_weight: number
  college: string
  country: string
  draft_year: number
  draft_round: number
  draft_number: number
  gp: number
  pts: number
  reb: number
  ast: number
}

type Team = {
  team_abbreviation: string;
  team_name?: string;
  Franchise: string
  Lg: string
  From: number
  To: number
  Yrs: number
  G: number
  W: number
  L: number
  'W/L%': number
  Plyfs: number
  Div: number
  Conf: number
  Champ: number
}

const playerAttributes = [
  'player_name', 'team_abbreviation', 'age', 'player_height', 'player_weight',
  'college', 'country', 'draft_year', 'draft_round', 'draft_number', 'gp',
  'pts', 'reb', 'ast'
]

const teamAttributes = [
  'team_abbreviation',
  'team_name',
  'wins',
  'losses',
  'win_loss_percentage',
  'playoffs',
  'division_titles',
  'conference_titles',
  'championships',
  'years'
]

const AttributeSelect = ({ 
  entity, 
  selectedAttributes, 
  setSelectedAttributes 
}: { 
  entity: string; 
  selectedAttributes: string[]; 
  setSelectedAttributes: (value: string[]) => void;
}) => {
  const handleValueChange = (value: string) => {
    if (selectedAttributes.includes(value)) {
      setSelectedAttributes(selectedAttributes.filter((attr: string) => attr !== value));
    } else {
      setSelectedAttributes([...selectedAttributes, value]);
    }
  };

  return (
    <div className="space-y-2">
      {(entity === 'Player' ? playerAttributes : teamAttributes).map((attr: string) => (
        <div key={attr} className="flex items-center">
          <Checkbox
            id={attr}
            checked={selectedAttributes.includes(attr)}
            onCheckedChange={() => handleValueChange(attr)}
          />
          <label htmlFor={attr} className="ml-2">
            {attr}
          </label>
        </div>
      ))}
    </div>
  );
};

export function CrudInterface() {
  const [crudAction, setCrudAction] = useState<string>('Create')
  const [entity, setEntity] = useState<string>('Player')
  const [players, setPlayers] = useState<Player[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [playerFormData, setPlayerFormData] = useState<Partial<Player>>({})
  const [teamFormData, setTeamFormData] = useState<Partial<Team>>({})
  const [retrievedData, setRetrievedData] = useState<(Player | Team)[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [sqlQuery, setSqlQuery] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([])
  const [topN, setTopN] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [fromYear, setFromYear] = useState<number>(1946)
  const [toYear, setToYear] = useState<number>(2023)

  useEffect(() => {
    fetchPlayers()
    fetchTeams()
  }, [])

  const fetchPlayers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/players')
      if (!response.ok) throw new Error('Failed to fetch players')
      const data = await response.json()
      setPlayers(data)
    } catch (error) {
      console.error('Error fetching players:', error)
      setError('Failed to load players')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/teams')
      if (!response.ok) throw new Error('Failed to fetch teams')
      const data = await response.json()
      setTeams(data)
    } catch (error) {
      console.error('Error fetching teams:', error)
      setError('Failed to load teams')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPlayers = useMemo(() => {
    if (!searchTerm) return players;
    return players.filter(player => 
      player.player_name && player.player_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [players, searchTerm])

  const filteredTeams = useMemo(() => {
    const uniqueTeams = teams.filter((team, index, self) =>
      team.team_abbreviation && team.team_name &&
      index === self.findIndex((t) => t.team_abbreviation === team.team_abbreviation)
    )
    
    if (!searchTerm) return uniqueTeams
    
    return uniqueTeams.filter(team => 
      team.team_abbreviation && team.team_abbreviation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.team_name && team.team_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [teams, searchTerm])

  const handleCrudActionChange = (value: string) => {
    setCrudAction(value)
    resetForm()
  }

  const handleEntityChange = (value: string) => {
    setEntity(value)
    resetForm()
  }

  const resetForm = () => {
    setSelectedPlayer('')
    setSelectedTeam('')
    setPlayerFormData({})
    setTeamFormData({})
    setRetrievedData(null)
    setSqlQuery('')
    setSelectedItems([])  // Clear selected items
    setSelectedAttributes([])  // Clear selected attributes
    setTopN('')  // Reset topN
    setSortBy('')  // Reset sortBy
    setSortOrder('desc')  // Reset sortOrder to default
    setFromYear(1946)  // Reset fromYear to default
    setToYear(2023)  // Reset toYear to default
    setSearchTerm('')  // Clear search term
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

  const handleItemSelect = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    )
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError(null)
    setRetrievedData(null)
    setSqlQuery('')

    try {
      let response
      if (crudAction === 'Retrieve') {
        const endpoint = entity === 'Player' ? '/api/players/retrieve' : '/api/teams/retrieve'
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [entity.toLowerCase() + 's']: selectedItems,
            attributes: selectedAttributes,
            topN: topN ? parseInt(topN) : undefined, // Parse topN here
            sortBy,
            sortOrder,
            fromYear: selectedAttributes.includes('years') ? fromYear : undefined,
            toYear: selectedAttributes.includes('years') ? toYear : undefined,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          console.log('Retrieved data:', data)
          setRetrievedData(data.results)
          setSqlQuery(data.query)
        } else {
          const errorData = await response.json()
          console.error('Error response:', errorData)
          throw new Error(`Failed to retrieve ${entity.toLowerCase()}s`)
        }
      } else {
        if (entity === 'Player') {
          await handlePlayerSubmit()
        } else if (entity === 'Team') {
          await handleTeamSubmit()
        }
      }
    } catch (error) {
      console.error('Error:', error)
      setError((error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlayerSubmit = async () => {
    try {
      setIsLoading(true)
      let response
      let query = ''
      if (crudAction === 'Create') {
        query = `INSERT INTO player_seasons (${Object.keys(playerFormData).join(', ')}) VALUES (${Object.values(playerFormData).map((_, i) => `$${i + 1}`).join(', ')})`
        response = await fetch('/api/players', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ players: [playerFormData], query }),
        })
      } else if (crudAction === 'Update' && selectedItems.length > 0) {
        const setClause = Object.keys(playerFormData).map((key, i) => `${key} = $${i + 1}`).join(', ')
        query = `UPDATE player_seasons SET ${setClause} WHERE player_name IN (${selectedItems.map((_, i) => `$${Object.keys(playerFormData).length + i + 1}`).join(', ')})`
        response = await fetch('/api/players', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ players: selectedItems, data: playerFormData, query }),
        })
      } else if (crudAction === 'Delete' && selectedItems.length > 0) {
        query = `DELETE FROM player_seasons WHERE player_name IN (${selectedItems.map((_, i) => `$${i + 1}`).join(', ')})`
        response = await fetch('/api/players', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ players: selectedItems, query }),
        })
      } else if (crudAction === 'Retrieve' && selectedItems.length > 0) {
        query = `SELECT ${selectedAttributes.join(', ')} FROM players WHERE player_name IN (${selectedItems.map((_, i) => `$${i + 1}`).join(', ')}) ORDER BY ${sortBy} ${sortOrder} LIMIT ${topN}`
        response = await fetch('/api/players/retrieve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ players: selectedItems, query }),
        })
        if (response.ok) {
          const data = await response.json()
          setRetrievedData(data.results as (Player | Team)[])
          setSqlQuery(data.query)
        }
      }
      if (!response?.ok) throw new Error('Failed to perform action')
      if (crudAction !== 'Retrieve') {
        alert('Action completed successfully')
        resetForm()
        fetchPlayers()
      }
    } catch (error) {
      console.error('Error performing action:', error)
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTeamSubmit = async () => {
    try {
      setIsLoading(true)
      let response
      if (crudAction === 'Retrieve') {
        response = await fetch('/api/teams/retrieve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            teams: selectedItems,
            attributes: selectedAttributes,
            topN,
            sortBy,
            sortOrder,
            fromYear,
            toYear,
          }),
        })
        if (response.ok) {
          const data = await response.json()
          console.log('Retrieved data:', data) // Add this line for debugging
          setRetrievedData(data.results as Team[])
          setSqlQuery(data.query)
        } else {
          const errorData = await response.json()
          console.error('Error response:', errorData) // Add this line for debugging
          throw new Error('Failed to retrieve teams')
        }
      } else if (crudAction === 'Create') {
        const query = `INSERT INTO teams (${Object.keys(teamFormData).join(', ')}) VALUES (${Object.values(teamFormData).map((_, i) => `$${i + 1}`).join(', ')})`
        response = await fetch('/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teams: [teamFormData], query }),
        })
      } else if (crudAction === 'Update' && selectedItems.length > 0) {
        const setClause = Object.keys(teamFormData).map((key, i) => `${key} = $${i + 1}`).join(', ')
        const query = `UPDATE teams SET ${setClause} WHERE Franchise IN (${selectedItems.map((_, i) => `$${Object.keys(teamFormData).length + i + 1}`).join(', ')})`
        response = await fetch('/api/teams', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teams: selectedItems, data: teamFormData, query }),
        })
      } else if (crudAction === 'Delete' && selectedItems.length > 0) {
        const query = `DELETE FROM teams WHERE Franchise IN (${selectedItems.map((_, i) => `$${i + 1}`).join(', ')})`
        response = await fetch('/api/teams', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teams: selectedItems, query }),
        })
      }
      if (!response?.ok) throw new Error('Failed to perform action')
      if (crudAction !== 'Retrieve') {
        alert('Action completed successfully')
        resetForm()
        fetchTeams()
      }
    } catch (error) {
      console.error('Error performing action:', error)
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-white to-red-900 text-gray-900">
      <header className="bg-[#17408B] text-white">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="text-3xl font-bold text-white">
              NBA Stats CRUD
            </Link>
            <Link href="/" className="text-gray-200 hover:text-white transition-colors">
              Back to Home
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

            {/* Search Input */}
            <Input
              placeholder={`Search ${entity}s`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />

            {/* Dynamic Form based on CRUD Action and Entity */}
            {crudAction === 'Create' && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-[#17408B] mb-4">Create New {entity}</h2>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entity === 'Player' ? (
                    <>
                      <Input name="player_name" placeholder="Player Name" onChange={handlePlayerFormChange} />
                      <Input name="team_abbreviation" placeholder="Team Abbreviation" onChange={handlePlayerFormChange} />
                      <Input name="age" placeholder="Age" type="number" onChange={handlePlayerFormChange} />
                      <Input name="player_height" placeholder="Height" type="number" onChange={handlePlayerFormChange} />
                      <Input name="player_weight" placeholder="Weight" type="number" onChange={handlePlayerFormChange} />
                      <Input name="college" placeholder="College" onChange={handlePlayerFormChange} />
                      <Input name="country" placeholder="Country" onChange={handlePlayerFormChange} />
                      <Input name="draft_year" placeholder="Draft Year" type="number" onChange={handlePlayerFormChange} />
                      <Input name="draft_round" placeholder="Draft Round" type="number" onChange={handlePlayerFormChange} />
                      <Input name="draft_number" placeholder="Draft Number" type="number" onChange={handlePlayerFormChange} />
                    </>
                  ) : (
                    <>
                      <Input name="Franchise" placeholder="Franchise" onChange={handleTeamFormChange} />
                      <Input name="Lg" placeholder="League" onChange={handleTeamFormChange} />
                      <Input name="From" placeholder="From Year" type="number" onChange={handleTeamFormChange} />
                      <Input name="To" placeholder="To Year" type="number" onChange={handleTeamFormChange} />
                      <Input name="Yrs" placeholder="Years" type="number" onChange={handleTeamFormChange} />
                      <Input name="G" placeholder="Games" type="number" onChange={handleTeamFormChange} />
                      <Input name="W" placeholder="Wins" type="number" onChange={handleTeamFormChange} />
                      <Input name="L" placeholder="Losses" type="number" onChange={handleTeamFormChange} />
                      <Input name="W/L%" placeholder="Win/Loss %" type="number" onChange={handleTeamFormChange} />
                      <Input name="Plyfs" placeholder="Playoffs" type="number" onChange={handleTeamFormChange} />
                      <Input name="Div" placeholder="Division Titles" type="number" onChange={handleTeamFormChange} />
                      <Input name="Conf" placeholder="Conference Titles" type="number" onChange={handleTeamFormChange} />
                      <Input name="Champ" placeholder="Championships" type="number" onChange={handleTeamFormChange} />
                    </>
                  )}
                </form>
              </div>
            )}

            {(crudAction === 'Update' || crudAction === 'Delete' || crudAction === 'Retrieve') && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-[#17408B] mb-4">
                  {crudAction} {entity}s
                </h2>
                <div className="max-h-60 overflow-y-auto">
                  {entity === 'Player'
                    ? filteredPlayers.map((player) => (
                        <div key={player.player_name} className="flex items-center mb-2">
                          <Checkbox
                            id={player.player_name}
                            checked={selectedItems.includes(player.player_name)}
                            onCheckedChange={() => handleItemSelect(player.player_name)}
                          />
                          <label htmlFor={player.player_name} className="ml-2">
                            {player.player_name}
                          </label>
                        </div>
                      ))
                    : filteredTeams.map((team, index) => (
                        <div key={`${team.team_abbreviation}-${team.team_name || ''}-${index}`} className="flex items-center mb-2">
                          <Checkbox
                            id={`${team.team_abbreviation}-${index}`}
                            checked={selectedItems.includes(team.team_abbreviation)}
                            onCheckedChange={() => handleItemSelect(team.team_abbreviation)}
                          />
                          <label htmlFor={`${team.team_abbreviation}-${index}`} className="ml-2">
                            {team.team_abbreviation} {team.team_name ? `- ${team.team_name}` : ''}
                          </label>
                        </div>
                      ))}
                </div>

                {crudAction === 'Update' && (
                  <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {entity === 'Player' ? (
                      <>
                        <Input name="team_abbreviation" placeholder="Team Abbreviation" onChange={handlePlayerFormChange} />
                        <Input name="age" placeholder="Age" type="number" onChange={handlePlayerFormChange} />
                        <Input name="player_height" placeholder="Height" type="number" onChange={handlePlayerFormChange} />
                        <Input name="player_weight" placeholder="Weight" type="number" onChange={handlePlayerFormChange} />
                      </>
                    ) : (
                      <>
                        <Input name="Lg" placeholder="League" onChange={handleTeamFormChange} />
                        <Input name="From" placeholder="From Year" type="number" onChange={handleTeamFormChange} />
                        <Input name="To" placeholder="To Year" type="number" onChange={handleTeamFormChange} />
                        <Input name="Yrs" placeholder="Years" type="number" onChange={handleTeamFormChange} />
                        <Input name="G" placeholder="Games" type="number" onChange={handleTeamFormChange} />
                        <Input name="W" placeholder="Wins" type="number" onChange={handleTeamFormChange} />
                        <Input name="L" placeholder="Losses" type="number" onChange={handleTeamFormChange} />
                        <Input name="W/L%" placeholder="Win/Loss %" type="number" onChange={handleTeamFormChange} />
                        <Input name="Plyfs" placeholder="Playoffs" type="number" onChange={handleTeamFormChange} />
                        <Input name="Div" placeholder="Division Titles" type="number" onChange={handleTeamFormChange} />
                        <Input name="Conf" placeholder="Conference Titles" type="number" onChange={handleTeamFormChange} />
                        <Input name="Champ" placeholder="Championships" type="number" onChange={handleTeamFormChange} />
                      </>
                    )}
                  </form>
                )}
              </div>
            )}

            {(crudAction === 'Update' || crudAction === 'Delete' || crudAction === 'Retrieve') && (
              <div className="mt-4">
                <h3 className="text-lg font-medium text-[#17408B] mb-2">Select Attributes</h3>
                <AttributeSelect 
                  entity={entity} 
                  selectedAttributes={selectedAttributes} 
                  setSelectedAttributes={setSelectedAttributes} 
                />
              </div>
            )}

            {crudAction === 'Retrieve' && (
              <>
                {entity === 'Player' && selectedItems.length === 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="topN" className="block text-sm font-medium text-gray-700">Top N Results</label>
                      <Input
                        id="topN"
                        type="number"
                        value={topN}
                        onChange={(e) => setTopN(e.target.value)}
                        className="mt-1"
                        max="10"
                      />
                    </div>
                    <div>
                      <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">Sort By</label>
                      <Select onValueChange={setSortBy} value={sortBy}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select attribute to sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedAttributes.map((attr) => (
                            <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Sort Order</label>
                      <Select onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')} value={sortOrder}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select sort order" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Ascending</SelectItem>
                          <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {entity === 'Team' && selectedItems.length === 0 && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="topN" className="block text-sm font-medium text-gray-700">Top N Results</label>
                      <Input
                        id="topN"
                        type="number"
                        value={topN}
                        onChange={(e) => setTopN(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">Sort By</label>
                      <Select onValueChange={setSortBy} value={sortBy}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select attribute to sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedAttributes.map((attr) => (
                            <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Sort Order</label>
                      <Select onValueChange={(value) => setSortOrder(value as 'asc' | 'desc')} value={sortOrder}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select sort order" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Ascending</SelectItem>
                          <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {selectedAttributes.includes('years') && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fromYear" className="block text-sm font-medium text-gray-700">From Year</label>
                      <Input
                        id="fromYear"
                        type="number"
                        value={fromYear}
                        onChange={(e) => setFromYear(parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label htmlFor="toYear" className="block text-sm font-medium text-gray-700">To Year</label>
                      <Input
                        id="toYear"
                        type="number"
                        value={toYear}
                        onChange={(e) => setToYear(parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-between mt-4">
              <Button onClick={handleSubmit} className="bg-[#C9082A] text-white hover:bg-[#17408B]">
                {crudAction}
              </Button>
              <Button onClick={resetForm} className="bg-gray-500 text-white hover:bg-gray-600">
                Clear Form
              </Button>
            </div>

            {isLoading && <p className="mt-4 text-center">Loading...</p>}
            {error && <p className="mt-4 text-center text-red-500">{error}</p>}

            {sqlQuery && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-[#17408B] mb-4">SQL Query</h2>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto">
                  {sqlQuery}
                </pre>
              </div>
            )}

            {retrievedData && retrievedData.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-bold text-[#17408B] mb-4">Retrieved Data</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(retrievedData[0]).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {retrievedData.map((item, index) => (
                      <TableRow key={index}>
                        {Object.values(item).map((value, i) => (
                          <TableCell key={i}>{value?.toString()}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}