'use client'

import React, { useState } from 'react'
import Podium from '@/components/cards/Podium'

const MountOlympusPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('spreads')

  const categories = [
    { id: 'spreads', label: '📊 Spread Podiums', emoji: '📊' },
    { id: 'coupons', label: '💰 Coupon Podiums', emoji: '💰' },
    { id: 'sizes', label: '💎 Size Podiums', emoji: '💎' },
    { id: 'tenors', label: '⏳ Tenor Podiums', emoji: '⏳' },
  ]

  const podiumData = {
    spreads: [
      {
        rank: 1 as const,
        title: 'Tightest Senior Preferred',
        winner: 'Eurobank',
        value: '245',
        unit: 'bps',
        subtitle: 'The golden child of spreads',
        wittyComment: 'Even the gods are jealous of this spread',
        color: 'bg-yellow-50',
        height: 'h-48',
      },
      {
        rank: 2 as const,
        title: 'Runner-up SR Preferred',
        winner: 'NBG',
        value: '265',
        unit: 'bps',
        subtitle: 'Close, but not quite divine',
        wittyComment: 'Silver is still precious, even in Athens',
        color: 'bg-gray-100',
        height: 'h-40',
      },
      {
        rank: 3 as const,
        title: 'Third Place SR Preferred',
        winner: 'Piraeus',
        value: '285',
        unit: 'bps',
        subtitle: 'Bronze medal, golden heart',
        wittyComment: 'Third time\'s the charm... or is it?',
        color: 'bg-orange-50',
        height: 'h-32',
      },
    ],
    coupons: [
      {
        rank: 1 as const,
        title: 'Highest Coupon',
        winner: 'Alpha AT1',
        value: '6.2',
        unit: '%',
        subtitle: 'Investors are singing hymns',
        wittyComment: 'Higher than Mount Olympus itself!',
        color: 'bg-yellow-50',
        height: 'h-48',
      },
      {
        rank: 2 as const,
        title: 'Second Highest',
        winner: 'Piraeus Tier2',
        value: '4.8',
        unit: '%',
        subtitle: 'Still divine, just a bit less',
        wittyComment: 'Hera approves of this coupon',
        color: 'bg-gray-100',
        height: 'h-40',
      },
      {
        rank: 3 as const,
        title: 'Third Highest',
        winner: 'Eurobank SR',
        value: '3.5',
        unit: '%',
        subtitle: 'Modest but mighty',
        wittyComment: 'Even Athena would be satisfied',
        color: 'bg-orange-50',
        height: 'h-32',
      },
    ],
    sizes: [
      {
        rank: 1 as const,
        title: 'Largest Issuance',
        winner: 'Eurobank',
        value: '€500',
        unit: 'M',
        subtitle: 'Go big or go home',
        wittyComment: 'Zeus would be proud of this size',
        color: 'bg-yellow-50',
        height: 'h-48',
      },
      {
        rank: 2 as const,
        title: 'Second Largest',
        winner: 'Piraeus',
        value: '€400',
        unit: 'M',
        subtitle: 'Still impressive by mortal standards',
        wittyComment: 'Poseidon nods in approval',
        color: 'bg-gray-100',
        height: 'h-40',
      },
      {
        rank: 3 as const,
        title: 'Third Largest',
        winner: 'Alpha',
        value: '€300',
        unit: 'M',
        subtitle: 'Size isn\'t everything',
        wittyComment: 'Hermes appreciates the efficiency',
        color: 'bg-orange-50',
        height: 'h-32',
      },
    ],
    tenors: [
      {
        rank: 1 as const,
        title: 'Longest Tenor',
        winner: 'Alpha AT1',
        value: '99',
        unit: 'Years',
        subtitle: 'Perpetual like the gods',
        wittyComment: 'This bond will outlive us all',
        color: 'bg-yellow-50',
        height: 'h-48',
      },
      {
        rank: 2 as const,
        title: 'Second Longest',
        winner: 'Piraeus Tier2',
        value: '7',
        unit: 'Years',
        subtitle: 'A respectable lifespan',
        wittyComment: 'Kronos would be impressed',
        color: 'bg-gray-100',
        height: 'h-40',
      },
      {
        rank: 3 as const,
        title: 'Third Longest',
        winner: 'Eurobank SR',
        value: '5',
        unit: 'Years',
        subtitle: 'Quick and efficient',
        wittyComment: 'Ares likes the speed',
        color: 'bg-orange-50',
        height: 'h-32',
      },
    ],
  }

  const currentPodiums = podiumData[activeCategory as keyof typeof podiumData]

  return (
    <div className="p-6 space-y-8">
      {/* Header with Epic Styling */}
      <div className="text-center space-y-2">
        <div className="text-6xl mb-4">⛰️</div>
        <h1 className="text-4xl font-bold text-primary-900">Mount Olympus</h1>
        <p className="text-xl text-accent-600 font-semibold">Where Legends Are Made</p>
        <p className="text-gray-600 mt-2">The gods have spoken. These are the champions of Greek banking.</p>
      </div>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeCategory === cat.id
                ? 'bg-accent-500 text-white shadow-lg scale-105'
                : 'bg-white text-primary-900 border-2 border-gray-200 hover:border-accent-500'
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Podiums Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto">
        {currentPodiums.map((podium) => (
          <Podium key={podium.rank} {...podium} />
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent-300 to-transparent"></div>
        <span className="text-2xl">⚡</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-accent-300 to-transparent"></div>
      </div>

      {/* Hall of Fame */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-2xl font-bold text-primary-900">🏛️ Hall of Fame</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tightest Spread All Time */}
            <div className="border-l-4 border-accent-500 pl-4">
              <p className="text-sm text-gray-600 font-semibold uppercase">All-Time Tightest Spread</p>
              <p className="text-2xl font-bold text-primary-900 mt-1">Eurobank SR</p>
              <p className="text-lg text-accent-600 font-semibold">245 bps</p>
              <p className="text-sm text-gray-600 mt-2 italic">"The benchmark that all others aspire to"</p>
            </div>

            {/* Highest Coupon All Time */}
            <div className="border-l-4 border-yellow-500 pl-4">
              <p className="text-sm text-gray-600 font-semibold uppercase">All-Time Highest Coupon</p>
              <p className="text-2xl font-bold text-primary-900 mt-1">Alpha AT1</p>
              <p className="text-lg text-yellow-600 font-semibold">6.2%</p>
              <p className="text-sm text-gray-600 mt-2 italic">"Investors were literally singing"</p>
            </div>

            {/* Most Consistent Issuer */}
            <div className="border-l-4 border-green-500 pl-4">
              <p className="text-sm text-gray-600 font-semibold uppercase">Most Consistent Issuer</p>
              <p className="text-2xl font-bold text-primary-900 mt-1">Eurobank</p>
              <p className="text-lg text-green-600 font-semibold">30% Market Share</p>
              <p className="text-sm text-gray-600 mt-2 italic">"The king of the mountain"</p>
            </div>

            {/* Most Innovative */}
            <div className="border-l-4 border-purple-500 pl-4">
              <p className="text-sm text-gray-600 font-semibold uppercase">Most Innovative</p>
              <p className="text-2xl font-bold text-primary-900 mt-1">Green Bonds</p>
              <p className="text-lg text-purple-600 font-semibold">240 bps Premium</p>
              <p className="text-sm text-gray-600 mt-2 italic">"Mother Earth approves"</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mythological Commentary */}
      <div className="bg-gradient-to-r from-accent-50 to-blue-50 rounded-lg p-6 border-2 border-accent-200">
        <div className="flex gap-4">
          <div className="text-4xl">🦅</div>
          <div>
            <h3 className="text-lg font-bold text-primary-900">Zeus Speaks</h3>
            <p className="text-gray-700 mt-2">
              "Behold, mortals! The Greek banking sector has ascended to new heights. From the depths of crisis to the peaks of recovery, these institutions have proven themselves worthy of Olympian status. The spreads have compressed like never before, and the coupon rates sing like the sirens of old. Let this dashboard be a testament to their resilience and the market's renewed faith in Greek finance."
            </p>
            <p className="text-sm text-gray-600 mt-3 italic">- The King of the Gods</p>
          </div>
        </div>
      </div>

      {/* Fun Facts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card bg-blue-50">
          <div className="card-body">
            <p className="text-sm text-gray-600 font-semibold uppercase">Did You Know?</p>
            <p className="text-primary-900 mt-2">
              Spreads have compressed by <span className="font-bold text-accent-600">649 bps</span> since 2019. That's like going from Tartarus to Olympus!
            </p>
          </div>
        </div>
        <div className="card bg-green-50">
          <div className="card-body">
            <p className="text-sm text-gray-600 font-semibold uppercase">Fun Fact</p>
            <p className="text-primary-900 mt-2">
              Green bonds trade <span className="font-bold text-green-600">240 bps tighter</span> than conventional bonds. Gaia is pleased.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-600 text-sm">
        <p>"In data we trust, in spreads we compete, on Mount Olympus we meet."</p>
        <p className="mt-2">Last updated: Today | Data as of: Latest market close</p>
      </div>
    </div>
  )
}

export default MountOlympusPage

