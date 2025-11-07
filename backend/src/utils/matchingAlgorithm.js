import Profile from '../models/Profile.js';
import User from '../models/User.js';
import Application from '../models/Application.js';

// Fuzzy string matching helper
const fuzzyMatch = (str1, str2, threshold = 0.7) => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  // Levenshtein distance based similarity
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1;
  
  const distance = levenshteinDistance(longer, shorter);
  const similarity = (longer.length - distance) / longer.length;
  
  return similarity >= threshold ? similarity : 0;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
};

export const calculateMatchScores = async (jobs, userId) => {
  try {
    const [profile, user, userApplications] = await Promise.all([
      Profile.findOne({ userId }).lean(),
      User.findById(userId).lean(),
      Application.find({ proId: userId }).lean()
    ]);
    
    if (!profile) return jobs;

    const userSkills = profile.skills || [];
    const userRating = user?.ratingAvg || 0;
    const completedJobs = user?.completedJobsCount || 0;
    const reliabilityScore = user?.reliabilityScore || 1.0;
    
    // Get job categories user has worked in
    const workedCategories = new Set();
    userApplications.forEach(app => {
      if (app.status === 'completed' && app.category) {
        workedCategories.add(app.category.toLowerCase());
      }
    });
    
    return jobs.map(job => {
      let score = 0;
      const jobSkills = job.requiredSkills || [];
      const jobObj = job.toObject ? job.toObject() : job;
      
      // Enhanced skill matching (50% weight)
      if (jobSkills.length > 0 && userSkills.length > 0) {
        let skillScore = 0;
        let totalWeight = 0;
        
        jobSkills.forEach(jobSkill => {
          let bestMatch = 0;
          userSkills.forEach(userSkill => {
            const match = fuzzyMatch(jobSkill, userSkill);
            bestMatch = Math.max(bestMatch, match);
          });
          skillScore += bestMatch;
          totalWeight += 1;
        });
        
        if (totalWeight > 0) {
          score += (skillScore / totalWeight) * 50;
        }
      }
      
      // Location proximity (25% weight)
      if (profile.location && job.location) {
        const distance = calculateDistance(
          profile.location.lat,
          profile.location.lng,
          job.location.lat,
          job.location.lng
        );
        
        let locationScore = 0;
        if (distance <= 5) locationScore = 25;
        else if (distance <= 15) locationScore = 20;
        else if (distance <= 30) locationScore = 15;
        else if (distance <= 50) locationScore = 10;
        else if (distance <= 100) locationScore = 5;
        
        score += locationScore;
      }
      
      // Experience and reliability (15% weight)
      let experienceScore = 0;
      if (completedJobs >= 20) experienceScore = 10;
      else if (completedJobs >= 10) experienceScore = 8;
      else if (completedJobs >= 5) experienceScore = 6;
      else if (completedJobs >= 1) experienceScore = 4;
      
      experienceScore += reliabilityScore * 5; // 0-5 points based on reliability
      score += Math.min(experienceScore, 15);
      
      // Rating bonus (10% weight)
      if (userRating >= 4.5) score += 10;
      else if (userRating >= 4.0) score += 8;
      else if (userRating >= 3.5) score += 6;
      else if (userRating >= 3.0) score += 4;
      
      // Category experience bonus (5% weight)
      if (job.category && workedCategories.has(job.category.toLowerCase())) {
        score += 5;
      }
      
      // Availability bonus (5% weight)
      const jobDate = new Date(job.dateStart);
      const dayOfWeek = jobDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      if (profile.availability) {
        if (isWeekend && profile.availability.weekends) score += 3;
        if (!isWeekend && profile.availability.weekdays) score += 3;
        if (profile.availability.flexible) score += 2;
      }
      
      // Penalty for overqualification (prevent mismatches)
      if (userRating >= 4.5 && job.payPerPerson < 15) {
        score -= 10; // High-rated workers might not want low-pay jobs
      }
      
      const finalScore = Math.max(0, Math.min(Math.round(score), 100));
      
      return {
        ...jobObj,
        matchScore: finalScore,
        matchDetails: {
          skillMatch: Math.round((score * 0.5) / 50 * 100),
          locationMatch: profile.location && job.location,
          experienceLevel: completedJobs,
          reliabilityScore: Math.round(reliabilityScore * 100)
        }
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