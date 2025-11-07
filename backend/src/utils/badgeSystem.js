// Badge system utility functions
export const BADGE_TIERS = {
  BRONZE_3: { name: 'Bronze III', minHours: 0, minEvents: 0, color: '#CD7F32', icon: '🥉' },
  BRONZE_2: { name: 'Bronze II', minHours: 20, minEvents: 2, color: '#CD7F32', icon: '🥉' },
  BRONZE_1: { name: 'Bronze I', minHours: 50, minEvents: 5, color: '#CD7F32', icon: '🥉' },
  SILVER_3: { name: 'Silver III', minHours: 100, minEvents: 10, color: '#C0C0C0', icon: '🥈' },
  SILVER_2: { name: 'Silver II', minHours: 200, minEvents: 20, color: '#C0C0C0', icon: '🥈' },
  SILVER_1: { name: 'Silver I', minHours: 350, minEvents: 35, color: '#C0C0C0', icon: '🥈' },
  GOLD_3: { name: 'Gold III', minHours: 500, minEvents: 50, color: '#FFD700', icon: '🥇' },
  GOLD_2: { name: 'Gold II', minHours: 750, minEvents: 75, color: '#FFD700', icon: '🥇' },
  GOLD_1: { name: 'Gold I', minHours: 1000, minEvents: 100, color: '#FFD700', icon: '🥇' }
};

export const calculateBadge = (totalHours, totalEvents) => {
  const tiers = Object.entries(BADGE_TIERS).reverse(); // Start from highest tier
  
  for (const [key, tier] of tiers) {
    if (totalHours >= tier.minHours && totalEvents >= tier.minEvents) {
      return {
        tier: key,
        ...tier,
        progress: calculateProgress(totalHours, totalEvents, key)
      };
    }
  }
  
  return {
    tier: 'BRONZE_3',
    ...BADGE_TIERS.BRONZE_3,
    progress: calculateProgress(totalHours, totalEvents, 'BRONZE_3')
  };
};

const calculateProgress = (totalHours, totalEvents, currentTier) => {
  const tierKeys = Object.keys(BADGE_TIERS);
  const currentIndex = tierKeys.indexOf(currentTier);
  
  if (currentIndex === tierKeys.length - 1) {
    return { hoursProgress: 100, eventsProgress: 100, nextTier: null };
  }
  
  const nextTierKey = tierKeys[currentIndex + 1];
  const nextTier = BADGE_TIERS[nextTierKey];
  
  const hoursProgress = Math.min(100, (totalHours / nextTier.minHours) * 100);
  const eventsProgress = Math.min(100, (totalEvents / nextTier.minEvents) * 100);
  
  return {
    hoursProgress: Math.round(hoursProgress),
    eventsProgress: Math.round(eventsProgress),
    nextTier: nextTier,
    nextTierKey,
    hoursNeeded: Math.max(0, nextTier.minHours - totalHours),
    eventsNeeded: Math.max(0, nextTier.minEvents - totalEvents)
  };
};

export const getBadgeIcon = (tier) => {
  return BADGE_TIERS[tier]?.icon || '🥉';
};

export const getBadgeColor = (tier) => {
  return BADGE_TIERS[tier]?.color || '#CD7F32';
};