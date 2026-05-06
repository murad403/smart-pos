import MainWrapper from '@/components/wrapper/MainWrapper'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MainWrapper>
      {children}
    </MainWrapper>
  )
}

export default layout
