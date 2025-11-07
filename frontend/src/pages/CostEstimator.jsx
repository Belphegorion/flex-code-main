import { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiMapPin, FiPieChart, FiPlus, FiTrash2 } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import LocationPicker from '../components/events/LocationPicker';

export default function CostEstimator() {
  const [data, setData] = useState({
    ticketPrice: '',
    expectedTickets: '',
    venueCost: '',
    workerCount: '',
    workerCost: '',
    location: null,
    customExpenses: []
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setData(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: 'Current Location'
            }
          }));
        },
        (error) => console.log('Location access denied:', error)
      );
    }
  }, []);

  const addExpense = () => {
    setData(prev => ({
      ...prev,
      customExpenses: [...prev.customExpenses, { name: '', amount: '' }]
    }));
  };

  const updateExpense = (index, field, value) => {
    const updated = [...data.customExpenses];
    updated[index][field] = value;
    setData({ ...data, customExpenses: updated });
  };

  const removeExpense = (index) => {
    setData(prev => ({
      ...prev,
      customExpenses: prev.customExpenses.filter((_, i) => i !== index)
    }));
  };

  const revenue = (parseFloat(data.ticketPrice) || 0) * (parseFloat(data.expectedTickets) || 0);
  const workerTotal = (parseFloat(data.workerCount) || 0) * (parseFloat(data.workerCost) || 0);
  const customTotal = data.customExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const totalExpenses = (parseFloat(data.venueCost) || 0) + workerTotal + customTotal;
  const profit = revenue - totalExpenses;

  const expenseBreakdown = [
    { label: 'Venue', value: parseFloat(data.venueCost) || 0, color: 'bg-blue-500' },
    { label: 'Workers', value: workerTotal, color: 'bg-green-500' },
    { label: 'Custom', value: customTotal, color: 'bg-purple-500' }
  ];

  const total = expenseBreakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <FiDollarSign /> Event Cost Estimator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiMapPin /> Event Location
              </h2>
              <LocationPicker
                value={data.location}
                onChange={(location) => setData({...data, location})}
              />
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Revenue</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ticket Price ($)</label>
                  <input
                    type="number"
                    value={data.ticketPrice}
                    onChange={(e) => setData({...data, ticketPrice: e.target.value})}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Expected Tickets</label>
                  <input
                    type="number"
                    value={data.expectedTickets}
                    onChange={(e) => setData({...data, expectedTickets: e.target.value})}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Fixed Expenses</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Venue Cost ($)</label>
                  <input
                    type="number"
                    value={data.venueCost}
                    onChange={(e) => setData({...data, venueCost: e.target.value})}
                    placeholder="0"
                    className="input-field"
                  />
                </div>
                <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Workers Needed</label>
                    <input
                      type="number"
                      value={data.workerCount}
                      onChange={(e) => setData({...data, workerCount: e.target.value})}
                      placeholder="0"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Cost per Worker ($)</label>
                    <input
                      type="number"
                      value={data.workerCost}
                      onChange={(e) => setData({...data, workerCost: e.target.value})}
                      placeholder="0"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Custom Expenses</h2>
                <button onClick={addExpense} className="btn-primary flex items-center gap-2">
                  <FiPlus /> Add Expense
                </button>
              </div>
              {data.customExpenses.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No custom expenses added. Click "Add Expense" to add one.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.customExpenses.map((expense, idx) => (
                    <div key={idx} className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Expense name"
                        value={expense.name}
                        onChange={(e) => updateExpense(idx, 'name', e.target.value)}
                        className="input-field flex-1"
                      />
                      <input
                        type="number"
                        placeholder="Amount"
                        value={expense.amount}
                        onChange={(e) => updateExpense(idx, 'amount', e.target.value)}
                        className="input-field w-32"
                      />
                      <button
                        onClick={() => removeExpense(idx)}
                        className="btn-secondary text-red-600 dark:text-red-400"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="card sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Expected Revenue:</span>
                  <span className="text-green-600 dark:text-green-400">${revenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Venue:</span>
                  <span>${(parseFloat(data.venueCost) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Workers:</span>
                  <span>${workerTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Custom:</span>
                  <span>${customTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg border-t pt-3">
                  <span className="font-medium">Total Expenses:</span>
                  <span className="text-red-600 dark:text-red-400">${totalExpenses.toFixed(2)}</span>
                </div>
                <div className={`flex justify-between text-xl font-bold pt-3 border-t ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  <span className="flex items-center gap-2">
                    {profit >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    {profit >= 0 ? 'Profit:' : 'Loss:'}
                  </span>
                  <span>${Math.abs(profit).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FiPieChart /> Expense Breakdown
                </h3>
                {total > 0 ? (
                  <div className="space-y-3">
                    {expenseBreakdown.map((item, idx) => {
                      const percentage = ((item.value / total) * 100).toFixed(1);
                      return item.value > 0 ? (
                        <div key={idx}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.label}</span>
                            <span className="font-medium">${item.value.toFixed(2)} ({percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div className={`${item.color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      ) : null;
                    })}
                    <div className="pt-3 border-t">
                      <div className="text-sm mb-2">Revenue vs Expenses</div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="text-xs text-green-600 dark:text-green-400 mb-1">Revenue</div>
                          <div className="bg-green-500 h-8 rounded flex items-center justify-center text-white text-sm font-medium">
                            ${revenue.toFixed(0)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-red-600 dark:text-red-400 mb-1">Expenses</div>
                          <div className="bg-red-500 h-8 rounded flex items-center justify-center text-white text-sm font-medium">
                            ${totalExpenses.toFixed(0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enter expenses to see breakdown</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
