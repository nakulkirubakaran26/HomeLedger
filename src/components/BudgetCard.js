import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Edit2, Target } from 'lucide-react';

const BudgetCard = () => {
    const { savedBudget, saveBudget, bills, formatCurrency } = useData();
    const [isEditing, setIsEditing] = useState(false);
    const [budgetInput, setBudgetInput] = useState('');

    const totalSpent = bills.reduce((sum, bill) => sum + (bill.amount || 0), 0);
    const remaining = savedBudget !== null ? savedBudget - totalSpent : null;
    
    const usagePercentage = savedBudget && savedBudget > 0 
        ? Math.min((totalSpent / savedBudget) * 100, 100) 
        : 0;

    let progressColor = 'bg-success';
    if (usagePercentage >= 60 && usagePercentage < 90) progressColor = 'bg-warning';
    if (usagePercentage >= 90) progressColor = 'bg-danger';

    const handleSave = () => {
        if (!budgetInput) return;
        saveBudget(budgetInput);
        setIsEditing(false);
    };

    return (
        <div className="card relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Target className="w-32 h-32" />
            </div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                   <h2 className="text-xl font-bold">Weekly Overview</h2>
                   <p className="text-text-secondary text-sm">Track your progress</p>
                </div>
                {savedBudget !== null && !isEditing && (
                    <button 
                        onClick={() => {
                            setBudgetInput(savedBudget);
                            setIsEditing(true);
                        }}
                        className="text-text-secondary hover:text-primary transition-colors p-2"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {savedBudget === null || isEditing ? (
                <div className="space-y-4 relative z-10">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Set Weekly Budget Target</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"></span>
                                <input 
                                    type="number"
                                    className="input pl-8"
                                    placeholder="0.00"
                                    value={budgetInput}
                                    onChange={(e) => setBudgetInput(e.target.value)}
                                />
                            </div>
                            <button onClick={handleSave} className="btn-primary whitespace-nowrap">
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-6 relative z-10">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-sm text-text-secondary mb-1">Spent / Budget</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">{formatCurrency(totalSpent)}</span>
                                <span className="text-lg text-text-secondary">/ {formatCurrency(savedBudget)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className={remaining < 0 ? 'text-danger' : 'text-success'}>
                                {remaining < 0 ? 'Over spending' : 'Remaining'}
                            </span>
                            <span className="text-text-primary">
                                {usagePercentage.toFixed(1)}%
                            </span>
                        </div>
                        <div className="h-3 w-full bg-background rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${progressColor} transition-all duration-1000 ease-out`}
                                style={{ width: `${usagePercentage}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BudgetCard;
