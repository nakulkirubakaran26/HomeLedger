import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { format } from 'date-fns';
import { Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react';

const ExpenseList = () => {
    const { bills, deleteBill, updateBill, formatCurrency } = useData();
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({});
    
    // Simple state for sorting
    const [sortConfig, setSortConfig] = useState({ key: 'billDate', direction: 'desc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
        setSortConfig({ key, direction });
    };

    const handleEditStart = (bill) => {
        setEditingId(bill.id);
        setEditData({ ...bill });
    };

    const handleEditSave = async (id) => {
        await updateBill(id, {
            ...editData,
            amount: Number(editData.amount),
            quantity: Number(editData.quantity)
        });
        setEditingId(null);
    }

    const sortedBills = [...bills].sort((a, b) => {
        if (sortConfig.key === 'amount') {
            return sortConfig.direction === 'asc' ? a.amount - b.amount : b.amount - a.amount;
        }
        if (sortConfig.key === 'billDate') {
           return sortConfig.direction === 'asc' ? new Date(a.billDate) - new Date(b.billDate) : new Date(b.billDate) - new Date(a.billDate);
        }
        return 0;
    });

    if (bills.length === 0) {
        return (
            <div className="card text-center py-12">
                <p className="text-text-secondary">No expenses found for this week. Start adding some!</p>
            </div>
        )
    }

    return (
        <div className="card overflow-hidden !px-0 !py-4">
            <div className="px-6 mb-4 flex justify-between items-center">
                <h3 className="text-xl font-bold">Recent Expenses</h3>
                <span className="text-sm text-text-secondary">{bills.length} transactions</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-y border-border bg-surface/50 text-text-secondary text-sm">
                            <th className="py-3 px-6 font-medium cursor-pointer" onClick={() => handleSort('billDate')}>
                                <div className="flex items-center gap-1">
                                    Date {sortConfig.key === 'billDate' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}
                                </div>
                            </th>
                            <th className="py-3 px-6 font-medium">Item Details</th>
                            <th className="py-3 px-6 font-medium">Category</th>
                            <th className="py-3 px-6 font-medium cursor-pointer" onClick={() => handleSort('amount')}>
                                <div className="flex items-center gap-1">
                                    Amount {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>)}
                                </div>
                            </th>
                            <th className="py-3 px-6 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {sortedBills.map((bill) => (
                            <tr key={bill.id} className="hover:bg-background/50 transition-colors group">
                                {editingId === bill.id ? (
                                     <td colSpan="5" className="p-4 bg-background/50">
                                         <div className="grid grid-cols-5 gap-4">
                                            <input type="date" className="input" value={editData.billDate} onChange={e => setEditData({...editData, billDate: e.target.value})} />
                                            <div className="col-span-2 space-y-2">
                                                <input type="text" className="input" placeholder="Item" value={editData.item} onChange={e => setEditData({...editData, item: e.target.value})} />
                                                <input type="number" className="input" placeholder="Qty" value={editData.quantity} onChange={e => setEditData({...editData, quantity: e.target.value})} />
                                            </div>
                                            <div className="space-y-2">
                                                <input 
                                                    type="text" 
                                                    className="input" 
                                                    placeholder="Category" 
                                                    value={editData.category} 
                                                    onChange={e => setEditData({...editData, category: e.target.value})} 
                                                />
                                                <input type="number" className="input" placeholder="Amount" value={editData.amount} onChange={e => setEditData({...editData, amount: e.target.value})} />
                                            </div>
                                            <div className="flex flex-col gap-2 justify-center">
                                                <button onClick={() => handleEditSave(bill.id)} className="btn-primary text-sm py-1">Save</button>
                                                <button onClick={() => setEditingId(null)} className="btn-secondary text-sm py-1">Cancel</button>
                                            </div>
                                         </div>
                                     </td>
                                ) : (
                                    <>
                                        <td className="py-4 px-6 text-sm text-text-secondary">
                                            {format(new Date(bill.billDate), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="font-medium text-text-primary">{bill.item}</p>
                                            <p className="text-text-secondary text-xs">Qty: {bill.quantity}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                                ['Food', 'Transport', 'Shopping', 'Bills', 'Other'].includes(bill.category)
                                                ? "bg-primary/10 text-primary border-primary/20"
                                                : "bg-surface text-text-secondary border-border"
                                            }`}>
                                                {bill.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 font-medium">
                                            {formatCurrency(bill.amount || 0)}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => handleEditStart(bill)}
                                                    className="p-2 text-text-secondary hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if(window.confirm('Delete this expense?')) deleteBill(bill.id)
                                                    }}
                                                    className="p-2 text-text-secondary hover:text-danger transition-colors hover:bg-danger/10 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
};

export default ExpenseList;
