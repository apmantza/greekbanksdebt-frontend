'use client'

import React, { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

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
          const bonds = bondsData.bonds || []

          const issuerMap: { [key: string]: number } = {}
          bonds.forEach((bond: any) => {
            const issuer = bond.issuer_name || 'Unknown'
            issuerMap[issuer] = (issuerMap[issuer] || 0) + bond.size
          })

          const chartData = Object.entries(issuerMap).map(([name, value]) => ({
            name,
            value: parseFloat(value.toFixed(2))
          }))
          setData(chartData)
        } else if (title === 'Spread Distribution') {
          const response = await fetch(`${apiUrl}/api/bonds/?limit=100`)
          const bondsData = await response.json()
          const bonds = bondsData.bonds || []
          const spreads = bonds.map((bond: any) => bond.spread).sort((a: number, b: number) => a - b)
          
          // Create buckets
          const min = Math.floor(spreads[0] || 0)
          const max = Math.ceil(spreads[spreads.length - 1] || 1000)
          const bucketSize = Math.ceil((max - min) / 10)
          const buckets: { [key: string]: number } = {}
          
          spreads.forEach((spread: number) => {
            const bucketIndex = Math.floor((spread - min) / bucketSize)
            const bucketStart = min + bucketIndex * bucketSize
            const bucketEnd = bucketStart + bucketSize
            const bucketKey = `${bucketStart}-${bucketEnd}`
            buckets[bucketKey] = (buckets[bucketKey] || 0) + 1
          })

          const chartData = Object.entries(buckets).map(([range, count]) => ({
            range,
            count
          }))
          setData(chartData)
        } else if (title === 'Issuance Trend') {
          const response = await fetch(`${apiUrl}/api/bonds/?limit=100`)
          const bondsData = await response.json()
          const bonds = bondsData.bonds || []
          
          // Sort by pricing date and calculate cumulative
          const sortedBonds = bonds.sort((a: any, b: any) => 
            new Date(a.pricing_date).getTime() - new Date(b.pricing_date).getTime()
          )

          let cumulative = 0
          const chartData = sortedBonds.map((bond: any) => {
            cumulative += bond.size
            return {
              date: new Date(bond.pricing_date).toLocaleDateString(),
              cumulative: parseFloat(cumulative.toFixed(2))
            }
          })
          setData(chartData)
        } else if (title === 'Issue Type Breakdown') {
          const response = await fetch(`${apiUrl}/api/bonds/?limit=100`)
          const bondsData = await response.json()
          const bonds = bondsData.bonds || []

          const typeMap: { [key: string]: number } = {}
          bonds.forEach((bond: any) => {
            const type = bond.issue_type || 'Unknown'
            typeMap[type] = (typeMap[type] || 0) + bond.size
          })

          const chartData = Object.entries(typeMap).map(([name, value]) => ({
            name,
            value: parseFloat(value.toFixed(2))
          }))
          setData(chartData)
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#ef4444']

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-80">
        {type === 'bar' && title === 'Issuance by Issuer' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `€${value}M`} />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}
        {type === 'histogram' && title === 'Spread Distribution' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        )}
        {type === 'line' && title === 'Issuance Trend' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `€${value}M`} />
              <Line type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {type === 'pie' && title === 'Issue Type Breakdown' && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: €${value}M`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={`cell-${index}`} fill={color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `€${value}M`} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default ChartCard
