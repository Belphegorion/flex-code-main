import { FiClock, FiCalendar, FiDollarSign } from 'react-icons/fi';
import StartWorkButton from './StartWorkButton';

export default function WorkerQuickActions() {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <FiClock className="text-primary-600" />
        Quick Actions
      </h3>
      
      <div className="space-y-4">
        <StartWorkButton />
        
        <div className="grid grid-cols-2 gap-3">
          <button className="btn-secondary flex items-center gap-2 justify-center">
            <FiCalendar size={16} />
            My Schedule
          </button>
          <button className="btn-secondary flex items-center gap-2 justify-center">
            <FiDollarSign size={16} />
            Earnings
          </button>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 Tip: Use "Start Work Hours" to quickly begin tracking time for any of your assigned events
        </p>
      </div>
    </div>
  );
}