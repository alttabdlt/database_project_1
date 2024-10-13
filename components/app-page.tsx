'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import React from "react"

export function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-white to-red-900 text-gray-900">
      <header className="bg-[#17408B] text-white">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex justify-center">
            <Link href="/" className="text-4xl font-bold text-white">
              NBA Stats
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-6xl font-bold text-center mb-16 text-[#17408B]"
        >
          Explore NBA Statistics
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <Link href="/players" className="block h-full">
            <Card className="bg-white border-[#17408B] hover:border-[#C9082A] transition-all overflow-hidden group h-full">
              <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91] p-8">
                <CardTitle className="text-3xl font-bold text-white">View Player Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-700 text-lg">Explore comprehensive statistics for NBA players, including scoring, rebounds, assists, and more.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/teams" className="block h-full">
            <Card className="bg-white border-[#17408B] hover:border-[#C9082A] transition-all overflow-hidden group h-full">
              <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91] p-8">
                <CardTitle className="text-3xl font-bold text-white">View Team Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-700 text-lg">Dive into detailed statistics for NBA teams, including wins, losses, championships, and historical performance.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/players/compare" className="block h-full">
            <Card className="bg-white border-[#17408B] hover:border-[#C9082A] transition-all overflow-hidden group h-full">
              <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91] p-8">
                <CardTitle className="text-3xl font-bold text-white">Compare Player Statistics</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-700 text-lg">Compare statistics between NBA players side by side, analyzing their performance across various metrics.</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/manage-data" className="block h-full">
            <Card className="bg-white border-[#17408B] hover:border-[#C9082A] transition-all overflow-hidden group h-full">
              <CardHeader className="bg-gradient-to-r from-[#17408B] to-[#1D4F91] p-8">
                <CardTitle className="text-3xl font-bold text-white">Manage Data</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <p className="text-gray-700 text-lg">Create, update, or delete NBA data. Manage player and team information to keep the database up-to-date.</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
