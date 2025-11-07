export const calculateSponsorBadge = (totalSponsored, successfulEvents, totalInvestment) => {
  const successRate = totalSponsored > 0 ? (successfulEvents / totalSponsored) * 100 : 0;
  
  // Define badge tiers based on sponsorship activity and success
  const badges = [
    { tier: 'Bronze Supporter', min: 1, maxSponsored: 2, minSuccess: 0, color: '#CD7F32' },
    { tier: 'Silver Patron', min: 3, maxSponsored: 5, minSuccess: 60, color: '#C0C0C0' },
    { tier: 'Gold Benefactor', min: 6, maxSponsored: 10, minSuccess: 70, color: '#FFD700' },
    { tier: 'Platinum Champion', min: 11, maxSponsored: 20, minSuccess: 80, color: '#E5E4E2' },
    { tier: 'Diamond Elite', min: 21, maxSponsored: Infinity, minSuccess: 85, color: '#B9F2FF' }
  ];

  let currentBadge = { tier: 'New Sponsor', min: 0, maxSponsored: 0, minSuccess: 0, color: '#9CA3AF' };
  
  for (const badge of badges) {
    if (totalSponsored >= badge.min && 
        successRate >= badge.minSuccess &&
        totalInvestment >= (badge.min * 1000)) { // Minimum investment per tier
      currentBadge = badge;
    }
  }

  // Calculate progress to next tier
  const nextBadge = badges.find(b => b.min > totalSponsored);
  const progress = nextBadge ? {
    current: totalSponsored,
    required: nextBadge.min,
    percentage: Math.min((totalSponsored / nextBadge.min) * 100, 100)
  } : null;

  return {
    ...currentBadge,
    successRate: Math.round(successRate),
    totalSponsored,
    successfulEvents,
    totalInvestment,
    progress
  };
};