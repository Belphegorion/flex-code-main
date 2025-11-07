export const PERMISSION_TEMPLATES = {
  full: {
    canHireWorkers: true,
    canManageJobs: true,
    canViewFinancials: true,
    canEditEvent: true,
    canManageGroups: true
  },
  operations: {
    canHireWorkers: true,
    canManageJobs: true,
    canViewFinancials: false,
    canEditEvent: false,
    canManageGroups: true
  },
  limited: {
    canHireWorkers: false,
    canManageJobs: true,
    canViewFinancials: false,
    canEditEvent: false,
    canManageGroups: false
  },
  viewer: {
    canHireWorkers: false,
    canManageJobs: false,
    canViewFinancials: true,
    canEditEvent: false,
    canManageGroups: false
  }
};

export const getPermissionTemplate = (templateName) => {
  return PERMISSION_TEMPLATES[templateName] || PERMISSION_TEMPLATES.limited;
};
