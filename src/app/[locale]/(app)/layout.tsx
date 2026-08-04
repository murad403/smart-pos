/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import MainWrapper from '@/components/wrapper/MainWrapper'
import SocketProvider from '@/providers/SocketProvider';
import SoundProvider from '@/providers/SoundProvider';

const layout = async ({ children, params }: { children: React.ReactNode, params?: Promise<any> }) => {
  if (params) await params;

  return (
    <SoundProvider>
      <SocketProvider>
        <MainWrapper>
          {children}
        </MainWrapper>
      </SocketProvider>
    </SoundProvider>
  )
}

export default layout
