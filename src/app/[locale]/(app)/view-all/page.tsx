"use client"
import SalesOverTime from '../dashboard/SalesOverTime'
import OrdersPerHour from '../dashboard/OrdersPerHour'
import TopSellingItems from '../dashboard/TopSellingItems'
import { useGetAnalyticsQuery } from '@/redux/features/dashboard/dashboard.api'


const page = () => {
    const { data: analyticsRes, isLoading } = useGetAnalyticsQuery(undefined);
    const analyticsData = analyticsRes?.data;
    return (
        <div className='space-y-4'>
            <SalesOverTime sales={analyticsData?.salesOverTime} isLoading={isLoading} />
            <OrdersPerHour ordersPerHour={analyticsData?.ordersPerHour} isLoading={isLoading} />
            <TopSellingItems items={analyticsData?.topSellingItems} isLoading={isLoading} />
        </div>
    )
}

export default page