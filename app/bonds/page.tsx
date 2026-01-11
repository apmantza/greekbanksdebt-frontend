'use client'

import React, { useState } from 'react'

const BondsPage: React.FC = () => {
  const [sortBy, setSortBy] = useState('spread')
  const [filterType, setFilterType] = useState('all')

  const bonds = [
    {
      id: 1,
      issuer: 'Eurobank',
      type: 'SR Preferred',
      spread: 245,
      coupon: 3.5,
      tenor: 5,
      size: '€500M',
      pricing_date: '2024-01-15',
      esg: true,
    },
    {
      id: 2,
      issuer: 'Piraeus',
      type: 'Tier 2',
      spread: 380,
      coupon: 4.8,
      tenor: 7,
      size: '€400M',
      pricing_date: '2024-01-10',
      esg: false,
    },
    {
      id: 3,
      issuer: 'Alpha',
      type: 'AT1',
      spread: 520,
      coupon: 6.2,
      tenor: 99,
      size: '€300M',
      pricing_date: '2024-01-05',
      esg: false,
    },
    {
      id: 4,
      issuer: 'NBG',
      type: 'SR Preferred',
      spread: 265,
      coupon: 3.8,
      tenor: 5,
      size: '€350M',
      pricing_date: '2023-12-20',
      esg: true,
    },
  ]

  const filteredBonds = bonds.filter((bond) => {
    if (filterType === 'all') return true
    return bond.type === filterType
  })

  const sortedBonds = [...filteredBonds].sort((a, b) => {
    if (sortBy === 'spread') return a.spread - b.spread
    if (sortBy === 'coupon') return b.coupon - a.coupon
    if (sortBy === 'tenor') return a.tenor - b.tenor
    return 0
  })

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
                <option value="Tier 2">Tier 2</option>
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
              <button className="btn btn-primary w-full">Export to CSV</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bonds Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-primary-900">Bonds ({sortedBonds.length})</h2>
        </div>
        <div className="card-body">
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
                    <td className="py-3 px-4 font-semibold">{bond.issuer}</td>
                    <td className="py-3 px-4">
                      <span className="badge badge-info">{bond.type}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-accent-600">{bond.spread} bps</span>
                    </td>
                    <td className="py-3 px-4">{bond.coupon.toFixed(2)}%</td>
                    <td className="py-3 px-4">{bond.tenor}Y</td>
                    <td className="py-3 px-4">{bond.size}</td>
                    <td className="py-3 px-4">
                      {bond.esg ? (
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
        </div>
      </div>
    </div>
  )
}

export default BondsPage

