import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, label, value, trend, color = 'primary', delay = 0 }) => {
  const colorClasses = {
    primary: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20',
    success: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    warning: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
    danger: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ scale: 1.02 }}
      className="card"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        <div className={`p-4 rounded-full ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;
