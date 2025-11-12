import Job from '../models/Job.js';

class SearchService {
  async searchJobs(filters, options = {}) {
    const {
      location,
      radius = 50,
      startDate,
      endDate,
      payMin,
      payMax,
      skills = [],
      eventType,
      limit = 20,
      page = 1,
      sortBy = 'createdAt'
    } = filters;

    const query = { status: 'open' };
    if (location?.coordinates) {
      query['location.coordinates'] = {
        $geoWithin: { $centerSphere: [location.coordinates, radius / 3963.2] }
      };
    }
    if (startDate || endDate) {
      query['schedule.startTime'] = {};
      if (startDate) query['schedule.startTime'].$gte = new Date(startDate);
      if (endDate) query['schedule.startTime'].$lte = new Date(endDate);
    }
    if (payMin || payMax) {
      query['pay.rate'] = {};
      if (payMin) query['pay.rate'].$gte = payMin;
      if (payMax) query['pay.rate'].$lte = payMax;
    }
    if (skills.length > 0) {
      query['requirements.skills'] = { $in: skills };
    }
    if (eventType) {
      query['eventDetails.category'] = eventType;
    }

    const skip = (page - 1) * limit;
    const sortOptions = { [sortBy]: -1 };
    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('organizerId', 'name profilePhoto profileData.organizer.company.name')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      Job.countDocuments(query)
    ]);
    return { data: jobs, total, page, totalPages: Math.ceil(total / limit) };
  }

  async autoComplete(query, type = 'location') {
    return [];
  }
}

export default new SearchService();


