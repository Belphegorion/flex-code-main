import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiDollarSign, FiUsers, FiPlus, FiX, FiSave, FiHome, FiSettings } from 'react-icons/fi';
import Layout from '../components/common/Layout';
import LocationPicker from '../components/events/LocationPicker';
import api from '../services/api';

export default function EventCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [location, setLocation] = useState(null);

  // Tickets
  const [totalDispersed, setTotalDispersed] = useState('');
  const [pricePerTicket, setPricePerTicket] = useState('');

  // Jobs
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    title: '',
    description: '',
    payPerPerson: '',
    totalPositions: '',
    requiredSkills: [],
    skillInput: ''
  });

  // Estimated Expenses
  const [estimatedExpenses, setEstimatedExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ category: '', description: '', estimatedAmount: '' });

  // Step 4: Venue & Event Details
  const [venue, setVenue] = useState({
    name: '',
    type: 'indoor',
    capacity: '',
    facilities: [],
    contactPerson: { name: '', phone: '', email: '' },
    rentalCost: '',
    setupRequirements: ''
  });
  const [eventType, setEventType] = useState('conference');
  const [attendees, setAttendees] = useState({
    expectedCount: '',
    demographics: { ageGroups: [], interests: [] }
  });
  const [customFields, setCustomFields] = useState([]);
  const [eventSettings, setEventSettings] = useState({
    isPublic: true,
    requiresApproval: false,
    allowWaitlist: false,
    maxWaitlistSize: '',
    cancellationPolicy: '',
    refundPolicy: ''
  });
  const [newFacility, setNewFacility] = useState('');
  const [newInterest, setNewInterest] = useState('');
  const [newCustomField, setNewCustomField] = useState({
    fieldName: '',
    fieldType: 'text',
    fieldValue: '',
    options: [],
    isRequired: false
  });

  const addExpense = () => {
    if (!newExpense.category || !newExpense.estimatedAmount) {
      toast.error('Please fill in expense details');
      return;
    }
    setEstimatedExpenses([...estimatedExpenses, { ...newExpense, estimatedAmount: parseFloat(newExpense.estimatedAmount) }]);
    setNewExpense({ category: '', description: '', estimatedAmount: '' });
  };

  const removeExpense = (index) => {
    setEstimatedExpenses(estimatedExpenses.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (newJob.skillInput.trim() && !newJob.requiredSkills.includes(newJob.skillInput.trim())) {
      setNewJob({
        ...newJob,
        requiredSkills: [...newJob.requiredSkills, newJob.skillInput.trim()],
        skillInput: ''
      });
    }
  };

  const removeSkill = (skill) => {
    setNewJob({
      ...newJob,
      requiredSkills: newJob.requiredSkills.filter(s => s !== skill)
    });
  };

  const addJob = () => {
    if (!newJob.title || !newJob.payPerPerson || !newJob.totalPositions || newJob.requiredSkills.length === 0) {
      toast.error('Please fill all job fields and add at least one skill');
      return;
    }
    setJobs([...jobs, {
      title: newJob.title,
      description: newJob.description,
      payPerPerson: parseFloat(newJob.payPerPerson),
      totalPositions: parseInt(newJob.totalPositions),
      requiredSkills: newJob.requiredSkills
    }]);
    setNewJob({ title: '', description: '', payPerPerson: '', totalPositions: '', requiredSkills: [], skillInput: '' });
  };

  const removeJob = (index) => {
    setJobs(jobs.filter((_, i) => i !== index));
  };

  // Calculations
  const ticketRevenue = (parseFloat(totalDispersed) || 0) * (parseFloat(pricePerTicket) || 0);
  const workerCost = jobs.reduce((sum, job) => sum + (job.payPerPerson * job.totalPositions), 0);
  const totalExpenses = estimatedExpenses.reduce((sum, e) => sum + e.estimatedAmount, 0);
  const estimatedProfit = ticketRevenue - workerCost - totalExpenses;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Event title is required');
      return;
    }

    if (!description.trim()) {
      toast.error('Event description is required');
      return;
    }

    if (!dateStart || !dateEnd) {
      toast.error('Start and end dates are required');
      return;
    }

    if (new Date(dateStart) >= new Date(dateEnd)) {
      toast.error('End date must be after start date');
      return;
    }

    if (!location) {
      toast.error('Event location is required');
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        title: title.trim(),
        description: description.trim(),
        dateStart,
        dateEnd,
        location,
        venue: {
          ...venue,
          capacity: parseInt(venue.capacity) || 0,
          rentalCost: parseFloat(venue.rentalCost) || 0
        },
        eventType,
        attendees: {
          ...attendees,
          expectedCount: parseInt(attendees.expectedCount) || 0
        },
        customFields,
        eventSettings: {
          ...eventSettings,
          maxWaitlistSize: parseInt(eventSettings.maxWaitlistSize) || 0
        },
        tickets: {
          totalDispersed: parseFloat(totalDispersed) || 0,
          totalSold: 0,
          pricePerTicket: parseFloat(pricePerTicket) || 0
        },
        estimatedExpenses
      };

      const res = await api.post('/events', eventData);
      const eventId = res.event._id;

      // Create all jobs for the event
      if (jobs.length > 0) {
        for (const job of jobs) {
          try {
            await api.post(`/events/${eventId}/jobs`, {
              ...job,
              roles: job.requiredSkills,
              requiredSkills: job.requiredSkills
            });
          } catch (jobError) {
            console.error('Failed to create job:', job.title, jobError);
            // Continue with other jobs even if one fails
          }
        }
      }

      toast.success('Event and jobs created successfully!');
      navigate('/organizer');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Plan your event with detailed information, venue details, and cost estimates (4 steps)
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {[
              { num: 1, label: 'Basic Info' },
              { num: 2, label: 'Tickets & Jobs' },
              { num: 3, label: 'Expenses' },
              { num: 4, label: 'Venue & Details' }
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s.num
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}
                  >
                    {s.num}
                  </div>
                  <span className="text-xs mt-1 text-center text-gray-600 dark:text-gray-400">
                    {s.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > s.num ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="card">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

                <div>
                  <label className="block text-sm font-medium mb-2">Event Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    placeholder="e.g., Summer Music Festival 2024"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field"
                    rows="4"
                    placeholder="Describe your event in detail..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <FiCalendar /> Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <FiCalendar /> End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <FiMapPin /> Event Location *
                  </label>
                  <LocationPicker location={location} onChange={setLocation} />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-primary"
                    disabled={!title || !description || !dateStart || !dateEnd || !location}
                  >
                    Next: Tickets & Jobs
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Tickets & Jobs */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Tickets & Job Positions</h2>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FiDollarSign /> Ticket Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Total Tickets</label>
                      <input
                        type="number"
                        value={totalDispersed}
                        onChange={(e) => setTotalDispersed(e.target.value)}
                        className="input-field"
                        placeholder="e.g., 500"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Price per Ticket ($)</label>
                      <input
                        type="number"
                        value={pricePerTicket}
                        onChange={(e) => setPricePerTicket(e.target.value)}
                        className="input-field"
                        placeholder="e.g., 50"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded">
                    <p className="text-sm font-medium">
                      Estimated Ticket Revenue: <span className="text-green-600 dark:text-green-400 text-lg">${ticketRevenue.toFixed(2)}</span>
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <FiUsers /> Add Job Positions
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Add multiple jobs (e.g., 24 Hand Workers, 3 Event Managers, 5 Security Staff)
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                        className="input-field"
                        placeholder="Job Title (e.g., Hand Worker)"
                      />
                      <input
                        type="text"
                        value={newJob.description}
                        onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                        className="input-field"
                        placeholder="Description"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="number"
                        value={newJob.payPerPerson}
                        onChange={(e) => setNewJob({ ...newJob, payPerPerson: e.target.value })}
                        className="input-field"
                        placeholder="Pay per person ($)"
                        min="0"
                        step="0.01"
                      />
                      <input
                        type="number"
                        value={newJob.totalPositions}
                        onChange={(e) => setNewJob({ ...newJob, totalPositions: e.target.value })}
                        className="input-field"
                        placeholder="Number of positions"
                        min="1"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newJob.skillInput}
                        onChange={(e) => setNewJob({ ...newJob, skillInput: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        className="input-field flex-1"
                        placeholder="Add required skill and press Enter"
                      />
                      <button type="button" onClick={addSkill} className="btn-secondary px-4">Add Skill</button>
                    </div>
                    {newJob.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {newJob.requiredSkills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center gap-2">
                            {skill}
                            <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-600">
                              <FiX size={16} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <button type="button" onClick={addJob} className="btn-primary w-full">
                      <FiPlus className="inline mr-2" /> Add Job
                    </button>
                  </div>
                </div>

                {jobs.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center justify-between">
                      <span>Jobs Added ({jobs.length})</span>
                      <span className="text-sm text-gray-500 font-normal">Total Positions: {jobs.reduce((sum, j) => sum + j.totalPositions, 0)}</span>
                    </h3>
                    {jobs.map((job, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border-l-4 border-purple-500">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs font-bold">#{index + 1}</span>
                            <p className="font-medium">{job.title}</p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {job.totalPositions} positions @ ${job.payPerPerson}/person
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Skills: {job.requiredSkills.join(', ')}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-red-600 dark:text-red-400">${(job.payPerPerson * job.totalPositions).toFixed(2)}</span>
                          <button type="button" onClick={() => removeJob(index)} className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                            <FiX size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Worker Cost:</span>
                        <span className="text-red-600 dark:text-red-400 text-lg font-bold">${workerCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary">Back</button>
                  <button type="button" onClick={() => setStep(3)} className="btn-primary">Next: Expenses</button>
                </div>
              </div>
            )}

            {/* Step 3: Expenses & Summary */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Estimated Expenses</h2>

                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Add Expense</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="input-field"
                      placeholder="Category (e.g., Venue)"
                    />
                    <input
                      type="text"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      className="input-field"
                      placeholder="Description"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={newExpense.estimatedAmount}
                        onChange={(e) => setNewExpense({ ...newExpense, estimatedAmount: e.target.value })}
                        className="input-field"
                        placeholder="Amount"
                        min="0"
                        step="0.01"
                      />
                      <button
                        type="button"
                        onClick={addExpense}
                        className="btn-primary px-4"
                      >
                        <FiPlus />
                      </button>
                    </div>
                  </div>
                </div>

                {estimatedExpenses.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold">Expense List</h3>
                    {estimatedExpenses.map((expense, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{expense.category}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{expense.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">${expense.estimatedAmount.toFixed(2)}</span>
                          <button
                            type="button"
                            onClick={() => removeExpense(index)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <FiX />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Financial Summary */}
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Financial Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Ticket Revenue:</span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        ${ticketRevenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Worker Costs:</span>
                      <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                        -${workerCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Other Expenses:</span>
                      <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                        -${totalExpenses.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold">Estimated Profit:</span>
                        <span className={`text-2xl font-bold ${
                          estimatedProfit >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          ${estimatedProfit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="btn-primary"
                  >
                    Next: Venue & Details
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Venue & Event Details */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold mb-4">Venue & Event Details</h2>

                {/* Event Type */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Event Type & Attendees</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Event Type *</label>
                      <select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        className="input-field"
                        required
                      >
                        <option value="conference">Conference</option>
                        <option value="concert">Concert</option>
                        <option value="festival">Festival</option>
                        <option value="workshop">Workshop</option>
                        <option value="seminar">Seminar</option>
                        <option value="exhibition">Exhibition</option>
                        <option value="sports">Sports Event</option>
                        <option value="wedding">Wedding</option>
                        <option value="corporate">Corporate Event</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Expected Attendees *</label>
                      <input
                        type="number"
                        value={attendees.expectedCount}
                        onChange={(e) => setAttendees({ ...attendees, expectedCount: e.target.value })}
                        className="input-field"
                        placeholder="e.g., 500"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Venue Details */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Venue Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Venue Name</label>
                        <input
                          type="text"
                          value={venue.name}
                          onChange={(e) => setVenue({ ...venue, name: e.target.value })}
                          className="input-field"
                          placeholder="e.g., Grand Convention Center"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Venue Type</label>
                        <select
                          value={venue.type}
                          onChange={(e) => setVenue({ ...venue, type: e.target.value })}
                          className="input-field"
                        >
                          <option value="indoor">Indoor</option>
                          <option value="outdoor">Outdoor</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Venue Capacity</label>
                        <input
                          type="number"
                          value={venue.capacity}
                          onChange={(e) => setVenue({ ...venue, capacity: e.target.value })}
                          className="input-field"
                          placeholder="Maximum capacity"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Rental Cost ($)</label>
                        <input
                          type="number"
                          value={venue.rentalCost}
                          onChange={(e) => setVenue({ ...venue, rentalCost: e.target.value })}
                          className="input-field"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    
                    {/* Facilities */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Facilities Available</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newFacility}
                          onChange={(e) => setNewFacility(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newFacility.trim() && !venue.facilities.includes(newFacility.trim())) {
                                setVenue({ ...venue, facilities: [...venue.facilities, newFacility.trim()] });
                                setNewFacility('');
                              }
                            }
                          }}
                          className="input-field flex-1"
                          placeholder="Add facility (e.g., Parking, WiFi, A/C)"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newFacility.trim() && !venue.facilities.includes(newFacility.trim())) {
                              setVenue({ ...venue, facilities: [...venue.facilities, newFacility.trim()] });
                              setNewFacility('');
                            }
                          }}
                          className="btn-secondary px-4"
                        >
                          Add
                        </button>
                      </div>
                      {venue.facilities.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {venue.facilities.map((facility, idx) => (
                            <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm flex items-center gap-2">
                              {facility}
                              <button
                                type="button"
                                onClick={() => setVenue({ ...venue, facilities: venue.facilities.filter((_, i) => i !== idx) })}
                                className="hover:text-red-600"
                              >
                                <FiX size={16} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contact Person */}
                    <div>
                      <h4 className="font-medium mb-2">Venue Contact Person</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={venue.contactPerson.name}
                          onChange={(e) => setVenue({ ...venue, contactPerson: { ...venue.contactPerson, name: e.target.value } })}
                          className="input-field"
                          placeholder="Contact Name"
                        />
                        <input
                          type="tel"
                          value={venue.contactPerson.phone}
                          onChange={(e) => setVenue({ ...venue, contactPerson: { ...venue.contactPerson, phone: e.target.value } })}
                          className="input-field"
                          placeholder="Phone Number"
                        />
                        <input
                          type="email"
                          value={venue.contactPerson.email}
                          onChange={(e) => setVenue({ ...venue, contactPerson: { ...venue.contactPerson, email: e.target.value } })}
                          className="input-field"
                          placeholder="Email Address"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Setup Requirements</label>
                      <textarea
                        value={venue.setupRequirements}
                        onChange={(e) => setVenue({ ...venue, setupRequirements: e.target.value })}
                        className="input-field"
                        rows="3"
                        placeholder="Special setup requirements, equipment needed, etc."
                      />
                    </div>
                  </div>
                </div>

                {/* Attendee Demographics */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Attendee Information</h3>
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Audience Interests</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newInterest}
                        onChange={(e) => setNewInterest(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newInterest.trim() && !attendees.demographics.interests.includes(newInterest.trim())) {
                              setAttendees({
                                ...attendees,
                                demographics: {
                                  ...attendees.demographics,
                                  interests: [...attendees.demographics.interests, newInterest.trim()]
                                }
                              });
                              setNewInterest('');
                            }
                          }
                        }}
                        className="input-field flex-1"
                        placeholder="Add interest (e.g., Technology, Music, Business)"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newInterest.trim() && !attendees.demographics.interests.includes(newInterest.trim())) {
                            setAttendees({
                              ...attendees,
                              demographics: {
                                ...attendees.demographics,
                                interests: [...attendees.demographics.interests, newInterest.trim()]
                              }
                            });
                            setNewInterest('');
                          }
                        }}
                        className="btn-secondary px-4"
                      >
                        Add
                      </button>
                    </div>
                    {attendees.demographics.interests.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {attendees.demographics.interests.map((interest, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm flex items-center gap-2">
                            {interest}
                            <button
                              type="button"
                              onClick={() => setAttendees({
                                ...attendees,
                                demographics: {
                                  ...attendees.demographics,
                                  interests: attendees.demographics.interests.filter((_, i) => i !== idx)
                                }
                              })}
                              className="hover:text-red-600"
                            >
                              <FiX size={16} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Settings */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Event Settings</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="isPublic"
                          checked={eventSettings.isPublic}
                          onChange={(e) => setEventSettings({ ...eventSettings, isPublic: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label htmlFor="isPublic" className="text-sm font-medium">Public Event</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="requiresApproval"
                          checked={eventSettings.requiresApproval}
                          onChange={(e) => setEventSettings({ ...eventSettings, requiresApproval: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label htmlFor="requiresApproval" className="text-sm font-medium">Requires Approval</label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="allowWaitlist"
                          checked={eventSettings.allowWaitlist}
                          onChange={(e) => setEventSettings({ ...eventSettings, allowWaitlist: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label htmlFor="allowWaitlist" className="text-sm font-medium">Allow Waitlist</label>
                      </div>
                      {eventSettings.allowWaitlist && (
                        <div>
                          <input
                            type="number"
                            value={eventSettings.maxWaitlistSize}
                            onChange={(e) => setEventSettings({ ...eventSettings, maxWaitlistSize: e.target.value })}
                            className="input-field"
                            placeholder="Max waitlist size"
                            min="1"
                          />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Cancellation Policy</label>
                        <textarea
                          value={eventSettings.cancellationPolicy}
                          onChange={(e) => setEventSettings({ ...eventSettings, cancellationPolicy: e.target.value })}
                          className="input-field"
                          rows="2"
                          placeholder="Cancellation terms..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Refund Policy</label>
                        <textarea
                          value={eventSettings.refundPolicy}
                          onChange={(e) => setEventSettings({ ...eventSettings, refundPolicy: e.target.value })}
                          className="input-field"
                          rows="2"
                          placeholder="Refund terms..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Fields */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Custom Fields (Optional)</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Add custom fields to collect additional information from attendees
                  </p>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={newCustomField.fieldName}
                        onChange={(e) => setNewCustomField({ ...newCustomField, fieldName: e.target.value })}
                        className="input-field"
                        placeholder="Field Name"
                      />
                      <select
                        value={newCustomField.fieldType}
                        onChange={(e) => setNewCustomField({ ...newCustomField, fieldType: e.target.value })}
                        className="input-field"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="boolean">Yes/No</option>
                        <option value="date">Date</option>
                        <option value="select">Dropdown</option>
                      </select>
                      <input
                        type="text"
                        value={newCustomField.fieldValue}
                        onChange={(e) => setNewCustomField({ ...newCustomField, fieldValue: e.target.value })}
                        className="input-field"
                        placeholder="Default Value"
                      />
                      <div className="flex gap-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={newCustomField.isRequired}
                            onChange={(e) => setNewCustomField({ ...newCustomField, isRequired: e.target.checked })}
                            className="w-4 h-4"
                          />
                          Required
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (newCustomField.fieldName.trim()) {
                              setCustomFields([...customFields, { ...newCustomField }]);
                              setNewCustomField({ fieldName: '', fieldType: 'text', fieldValue: '', options: [], isRequired: false });
                            }
                          }}
                          className="btn-primary px-3 py-1 text-sm"
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </div>
                  </div>
                  {customFields.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h4 className="font-medium">Custom Fields Added:</h4>
                      {customFields.map((field, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border">
                          <div className="flex-1">
                            <span className="font-medium">{field.fieldName}</span>
                            <span className="text-sm text-gray-500 ml-2">({field.fieldType})</span>
                            {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                          </div>
                          <button
                            type="button"
                            onClick={() => setCustomFields(customFields.filter((_, i) => i !== idx))}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <FiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Updated Financial Summary */}
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-4">Final Financial Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Ticket Revenue:</span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        ${ticketRevenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Worker Costs:</span>
                      <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                        -${workerCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Venue Rental:</span>
                      <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                        -${(parseFloat(venue.rentalCost) || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 dark:text-gray-300">Other Expenses:</span>
                      <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                        -${totalExpenses.toFixed(2)}
                      </span>
                    </div>
                    <div className="border-t-2 border-gray-300 dark:border-gray-600 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold">Estimated Profit:</span>
                        <span className={`text-2xl font-bold ${
                          (estimatedProfit - (parseFloat(venue.rentalCost) || 0)) >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          ${(estimatedProfit - (parseFloat(venue.rentalCost) || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="btn-secondary"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !eventType || !attendees.expectedCount}
                    className="btn-primary flex items-center gap-2"
                  >
                    <FiSave />
                    {loading ? 'Creating Event...' : 'Create Event'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </Layout>
  );
}
