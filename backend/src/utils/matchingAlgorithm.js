import Profile from '../models/Profile.js';

export const calculateMatchScores = async (jobs, userId) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) return jobs;

    const userSkills = profile.skills || [];
    
    return jobs.map(job => {
      let score = 0;
      const jobSkills = job.requiredSkills || [];
      
      // Skill matching (60% weight)
      if (jobSkills.length > 0 && userSkills.length > 0) {
        const matchingSkills = jobSkills.filter(skill => 
          userSkills.some(userSkill => 
            userSkill.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(userSkill.toLowerCase())
          )
        );
        score += (matchingSkills.length / jobSkills.length) * 60;
      }
      
      // Location proximity (20% weight)
      if (profile.location && job.location) {
        const distance = calculateDistance(
          profile.location.lat,
          profile.location.lng,
          job.location.lat,
          job.location.lng
        );
        if (distance <= 10) score += 20;
        else if (distance <= 25) score += 15;
        else if (distance <= 50) score += 10;
      }
      
      // Experience level (10% weight)
      if (profile.experience && job.experienceLevel) {
        if (profile.experience.toLowerCase().includes(job.experienceLevel.toLowerCase())) {
          score += 10;
        }
      }
      
      // Rating compatibility (10% weight)
      if (profile.ratingAvg >= 4) score += 10;
      else if (profile.ratingAvg >= 3) score += 5;
      
      return {
        ...job.toObject(),
        matchScore: Math.min(Math.round(score), 100)
      };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  } catch (error) {
    console.error('Error calculating match scores:', error);
    return jobs;
  }
};

export const updateReliabilityScore = async (userId) => {
  try {
    const profile = await Profile.findOne({ userId });
    if (!profile) return;

    const user = await Profile.findOne({ userId }).populate('userId');
    const completedJobs = user?.userId?.completedJobsCount || 0;
    const noShows = user?.userId?.noShowCount || 0;
    const totalJobs = completedJobs + noShows;

    if (totalJobs === 0) {
      profile.reliabilityScore = 100;
    } else {
      const reliabilityScore = Math.max(0, Math.round((completedJobs / totalJobs) * 100));
      profile.reliabilityScore = reliabilityScore;
    }

    await profile.save();
  } catch (error) {
    console.error('Error updating reliability score:', error);
  }
};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};