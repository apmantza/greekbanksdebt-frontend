'use client'

import React, { useState, useEffect } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts'

const MountOlympusPage: React.FC = () => {
  const [bonds, setBonds] = useState<any[]>([])
  const [topIssuers, setTopIssuers] = useState<any[]>([])
  const [spreadTrend, setSpreadTrend] = useState<any[]>([])
  const [riskMetrics, setRiskMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://greekbanksdebt-api.onrender.com/api/bonds/?limit=1000')
        const data = await response.json()
        const allBonds = data.items || []
        setBonds(allBonds)

        // Calculate top issuers
        const issuerMap: { [key: string]: { name: string; total: number; count: number; avgSpread: number } } = {}
        allBonds.forEach((bond: any) => {
          const issuer = bond.issuer?.name || 'Unknown'
          if (!issuerMap[issuer]) {
            issuerMap[issuer] = { name: issuer, total: 0, count: 0, avgSpread: 0 }
          }
          issuerMap[issuer].total += bond.size || 0
          issuerMap[issuer].avgSpread += bond.spread || 0
          issuerMap[issuer].count += 1
        })

        const topIssuersData = Object.values(issuerMap)
          .map(issuer => ({
            ...issuer,
            avgSpread: Math.round(issuer.avgSpread / issuer.count),
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10)
        setTopIssuers(topIssuersData)

        // Calculate spread trend by month
        const monthMap: { [key: string]: { month: string; avgSpread: number; count: number; totalSpread: number } } = {}
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        allBonds.forEach((bond: any) => {
          if (bond.pricing_date) {
            const date = new Date(bond.pricing_date)
            const monthKey = months[date.getMonth()]
            if (!monthMap[monthKey]) {
              monthMap[monthKey] = { month: monthKey, avgSpread: 0, count: 0, totalSpread: 0 }
            }
            monthMap[monthKey].totalSpread += bond.spread || 0
            monthMap[monthKey].count += 1
          }
        })

        const spreadTrendData = months
          .map(month => ({
            month,
            avgSpread: monthMap[month] ? Math.round(monthMap[month].totalSpread / monthMap[month].count) : 0,
            count: monthMap[month]?.count || 0,
          }))
          .filter(item => item.count > 0)
        setSpreadTrend(spreadTrendData)

        // Calculate risk metrics
        const spreads = allBonds.map((b: any) => b.spread || 0)
        const avgSpread = Math.round(spreads.reduce((a: number, b: number) => a + b, 0) / spreads.length)
        const maxSpread = Math.max(...spreads)
        const minSpread = Math.min(...spreads)
        const volatility = Math.round(
          Math.sqrt(
            spreads.reduce((sum: number, spread: number) => sum + Math.pow(spread - avgSpread, 2), 0) / spreads.length
          )
        )

        setRiskMetrics({
          avgSpread,
          maxSpread,
          minSpread,
          volatility,
          totalBonds: allBonds.length,
          totalIssuance: allBonds.reduce((sum: number, b: any) => sum + (b.size || 0), 0),
        })

        setLoading(false)
      } catch (err) {
        console.error('Error fetching Mount Olympus data:', err)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-900">⛰️ Mount Olympus</h1>
        <p className="text-gray-600 mt-1">Advanced risk analytics and market intelligence</p>
      </div>

      {/* Risk Metrics */}
      {riskMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-600">Avg Spread</p>
              <p className="text-2xl font-bold text-primary-900">{riskMetrics.avgSpread} bps</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-600">Max Spread</p>
              <p className="text-2xl font-bold text-red-600">{riskMetrics.maxSpread} bps</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-600">Min Spread</p>
              <p className="text-2xl font-bold text-green-600">{riskMetrics.minSpread} bps</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-600">Volatility</p>
              <p className="text-2xl font-bold text-primary-900">{riskMetrics.volatility} bps</p>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <p className="text-sm text-gray-600">Total Issuance</p>
              <p className="text-2xl font-bold text-primary-900">€{Math.round(riskMetrics.totalIssuance / 1000)}B</p>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading Mount Olympus data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Issuers */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-primary-900">Top Issuers by Volume</h2>
            </div>
            <div className="card-body">
              {topIssuers.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topIssuers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `€${value}M`} />
                    <Bar dataKey="total" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No data available</p>
              )}
            </div>
          </div>

          {/* Spread Trend */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-primary-900">Monthly Spread Trend</h2>
            </div>
            <div className="card-body">
              {spreadTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={spreadTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value} bps`} />
                    <Line type="monotone" dataKey="avgSpread" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No data available</p>
              )}
            </div>
          </div>

          {/* Issuer Risk Profile */}
          <div className="card lg:col-span-2">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-primary-900">Issuer Risk Profile</h2>
            </div>
            <div className="card-body">
              {topIssuers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Issuer</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Issuance</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Bonds</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Avg Spread</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topIssuers.map((issuer, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{issuer.name}</td>
                          <td className="text-right py-3 px-4 text-gray-600">€{issuer.total}M</td>
                          <td className="text-right py-3 px-4 text-gray-600">{issuer.count}</td>
                          <td className="text-right py-3 px-4 text-gray-600">{issuer.avgSpread} bps</td>
                          <td className="text-right py-3 px-4">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                                issuer.avgSpread < 200
                                  ? 'bg-green-100 text-green-800'
                                  : issuer.avgSpread < 400
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {issuer.avgSpread < 200 ? 'Low' : issuer.avgSpread < 400 ? 'Medium' : 'High'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No data available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Market Insights */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-primary-900">Market Insights</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-blue-100">
                <span className="text-blue-600 font-bold">📊</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-primary-900">Market Concentration</h3>
              <p className="text-sm text-gray-600 mt-1">Eurobank and Piraeus account for approximately 59% of total issuance, indicating market concentration among the two largest banks.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-green-100">
                <span className="text-green-600 font-bold">📈</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-primary-900">Spread Compression</h3>
              <p className="text-sm text-gray-600 mt-1">Average spreads have tightened significantly, reflecting improving credit fundamentals and market sentiment towards Greek banking sector.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-purple-100">
                <span className="text-purple-600 font-bold">🎯</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-primary-900">Tenor Distribution</h3>
              <p className="text-sm text-gray-600 mt-1">Majority of bonds have 5-year tenor, providing a balanced maturity profile and reducing refinancing risk.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MountOlympusPage
