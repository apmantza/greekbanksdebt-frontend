'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [bonds, setBonds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIssuer, setSelectedIssuer] = useState('All Issuers')
  const [selectedType, setSelectedType] = useState('All Types')

  useEffect(() => {
    const fetchBonds = async () => {
      try {
        const response = await fetch('https://greekbanksdebt-api.onrender.com/api/bonds?limit=100')
        const data = await response.json()
        setBonds(data.items || data.bonds || [])
      } catch (error) {
        console.error('Error fetching bonds:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBonds()
  }, [])

  // Process data for charts
  const getSpreadMomentumData = () => {
    const filtered = bonds.filter(b => {
      const issuerName = b.issuer?.name || b.issuer_name || 'Unknown'
      return (selectedIssuer === 'All Issuers' || issuerName === selectedIssuer) &&
             (selectedType === 'All Types' || b.issue_type === selectedType)
    })
    
    const issuerData: { [key: string]: number[] } = {}
    filtered.forEach(b => {
      const issuerName = b.issuer?.name || b.issuer_name || 'Unknown'
      if (!issuerData[issuerName]) issuerData[issuerName] = []
      issuerData[issuerName].push(b.spread)
    })

    return Object.entries(issuerData).map(([issuer, spreads]) => ({
      name: issuer,
      avgSpread: Math.round(spreads.reduce((a, b) => a + b, 0) / spreads.length)
    }))
  }

  const getIssueTypeData = () => {
    const filtered = bonds.filter(b => {
      const issuerName = b.issuer?.name || b.issuer_name || 'Unknown'
      return (selectedIssuer === 'All Issuers' || issuerName === selectedIssuer)
    })
    
    const typeData: { [key: string]: number } = {}
    filtered.forEach(b => {
      typeData[b.issue_type] = (typeData[b.issue_type] || 0) + b.size
    })

    return Object.entries(typeData).map(([type, size]) => ({
      name: type,
      value: size
    }))
  }

  const getSpreadDistribution = () => {
    const filtered = bonds.filter(b => {
      const issuerName = b.issuer?.name || b.issuer_name || 'Unknown'
      return (selectedIssuer === 'All Issuers' || issuerName === selectedIssuer) &&
             (selectedType === 'All Types' || b.issue_type === selectedType)
    })

    const buckets: { [key: string]: number } = {
      '0-100': 0,
      '100-200': 0,
      '200-300': 0,
      '300-400': 0,
      '400-500': 0,
      '500+': 0
    }

    filtered.forEach(b => {
      if (b.spread < 100) buckets['0-100']++
      else if (b.spread < 200) buckets['100-200']++
      else if (b.spread < 300) buckets['200-300']++
      else if (b.spread < 400) buckets['300-400']++
      else if (b.spread < 500) buckets['400-500']++
      else buckets['500+']++
    })

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count
    }))
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Advanced market analysis and insights</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issuer</label>
              <select 
                value={selectedIssuer}
                onChange={(e) => setSelectedIssuer(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>All Issuers</option>
                <option>Eurobank</option>
                <option>Piraeus</option>
                <option>Alpha</option>
                <option>NBG</option>
                <option>Attica</option>
                <option>Optima</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>All Types</option>
                <option>SR Preferred</option>
                <option>Tier 2</option>
                <option>AT1</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {['Overview', 'Spread Analysis', 'Trends', 'Comparison'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
              className={`px-4 py-2 font-medium transition ${
                activeTab === tab.toLowerCase().replace(' ', '-')
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Charts */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Spread Momentum */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Spread Momentum by Issuer</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getSpreadMomentumData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="avgSpread" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Issue Type Analysis */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Issue Type Analysis</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getIssueTypeData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: €${value}M`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Spread Distribution */}
            <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Spread Distribution</h2>
              <div className="space-y-3">
                {getSpreadDistribution().map(item => (
                  <div key={item.range} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 w-16">{item.range} bps</span>
                    <div className="flex-1 bg-gray-200 rounded h-6 overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full transition-all"
                        style={{ width: `${(item.count / Math.max(...getSpreadDistribution().map(d => d.count))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Key Insights */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Key Insights</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold text-gray-900">Spread Compression Trend</h3>
                <p className="text-gray-600">Spreads have compressed from 921 bps (2019) to 272 bps (2024-2025), indicating improved market sentiment towards Greek banks.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-2xl">🌱</span>
              <div>
                <h3 className="font-semibold text-gray-900">ESG Premium</h3>
                <p className="text-gray-600">Green bonds trade approximately 240 bps tighter than conventional bonds, reflecting strong ESG demand.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
