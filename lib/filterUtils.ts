import { FilterState } from './FilterContext'

export interface Bond {
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

export const applyFilters = (bonds: Bond[], filters: FilterState): Bond[] => {
  return bonds.filter((bond) => {
    // Issuer filter
    if (filters.issuers.length > 0) {
      const issuerName = bond.issuer?.name || bond.issuer_name || 'Unknown'
      if (!filters.issuers.includes(issuerName)) {
        return false
      }
    }

    // Issue type filter
    if (filters.issueTypes.length > 0) {
      if (!filters.issueTypes.includes(bond.issue_type)) {
        return false
      }
    }

    // Spread range filter
    if (bond.spread < filters.spreadRange[0] || bond.spread > filters.spreadRange[1]) {
      return false
    }

    // Coupon range filter
    if (bond.coupon < filters.couponRange[0] || bond.coupon > filters.couponRange[1]) {
      return false
    }

    // Tenor range filter
    if (bond.tenor < filters.tenorRange[0] || bond.tenor > filters.tenorRange[1]) {
      return false
    }

    // Date range filter
    if (filters.dateRange[0] || filters.dateRange[1]) {
      const pricingDate = new Date(bond.pricing_date)
      if (filters.dateRange[0] && pricingDate < filters.dateRange[0]) {
        return false
      }
      if (filters.dateRange[1] && pricingDate > filters.dateRange[1]) {
        return false
      }
    }

    return true
  })
}
