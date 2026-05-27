import { useMemo, useState } from 'react';
import { useRequest } from '../context/RequestContext';

const useDashboard = () => {
    const { requests, updateRequestStatus } = useRequest();

    // Statistics calculations
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'active').length;
    const processingRequests = requests.filter(r => r.status === 'processing').length;
    const completedRequests = requests.filter(r => r.status === 'success' || r.status === 'completed').length;
    const delayRequests = requests.filter(r => r.status === 'delay').length;

    // Status Data for Pie Chart
    const statusData = [
        { name: 'Pending', value: pendingRequests, color: '#f59e0b' },
        { name: 'Processing', value: processingRequests, color: '#6366f1' },
        { name: 'Success', value: completedRequests, color: '#10b981' },
        { name: 'Delay', value: delayRequests, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const [selectedMonth, setSelectedMonth] = useState('All');

    // Chart Data Generation (Last 12 Months mock data logic)
    const last12MonthsData = useMemo(() => {
        const months = [];
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });
            months.push({
                name: monthName,
                requests: Math.floor(Math.random() * 15) + 5
            });
        }
        return months;
    }, []);

    const filteredChartData = useMemo(() => {
        if (selectedMonth === 'All') return last12MonthsData;

        const selectedMonthData = last12MonthsData.find(d => d.name === selectedMonth);
        const monthlyTotal = selectedMonthData ? selectedMonthData.requests : 0;

        const days = [];
        const daysInMonth = 30;

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                name: `${i} ${selectedMonth}`,
                requests: 0
            });
        }

        for (let i = 0; i < monthlyTotal; i++) {
            const randomDayIndex = Math.floor(Math.random() * daysInMonth);
            days[randomDayIndex].requests += 1;
        }

        return days;
    }, [selectedMonth, last12MonthsData]);

    const monthOptions = last12MonthsData.map(d => d.name);

    // Sorted Requests for Table
    const sortedRequests = useMemo(() => {
        return [...requests].sort((a, b) => {
            const aStatus = a.status === 'active' ? 'pending' : a.status;
            const bStatus = b.status === 'active' ? 'pending' : b.status;
            const aCompleted = aStatus === 'success' || aStatus === 'completed';
            const bCompleted = bStatus === 'success' || bStatus === 'completed';
            if (aCompleted && !bCompleted) return 1;
            if (!aCompleted && bCompleted) return -1;
            
            // Sort by the latest event time (creation timestamp or last reminder) descending (newest first)
            const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
            const remindA = a.lastRemindedAt ? new Date(a.lastRemindedAt).getTime() : 0;
            const activeTimeA = Math.max(timeA, remindA);

            const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
            const remindB = b.lastRemindedAt ? new Date(b.lastRemindedAt).getTime() : 0;
            const activeTimeB = Math.max(timeB, remindB);

            return activeTimeB - activeTimeA;
        });
    }, [requests]);

    return {
        totalRequests,
        pendingRequests,
        processingRequests,
        completedRequests,
        statusData,
        selectedMonth,
        setSelectedMonth,
        filteredChartData,
        monthOptions,
        sortedRequests,
        updateRequestStatus
    };
};

export default useDashboard;
