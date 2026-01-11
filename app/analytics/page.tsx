'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, HistogramChart, Histogram, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [spreadMomentumData, setSpreadMomentumData] = useState<any[]>([])
  const [tenorSpreadData, setTenorSpreadData] = useState<any[]>([])
  const [issueTypeData, setIssueTypeData] = useState<any[]>([])
  const [seasonalityData, setSeasonalityData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // Fetch bonds data
        const response = await fetch('https://greekbanksdebt-api.onrender.com/api/bonds/?limit=1000')
        const data = await response.json()
        const bonds = data.items || []

        // Process data for charts
        if (bonds.length > 0) {
          // Spread Momentum by Issuer
          const spreadByIssuer: { [key: string]: { issuer: string; spread: number; count: number } } = {}
          bonds.forEach((bond: any) => {
            const issuer = bond.issuer?.name || 'Unknown'
            if (!spreadByIssuer[issuer]) {
              spreadByIssuer[issuer] = { issuer, spread: 0, count: 0 }
            }
            spreadByIssuer[issuer].spread += bond.spread || 0
            spreadByIssuer[issuer].count += 1
          })
          const spreadMomentum = Object.values(spreadByIssuer).map(item => ({
            issuer: item.issuer,
            spread: Math.round(item.spread / item.count),
          }))
          setSpreadMomentumData(spreadMomentum)

          // Tenor-Spread Slope
          const tenorSpreadMap: { [key: number]: { tenor: number; spread: number; count: number } } = {}
          bonds.forEach((bond: any) => {
            const tenor = bond.tenor || 5
            if (!tenorSpreadMap[tenor]) {
              tenorSpreadMap[tenor] = { tenor, spread: 0, count: 0 }
            }
            tenorSpreadMap[tenor].spread += bond.spread || 0
            tenorSpreadMap[tenor].count += 1
          })
          const tenorSpread = Object.values(tenorSpreadMap)
            .sort((a, b) => a.tenor - b.tenor)
            .map(item => ({
              tenor: `${item.tenor}Y`,
              spread: Math.round(item.spread / item.count),
            }))
          setTenorSpreadData(tenorSpread)

          // Issue Type Analysis
          const issueTypeMap: { [key: string]: number } = {}
          bonds.forEach((bond: any) => {
            const type = bond.issue_type || 'Unknown'
            issueTypeMap[type] = (issueTypeMap[type] || 0) + bond.size
          })
          const issueType = Object.entries(issueTypeMap).map(([type, size]) => ({
            name: type,
            value: size,
          }))
          setIssueTypeData(issueType)

          // Seasonality (by month)
          const monthMap: { [key: string]: { month: string; count: number } } = {}
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          bonds.forEach((bond: any) => {
            if (bond.pricing_date) {
              const date = new Date(bond.pricing_date)
              const monthKey = months[date.getMonth()]
              monthMap[monthKey] = { month: monthKey, count: (monthMap[monthKey]?.count || 0) + 1 }
            }
          })
          const seasonality = months.map(month => ({
            month,
            count: monthMap[month]?.count || 0,
          }))
          setSeasonalityData(seasonality)
        }
        setLoading(false)
      } catch (err) {
        console.error('Error fetching analytics data:', err)
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'spreads', label: 'Spread Analysis' },
    { id: 'trends', label: 'Trends' },
    { id: 'comparison', label: 'Comparison' },
  ]

  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Advanced market analysis and insights</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issuer</label>
              <select className="input">
                <option>All Issuers</option>
                <option>Eurobank</option>
                <option>Piraeus</option>
                <option>Alpha</option>
                <option>NBG</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
              <select className="input">
                <option>All Types</option>
                <option>SR Preferred</option>
                <option>Tier 2</option>
                <option>AT1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select className="input">
                <option>Last 12 Months</option>
                <option>Last 24 Months</option>
                <option>All Time</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="btn btn-primary w-full">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-accent-500 text-accent-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading analytics data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spread Momentum */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-primary-900">Spread Momentum by Issuer</h2>
            </div>
            <div className="card-body">
              {spreadMomentumData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={spreadMomentumData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="issuer" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="spread" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No data available</p>
              )}
            </div>
          </div>

          {/* Tenor-Spread Slope */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-primary-900">Tenor-Spread Slope</h2>
            </div>
            <div className="card-body">
              {tenorSpreadData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={tenorSpreadData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tenor" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="spread" stroke="#8b5cf6" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No data available</p>
              )}
            </div>
          </div>

          {/* Issue Type Analysis */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-primary-900">Issue Type Analysis</h2>
            </div>
            <div className="card-body">
              {issueTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={issueTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: €${value}M`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {issueTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `€${value}M`} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No data available</p>
              )}
            </div>
          </div>

          {/* Seasonality */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-primary-900">Seasonality</h2>
            </div>
            <div className="card-body">
              {seasonalityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={seasonalityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No data available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-primary-900">Key Insights</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-accent-100">
                <span className="text-accent-600 font-bold">💡</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-primary-900">Spread Compression Trend</h3>
              <p className="text-sm text-gray-600 mt-1">Spreads have compressed from 921 bps (2019) to 272 bps (2024-2025), indicating improved market sentiment towards Greek banks.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-accent-100">
                <span className="text-accent-600 font-bold">💡</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-primary-900">ESG Premium</h3>
              <p className="text-sm text-gray-600 mt-1">Green bonds trade approximately 240 bps tighter than conventional bonds, reflecting strong ESG demand.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
