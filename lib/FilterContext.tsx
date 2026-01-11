'use client'

import React, { createContext, useContext, useState } from 'react'

export interface FilterState {
  issuers: string[]
  issueTypes: string[]
  spreadRange: [number, number]
  couponRange: [number, number]
  tenorRange: [number, number]
  dateRange: [Date | null, Date | null]
}

interface FilterContextType {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  resetFilters: () => void
  updateFilter: (key: keyof FilterState, value: any) => void
}

const defaultFilters: FilterState = {
  issuers: [],
  issueTypes: [],
  spreadRange: [0, 1000],
  couponRange: [0, 15],
  tenorRange: [0, 10],
  dateRange: [null, null],
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export const FilterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(defaultFilters)

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <FilterContext.Provider value={{ filters, setFilters, resetFilters, updateFilter }}>
      {children}
    </FilterContext.Provider>
  )
}

export const useFilters = () => {
  const context = useContext(FilterContext)
  if (context === undefined) {
    throw new Error('useFilters must be used within FilterProvider')
  }
  return context
}
