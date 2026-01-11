'use client'

import React, { useEffect, useState } from 'react'

interface HeatmapChartProps {
  title: string
  dataType: 'seasonality' | 'issuer-spread'
}

const HeatmapChart: React.FC<HeatmapChartProps> = ({ title, dataType }) => {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://greekbanksdebt-api.onrender.com'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(`${apiUrl}/api/bonds?limit=100`)
        const bondsData = await response.json()
        const bonds = bondsData.items || bondsData.bonds || []

        if (dataType === 'seasonality') {
          // Calculate deals per issuer per quarter
          const quarterMap: { [key: string]: { [key: number]: number } } = {}

          bonds.forEach((bond: any) => {
            if (bond.pricing_date) {
              const date = new Date(bond.pricing_date)
              const quarter = Math.floor(date.getMonth() / 3) + 1
              const issuer = bond.issuer?.name || bond.issuer_name || 'Unknown'

              if (!quarterMap[issuer]) {
                quarterMap[issuer] = { 1: 0, 2: 0, 3: 0, 4: 0 }
              }
              quarterMap[issuer][quarter]++
            }
          })

          const heatmapData = Object.entries(quarterMap).map(([issuer, quarters]) => ({
            issuer,
            q1: quarters[1] || 0,
            q2: quarters[2] || 0,
            q3: quarters[3] || 0,
            q4: quarters[4] || 0,
          }))

          setData(heatmapData)
        }
      } catch (err) {
        console.error('Error fetching heatmap data:', err)
        setError('Failed to load heatmap data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dataType, apiUrl])

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">Loading heatmap...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="h-80 flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  const getColor = (value: number, max: number) => {
    const intensity = value / max
    if (intensity === 0) return 'bg-gray-100'
    if (intensity < 0.25) return 'bg-blue-100'
    if (intensity < 0.5) return 'bg-blue-300'
    if (intensity < 0.75) return 'bg-blue-500'
    return 'bg-blue-700'
  }

  const maxValue = Math.max(
    ...data.flatMap((row: any) => [row.q1, row.q2, row.q3, row.q4])
  )

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-4 font-semibold text-gray-700">Issuer</th>
              <th className="text-center py-2 px-4 font-semibold text-gray-700">Q1</th>
              <th className="text-center py-2 px-4 font-semibold text-gray-700">Q2</th>
              <th className="text-center py-2 px-4 font-semibold text-gray-700">Q3</th>
              <th className="text-center py-2 px-4 font-semibold text-gray-700">Q4</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, idx: number) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 font-medium text-gray-900">{row.issuer}</td>
                <td className={`text-center py-2 px-4 ${getColor(row.q1, maxValue)} font-semibold text-white`}>
                  {row.q1}
                </td>
                <td className={`text-center py-2 px-4 ${getColor(row.q2, maxValue)} font-semibold text-white`}>
                  {row.q2}
                </td>
                <td className={`text-center py-2 px-4 ${getColor(row.q3, maxValue)} font-semibold text-white`}>
                  {row.q3}
                </td>
                <td className={`text-center py-2 px-4 ${getColor(row.q4, maxValue)} font-semibold text-white`}>
                  {row.q4}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-gray-600 mt-4">
        Darker blue indicates higher deal count. Shows seasonal patterns in issuance activity.
      </p>
    </div>
  )
}

export default HeatmapChart
