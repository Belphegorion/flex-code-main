export const reviewToLegacy = (review) => {
  if (!review) return null;
  return {
    fromId: review.reviewerId || review.fromId,
    toId: review.subjectId || review.toId,
    jobId: review.jobId,
    rating: review.overallRating ?? review.rating,
    text: review.content ?? review.text,
    type: review.type, // may be undefined in new model
    createdAt: review.createdAt,
    updatedAt: review.updatedAt
  };
};

export const coOrganizerToLegacy = (co) => {
  if (!co) return null;
  return {
    eventId: co.eventId || co.jobId, // fallback mapping
    userId: co.userId || co.coOrganizerId,
    addedBy: co.addedBy || co.organizerId,
    permissions: co.permissions,
    status: co.status || (co.invitationStatus === 'accepted' ? 'active' : 'inactive'),
    elevatedFrom: co.elevatedFrom,
    createdAt: co.createdAt,
    updatedAt: co.updatedAt
  };
};


