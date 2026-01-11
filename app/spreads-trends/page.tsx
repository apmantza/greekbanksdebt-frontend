'use client'

import React, { useState, useEffect } from 'react'
import ScatterChartComponent from '@/components/cards/ScatterChart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'

const SpreadsTrendsPage: React.FC = () => {
  const [issuanceByYear, setIssuanceByYear] = useState<any[]>([])
  const [callableDebt, setCallableDebt] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://greekbanksdebt-api.onrender.com'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${apiUrl}/api/bonds?limit=100`)
        const bondsData = await response.json()
        const bonds = bondsData.items || bondsData.bonds || []

        // Calculate issuance by year
        const yearMap: { [key: string]: number } = {}
        bonds.forEach((bond: any) => {
          if (bond.pricing_date) {
            const year = new Date(bond.pricing_date).getFullYear()
            yearMap[year] = (yearMap[year] || 0) + bond.size
          }
        })

        const yearData = Object.entries(yearMap)
          .map(([year, size]) => ({
            year: parseInt(year),
            size: parseFloat(size.toFixed(2)),
          }))
          .sort((a, b) => a.year - b.year)

        setIssuanceByYear(yearData)

        // Calculate callable debt by year
        const callMap: { [key: string]: number } = {}
        bonds.forEach((bond: any) => {
          if (bond.call_date) {
            const year = new Date(bond.call_date).getFullYear()
            callMap[year] = (callMap[year] || 0) + bond.size
          }
        })

        const callData = Object.entries(callMap)
          .map(([year, size]) => ({
            year: parseInt(year),
            size: parseFloat(size.toFixed(2)),
          }))
          .sort((a, b) => a.year - b.year)

        setCallableDebt(callData)
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [apiUrl])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📈 Spreads & Trends Analysis</h1>
          <p className="text-gray-600">Detailed analysis of spreads, coupons, tenors, and market trends</p>
        </div>

        {/* Scatter Plots Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ScatterChartComponent
            title="Spread vs Tenor"
            xAxisLabel="Tenor (years)"
            yAxisLabel="Spread (bps)"
            dataType="spread-vs-tenor"
          />
          <ScatterChartComponent
            title="Coupon vs Tenor"
            xAxisLabel="Tenor (years)"
            yAxisLabel="Coupon (%)"
            dataType="coupon-vs-tenor"
          />
        </div>

        {/* Time Series Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Issuance by Year */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Issuance by Year</h3>
            <div className="h-80">
              {issuanceByYear.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={issuanceByYear}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => `€${value}M`} />
                    <Bar dataKey="size" fill="#3b82f6" name="Total Size" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading...</p>
                </div>
              )}
            </div>
          </div>

          {/* Callable Debt by Year */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Callable Debt by Year</h3>
            <div className="h-80">
              {callableDebt.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={callableDebt}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => `€${value}M`} />
                    <Bar dataKey="size" fill="#f59e0b" name="Callable Size" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Spread Trends Over Time */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spread Trends Over Time</h3>
          <p className="text-sm text-gray-600 mb-4">Shows how spreads have evolved across different issuers</p>
          <ScatterChartComponent
            title=""
            xAxisLabel="Pricing Date"
            yAxisLabel="Spread (bps)"
            dataType="spread-vs-date"
          />
        </div>
      </div>
    </div>
  )
}

export default SpreadsTrendsPage
