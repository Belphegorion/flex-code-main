import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      {Icon && (
        <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <Icon size={48} className="text-gray-400 dark:text-gray-600" />
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">{description}</p>
      {action}
    </motion.div>
  );
};

export default EmptyState;
