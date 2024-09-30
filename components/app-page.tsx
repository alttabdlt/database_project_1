'use client'

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import React from "react"

export function Page() {
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
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-5xl font-bold text-center mb-12 text-[#17408B]"
        >
          Explore NBA Statistics
        </motion.h1>

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
      </main>
    </div>
  )
}