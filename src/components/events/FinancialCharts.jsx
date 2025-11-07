import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#0ea5e9', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function FinancialCharts({ summary }) {
  const profitData = [
    { name: 'Revenue', value: summary.totalRevenue },
    { name: 'Expenses', value: summary.totalExpenses },
    { name: 'Profit', value: summary.totalProfit }
  ];

  const pieData = [
    { name: 'Revenue', value: summary.totalRevenue },
    { name: 'Expenses', value: summary.totalExpenses }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Financial Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={profitData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="value" fill="#0ea5e9" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="text-lg font-bold mb-4">Revenue vs Expenses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
