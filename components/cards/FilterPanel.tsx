'use client'

import React, { useEffect, useState } from 'react'
import { useFilters } from '@/lib/FilterContext'

interface FilterPanelProps {
  onFiltersApply?: () => void
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFiltersApply }) => {
  const { filters, updateFilter, resetFilters } = useFilters()
  const [issuers, setIssuers] = useState<string[]>([])
  const [issueTypes, setIssueTypes] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://greekbanksdebt-api.onrender.com'

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/bonds?limit=100`)
        const bondsData = await response.json()
        const bonds = bondsData.items || bondsData.bonds || []

        // Extract unique issuers and issue types
        const uniqueIssuers = Array.from(
          new Set(bonds.map((b: any) => b.issuer?.name || b.issuer_name || 'Unknown'))
        ).sort()

        const uniqueTypes = Array.from(
          new Set(bonds.map((b: any) => b.issue_type || 'Unknown'))
        ).sort()

        setIssuers(uniqueIssuers as string[])
        setIssueTypes(uniqueTypes as string[])
      } catch (err) {
        console.error('Error fetching filter options:', err)
      }
    }

    fetchFilterOptions()
  }, [apiUrl])

  const handleIssuerToggle = (issuer: string) => {
    const newIssuers = filters.issuers.includes(issuer)
      ? filters.issuers.filter((i) => i !== issuer)
      : [...filters.issuers, issuer]
    updateFilter('issuers', newIssuers)
  }

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.issueTypes.includes(type)
      ? filters.issueTypes.filter((t) => t !== type)
      : [...filters.issueTypes, type]
    updateFilter('issueTypes', newTypes)
  }

  const handleSpreadChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newRange: [number, number] = [...filters.spreadRange] as [number, number]
    newRange[index] = parseFloat(e.target.value)
    updateFilter('spreadRange', newRange)
  }

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newRange: [number, number] = [...filters.couponRange] as [number, number]
    newRange[index] = parseFloat(e.target.value)
    updateFilter('couponRange', newRange)
  }

  const handleTenorChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newRange: [number, number] = [...filters.tenorRange] as [number, number]
    newRange[index] = parseFloat(e.target.value)
    updateFilter('tenorRange', newRange)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">🔍 Advanced Filters</h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-600 hover:text-gray-900 font-medium"
        >
          {isOpen ? '▼ Hide' : '▶ Show'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-6">
          {/* Issuers Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Issuers</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {issuers.map((issuer) => (
                <label key={issuer} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.issuers.includes(issuer)}
                    onChange={() => handleIssuerToggle(issuer)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{issuer}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Issue Type Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Issue Type</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {issueTypes.map((type) => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.issueTypes.includes(type)}
                    onChange={() => handleTypeToggle(type)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Spread Range Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Spread Range (bps): {filters.spreadRange[0]} - {filters.spreadRange[1]}
            </label>
            <div className="flex gap-4">
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.spreadRange[0]}
                onChange={(e) => handleSpreadChange(e, 0)}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.spreadRange[1]}
                onChange={(e) => handleSpreadChange(e, 1)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Coupon Range Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Coupon Range (%): {filters.couponRange[0].toFixed(2)} - {filters.couponRange[1].toFixed(2)}
            </label>
            <div className="flex gap-4">
              <input
                type="range"
                min="0"
                max="15"
                step="0.1"
                value={filters.couponRange[0]}
                onChange={(e) => handleCouponChange(e, 0)}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="15"
                step="0.1"
                value={filters.couponRange[1]}
                onChange={(e) => handleCouponChange(e, 1)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Tenor Range Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tenor Range (years): {filters.tenorRange[0].toFixed(1)} - {filters.tenorRange[1].toFixed(1)}
            </label>
            <div className="flex gap-4">
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.tenorRange[0]}
                onChange={(e) => handleTenorChange(e, 0)}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={filters.tenorRange[1]}
                onChange={(e) => handleTenorChange(e, 1)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <button
              onClick={() => {
                resetFilters()
                onFiltersApply?.()
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={onFiltersApply}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel
