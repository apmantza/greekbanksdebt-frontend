declare module 'react-plotly.js' {
  import React from 'react'

  interface PlotProps {
    data: any[]
    layout?: any
    frames?: any[]
    config?: any
    style?: React.CSSProperties
    className?: string
    onInitialized?: (figure: any, graphDiv: any) => void
    onUpdate?: (figure: any, graphDiv: any) => void
    onPurge?: (graphDiv: any) => void
    onError?: (error: any) => void
    divId?: string
  }

  const Plot: React.FC<PlotProps>
  export default Plot
}
