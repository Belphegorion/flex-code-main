import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiDollarSign, FiUsers, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ExpenseEstimator({ eventId, onUpdate }) {
  const [estimatedExpenses, setEstimatedExpenses] = useState([]);
  const [workerCosts, setWorkerCosts] = useState({ totalWorkers: 0, costPerWorker: 0, totalWorkerCost: 0 });
  const [ticketInfo, setTicketInfo] = useState({ totalDispersed: 0, pricePerTicket: 0 });
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ category: '', description: '', estimatedAmount: 0 });

  useEffect(() => {
    fetchEventData();
  }, [eventId]);

  const fetchEventData = async () => {
    try {
      const res = await axios.get(`/api/events/${eventId}`);
      const event = res.data.event;
      setEstimatedExpenses(event.estimatedExpenses || []);
      setWorkerCosts(event.workerCosts || { totalWorkers: 0, costPerWorker: 0, totalWorkerCost: 0 });
      setTicketInfo({
        totalDispersed: event.tickets?.totalDispersed || 0,
        pricePerTicket: event.tickets?.pricePerTicket || 0
      });
    } catch (error) {
      console.error('Error fetching event data:', error);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`/api/events/${eventId}/estimated-expenses`, expenseForm);
      toast.success('Estimated expense added');
      setShowExpenseForm(false);
      setExpenseForm({ category: '', description: '', estimatedAmount: 0 });
      fetchEventData();
      onUpdate?.();
    } catch (error) {
      toast.error('Error adding expense');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await axios.delete(`/api/events/${eventId}/estimated-expenses/${expenseId}`);
      toast.success('Expense deleted');
      fetchEventData();
      onUpdate?.();
    } catch (error) {
      toast.error('Error deleting expense');
    }
  };

  const handleUpdateWorkerCosts = async () => {
    try {
      await axios.put(`/api/events/${eventId}/worker-costs`, {
        totalWorkers: workerCosts.totalWorkers,
        costPerWorker: workerCosts.costPerWorker
      });
      toast.success('Worker costs updated');
      fetchEventData();
      onUpdate?.();
    } catch (error) {
      toast.error('Error updating worker costs');
    }
  };

  const totalEstimatedExpenses = estimatedExpenses.reduce((sum, e) => sum + (e.estimatedAmount || 0), 0);
  const totalCost = totalEstimatedExpenses + (workerCosts.totalWorkerCost || 0);
  const estimatedRevenue = (ticketInfo.totalDispersed || 0) * (ticketInfo.pricePerTicket || 0);
  const estimatedProfit = estimatedRevenue - totalCost;

  const expensesByCategory = estimatedExpenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.estimatedAmount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <FiDollarSign className="text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-sm">Est. Revenue</h4>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${estimatedRevenue.toLocaleString()}
          </p>
        </div>

        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 mb-2">
            <FiDollarSign className="text-red-600 dark:text-red-400" />
            <h4 className="font-semibold text-sm">Total Cost</h4>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ${totalCost.toLocaleString()}
          </p>
        </div>

        <div className="card bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-2 mb-2">
            <FiUsers className="text-orange-600 dark:text-orange-400" />
            <h4 className="font-semibold text-sm">Worker Cost</h4>
          </div>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            ${workerCosts.totalWorkerCost.toLocaleString()}
          </p>
        </div>

        <div className={`card ${estimatedProfit >= 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-700'}`}>
          <div className="flex items-center gap-2 mb-2">
            <FiTrendingUp className={estimatedProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'} />
            <h4 className="font-semibold text-sm">Est. Profit</h4>
          </div>
          <p className={`text-2xl font-bold ${estimatedProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
            ${estimatedProfit.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-4">Worker Cost Calculator</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Total Workers</label>
            <input
              type="number"
              value={workerCosts.totalWorkers}
              onChange={(e) => setWorkerCosts({ ...workerCosts, totalWorkers: parseInt(e.target.value) || 0 })}
              className="input-field"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Cost per Worker ($)</label>
            <input
              type="number"
              value={workerCosts.costPerWorker}
              onChange={(e) => setWorkerCosts({ ...workerCosts, costPerWorker: parseFloat(e.target.value) || 0 })}
              className="input-field"
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex items-end">
            <button onClick={handleUpdateWorkerCosts} className="btn-primary w-full">
              Update Worker Costs
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Estimated Expenses</h3>
          <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="btn-primary flex items-center gap-2">
            <FiPlus /> Add Expense
          </button>
        </div>

        {showExpenseForm && (
          <form onSubmit={handleAddExpense} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select category</option>
                  <option value="location">Location/Venue</option>
                  <option value="food">Food & Catering</option>
                  <option value="tents">Tents & Structures</option>
                  <option value="equipment">Equipment</option>
                  <option value="marketing">Marketing</option>
                  <option value="miscellaneous">Miscellaneous</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount ($)</label>
                <input
                  type="number"
                  value={expenseForm.estimatedAmount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, estimatedAmount: parseFloat(e.target.value) || 0 })}
                  className="input-field"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Add Expense</button>
              <button type="button" onClick={() => setShowExpenseForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="font-semibold mb-3">By Category</h4>
            <div className="space-y-2">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="capitalize text-sm">{category}</span>
                  <strong className="text-sm">${amount.toLocaleString()}</strong>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Cost Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">Operational Expenses</span>
                <strong className="text-sm">${totalEstimatedExpenses.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm">Worker Costs ({workerCosts.totalWorkers} × ${workerCosts.costPerWorker})</span>
                <strong className="text-sm">${workerCosts.totalWorkerCost.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between items-center p-2 bg-primary-50 dark:bg-primary-900/20 rounded font-bold">
                <span className="text-sm">Total Estimated Cost</span>
                <strong className="text-sm">${totalCost.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3 text-sm">Category</th>
                <th className="text-left py-3 text-sm">Description</th>
                <th className="text-right py-3 text-sm">Amount</th>
                <th className="text-right py-3 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {estimatedExpenses.map((expense) => (
                <tr key={expense._id} className="border-b dark:border-gray-700">
                  <td className="py-3 capitalize text-sm">{expense.category}</td>
                  <td className="py-3 text-sm">{expense.description}</td>
                  <td className="py-3 text-right text-sm">${expense.estimatedAmount.toLocaleString()}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDeleteExpense(expense._id)} className="text-red-600 hover:text-red-800">
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
