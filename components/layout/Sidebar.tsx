'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Sidebar: React.FC = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/analytics', label: 'Analytics', icon: '📈' },
    { href: '/issuers', label: 'Issuers', icon: '🏦' },
    { href: '/bonds', label: 'Bonds', icon: '📋' },
    { href: '/tools', label: 'Tools', icon: '🛠️' },
    { href: '/olympus', label: 'Mount Olympus', icon: '⛰️' },
  ]

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-primary-900 text-white transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="p-4 border-b border-primary-800">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent-500 rounded-lg flex items-center justify-center font-bold">Ω</div>
              <span className="font-bold text-sm">GBD</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-primary-800 rounded transition-colors"
          >
            {isOpen ? '←' : '→'}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive(item.href)
                ? 'bg-accent-500 text-white'
                : 'text-gray-300 hover:bg-primary-800'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            {isOpen && <span className="text-sm font-medium">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-primary-800">
        {isOpen && (
          <div className="text-xs text-gray-400">
            <p className="font-semibold text-white mb-2">Greek Banks</p>
            <p>Debt Dashboard v1.0</p>
          </div>
        )}
      </div>
    </aside>
  )
}

export default Sidebar

