import React from 'react'
import SalesOverTime from './SalesOverTime'
import DashboardStats from './DashboardStats'
import Alerts from './Alerts'
import TopSellingItems from './TopSellingItems'
import OrdersPerHour from './OrdersPerHour'

const page = () => {
  return (
    <div>
      <DashboardStats />
      <Alerts />
      <TopSellingItems />
      <OrdersPerHour />
      <SalesOverTime />
    </div>
  )
}

export default page
