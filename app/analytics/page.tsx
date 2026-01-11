'use client'

import React, { useState } from 'react'
import ChartCard from '@/components/cards/ChartCard'

const AnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'spreads', label: 'Spread Analysis' },
    { id: 'trends', label: 'Trends' },
    { id: 'comparison', label: 'Comparison' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Advanced market analysis and insights</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issuer</label>
              <select className="input">
                <option>All Issuers</option>
                <option>Eurobank</option>
                <option>Piraeus</option>
                <option>Alpha</option>
                <option>NBG</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issue Type</label>
              <select className="input">
                <option>All Types</option>
                <option>SR Preferred</option>
                <option>Tier 2</option>
                <option>AT1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select className="input">
                <option>Last 12 Months</option>
                <option>Last 24 Months</option>
                <option>All Time</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="btn btn-primary w-full">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-accent-500 text-accent-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Spread Momentum" type="bar" />
        <ChartCard title="Tenor-Spread Slope" type="line" />
        <ChartCard title="Issue Type Analysis" type="histogram" />
        <ChartCard title="Seasonality" type="bar" />
      </div>

      {/* Insights */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-primary-900">Key Insights</h2>
        </div>
        <div className="card-body space-y-4">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-accent-100">
                <span className="text-accent-600 font-bold">💡</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-primary-900">Spread Compression Trend</h3>
              <p className="text-sm text-gray-600 mt-1">Spreads have compressed from 921 bps (2019) to 272 bps (2024-2025), indicating improved market sentiment towards Greek banks.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 rounded-md bg-accent-100">
                <span className="text-accent-600 font-bold">💡</span>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-primary-900">ESG Premium</h3>
              <p className="text-sm text-gray-600 mt-1">Green bonds trade approximately 240 bps tighter than conventional bonds, reflecting strong ESG demand.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage

