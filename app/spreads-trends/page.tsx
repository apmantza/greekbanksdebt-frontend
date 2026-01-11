'use client'
// Force rebuild v2
import React, { useState, useEffect } from 'react'
import FilterPanel from '@/components/cards/FilterPanel'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter } from 'recharts'

const SpreadsTrendsPage: React.FC = () => {
  const [spreadByIssuer, setSpreadByIssuer] = useState<any[]>([])
  const [couponByIssuer, setCouponByIssuer] = useState<any[]>([])
  const [spreadByType, setSpreadByType] = useState<any[]>([])
  const [spreadDistribution, setSpreadDistribution] = useState<any[]>([])
  const [issuanceByYear, setIssuanceByYear] = useState<any[]>([])
  const [callableDebt, setCallableDebt] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://greekbanksdebt-api.onrender.com'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${apiUrl}/api/bonds?limit=100`)
        const bondsData = await response.json()
        const bonds = bondsData.items || bondsData.bonds || []

        // Calculate spread by issuer
        const issuerSpreadMap: { [key: string]: { spreads: number[]; coupons: number[] } } = {}
        bonds.forEach((bond: any) => {
          const issuer = bond.issuer?.name || bond.issuer_name || 'Unknown'
          if (!issuerSpreadMap[issuer]) {
            issuerSpreadMap[issuer] = { spreads: [], coupons: [] }
          }
          if (bond.spread) issuerSpreadMap[issuer].spreads.push(bond.spread)
          if (bond.coupon) issuerSpreadMap[issuer].coupons.push(bond.coupon)
        })

        const spreadData = Object.entries(issuerSpreadMap)
          .map(([issuer, data]) => ({
            issuer,
            avgSpread: parseFloat((data.spreads.reduce((a, b) => a + b, 0) / data.spreads.length).toFixed(1)),
            minSpread: Math.min(...data.spreads),
            maxSpread: Math.max(...data.spreads),
            avgCoupon: parseFloat((data.coupons.reduce((a, b) => a + b, 0) / data.coupons.length).toFixed(2)),
          }))
          .sort((a, b) => a.avgSpread - b.avgSpread)

        setSpreadByIssuer(spreadData)
        setCouponByIssuer(spreadData)

        // Calculate spread by issue type
        const typeSpreadMap: { [key: string]: number[] } = {}
        bonds.forEach((bond: any) => {
          const type = bond.issue_type || 'Unknown'
          if (!typeSpreadMap[type]) {
            typeSpreadMap[type] = []
          }
          if (bond.spread) typeSpreadMap[type].push(bond.spread)
        })

        const typeData = Object.entries(typeSpreadMap)
          .map(([type, spreads]) => ({
            type,
            avgSpread: parseFloat((spreads.reduce((a, b) => a + b, 0) / spreads.length).toFixed(1)),
            count: spreads.length,
            minSpread: Math.min(...spreads),
            maxSpread: Math.max(...spreads),
          }))
          .sort((a, b) => a.avgSpread - b.avgSpread)

        setSpreadByType(typeData)

        // Calculate spread distribution (buckets)
        const spreadBuckets: { [key: string]: number } = {
          '0-100': 0,
          '100-200': 0,
          '200-300': 0,
          '300-400': 0,
          '400-500': 0,
          '500+': 0,
        }

        bonds.forEach((bond: any) => {
          if (bond.spread) {
            if (bond.spread < 100) spreadBuckets['0-100']++
            else if (bond.spread < 200) spreadBuckets['100-200']++
            else if (bond.spread < 300) spreadBuckets['200-300']++
            else if (bond.spread < 400) spreadBuckets['300-400']++
            else if (bond.spread < 500) spreadBuckets['400-500']++
            else spreadBuckets['500+']++
          }
        })

        const distributionData = Object.entries(spreadBuckets).map(([bucket, count]) => ({
          bucket,
          count,
        }))

        setSpreadDistribution(distributionData)

        // Calculate issuance by year
        const yearMap: { [key: string]: number } = {}
        bonds.forEach((bond: any) => {
          if (bond.pricing_date) {
            const year = new Date(bond.pricing_date).getFullYear()
            yearMap[year] = (yearMap[year] || 0) + bond.size
          }
        })

        const yearData = Object.entries(yearMap)
          .map(([year, size]) => ({
            year: parseInt(year),
            size: parseFloat(size.toFixed(2)),
          }))
          .sort((a, b) => a.year - b.year)

        setIssuanceByYear(yearData)

        // Calculate callable debt by year
        const callMap: { [key: string]: number } = {}
        bonds.forEach((bond: any) => {
          if (bond.call_date) {
            const year = new Date(bond.call_date).getFullYear()
            callMap[year] = (callMap[year] || 0) + bond.size
          }
        })

        const callData = Object.entries(callMap)
          .map(([year, size]) => ({
            year: parseInt(year),
            size: parseFloat(size.toFixed(2)),
          }))
          .sort((a, b) => a.year - b.year)

        setCallableDebt(callData)
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [apiUrl])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📈 Spreads & Trends Analysis</h1>
          <p className="text-gray-600">Detailed analysis of spreads, coupons, tenors, and market trends</p>
        </div>

        {/* Filter Panel */}
        <FilterPanel />

        {/* Spread Analysis by Issuer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Average Spread by Issuer */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Average Spread by Issuer</h3>
            <p className="text-sm text-gray-600 mb-4">Sorted from tightest to widest spreads</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spreadByIssuer} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Spread (bps)', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis dataKey="issuer" type="category" width={80} />
                  <Tooltip formatter={(value: any) => `${value.toFixed(1)} bps`} />
                  <Bar dataKey="avgSpread" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Average Coupon by Issuer */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Average Coupon by Issuer</h3>
            <p className="text-sm text-gray-600 mb-4">Compensation offered by each issuer</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={couponByIssuer} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" label={{ value: 'Coupon (%)', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis dataKey="issuer" type="category" width={80} />
                  <Tooltip formatter={(value: any) => `${value.toFixed(2)}%`} />
                  <Bar dataKey="avgCoupon" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Spread Analysis by Type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spread by Issue Type */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏷️ Average Spread by Issue Type</h3>
            <p className="text-sm text-gray-600 mb-4">Spread comparison across different instrument types</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spreadByType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                  <YAxis label={{ value: 'Spread (bps)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => `${value.toFixed(1)} bps`} />
                  <Bar dataKey="avgSpread" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Spread Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Spread Distribution</h3>
            <p className="text-sm text-gray-600 mb-4">Number of bonds in each spread bucket</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spreadDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" label={{ value: 'Spread Range (bps)', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Issuance Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Issuance by Year */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Issuance by Year</h3>
            <p className="text-sm text-gray-600 mb-4">Total issuance volume by year</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issuanceByYear}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis label={{ value: 'Size (€M)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => `€${value.toFixed(0)}M`} />
                  <Bar dataKey="size" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Callable Debt by Year */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Callable Debt by Year</h3>
            <p className="text-sm text-gray-600 mb-4">Refinancing needs by call date</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={callableDebt}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis label={{ value: 'Size (€M)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value: any) => `€${value.toFixed(0)}M`} />
                  <Bar dataKey="size" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm font-semibold text-gray-700">Tightest Spreads</p>
              <p className="text-sm text-gray-600">
                {spreadByIssuer.length > 0
                  ? `${spreadByIssuer[0].issuer} with ${spreadByIssuer[0].avgSpread} bps`
                  : 'Loading...'}
              </p>
            </div>
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm font-semibold text-gray-700">Widest Spreads</p>
              <p className="text-sm text-gray-600">
                {spreadByIssuer.length > 0
                  ? `${spreadByIssuer[spreadByIssuer.length - 1].issuer} with ${spreadByIssuer[spreadByIssuer.length - 1].avgSpread} bps`
                  : 'Loading...'}
              </p>
            </div>
            <div className="border-l-4 border-pink-500 pl-4">
              <p className="text-sm font-semibold text-gray-700">Highest Coupons</p>
              <p className="text-sm text-gray-600">
                {couponByIssuer.length > 0
                  ? `${couponByIssuer[couponByIssuer.length - 1].issuer} with ${couponByIssuer[couponByIssuer.length - 1].avgCoupon}%`
                  : 'Loading...'}
              </p>
            </div>
            <div className="border-l-4 border-amber-500 pl-4">
              <p className="text-sm font-semibold text-gray-700">Most Expensive Type</p>
              <p className="text-sm text-gray-600">
                {spreadByType.length > 0
                  ? `${spreadByType[spreadByType.length - 1].type} with ${spreadByType[spreadByType.length - 1].avgSpread} bps`
                  : 'Loading...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpreadsTrendsPage
