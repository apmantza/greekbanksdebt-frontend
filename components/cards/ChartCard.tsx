'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ChartCardProps {
  title: string
  description?: string
}

const ChartCard: React.FC<ChartCardProps> = ({ title, description }) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('https://greekbanksdebt-api.onrender.com/api/bonds/?limit=1000')
        if (!response.ok) throw new Error('Failed to fetch bonds')
        
        const bondsData = await response.json()
        const bonds = bondsData.bonds || []

        if (title === 'Issuance by Issuer') {
          const issuerMap: { [key: string]: number } = {}
          bonds.forEach((bond: any) => {
            const issuer = bond.issuer?.name || 'Unknown'
            issuerMap[issuer] = (issuerMap[issuer] || 0) + (bond.size || 0)
          })
          const chartData = Object.entries(issuerMap).map(([name, value]) => ({
            name,
            value: parseFloat((value as number).toFixed(2))
          }))
          setData(chartData)
        } else if (title === 'Spread Distribution') {
          const spreads = bonds.map((bond: any) => bond.spread || 0).sort((a: number, b: number) => a - b)
          const buckets: { [key: string]: number } = {}
          spreads.forEach((spread: number) => {
            const bucket = Math.floor(spread / 100) * 100
            const range = `${bucket}-${bucket + 100} bps`
            buckets[range] = (buckets[range] || 0) + 1
          })
          const chartData = Object.entries(buckets).map(([range, count]) => ({
            range,
            count
          }))
          setData(chartData)
        } else if (title === 'Issuance Trend') {
          const sortedBonds = [...bonds].sort((a: any, b: any) => 
            new Date(a.pricing_date || 0).getTime() - new Date(b.pricing_date || 0).getTime()
          )
          let cumulative = 0
          const chartData = sortedBonds.slice(0, 20).map((bond: any) => {
            cumulative += bond.size || 0
            return {
              date: bond.pricing_date ? new Date(bond.pricing_date).toLocaleDateString() : 'Unknown',
              cumulative: parseFloat(cumulative.toFixed(2))
            }
          })
          setData(chartData)
        } else if (title === 'Issue Type Breakdown') {
          const typeMap: { [key: string]: number } = {}
          bonds.forEach((bond: any) => {
            const type = bond.issue_type || 'Unknown'
            typeMap[type] = (typeMap[type] || 0) + (bond.size || 0)
          })
          const chartData = Object.entries(typeMap).map(([name, value]) => ({
            name,
            value: parseFloat((value as number).toFixed(2))
          }))
          setData(chartData)
        }
        setLoading(false)
      } catch (err) {
        console.error('Error processing chart data:', err)
        setError(err instanceof Error ? err.message : 'Error loading chart')
        setLoading(false)
      }
    }

    fetchAndProcessData()
  }, [title])

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-primary-900">{title}</h3>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
        <div className="card-body flex items-center justify-center h-80">
          <p className="text-gray-500">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-primary-900">{title}</h3>
        </div>
        <div className="card-body flex items-center justify-center h-80">
          <p className="text-red-500">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-primary-900">{title}</h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      <div className="card-body">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-80">
            <p className="text-gray-500">No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            {title === 'Issuance by Issuer' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value}M`} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            ) : title === 'Spread Distribution' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#a855f7" />
              </BarChart>
            ) : title === 'Issuance Trend' ? (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value}M`} />
                <Line type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            ) : title === 'Issue Type Breakdown' ? (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: €${value}M`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip formatter={(value) => `€${value}M`} />
              </PieChart>
            ) : null}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default ChartCard
