import { useState } from 'react';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

export default function AdvancedSearch({ onSearch, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    query: '',
    location: '',
    payMin: '',
    payMax: '',
    dateFrom: '',
    dateTo: '',
    skills: [],
    status: 'all'
  });
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !filters.skills.includes(skillInput.trim())) {
      setFilters({ ...filters, skills: [...filters.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFilters({ ...filters, skills: filters.skills.filter(s => s !== skill) });
  };

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters = {
      query: '',
      location: '',
      payMin: '',
      payMax: '',
      dateFrom: '',
      dateTo: '',
      skills: [],
      status: 'all'
    };
    setFilters(resetFilters);
    onReset();
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            placeholder="Search jobs..."
            className="input-field pl-10"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`btn-secondary flex items-center gap-2 ${isOpen ? 'bg-primary-100 dark:bg-primary-900' : ''}`}
        >
          <FiFilter size={16} />
          Filters
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg p-4 z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="City or area"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="input-field"
              >
                <option value="all">All Jobs</option>
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Pay Range ($)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.payMin}
                  onChange={(e) => setFilters({ ...filters, payMin: e.target.value })}
                  placeholder="Min"
                  className="input-field"
                  min="0"
                />
                <input
                  type="number"
                  value={filters.payMax}
                  onChange={(e) => setFilters({ ...filters, payMax: e.target.value })}
                  placeholder="Max"
                  className="input-field"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="input-field"
                />
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Required Skills</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add skill"
                className="input-field flex-1"
              />
              <button type="button" onClick={addSkill} className="btn-secondary">
                Add
              </button>
            </div>
            {filters.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {filters.skills.map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm flex items-center gap-1">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-600">
                      <FiX size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t dark:border-gray-700">
            <button onClick={handleSearch} className="btn-primary flex-1">
              Apply Filters
            </button>
            <button onClick={handleReset} className="btn-secondary">
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}