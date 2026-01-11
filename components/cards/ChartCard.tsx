'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false })

interface ChartCardProps {
  title: string
  type: 'bar' | 'line' | 'pie' | 'histogram'
}

const ChartCard: React.FC<ChartCardProps> = ({ title, type }) => {
  const [data, setData] = useState<any[]>([])
  const [layout, setLayout] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://greekbanksdebt-api.onrender.com'

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (title === 'Issuance by Issuer') {
          // Fetch bonds and aggregate by issuer
          const response = await fetch(`${apiUrl}/api/bonds/?limit=100`)
          const bondsData = await response.json()
          const bonds = bondsData.items || []

          const issuerMap: { [key: string]: number } = {}
          bonds.forEach((bond: any) => {
            const issuer = bond.issuer?.name || 'Unknown'
            issuerMap[issuer] = (issuerMap[issuer] || 0) + bond.size
          })

          const issuers = Object.keys(issuerMap).sort((a, b) => issuerMap[b] - issuerMap[a])
          const sizes = issuers.map(issuer => issuerMap[issuer])

          setData([
            {
              x: issuers,
              y: sizes,
              type: 'bar',
              marker: { color: '#2563eb' },
            },
          ])

          setLayout({
            title: { text: 'Issuance by Issuer (€M)', x: 0.5, xanchor: 'center' },
            xaxis: { title: 'Issuer' },
            yaxis: { title: 'Issuance (€M)' },
            margin: { l: 60, r: 20, t: 40, b: 60 },
            height: 300,
          })
        } else if (title === 'Spread Distribution') {
          // Fetch bonds and create histogram
          const response = await fetch(`${apiUrl}/api/bonds/?limit=100`)
          const bondsData = await response.json()
          const bonds = bondsData.items || []
          const spreads = bonds.map((bond: any) => bond.spread)

          setData([
            {
              x: spreads,
              type: 'histogram',
              marker: { color: '#7c3aed' },
              nbinsx: 20,
            },
          ])

          setLayout({
            title: { text: 'Spread Distribution (bps)', x: 0.5, xanchor: 'center' },
            xaxis: { title: 'Spread (bps)' },
            yaxis: { title: 'Count' },
            margin: { l: 60, r: 20, t: 40, b: 60 },
            height: 300,
          })
        } else if (title === 'Issuance Trend') {
          // Create a simple trend line
          const response = await fetch(`${apiUrl}/api/bonds/?limit=100`)
          const bondsData = await response.json()
          const bonds = bondsData.items || []

          // Group by pricing date
          const dateMap: { [key: string]: number } = {}
          bonds.forEach((bond: any) => {
            const date = bond.pricing_date?.split('T')[0] || 'Unknown'
            dateMap[date] = (dateMap[date] || 0) + bond.size
          })

          const dates = Object.keys(dateMap).sort()
          const cumulative = dates.map((_, i) => dates.slice(0, i + 1).reduce((sum, d) => sum + dateMap[d], 0))

          setData([
            {
              x: dates,
              y: cumulative,
              type: 'scatter',
              mode: 'lines+markers',
              line: { color: '#059669', width: 2 },
              marker: { size: 6 },
            },
          ])

          setLayout({
            title: { text: 'Cumulative Issuance Trend (€M)', x: 0.5, xanchor: 'center' },
            xaxis: { title: 'Date' },
            yaxis: { title: 'Cumulative Issuance (€M)' },
            margin: { l: 60, r: 20, t: 40, b: 80 },
            height: 300,
          })
        } else if (title === 'Issue Type Breakdown') {
          // Fetch bonds and create pie chart
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

          setData([
            {
              labels: types,
              values: sizes,
              type: 'pie',
              marker: {
                colors: ['#2563eb', '#7c3aed', '#059669', '#f59e0b', '#ef4444'],
              },
            },
          ])

          setLayout({
            title: { text: 'Issue Type Breakdown (€M)', x: 0.5, xanchor: 'center' },
            margin: { l: 20, r: 20, t: 40, b: 20 },
            height: 300,
          })
        }
      } catch (err) {
        console.error('Error fetching chart data:', err)
        setError('Failed to load chart data')
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
            <p className="text-gray-500">Loading chart...</p>
          </div>
        ) : error ? (
          <div className="h-64 bg-red-50 rounded flex items-center justify-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : data.length > 0 ? (
          <div style={{ height: '300px', width: '100%' }}>
            <Plot
              data={data}
              layout={{
                ...layout,
                autosize: true,
                margin: { l: 60, r: 20, t: 40, b: 60 },
              }}
              style={{ width: '100%', height: '100%' }}
              config={{ responsive: true, displayModeBar: false }}
            />
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
