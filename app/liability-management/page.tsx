'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from 'recharts'
import FilterPanel from '@/components/cards/FilterPanel'

const LiabilityManagementPage: React.FC = () => {
  const [callableByYear, setCallableByYear] = useState<any[]>([])
  const [callableByIssuer, setCallableByIssuer] = useState<any[]>([])
  const [callableByType, setCallableByType] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://greekbanksdebt-api.onrender.com'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${apiUrl}/api/bonds?limit=100`)
        const bondsData = await response.json()
        const bonds = bondsData.items || bondsData.bonds || []

        // Calculate callable debt by year
        const yearMap: { [key: string]: number } = {}
        const issuerMap: { [key: string]: number } = {}
        const typeMap: { [key: string]: number } = {}

        bonds.forEach((bond: any) => {
          if (bond.call_date) {
            const year = new Date(bond.call_date).getFullYear()
            yearMap[year] = (yearMap[year] || 0) + bond.size

            const issuer = bond.issuer?.name || bond.issuer_name || 'Unknown'
            issuerMap[issuer] = (issuerMap[issuer] || 0) + bond.size

            const type = bond.issue_type || 'Unknown'
            typeMap[type] = (typeMap[type] || 0) + bond.size
          }
        })

        const yearData = Object.entries(yearMap)
          .map(([year, size]) => ({
            year: parseInt(year),
            size: parseFloat(size.toFixed(2)),
          }))
          .sort((a, b) => a.year - b.year)

        const issuerData = Object.entries(issuerMap)
          .map(([issuer, size]) => ({
            issuer,
            size: parseFloat(size.toFixed(2)),
          }))
          .sort((a, b) => b.size - a.size)

        const typeData = Object.entries(typeMap)
          .map(([type, size]) => ({
            type,
            size: parseFloat(size.toFixed(2)),
          }))
          .sort((a, b) => b.size - a.size)

        setCallableByYear(yearData)
        setCallableByIssuer(issuerData)
        setCallableByType(typeData)
      } catch (err) {
        console.error('Error fetching liability data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [apiUrl])

  const ISSUER_COLORS: { [key: string]: string } = {
    'Piraeus': '#3b82f6',
    'NBG': '#8b5cf6',
    'Alpha': '#ec4899',
    'Eurobank': '#f59e0b',
    'Optima': '#10b981',
    'Attica': '#06b6d4',
  }

  const TYPE_COLORS: { [key: string]: string } = {
    'SR Preferred': '#3b82f6',
    'Tier2': '#8b5cf6',
    'AT1': '#ec4899',
  }

  const totalCallable = callableByYear.reduce((sum, item) => sum + item.size, 0)
  const peakYear = callableByYear.length > 0 ? callableByYear.reduce((max, item) => item.size > max.size ? item : max) : null

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏦 Liability Management</h1>
          <p className="text-gray-600">Callable debt analysis, maturity ladder, and refinancing needs</p>
        </div>

        {/* Filter Panel */}
        <FilterPanel />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Total Callable Debt</p>
            <p className="text-3xl font-bold text-blue-600">€{(totalCallable / 1000).toFixed(1)}B</p>
            <p className="text-xs text-gray-500 mt-2">Across all future call dates</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Peak Refinancing Year</p>
            {peakYear && (
              <>
                <p className="text-3xl font-bold text-amber-600">{peakYear.year}</p>
                <p className="text-xs text-gray-500 mt-2">€{(peakYear.size / 1000).toFixed(1)}B due</p>
              </>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Largest Issuer Liability</p>
            {callableByIssuer.length > 0 && (
              <>
                <p className="text-3xl font-bold text-purple-600">{callableByIssuer[0].issuer}</p>
                <p className="text-xs text-gray-500 mt-2">€{(callableByIssuer[0].size / 1000).toFixed(1)}B callable</p>
              </>
            )}
          </div>
        </div>

        {/* Callable Debt by Year - Maturity Ladder */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📅 Maturity Ladder - Callable Debt by Year</h2>
          <p className="text-sm text-gray-600 mb-4">Shows refinancing needs across future years</p>
          <div className="h-80">
            {callableByYear.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callableByYear} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'Callable Size (€M)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `€${value}M`} />
                  <Bar dataKey="size" fill="#f59e0b" name="Callable Debt" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading...</p>
              </div>
            )}
          </div>
        </div>

        {/* Callable Debt by Issuer */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🏛️ Callable Debt by Issuer</h2>
          <p className="text-sm text-gray-600 mb-4">Total refinancing burden per bank</p>
          <div className="h-80">
            {callableByIssuer.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callableByIssuer} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="issuer" />
                  <YAxis label={{ value: 'Callable Size (€M)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `€${value}M`} />
                  <Bar dataKey="size" fill="#8b5cf6" name="Callable Debt">
                    {callableByIssuer.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={ISSUER_COLORS[entry.issuer] || '#999'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading...</p>
              </div>
            )}
          </div>
        </div>

        {/* Callable Debt by Issue Type */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 Callable Debt by Issue Type</h2>
          <p className="text-sm text-gray-600 mb-4">Refinancing composition by instrument type</p>
          <div className="h-80">
            {callableByType.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callableByType} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis label={{ value: 'Callable Size (€M)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `€${value}M`} />
                  <Bar dataKey="size" fill="#ec4899" name="Callable Debt">
                    {callableByType.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={TYPE_COLORS[entry.type] || '#999'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading...</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Breakdown Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Detailed Callable Debt Schedule</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Year</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Callable Size (€M)</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">% of Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Visualization</th>
                </tr>
              </thead>
              <tbody>
                {callableByYear.map((item: any, idx: number) => {
                  const percentage = ((item.size / totalCallable) * 100).toFixed(1)
                  return (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{item.year}</td>
                      <td className="text-right py-3 px-4 text-gray-700">€{item.size.toFixed(0)}M</td>
                      <td className="text-right py-3 px-4 text-gray-700">{percentage}%</td>
                      <td className="py-3 px-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-amber-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LiabilityManagementPage
