'use client'

import React from 'react'

const ToolsPage: React.FC = () => {
  const tools = [
    {
      title: 'Bond Comparison',
      description: 'Compare multiple bonds side-by-side',
      icon: '⚖️',
      href: '#',
    },
    {
      title: 'Relative Value',
      description: 'Identify attractive opportunities',
      icon: '📊',
      href: '#',
    },
    {
      title: 'Spread Watch',
      description: 'Monitor spread movements',
      icon: '👁️',
      href: '#',
    },
    {
      title: 'Scenario Analysis',
      description: 'Analyze market scenarios',
      icon: '🎯',
      href: '#',
    },
    {
      title: 'Export Data',
      description: 'Download filtered data',
      icon: '📥',
      href: '#',
    },
    {
      title: 'Reports',
      description: 'Generate custom reports',
      icon: '📄',
      href: '#',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary-900">Tools</h1>
        <p className="text-gray-600 mt-1">Analysis and comparison tools</p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <a
            key={index}
            href={tool.href}
            className="card cursor-pointer hover:shadow-lg transition-shadow group"
          >
            <div className="card-body">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{tool.icon}</div>
              <h3 className="text-lg font-semibold text-primary-900">{tool.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{tool.description}</p>
              <div className="mt-4 text-accent-600 font-medium group-hover:translate-x-1 transition-transform">
                Launch →
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Coming Soon */}
      <div className="card bg-gradient-to-r from-accent-50 to-blue-50">
        <div className="card-body">
          <h2 className="text-lg font-semibold text-primary-900">Coming Soon</h2>
          <p className="text-gray-600 mt-2">We're working on additional tools and features to enhance your analysis experience.</p>
          <ul className="mt-4 space-y-2 text-sm text-gray-700">
            <li>✓ Real-time alerts and notifications</li>
            <li>✓ Portfolio analytics</li>
            <li>✓ Risk metrics dashboard</li>
            <li>✓ API access for developers</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ToolsPage

