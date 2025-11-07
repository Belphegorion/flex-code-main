import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMapPin, FiCalendar, FiDollarSign, FiUsers } from 'react-icons/fi';
import { getRelativeDistance } from '../../utils/distance';

const JobCard = ({ job, showMatchScore = false, userLocation = null }) => {
  const statusColors = {
    open: 'badge-success',
    'in-progress': 'badge-warning',
    completed: 'badge-info',
    cancelled: 'badge-danger'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' }}
      transition={{ duration: 0.2 }}
    >
      <Link to={`/jobs/${job._id}`} className="card block transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
          <span className={`badge ${statusColors[job.status]}`}>
            {job.status}
          </span>
        </div>
        {showMatchScore && job.matchScore && (
          <div className="text-right">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {job.matchScore}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Match</div>
          </div>
        )}
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {job.description}
      </p>

      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center">
          <FiMapPin className="mr-2" />
          {userLocation && job.location?.coordinates ? (
            <span>{getRelativeDistance(job.location, userLocation)} • {job.location?.city || 'Remote'}</span>
          ) : (
            <span>{job.location?.city || 'Remote'}</span>
          )}
        </div>
        <div className="flex items-center">
          <FiCalendar className="mr-2" />
          {new Date(job.dateStart).toLocaleDateString()}
        </div>
        <div className="flex items-center">
          <FiDollarSign className="mr-2" />
          ₹{job.payPerPerson}
        </div>
        <div className="flex items-center">
          <FiUsers className="mr-2" />
          {job.positionsFilled}/{job.totalPositions} filled
        </div>
      </div>

      {job.requiredSkills && (
        <div className="mt-4 flex flex-wrap gap-2">
          {job.requiredSkills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 3 && (
            <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
              +{job.requiredSkills.length - 3} more
            </span>
          )}
        </div>
      )}
      </Link>
    </motion.div>
  );
};

export default JobCard;
