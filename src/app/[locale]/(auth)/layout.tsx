import React from 'react'

const layout = async ({children, params}: {children: React.ReactNode, params?: Promise<any>}) => {
  if (params) await params;
  return (
    <div>
      {children}
    </div>
  )
}

export default layout
