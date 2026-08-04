/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import MainWrapper from '@/components/wrapper/MainWrapper'
import SocketProvider from '@/providers/SocketProvider';

const layout = async ({ children, params }: { children: React.ReactNode, params?: Promise<any> }) => {
  if (params) await params;

  return (
    <SocketProvider>
      <MainWrapper>
        {children}
      </MainWrapper>
    </SocketProvider>
  )
}

export default layout
