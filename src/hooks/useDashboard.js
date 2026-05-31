import { useMemo, useState } from 'react';
import { useRequest } from '../context/RequestContext';

const useDashboard = () => {
    const { requests, updateRequestStatus } = useRequest();

    // Statistics calculations
    const totalRequests = requests.length;
    const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'active').length;
    const inProgressRequests = requests.filter(r => r.status === 'in progress').length;
    const completedRequests = requests.filter(r => r.status === 'success' || r.status === 'completed').length;

    const delayRequests = requests.filter(r => r.status === 'delay' || r.status === 'rejected').length;

    // Status Data for Pie Chart
    const statusData = [
        { name: 'Pending', value: pendingRequests, color: '#f59e0b' },
        { name: 'In Progress', value: inProgressRequests, color: '#3b82f6' },
        { name: 'Success', value: completedRequests, color: '#10b981' },
        { name: 'Rejected', value: delayRequests, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const [selectedMonth, setSelectedMonth] = useState('All');

    // Build real last-12-months chart data from actual request timestamps
    const last12MonthsData = useMemo(() => {
        const today = new Date();
        const months = [];
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            months.push({
                year: d.getFullYear(),
                month: d.getMonth(),       // 0-indexed
                name: d.toLocaleString('default', { month: 'short' }),
                requests: 0
            });
        }
        requests.forEach(req => {
            if (!req.timestamp) return;
            const ts = new Date(req.timestamp);
            const bucket = months.find(m => m.year === ts.getFullYear() && m.month === ts.getMonth());
            if (bucket) bucket.requests += 1;
        });
        return months.map(({ name, requests }) => ({ name, requests }));
    }, [requests]);

    // For a specific month selected: break down by day
    const filteredChartData = useMemo(() => {
        if (selectedMonth === 'All') return last12MonthsData;

        // Find which year+month this label belongs to (most recent match)
        const today = new Date();
        let targetYear = today.getFullYear();
        let targetMonth = -1;
        for (let i = 11; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            if (d.toLocaleString('default', { month: 'short' }) === selectedMonth) {
                targetYear = d.getFullYear();
                targetMonth = d.getMonth();
            }
        }

        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const days = Array.from({ length: daysInMonth }, (_, i) => ({
            name: `${i + 1} ${selectedMonth}`,
            requests: 0
        }));

        requests.forEach(req => {
            if (!req.timestamp) return;
            const ts = new Date(req.timestamp);
            if (ts.getFullYear() === targetYear && ts.getMonth() === targetMonth) {
                days[ts.getDate() - 1].requests += 1;
            }
        });

        return days;
    }, [selectedMonth, last12MonthsData, requests]);

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
        inProgressRequests,
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
