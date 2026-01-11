'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts'
import HeatmapChart from '@/components/cards/HeatmapChart'
import FilterPanel from '@/components/cards/FilterPanel'

const AdvancedAnalyticsPage: React.FC = () => {
  const [spreadMomentum, setSpreadMomentum] = useState<any[]>([])
  const [expectedSpreads, setExpectedSpreads] = useState<any[]>([])
  const [tenorSlopes, setTenorSlopes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://greekbanksdebt-api.onrender.com'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${apiUrl}/api/bonds?limit=100`)
        const bondsData = await response.json()
        const bonds = bondsData.items || bondsData.bonds || []

        // Calculate Spread Momentum (Last 24m vs Prior 24m)
        const now = new Date()
        const last24mStart = new Date(now.getTime() - 24 * 30 * 24 * 60 * 60 * 1000)
        const prior24mStart = new Date(now.getTime() - 48 * 30 * 24 * 60 * 60 * 1000)

        const momentumByType: { [key: string]: { last: number[]; prior: number[] } } = {}

        bonds.forEach((bond: any) => {
          const issueType = bond.issue_type || 'Unknown'
          if (!momentumByType[issueType]) {
            momentumByType[issueType] = { last: [], prior: [] }
          }

          if (bond.pricing_date && bond.spread) {
            const pricingDate = new Date(bond.pricing_date)
            if (pricingDate >= last24mStart) {
              momentumByType[issueType].last.push(bond.spread)
            } else if (pricingDate >= prior24mStart) {
              momentumByType[issueType].prior.push(bond.spread)
            }
          }
        })

        const momentumData = Object.entries(momentumByType)
          .map(([type, data]) => {
            const lastAvg = data.last.length > 0 ? data.last.reduce((a, b) => a + b, 0) / data.last.length : 0
            const priorAvg = data.prior.length > 0 ? data.prior.reduce((a, b) => a + b, 0) / data.prior.length : 0
            return {
              type,
              lastAvg: parseFloat(lastAvg.toFixed(1)),
              priorAvg: parseFloat(priorAvg.toFixed(1)),
              delta: parseFloat((lastAvg - priorAvg).toFixed(1)),
            }
          })
          .sort((a, b) => a.delta - b.delta)

        setSpreadMomentum(momentumData)

        // Calculate Expected New Spread (Trimmed mean of recent deals)
        const recentByType: { [key: string]: number[] } = {}

        bonds
          .sort((a: any, b: any) => new Date(b.pricing_date).getTime() - new Date(a.pricing_date).getTime())
          .slice(0, 20)
          .forEach((bond: any) => {
            const type = bond.issue_type || 'Unknown'
            if (bond.spread) {
              if (!recentByType[type]) {
                recentByType[type] = []
              }
              recentByType[type].push(bond.spread)
            }
          })

        const expectedData = Object.entries(recentByType)
          .map(([type, spreads]) => {
            if (spreads.length >= 3) {
              const sorted = spreads.sort((a, b) => a - b)
              const trimmed = sorted.slice(1, sorted.length - 1)
              const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length
              return {
                type,
                expectedSpread: parseFloat(avg.toFixed(1)),
                sampleSize: spreads.length,
              }
            }
            return null
          })
          .filter((x) => x !== null)

        setExpectedSpreads(expectedData)

        // Calculate Tenor-Spread Slope (OLS regression for SR Preferred)
        const srBonds = bonds
          .filter((b: any) => b.issue_type === 'SR Preferred' && b.tenor && b.spread)
          .sort((a: any, b: any) => new Date(b.pricing_date).getTime() - new Date(a.pricing_date).getTime())
          .slice(0, 15)

        const slopeByIssuer: { [key: string]: { tenors: number[]; spreads: number[] } } = {}

        srBonds.forEach((bond: any) => {
          const issuer = bond.issuer?.name || bond.issuer_name || 'Unknown'
          if (!slopeByIssuer[issuer]) {
            slopeByIssuer[issuer] = { tenors: [], spreads: [] }
          }
          slopeByIssuer[issuer].tenors.push(bond.tenor)
          slopeByIssuer[issuer].spreads.push(bond.spread)
        })

        const slopeData = Object.entries(slopeByIssuer)
          .map(([issuer, data]) => {
            if (data.tenors.length >= 3) {
              // Simple linear regression
              const n = data.tenors.length
              const sumX = data.tenors.reduce((a, b) => a + b, 0)
              const sumY = data.spreads.reduce((a, b) => a + b, 0)
              const sumXY = data.tenors.reduce((sum, x, i) => sum + x * data.spreads[i], 0)
              const sumX2 = data.tenors.reduce((sum, x) => sum + x * x, 0)

              const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
              return {
                issuer,
                slope: parseFloat(slope.toFixed(1)),
                dataPoints: n,
              }
            }
            return null
          })
          .filter((x) => x !== null)
          .sort((a: any, b: any) => b.slope - a.slope)

        setTenorSlopes(slopeData)
      } catch (err) {
        console.error('Error fetching analytics data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [apiUrl])

  const getMomentumColor = (delta: number) => {
    if (delta < 0) return '#10b981' // Green - tightening
    if (delta > 0) return '#ef4444' // Red - widening
    return '#6b7280' // Gray - neutral
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔬 Advanced Analytics & Forecasts</h1>
          <p className="text-gray-600">Deep-dive analysis including momentum, forecasts, and term structure</p>
        </div>

        {/* Filter Panel */}
        <FilterPanel />

        {/* Spread Momentum Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📈 Spread Momentum Analysis</h2>
          <p className="text-sm text-gray-600 mb-4">Comparing last 24 months vs prior 24 months</p>
          <div className="h-80">
            {spreadMomentum.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spreadMomentum} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis label={{ value: 'Δ Spread (bps)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip
                    formatter={(value) => `${value} bps`}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                  <Bar dataKey="delta" name="Spread Change (bps)" fill="#3b82f6">
                    {spreadMomentum.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={getMomentumColor(entry.delta)} />
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
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {spreadMomentum.map((item: any, idx: number) => (
              <div key={idx} className="bg-gray-50 p-4 rounded">
                <p className="font-semibold text-gray-900">{item.type}</p>
                <p className="text-sm text-gray-600">Prior 24m: {item.priorAvg} bps</p>
                <p className="text-sm text-gray-600">Last 24m: {item.lastAvg} bps</p>
                <p className={`text-sm font-bold ${item.delta < 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Δ {item.delta > 0 ? '+' : ''}{item.delta} bps
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Expected New Spread Forecast */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎯 Expected New Spread Forecast</h2>
          <p className="text-sm text-gray-600 mb-4">Trimmed mean of recent deals by issue type</p>
          <div className="h-80">
            {expectedSpreads.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expectedSpreads} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis label={{ value: 'Expected Spread (bps)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `${value} bps`} />
                  <Bar dataKey="expectedSpread" fill="#8b5cf6" name="Expected Spread" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading...</p>
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {expectedSpreads.map((item: any, idx: number) => (
              <div key={idx} className="bg-purple-50 p-4 rounded border border-purple-200">
                <p className="font-semibold text-gray-900">{item.type}</p>
                <p className="text-2xl font-bold text-purple-600 mt-2">{item.expectedSpread} bps</p>
                <p className="text-sm text-gray-600 mt-1">Based on {item.sampleSize} recent deals</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tenor-Spread Slope Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">📐 Tenor-Spread Slope Analysis</h2>
          <p className="text-sm text-gray-600 mb-4">Term premium structure for SR Preferred bonds (last 24 months)</p>
          <div className="h-80">
            {tenorSlopes.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tenorSlopes} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="issuer" />
                  <YAxis label={{ value: 'Slope (bps/year)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `${value} bps/year`} />
                  <Bar dataKey="slope" fill="#f59e0b" name="Tenor-Spread Slope" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading...</p>
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {tenorSlopes.slice(0, 3).map((item: any, idx: number) => (
              <div key={idx} className="bg-amber-50 p-4 rounded border border-amber-200">
                <p className="font-semibold text-gray-900">{item.issuer}</p>
                <p className="text-2xl font-bold text-amber-600 mt-2">{item.slope} bps/yr</p>
                <p className="text-sm text-gray-600 mt-1">{item.dataPoints} data points</p>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonality Heatmap */}
        <div className="mb-8">
          <HeatmapChart title="📅 Issuance Seasonality by Quarter" dataType="seasonality" />
        </div>
      </div>
    </div>
  )
}

export default AdvancedAnalyticsPage
