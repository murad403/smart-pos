import MainWrapper from '@/components/wrapper/MainWrapper'
import React from 'react'

const layout = async ({ children, params }: { children: React.ReactNode, params?: Promise<any> }) => {
  if (params) await params;
  return (
    <MainWrapper>
      {children}
    </MainWrapper>
  )
}

export default layout
