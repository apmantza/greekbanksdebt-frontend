'use client'

import React, { useState, useEffect } from 'react'
import KPICard from '@/components/cards/KPICard'
import ChartCard from '@/components/cards/ChartCard'

interface DashboardMetrics {
  total_issuance: number
  average_spread: number
  active_bonds_count: number
  top_issuer: string
  spread_compression: number
  green_bond_premium: number
}

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

const DashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [bonds, setBonds] = useState<Bond[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://greekbanksdebt-api.onrender.com'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch dashboard metrics
        const metricsResponse = await fetch(`${apiUrl}/api/analytics/dashboard`)
        if (!metricsResponse.ok) {
          throw new Error('Failed to fetch metrics')
        }
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)

        // Fetch recent bonds
        const bondsResponse = await fetch(`${apiUrl}/api/bonds/?limit=5&sort_by=pricing_date&sort_order=desc`)
        if (!bondsResponse.ok) {
          throw new Error('Failed to fetch bonds')
        }
        const bondsData = await bondsResponse.json()
        setBonds(bondsData.items || [])
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
        // Use fallback data
        setMetrics({
          total_issuance: 26638.5,
          average_spread: 382.2,
          active_bonds_count: 55,
          top_issuer: 'Eurobank',
          spread_compression: 0,
          green_bond_premium: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [apiUrl])

  // Format KPI data
  const kpis: Array<{ label: string; value: string; change: string; trend: 'up' | 'down' | 'neutral' }> = metrics
    ? [
        {
          label: 'Total Issuance',
          value: `€${(metrics.total_issuance / 1000).toFixed(1)}B`,
          change: '+5.2%',
          trend: 'up' as const,
        },
        {
          label: 'Avg Spread',
          value: `${metrics.average_spread.toFixed(0)} bps`,
          change: '-120 bps',
          trend: 'down' as const,
        },
        {
          label: 'Active Bonds',
          value: `${metrics.active_bonds_count}`,
          change: '+3',
          trend: 'up' as const,
        },
        {
          label: 'Top Issuer',
          value: metrics.top_issuer,
          change: '30%',
          trend: 'neutral' as const,
        },
      ]
    : []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Greek Banks Debt Market Overview</p>
        {error && <p className="text-red-600 text-sm mt-2">⚠️ {error}</p>}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading metrics...</div>
        ) : (
          kpis.map((kpi, index) => <KPICard key={index} {...kpi} />)
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Issuance by Issuer" type="bar" />
        <ChartCard title="Spread Distribution" type="histogram" />
        <ChartCard title="Issuance Trend" type="line" />
        <ChartCard title="Issue Type Breakdown" type="pie" />
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-primary-900">Recent Bonds</h2>
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
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Size</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-center text-gray-500">
                      Loading bonds...
                    </td>
                  </tr>
                ) : bonds.length > 0 ? (
                  bonds.map((bond) => (
                    <tr key={bond.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{bond.issuer?.name || 'N/A'}</td>
                      <td className="py-3 px-4">
                        <span className="badge badge-info">{bond.issue_type}</span>
                      </td>
                      <td className="py-3 px-4">{bond.spread.toFixed(1)} bps</td>
                      <td className="py-3 px-4">{bond.coupon.toFixed(2)}%</td>
                      <td className="py-3 px-4 font-semibold">€{bond.size.toFixed(0)}M</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-center text-gray-500">
                      No bonds available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
