'use client'

import React from 'react'
import Link from 'next/link'

const IssuersPage: React.FC = () => {
  const issuers = [
    {
      name: 'Eurobank',
      market_share: '30%',
      avg_spread: '245 bps',
      bonds_count: 17,
      total_issuance: '€8.0B',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      name: 'Piraeus Bank',
      market_share: '29%',
      avg_spread: '265 bps',
      bonds_count: 16,
      total_issuance: '€7.7B',
      color: 'bg-green-100 text-green-800',
    },
    {
      name: 'Alpha Bank',
      market_share: '21%',
      avg_spread: '310 bps',
      bonds_count: 12,
      total_issuance: '€5.6B',
      color: 'bg-purple-100 text-purple-800',
    },
    {
      name: 'National Bank of Greece',
      market_share: '19%',
      avg_spread: '285 bps',
      bonds_count: 10,
      total_issuance: '€5.0B',
      color: 'bg-orange-100 text-orange-800',
    },
  ]

  return (
    <div className=\"p-6 space-y-6\">
      {/* Header */}
      <div>
        <h1 className=\"text-3xl font-bold text-primary-900\">Issuers</h1>
        <p className=\"text-gray-600 mt-1\">Greek Banks Debt Issuance Profile</p>
      </div>

      {/* Issuers Grid */}
      <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
        {issuers.map((issuer) => (
          <Link key={issuer.name} href={`/issuers/${issuer.name.toLowerCase().replace(/\\s+/g, '-')}`}>
            <div className=\"card cursor-pointer hover:shadow-lg transition-shadow\">
              <div className=\"card-body\">
                <div className=\"flex items-start justify-between mb-4\">
                  <div>
                    <h3 className=\"text-lg font-semibold text-primary-900\">{issuer.name}</h3>
                    <p className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${issuer.color}`}>
                      {issuer.market_share} Market Share
                    </p>
                  </div>
                </div>

                <div className=\"grid grid-cols-2 gap-4 mt-4\">
                  <div>
                    <p className=\"text-xs text-gray-600 font-medium\">Avg Spread</p>
                    <p className=\"text-lg font-bold text-primary-900 mt-1\">{issuer.avg_spread}</p>
                  </div>
                  <div>
                    <p className=\"text-xs text-gray-600 font-medium\">Bonds Count</p>
                    <p className=\"text-lg font-bold text-primary-900 mt-1\">{issuer.bonds_count}</p>
                  </div>
                  <div>
                    <p className=\"text-xs text-gray-600 font-medium\">Total Issuance</p>
                    <p className=\"text-lg font-bold text-primary-900 mt-1\">{issuer.total_issuance}</p>
                  </div>
                  <div>
                    <p className=\"text-xs text-gray-600 font-medium\">Avg Tenor</p>
                    <p className=\"text-lg font-bold text-primary-900 mt-1\">5.2Y</p>
                  </div>
                </div>

                <button className=\"btn btn-secondary w-full mt-4\">View Profile →</button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Comparison Table */}
      <div className=\"card\">
        <div className=\"card-header\">
          <h2 className=\"text-lg font-semibold text-primary-900\">Issuer Comparison</h2>
        </div>
        <div className=\"card-body\">
          <div className=\"overflow-x-auto\">
            <table className=\"w-full text-sm\">
              <thead>
                <tr className=\"border-b border-gray-200\">
                  <th className=\"text-left py-3 px-4 font-semibold text-gray-700\">Issuer</th>
                  <th className=\"text-left py-3 px-4 font-semibold text-gray-700\">Market Share</th>
                  <th className=\"text-left py-3 px-4 font-semibold text-gray-700\">Avg Spread</th>
                  <th className=\"text-left py-3 px-4 font-semibold text-gray-700\">Bonds</th>
                  <th className=\"text-left py-3 px-4 font-semibold text-gray-700\">Total Issuance</th>
                  <th className=\"text-left py-3 px-4 font-semibold text-gray-700\">Trend</th>
                </tr>
              </thead>
              <tbody>
                {issuers.map((issuer) => (
                  <tr key={issuer.name} className=\"border-b border-gray-100 hover:bg-gray-50\">
                    <td className=\"py-3 px-4 font-semibold\">{issuer.name}</td>
                    <td className=\"py-3 px-4\">{issuer.market_share}</td>
                    <td className=\"py-3 px-4\">{issuer.avg_spread}</td>
                    <td className=\"py-3 px-4\">{issuer.bonds_count}</td>
                    <td className=\"py-3 px-4\">{issuer.total_issuance}</td>
                    <td className=\"py-3 px-4\">
                      <span className=\"text-status-success\">↑ +2.3%</span>
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

export default IssuersPage

