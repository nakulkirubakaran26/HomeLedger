import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { PlusCircle } from 'lucide-react';

const AddBillForm = () => {
  const { addBill } = useData();
  const [formData, setFormData] = useState({
    item: '',
    amount: '',
    quantity: '1',
    billDate: new Date().toISOString().split('T')[0],
    category: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item || !formData.amount || !formData.category) {
      alert("Please fill all required fields");
      return;
    }
    
    await addBill({
      ...formData,
      amount: Number(formData.amount),
      quantity: Number(formData.quantity)
    });
    
    setFormData({
      item: '',
      amount: '',
      quantity: '1',
      billDate: new Date().toISOString().split('T')[0],
      category: ''
    });
  };

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-6">Add New Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Item Name</label>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. Groceries"
              value={formData.item}
              onChange={(e) => setFormData({...formData, item: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
            <div className="flex gap-2">
              <select 
                className="input bg-surface flex-1"
                value={formData.category === '' ? '' : ['Food', 'Transport', 'Shopping', 'Bills', 'Other'].includes(formData.category) ? formData.category : 'Custom'}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'Custom') {
                    setFormData({...formData, category: 'New Category'}); // Temporary placeholder to trigger input
                  } else {
                    setFormData({...formData, category: val});
                  }
                }}
              >
                <option value="">Select Category</option>
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
                <option value="Other">Other</option>
                <option value="Custom">Custom...</option>
              </select>
              
              {/* Show custom input if category is not one of the predefined options and not empty */}
              {formData.category !== '' && !['Food', 'Transport', 'Shopping', 'Bills', 'Other'].includes(formData.category) && (
                 <input 
                   type="text"
                   className="input flex-1 animate-in fade-in slide-in-from-right-2"
                   placeholder="Enter custom category"
                   value={formData.category === 'New Category' ? '' : formData.category}
                   onChange={(e) => setFormData({...formData, category: e.target.value})}
                   autoFocus
                 />
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-text-secondary mb-1">Quantity</label>
               <input 
                 type="number" 
                 min="1"
                 className="input" 
                 value={formData.quantity}
                 onChange={(e) => setFormData({...formData, quantity: e.target.value})}
               />
             </div>
             <div>
               <label className="block text-sm font-medium text-text-secondary mb-1">Amount</label>
               <input 
                 type="number" 
                 step="0.01"
                 min="0"
                 className="input" 
                 placeholder="0.00"
                 value={formData.amount}
                 onChange={(e) => setFormData({...formData, amount: e.target.value})}
               />
             </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Date</label>
            <input 
              type="date" 
              className="input" 
              value={formData.billDate}
              onChange={(e) => setFormData({...formData, billDate: e.target.value})}
            />
          </div>
        </div>
        
        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-4 py-3">
          <PlusCircle className="w-5 h-5" />
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default AddBillForm;
