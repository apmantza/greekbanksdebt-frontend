'use client'

import React, { useEffect, useState } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ScatterChartProps {
  title: string
  xAxisLabel: string
  yAxisLabel: string
  dataType: 'spread-vs-tenor' | 'coupon-vs-tenor' | 'spread-vs-date'
}

const ScatterChartComponent: React.FC<ScatterChartProps> = ({ title, xAxisLabel, yAxisLabel, dataType }) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://greekbanksdebt-api.onrender.com'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${apiUrl}/api/bonds?limit=100`)
        const bondsData = await response.json()
        const bonds = bondsData.items || bondsData.bonds || []

        let chartData: any[] = []

        if (dataType === 'spread-vs-tenor') {
          chartData = bonds
            .filter((bond: any) => bond.spread && bond.tenor)
            .map((bond: any) => ({
              tenor: bond.tenor,
              spread: bond.spread,
              issuer: bond.issuer?.name || bond.issuer_name || 'Unknown',
              coupon: bond.coupon,
            }))
        } else if (dataType === 'coupon-vs-tenor') {
          chartData = bonds
            .filter((bond: any) => bond.coupon && bond.tenor)
            .map((bond: any) => ({
              tenor: bond.tenor,
              coupon: bond.coupon,
              issuer: bond.issuer?.name || bond.issuer_name || 'Unknown',
              spread: bond.spread,
            }))
        } else if (dataType === 'spread-vs-date') {
          chartData = bonds
            .filter((bond: any) => bond.spread && bond.pricing_date)
            .map((bond: any) => ({
              date: new Date(bond.pricing_date).getTime(),
              spread: bond.spread,
              issuer: bond.issuer?.name || bond.issuer_name || 'Unknown',
              coupon: bond.coupon,
            }))
            .sort((a: any, b: any) => a.date - b.date)
        }

        setData(chartData)
      } catch (err) {
        console.error('Error fetching scatter data:', err)
        setError('Failed to load chart data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dataType, apiUrl])

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

  const ISSUER_COLORS: { [key: string]: string } = {
    'Piraeus': '#3b82f6',
    'NBG': '#8b5cf6',
    'Alpha': '#ec4899',
    'Eurobank': '#f59e0b',
    'Optima': '#10b981',
    'Attica': '#06b6d4',
  }

  const issuers = Array.from(new Set(data.map((d: any) => d.issuer)))

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={
                dataType === 'spread-vs-tenor' || dataType === 'coupon-vs-tenor'
                  ? 'tenor'
                  : 'date'
              }
              type={dataType === 'spread-vs-date' ? 'number' : 'number'}
              name={xAxisLabel}
              unit={dataType === 'spread-vs-date' ? '' : ' yrs'}
            />
            <YAxis
              dataKey={
                dataType === 'spread-vs-tenor' ? 'spread' : dataType === 'coupon-vs-tenor' ? 'coupon' : 'spread'
              }
              name={yAxisLabel}
              unit={dataType === 'coupon-vs-tenor' ? '%' : ' bps'}
            />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value: any, name: string) => {
                if (name === 'tenor') return [`${value.toFixed(1)} yrs`, 'Tenor']
                if (name === 'spread') return [`${value.toFixed(1)} bps`, 'Spread']
                if (name === 'coupon') return [`${value.toFixed(2)}%`, 'Coupon']
                if (name === 'date') return [new Date(value).toLocaleDateString(), 'Date']
                return [value, name]
              }}
            />
            <Legend />
            {issuers.map((issuer: string) => (
              <Scatter
                key={issuer}
                name={issuer}
                data={data.filter((d: any) => d.issuer === issuer)}
                fill={ISSUER_COLORS[issuer] || '#999'}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default ScatterChartComponent
