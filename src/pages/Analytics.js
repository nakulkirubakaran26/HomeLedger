import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

const Analytics = () => {
    const { allBills, formatCurrency } = useData();

    // Calculate Category Distribution for Current Month
    const { categoryData, totalMonthlySpend } = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const monthlyBills = allBills.filter(bill => {
            const d = new Date(bill.billDate);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const totals = {};
        let totalSpend = 0;
        monthlyBills.forEach(bill => {
            const amt = Number(bill.amount);
            totals[bill.category] = (totals[bill.category] || 0) + amt;
            totalSpend += amt;
        });

        const labels = Object.keys(totals);
        const data = Object.values(totals);
        
        // Tailwind Colors matched to categories roughly for aesthetic (Base Palette)
        const baseColors = [
            '#6366f1', // Primary (Indigo)
            '#10b981', // Success (Emerald)
            '#f59e0b', // Warning (Amber)
            '#ef4444', // Danger (Red)
            '#8b5cf6', // Violet
            '#3b82f6', // Blue
            '#ec4899', // Pink
            '#14b8a6', // Teal
        ];

        // Ensure we always have enough colors for custom categories by wrapping around the base palette
        const colors = labels.map((_, index) => baseColors[index % baseColors.length]);

        return {
            totalMonthlySpend: totalSpend,
            categoryData: {
                labels,
                datasets: [
                    {
                        data,
                        backgroundColor: colors,
                        borderWidth: 0,
                        hoverOffset: 4
                    }
                ]
            }
        };
    }, [allBills]);

    // Calculate Daily Spend Trend for Current Month
    const trendData = useMemo(() => {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

        // Initialize array of days [1, 2, ..., daysInMonth]
        const dailyTotals = Array(daysInMonth).fill(0);

        allBills.forEach(bill => {
            const d = new Date(bill.billDate);
            if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                dailyTotals[d.getDate() - 1] += Number(bill.amount);
            }
        });

        const labels = Array.from({length: daysInMonth}, (_, i) => i + 1);

        return {
            labels,
            datasets: [
                {
                    label: 'Daily Spend (₹)',
                    data: dailyTotals,
                    borderColor: '#6366f1', // Primary color
                    backgroundColor: 'rgba(99, 102, 241, 0.1)', // Primary with opacity
                    fill: true,
                    tension: 0.4 // Smooth curves
                }
            ]
        };
    }, [allBills]);


    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#94a3b8', // text-secondary
                    padding: 20,
                    usePointStyle: true,
                }
            }
        },
        cutout: '70%'
    };

    const lineOptions = {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#334155' }, // border color
                ticks: { color: '#94a3b8' } // text-secondary
            },
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8' }
            }
        }
    };


    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Analytics
                </h1>
                <p className="text-text-secondary mt-1">Deep dive into your spending patterns.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Category Breakdown (Doughnut) */}
                <div className="card lg:col-span-1 flex flex-col">
                    <h2 className="text-xl font-bold mb-6">Monthly Breakdown</h2>
                    <div className="flex-1 flex flex-col items-center justify-center relative min-h-[300px]">
                        {categoryData.labels.length > 0 ? (
                            <>
                                <Doughnut data={categoryData} options={chartOptions} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                                    <span className="text-sm text-text-secondary">Total</span>
                                    <span className="text-2xl font-bold text-text-primary">{formatCurrency(totalMonthlySpend)}</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-text-secondarytext-center">No expenses recorded this month.</p>
                        )}
                    </div>
                </div>

                {/* Spending Trend (Line Chart) */}
                <div className="card lg:col-span-2">
                     <h2 className="text-xl font-bold mb-6">Daily Spending Trend (This Month)</h2>
                     <div className="w-full h-[300px] flex items-center justify-center">
                         {totalMonthlySpend > 0 ? (
                             <Line data={trendData} options={lineOptions} />
                         ) : (
                             <p className="text-text-secondary">No data available to show trends.</p>
                         )}
                     </div>
                </div>
            </div>

            {/* Additional Stats/Insights Section could go here */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="card bg-primary/5 border-primary/20">
                     <h3 className="text-sm font-medium text-text-secondary mb-2">Total Bills Tracked</h3>
                     <p className="text-3xl font-bold text-white">{allBills.length}</p>
                 </div>
                 <div className="card">
                     <h3 className="text-sm font-medium text-text-secondary mb-2">Highest Expense Category</h3>
                     <p className="text-3xl font-bold text-white capitalize">
                        {categoryData.labels.length > 0 ? 
                            categoryData.labels[
                                categoryData.datasets[0].data.indexOf(Math.max(...categoryData.datasets[0].data))
                            ] 
                            : 'N/A'
                        }
                     </p>
                 </div>
                 <div className="card">
                     <h3 className="text-sm font-medium text-text-secondary mb-2">Average Daily Spend</h3>
                     <p className="text-3xl font-bold text-white">
                         {formatCurrency(totalMonthlySpend > 0 ? (totalMonthlySpend / new Date().getDate()).toFixed(0) : 0)}
                     </p>
                     <p className="text-xs text-text-secondary mt-1">Based on days passed this month</p>
                 </div>
            </div>
        </div>
    );
};

export default Analytics;
