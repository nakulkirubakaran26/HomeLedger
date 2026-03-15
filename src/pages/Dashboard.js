import React from 'react';
import { useData } from '../contexts/DataContext';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import BudgetCard from '../components/BudgetCard';
import AddBillForm from '../components/AddBillForm';
import ExpenseList from '../components/ExpenseList';
import * as XLSX from 'xlsx';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';


ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const Dashboard = () => {
  const { bills, getTargetWeekYear, setWeekOffset, weekOffset } = useData();
  const { week, year } = getTargetWeekYear();

  const exportToExcel = () => {
    if (bills.length === 0) {
      alert("No data to export for this week");
      return;
    }

    const data = bills.map((bill, index) => ({
      "S.No": index + 1,
      Item: bill.item,
      Quantity: bill.quantity,
      "Amount (₹)": bill.amount,
      Category: bill.category,
      "Bill Date": bill.billDate
    }));

    const totalSpent = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    
    data.push({
      "S.No": "",
      Item: "TOTAL",
      Quantity: "",
      "Amount (₹)": totalSpent
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Week-${week}`);
    XLSX.writeFile(workbook, `HomeLedger_Week-${week}_${year}.xlsx`);
  };

  const getWeekRange = () => {
    const base = new Date();
    base.setDate(base.getDate() + weekOffset * 7);
    const start = new Date(base);
    start.setDate(base.getDate() - base.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return `${start.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-text-secondary mt-1">Here's what's happening with your money.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface border border-border rounded-lg p-1">
            <button 
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-2 hover:bg-border rounded-md transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 text-center min-w-[140px]">
              <div className="text-sm font-bold">Week {week}</div>
              <div className="text-xs text-text-secondary">{getWeekRange()}</div>
            </div>
             <button 
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="p-2 hover:bg-border rounded-md transition-colors"
              disabled={weekOffset >= 0}
            >
              <ChevronRight className={`w-5 h-5 ${weekOffset >= 0 ? 'opacity-50' : ''}`} />
            </button>
          </div>

          <button onClick={exportToExcel} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <BudgetCard />
          <ExpenseList />
        </div>
        <div className="space-y-8">
          <AddBillForm />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
