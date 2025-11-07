import { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiMapPin, FiPieChart } from 'react-icons/fi';
import LocationPicker from './LocationPicker';

export default function QuickEstimator() {
  const [data, setData] = useState({
    ticketPrice: 0,
    expectedTickets: 0,
    venueCost: 0,
    workerCount: 0,
    workerCost: 0,
    otherExpenses: 0,
    location: null
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

  const revenue = data.ticketPrice * data.expectedTickets;
  const workerTotal = data.workerCount * data.workerCost;
  const totalExpenses = data.venueCost + workerTotal + data.otherExpenses;
  const profit = revenue - totalExpenses;

  const expenseBreakdown = [
    { label: 'Venue', value: data.venueCost, color: 'bg-blue-500' },
    { label: 'Workers', value: workerTotal, color: 'bg-green-500' },
    { label: 'Other', value: data.otherExpenses, color: 'bg-yellow-500' }
  ];

  const total = expenseBreakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="card mb-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <FiDollarSign /> Event Cost Estimator
      </h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <FiMapPin /> Event Location
        </label>
        <LocationPicker
          value={data.location}
          onChange={(location) => setData({...data, location})}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Ticket Price ($)</label>
          <input
            type="number"
            value={data.ticketPrice}
            onChange={(e) => setData({...data, ticketPrice: +e.target.value})}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expected Tickets</label>
          <input
            type="number"
            value={data.expectedTickets}
            onChange={(e) => setData({...data, expectedTickets: +e.target.value})}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Venue Cost ($)</label>
          <input
            type="number"
            value={data.venueCost}
            onChange={(e) => setData({...data, venueCost: +e.target.value})}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Other Expenses ($)</label>
          <input
            type="number"
            value={data.otherExpenses}
            onChange={(e) => setData({...data, otherExpenses: +e.target.value})}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Workers Needed</label>
          <input
            type="number"
            value={data.workerCount}
            onChange={(e) => setData({...data, workerCount: +e.target.value})}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cost per Worker ($)</label>
          <input
            type="number"
            value={data.workerCost}
            onChange={(e) => setData({...data, workerCost: +e.target.value})}
            className="input-field"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 border-t pt-4">
        <div className="space-y-3">
          <div className="flex justify-between text-lg">
            <span className="font-medium">Expected Revenue:</span>
            <span className="text-green-600 dark:text-green-400">${revenue.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Worker Costs:</span>
            <span>${workerTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg">
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

        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <FiPieChart /> Expense Breakdown
          </h3>
          {total > 0 ? (
            <div className="space-y-3">
              {expenseBreakdown.map((item, idx) => {
                const percentage = ((item.value / total) * 100).toFixed(1);
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.label}</span>
                      <span className="font-medium">${item.value.toFixed(2)} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className={`${item.color} h-2 rounded-full`} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Revenue vs Expenses</span>
                </div>
                <div className="flex gap-2 mt-2">
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
  );
}
