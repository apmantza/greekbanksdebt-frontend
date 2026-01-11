'use client'

import React, { useState, useEffect } from 'react'

const MountOlympusPage: React.FC = () => {
  const [bonds, setBonds] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://greekbanksdebt-api.onrender.com/api/bonds?limit=1000')
        const data = await response.json()
        const allBonds = data.items || data.bonds || []
        setBonds(allBonds)

        // Calculate metrics
        if (allBonds.length > 0) {
          const spreads = allBonds.map((b: any) => b.spread || 0)
          const avgSpread = spreads.reduce((a: number, b: number) => a + b, 0) / spreads.length
          
          // Get top 3 by tightest spread
          const topBySpread = [...allBonds]
            .sort((a: any, b: any) => (a.spread || 0) - (b.spread || 0))
            .slice(0, 3)
          
          // Get top by coupon
          const topByCoupon = [...allBonds]
            .sort((a: any, b: any) => (b.coupon || 0) - (a.coupon || 0))
            .slice(0, 1)[0]

          // Get top by size
          const topBySize = [...allBonds]
            .sort((a: any, b: any) => (b.size || 0) - (a.size || 0))
            .slice(0, 1)[0]

          setMetrics({
            avgSpread: Math.round(avgSpread),
            topBySpread,
            topByCoupon,
            topBySize,
            totalBonds: allBonds.length
          })
        }
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-8">Loading Mount Olympus...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-amber-50 p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-primary-900 mb-2">⛰️ Mount Olympus</h1>
        <p className="text-xl text-gray-600">Where Greek Banking Excellence Reaches Divine Heights</p>
      </div>

      {/* Podium Section */}
      <div className="card mb-12">
        <div className="card-header">
          <h2 className="text-3xl font-bold text-primary-900">🏆 Spread Podium</h2>
          <p className="text-gray-600 mt-1">The tightest spreads - the gods of the market</p>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Gold Medal */}
            {metrics?.topBySpread?.[0] && (
              <div className="text-center">
                <div className="text-6xl mb-4">🥇</div>
                <div className="bg-gradient-to-b from-yellow-100 to-yellow-50 rounded-lg p-6 border-2 border-yellow-400">
                  <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Gold - Tightest Spread</p>
                  <p className="text-2xl font-bold text-primary-900">{metrics.topBySpread[0].issuer?.name}</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">{metrics.topBySpread[0].spread} bps</p>
                  <p className="text-sm text-gray-600 mt-3 italic">\"The benchmark of excellence\"</p>
                </div>
              </div>
            )}

            {/* Silver Medal */}
            {metrics?.topBySpread?.[1] && (
              <div className="text-center">
                <div className="text-6xl mb-4">🥈</div>
                <div className="bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg p-6 border-2 border-gray-400">
                  <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Silver - Second Tightest</p>
                  <p className="text-2xl font-bold text-primary-900">{metrics.topBySpread[1].issuer?.name}</p>
                  <p className="text-3xl font-bold text-gray-600 mt-2">{metrics.topBySpread[1].spread} bps</p>
                  <p className="text-sm text-gray-600 mt-3 italic\">\"A worthy challenger\"</p>
                </div>
              </div>
            )}

            {/* Bronze Medal */}
            {metrics?.topBySpread?.[2] && (
              <div className="text-center">
                <div className="text-6xl mb-4">🥉</div>
                <div className="bg-gradient-to-b from-orange-100 to-orange-50 rounded-lg p-6 border-2 border-orange-400">
                  <p className="text-sm text-gray-600 font-semibold uppercase mb-2">Bronze - Third Tightest</p>
                  <p className="text-2xl font-bold text-primary-900">{metrics.topBySpread[2].issuer?.name}</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{metrics.topBySpread[2].spread} bps</p>
                  <p className="text-sm text-gray-600 mt-3 italic\">\"Still divine\"</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-12 justify-center">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent-300 to-transparent"></div>
        <span className="text-2xl">⚡</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent-300 to-transparent"></div>
      </div>

      {/* Hall of Fame */}
      <div className="card mb-12">
        <div className="card-header">
          <h2 className="text-2xl font-bold text-primary-900">🏛️ Hall of Fame</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tightest Spread All Time */}
            <div className="border-l-4 border-accent-500 pl-4">
              <p className="text-sm text-gray-600 font-semibold uppercase">All-Time Tightest Spread</p>
              {metrics?.topBySpread?.[0] && (
                <>
                  <p className="text-2xl font-bold text-primary-900 mt-1">{metrics.topBySpread[0].issuer?.name}</p>
                  <p className="text-lg text-accent-600 font-semibold">{metrics.topBySpread[0].spread} bps</p>
                  <p className="text-sm text-gray-600 mt-2 italic">\"The benchmark that all others aspire to\"</p>
                </>
              )}
            </div>

            {/* Highest Coupon All Time */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="text-sm text-gray-600 font-semibold uppercase">All-Time Highest Coupon</p>
              {metrics?.topByCoupon && (
                <>
                  <p className="text-2xl font-bold text-primary-900 mt-1">{metrics.topByCoupon.issuer?.name}</p>
                  <p className="text-lg text-yellow-600 font-semibold">{metrics.topByCoupon.coupon}%</p>
                  <p className="text-sm text-gray-600 mt-2 italic">\"Investors were literally singing\"</p>
                </>
              )}
            </div>

            {/* Largest Issuance */}
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600 font-semibold uppercase">Largest Single Issuance</p>
              {metrics?.topBySize && (
                <>
                  <p className="text-2xl font-bold text-primary-900 mt-1">{metrics.topBySize.issuer?.name}</p>
                  <p className="text-lg text-green-600 font-semibold">€{metrics.topBySize.size}M</p>
                  <p className="text-sm text-gray-600 mt-2 italic\">\"The king of the mountain\"</p>
                </>
              )}
            </div>

            {/* Market Stats */}
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-600 font-semibold uppercase">Market Statistics</p>
              {metrics && (
                <>
                  <p className="text-2xl font-bold text-primary-900 mt-1">{metrics.totalBonds} Bonds</p>
                  <p className="text-lg text-purple-600 font-semibold">Avg Spread: {metrics.avgSpread} bps</p>
                  <p className="text-sm text-gray-600 mt-2 italic\">\"A thriving market\"</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mythological Commentary */}
      <div className="bg-gradient-to-r from-accent-50 to-blue-50 rounded-lg p-6 border-2 border-accent-200 mb-12">
        <div className="flex gap-4">
          <div className="text-4xl">🦅</div>
          <div>
            <h3 className="text-lg font-bold text-primary-900">Zeus Speaks</h3>
            <p className="text-gray-700 mt-2">
              \"Behold, mortals! The Greek banking sector has ascended to new heights. From the depths of crisis to the peaks of recovery, these institutions have proven themselves worthy of Olympian status. The spreads have compressed like never before, and the coupon rates sing like the sirens of old. Let this dashboard be a testament to their resilience and the market's renewed faith in Greek finance.\"
            </p>
            <p className="text-sm text-gray-600 mt-3 italic\">- The King of the Gods</p>
          </div>
        </div>
      </div>

      {/* Fun Facts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        <div className="card bg-blue-50">
          <div className="card-body">
            <p className="text-sm text-gray-600 font-semibold uppercase\">Did You Know?</p>
            <p className="text-primary-900 mt-2\">
              We track <span className="font-bold text-accent-600\">{metrics?.totalBonds}</span> bonds across 6 Greek banks. That's more than Zeus has thunderbolts!
            </p>
          </div>
        </div>
        <div className="card bg-green-50">
          <div className="card-body">
            <p className="text-sm text-gray-600 font-semibold uppercase\">Fun Fact</p>
            <p className="text-primary-900 mt-2\">
              The average spread is <span className="font-bold text-accent-600\">{metrics?.avgSpread} bps</span>. That's tighter than Hephaestus's grip!
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 text-sm">
        <p>\"In data we trust, in spreads we compete, on Mount Olympus we meet.\"</p>
        <p className="mt-2">Last updated: Today | Data as of: Latest market close</p>
      </div>
    </div>
  )
}

export default MountOlympusPage
