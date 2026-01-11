'use client'

import React, { useState, useEffect } from 'react'

interface Bond {
  id: number
  issuer_id: number
  isin: string
  name: string
  issue_type: string
  coupon: number
  tenor: number
  spread: number
  size: number
  pricing_date: string
  maturity_date: string
  is_green: boolean
  is_callable: boolean
  call_date: string
  currency: string
  status: string
  issuer?: {
    id: number
    name: string
    ticker: string
  }
}

const BondsPage: React.FC = () => {
  const [sortBy, setSortBy] = useState('spread')
  const [filterType, setFilterType] = useState('all')
  const [bonds, setBonds] = useState<Bond[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://greekbanksdebt-api.onrender.com'

  useEffect(() => {
    const fetchBonds = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch all bonds with a high limit
        const response = await fetch(`${apiUrl}/api/bonds/?limit=100`)
        if (!response.ok) {
          throw new Error('Failed to fetch bonds')
        }
        const data = await response.json()
        setBonds(data.items || [])
      } catch (err) {
        console.error('Error fetching bonds:', err)
        setError(err instanceof Error ? err.message : 'Failed to load bonds')
        setBonds([])
      } finally {
        setLoading(false)
      }
    }

    fetchBonds()
  }, [apiUrl])

  const filteredBonds = bonds.filter((bond) => {
    if (filterType === 'all') return true
    return bond.issue_type === filterType
  })

  const sortedBonds = [...filteredBonds].sort((a, b) => {
    if (sortBy === 'spread') return a.spread - b.spread
    if (sortBy === 'coupon') return b.coupon - a.coupon
    if (sortBy === 'tenor') return a.tenor - b.tenor
    return 0
  })

  const getIssuerName = (bond: Bond): string => {
    return bond.issuer?.name || 'Unknown'
  }

  const handleExportCSV = () => {
    const headers = ['Issuer', 'Type', 'Spread (bps)', 'Coupon (%)', 'Tenor (Y)', 'Size (€M)', 'ESG', 'ISIN']
    const rows = sortedBonds.map(bond => [
      getIssuerName(bond),
      bond.issue_type,
      bond.spread.toFixed(2),
      bond.coupon.toFixed(2),
      bond.tenor,
      bond.size,
      bond.is_green ? 'Green' : '-',
      bond.isin,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bonds.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-900">Bonds</h1>
        <p className="text-gray-600 mt-1">Complete bond inventory and details</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input"
              >
                <option value="all">All Types</option>
                <option value="SR Preferred">SR Preferred</option>
                <option value="Tier2">Tier 2</option>
                <option value="AT1">AT1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input"
              >
                <option value="spread">Spread (Low to High)</option>
                <option value="coupon">Coupon (High to Low)</option>
                <option value="tenor">Tenor (Short to Long)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={handleExportCSV} className="btn btn-primary w-full">Export to CSV</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bonds Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-primary-900">
            Bonds ({loading ? 'Loading...' : sortedBonds.length})
          </h2>
        </div>
        <div className="card-body">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading bonds...</p>
            </div>
          ) : sortedBonds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No bonds found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Issuer</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Spread</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Coupon</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Tenor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">ESG</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBonds.map((bond) => (
                    <tr key={bond.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-semibold">{getIssuerName(bond)}</td>
                      <td className="py-3 px-4">
                        <span className="badge badge-info">{bond.issue_type}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-accent-600">{bond.spread.toFixed(1)} bps</span>
                      </td>
                      <td className="py-3 px-4">{bond.coupon.toFixed(2)}%</td>
                      <td className="py-3 px-4">{bond.tenor}Y</td>
                      <td className="py-3 px-4">€{bond.size}M</td>
                      <td className="py-3 px-4">
                        {bond.is_green ? (
                          <span className="badge badge-success">✓ Green</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-accent-600 hover:text-accent-700 font-medium">View →</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BondsPage
