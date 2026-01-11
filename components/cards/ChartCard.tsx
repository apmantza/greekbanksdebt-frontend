'use client'

import React, { useEffect, useState } from 'react'

interface ChartCardProps {
  title: string
  type: 'bar' | 'line' | 'pie' | 'histogram'
}

const ChartCard: React.FC<ChartCardProps> = ({ title, type }) => {
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://greekbanksdebt-api.onrender.com'

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (title === 'Issuance by Issuer') {
          const response = await fetch(`${apiUrl}/api/bonds/?limit=100`)
          const bondsData = await response.json()
          const bonds = bondsData.items || []

          const issuerMap: { [key: string]: number } = {}
          bonds.forEach((bond: any) => {
            const issuer = bond.issuer?.name || 'Unknown'
            issuerMap[issuer] = (issuerMap[issuer] || 0) + bond.size
          })

          const issuers = Object.keys(issuerMap).sort((a, b) => issuerMap[b] - issuerMap[a])
          setData({ issuers, sizes: issuers.map(i => issuerMap[i]) })
        } else if (title === 'Spread Distribution') {
          const response = await fetch(`${apiUrl}/api/bonds/?limit=100`)
          const bondsData = await response.json()
          const bonds = bondsData.items || []
          const spreads = bonds.map((bond: any) => bond.spread).sort((a: number, b: number) => a - b)
          
          // Create buckets
          const min = spreads[0] || 0
          const max = spreads[spreads.length - 1] || 1000
          const bucketSize = (max - min) / 10
          const buckets: { [key: string]: number } = {}
          
          spreads.forEach((spread: number) => {
            const bucketIndex = Math.floor((spread - min) / bucketSize)
            const bucketKey = `${(min + bucketIndex * bucketSize).toFixed(0)}-${(min + (bucketIndex + 1) * bucketSize).toFixed(0)}`
            buckets[bucketKey] = (buckets[bucketKey] || 0) + 1
          })
          
          setData({ buckets })
        } else if (title === 'Issuance Trend') {
          const response = await fetch(`${apiUrl}/api/bonds/?limit=100`)
          const bondsData = await response.json()
          const bonds = bondsData.items || []

          const dateMap: { [key: string]: number } = {}
          bonds.forEach((bond: any) => {
            const date = bond.pricing_date?.split('T')[0] || 'Unknown'
            dateMap[date] = (dateMap[date] || 0) + bond.size
          })

          const dates = Object.keys(dateMap).sort()
          const cumulative = dates.map((_, i) => dates.slice(0, i + 1).reduce((sum, d) => sum + dateMap[d], 0))

          setData({ dates, cumulative })
        } else if (title === 'Issue Type Breakdown') {
          const response = await fetch(`${apiUrl}/api/bonds/?limit=100`)
          const bondsData = await response.json()
          const bonds = bondsData.items || []

          const typeMap: { [key: string]: number } = {}
          bonds.forEach((bond: any) => {
            const type = bond.issue_type || 'Unknown'
            typeMap[type] = (typeMap[type] || 0) + bond.size
          })

          const types = Object.keys(typeMap)
          const sizes = types.map(type => typeMap[type])

          setData({ types, sizes })
        }
      } catch (err) {
        console.error('Error fetching chart data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchChartData()
  }, [title, apiUrl])

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-primary-900">{title}</h3>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">Loading data...</p>
          </div>
        ) : error ? (
          <div className="h-64 bg-red-50 rounded flex items-center justify-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : title === 'Issuance by Issuer' && data.issuers ? (
          <div className="space-y-2">
            {data.issuers.map((issuer: string, idx: number) => (
              <div key={issuer} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{issuer}</span>
                <div className="flex items-center gap-2 flex-1 ml-4">
                  <div className="bg-blue-200 h-6 rounded" style={{ width: `${(data.sizes[idx] / Math.max(...data.sizes)) * 100}%` }}></div>
                  <span className="text-sm text-gray-600 w-16 text-right">€{data.sizes[idx]}M</span>
                </div>
              </div>
            ))}
          </div>
        ) : title === 'Spread Distribution' && data.buckets ? (
          <div className="space-y-2">
            {Object.entries(data.buckets).map(([bucket, count]: [string, any]) => (
              <div key={bucket} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{bucket} bps</span>
                <div className="flex items-center gap-2 flex-1 ml-4">
                  <div className="bg-purple-200 h-6 rounded" style={{ width: `${(count / Math.max(...Object.values(data.buckets as any).map(Number))) * 100}%` }}></div>
                  <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        ) : title === 'Issuance Trend' && data.dates ? (
          <div className="text-sm text-gray-600">
            <p className="mb-3">Cumulative Issuance Over Time</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-right py-2">Cumulative (€M)</th>
                </tr>
              </thead>
              <tbody>
                {data.dates.map((date: string, idx: number) => (
                  <tr key={date} className="border-b">
                    <td className="py-2">{date}</td>
                    <td className="text-right">{data.cumulative[idx].toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : title === 'Issue Type Breakdown' && data.types ? (
          <div className="space-y-2">
            {data.types.map((type: string, idx: number) => {
              const total = data.sizes.reduce((a: number, b: number) => a + b, 0)
              const percentage = ((data.sizes[idx] / total) * 100).toFixed(1)
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{type}</span>
                  <div className="flex items-center gap-2 flex-1 ml-4">
                    <div className="bg-green-200 h-6 rounded" style={{ width: `${(data.sizes[idx] / Math.max(...data.sizes)) * 100}%` }}></div>
                    <span className="text-sm text-gray-600 w-20 text-right">{percentage}% (€{data.sizes[idx]}M)</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded flex items-center justify-center">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChartCard
