const roles = [
  { 
    value: 'worker', 
    label: 'Worker', 
    description: 'Find work opportunities at events' 
  },
  { 
    value: 'organizer', 
    label: 'Event Organizer', 
    description: 'Post events and hire workers' 
  },
  { 
    value: 'sponsor', 
    label: 'Event Sponsor', 
    description: 'Fund events and track sponsorships' 
  }
];

const RoleSelector = ({ selectedRole, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">I am a...</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div
            key={role.value}
            onClick={() => onChange(role.value)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedRole === role.value
                ? 'border-primary-600 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20'
                : 'border-gray-300 hover:border-primary-400 dark:border-gray-600 dark:hover:border-primary-500'
            }`}
          >
            <h3 className="font-semibold text-lg mb-1">{role.label}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{role.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;