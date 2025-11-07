import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiPlus, FiTrash2, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../services/api';
import Modal from '../components/common/Modal';
import ExpenseEstimator from '../components/events/ExpenseEstimator';

export default function EventFinancials() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [financials, setFinancials] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [activeTab, setActiveTab] = useState('actual');
  const [expenseForm, setExpenseForm] = useState({ category: '', description: '', amount: 0 });
  const [ticketForm, setTicketForm] = useState({ totalDispersed: 0, totalSold: 0, pricePerTicket: 0 });

  useEffect(() => {
    fetchEventDetails();
    fetchFinancials();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.event);
      setTicketForm({
        totalDispersed: res.event.tickets?.totalDispersed || 0,
        totalSold: res.event.tickets?.totalSold || 0,
        pricePerTicket: res.event.tickets?.pricePerTicket || 0
      });
    } catch (error) {
      toast.error('Error loading event');
    }
  };

  const fetchFinancials = async () => {
    try {
      const res = await api.get(`/events/${eventId}/financials`);
      setFinancials(res);
    } catch (error) {
      toast.error('Error loading financials');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/events/${eventId}/expenses`, expenseForm);
      toast.success('Expense added');
      setShowExpenseModal(false);
      setExpenseForm({ category: '', description: '', amount: 0 });
      fetchFinancials();
    } catch (error) {
      toast.error('Error adding expense');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      await api.delete(`/events/${eventId}/expenses/${expenseId}`);
      toast.success('Expense deleted');
      fetchFinancials();
    } catch (error) {
      toast.error('Error deleting expense');
    }
  };

  const handleUpdateTickets = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/events/${eventId}/tickets`, ticketForm);
      toast.success('Tickets updated');
      setShowTicketModal(false);
      fetchFinancials();
      fetchEventDetails();
    } catch (error) {
      toast.error('Error updating tickets');
    }
  };

  if (!financials || !event) return <div className="flex justify-center p-8">Loading...</div>;

  const expensesByCategory = financials.expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto p-6">
      <button onClick={() => navigate('/events')} className="btn-secondary mb-6 flex items-center gap-2">
        <FiArrowLeft /> Back to Events
      </button>

      <h1 className="text-3xl font-bold mb-6">{event.title} - Financials</h1>

      <div className="mb-6">
        <div className="flex gap-4 border-b dark:border-gray-700">
          <button
            onClick={() => setActiveTab('actual')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'actual'
                ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Actual Financials
          </button>
          <button
            onClick={() => setActiveTab('estimated')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'estimated'
                ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Cost Estimator
          </button>
        </div>
      </div>

      {activeTab === 'actual' && (
        <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-2">
            <FiTrendingUp className="text-green-600 dark:text-green-400" size={24} />
            <h3 className="font-semibold">Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            ${financials.revenue.toLocaleString()}
          </p>
        </div>

        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex items-center gap-3 mb-2">
            <FiTrendingDown className="text-red-600 dark:text-red-400" size={24} />
            <h3 className="font-semibold">Expenses</h3>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            ${financials.totalExpenses.toLocaleString()}
          </p>
        </div>

        <div className={`card ${financials.netProfit >= 0 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'}`}>
          <div className="flex items-center gap-3 mb-2">
            <FiDollarSign className={financials.netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'} size={24} />
            <h3 className="font-semibold">Net Profit</h3>
          </div>
          <p className={`text-3xl font-bold ${financials.netProfit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}`}>
            ${financials.netProfit.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Ticket Sales</h2>
            <button onClick={() => setShowTicketModal(true)} className="btn-primary text-sm">
              Update
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Dispersed:</span>
              <strong>{financials.tickets.totalDispersed}</strong>
            </div>
            <div className="flex justify-between">
              <span>Total Sold:</span>
              <strong>{financials.tickets.totalSold}</strong>
            </div>
            <div className="flex justify-between">
              <span>Remaining:</span>
              <strong>{financials.tickets.totalDispersed - financials.tickets.totalSold}</strong>
            </div>
            <div className="flex justify-between">
              <span>Price per Ticket:</span>
              <strong>${financials.tickets.pricePerTicket}</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold mb-4">Expenses by Category</h2>
          <div className="space-y-2">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="capitalize">{category}</span>
                <strong>${amount.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Expense Details</h2>
          <button onClick={() => setShowExpenseModal(true)} className="btn-primary flex items-center gap-2">
            <FiPlus /> Add Expense
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="text-left py-3">Category</th>
                <th className="text-left py-3">Description</th>
                <th className="text-right py-3">Amount</th>
                <th className="text-right py-3">Date</th>
                <th className="text-right py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {financials.expenses.map((expense) => (
                <tr key={expense._id} className="border-b dark:border-gray-700">
                  <td className="py-3 capitalize">{expense.category}</td>
                  <td className="py-3">{expense.description}</td>
                  <td className="py-3 text-right">${expense.amount.toLocaleString()}</td>
                  <td className="py-3 text-right">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => handleDeleteExpense(expense._id)} className="text-red-600 hover:text-red-800">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showExpenseModal} onClose={() => setShowExpenseModal(false)} title="Add Expense">
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={expenseForm.category}
                onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select category</option>
                <option value="food">Food</option>
                <option value="tents">Tents</option>
                <option value="equipment">Equipment</option>
                <option value="staff">Staff</option>
                <option value="marketing">Marketing</option>
                <option value="venue">Venue</option>
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
                value={expenseForm.amount}
                onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) })}
                className="input-field"
                min="0"
                step="0.01"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full">Add Expense</button>
          </form>
      </Modal>

      <Modal isOpen={showTicketModal} onClose={() => setShowTicketModal(false)} title="Update Ticket Information">
          <form onSubmit={handleUpdateTickets} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Total Tickets Dispersed</label>
              <input
                type="number"
                value={ticketForm.totalDispersed}
                onChange={(e) => setTicketForm({ ...ticketForm, totalDispersed: parseInt(e.target.value) })}
                className="input-field"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Total Tickets Sold</label>
              <input
                type="number"
                value={ticketForm.totalSold}
                onChange={(e) => setTicketForm({ ...ticketForm, totalSold: parseInt(e.target.value) })}
                className="input-field"
                min="0"
                max={ticketForm.totalDispersed}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Price per Ticket ($)</label>
              <input
                type="number"
                value={ticketForm.pricePerTicket}
                onChange={(e) => setTicketForm({ ...ticketForm, pricePerTicket: parseFloat(e.target.value) })}
                className="input-field"
                min="0"
                step="0.01"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full">Update Tickets</button>
          </form>
      </Modal>
        </>
      )}

      {activeTab === 'estimated' && (
        <ExpenseEstimator eventId={eventId} onUpdate={fetchFinancials} />
      )}
    </div>
  );
}
