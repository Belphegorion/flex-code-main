# Co-Organizer System Integration Guide

## Quick Start

### Backend Integration

1. **Import Components in Event Pages**:
```jsx
import CoOrganizerManager from '../components/coorganizer/CoOrganizerManager';
import CoOrganizerAnalytics from '../components/coorganizer/CoOrganizerAnalytics';
import ActivityLog from '../components/coorganizer/ActivityLog';
import BulkHireModal from '../components/coorganizer/BulkHireModal';

// In your EventDetails component:
<CoOrganizerManager eventId={eventId} />
<CoOrganizerAnalytics eventId={eventId} />
```

2. **Import Group Hierarchy**:
```jsx
import GroupHierarchy from '../components/groups/GroupHierarchy';

// In your event management page:
<GroupHierarchy eventId={eventId} />
```

3. **Use Profile Image Links**:
```jsx
import ProfileImageLink from '../components/profile/ProfileImageLink';

// Replace any profile image with:
<ProfileImageLink 
  userId={user._id}
  profilePhoto={user.profilePhoto}
  name={user.name}
  size="md"
/>
```

### API Usage Examples

#### Hire Co-Organizer
```javascript
const hireCoOrganizer = async (eventId, userId) => {
  const response = await api.post('/co-organizers/hire', {
    eventId,
    userId,
    template: 'operations' // or custom permissions
  });
  return response;
};
```

#### Bulk Hire
```javascript
const bulkHire = async (eventId, userIds) => {
  const response = await api.post('/co-organizers/bulk-hire', {
    eventId,
    users: userIds,
    template: 'limited'
  });
  return response;
};
```

#### Elevate Worker
```javascript
const elevateWorker = async (eventId, workerId) => {
  const response = await api.post('/co-organizers/elevate', {
    eventId,
    workerId,
    permissions: {
      canHireWorkers: true,
      canManageJobs: true,
      canViewFinancials: false,
      canEditEvent: false,
      canManageGroups: true
    }
  });
  return response;
};
```

#### Create Hierarchical Group
```javascript
const createCoOrganizerGroup = async (eventId, name, participants) => {
  const response = await api.post('/groups', {
    name,
    eventId,
    groupType: 'coorganizer',
    parentGroupId: mainGroupId, // optional
    participants
  });
  return response;
};
```

## Permission Checking

### Backend (in controllers)
```javascript
import { checkCoOrganizerPermission } from '../controllers/coOrganizerController.js';

// Check if user can perform action
const canEdit = await checkCoOrganizerPermission(eventId, userId, 'canEditEvent');
if (!canEdit) {
  return res.status(403).json({ message: 'Insufficient permissions' });
}
```

### Frontend (in components)
```javascript
// Fetch co-organizer status
const checkPermissions = async () => {
  const res = await api.get(`/co-organizers/event/${eventId}`);
  const myCoOrg = res.coOrganizers.find(co => co.userId._id === currentUserId);
  return myCoOrg?.permissions || {};
};
```

## Activity Logging

### Log Co-Organizer Actions
```javascript
import { logCoOrganizerActivity } from '../utils/coOrganizerLogger.js';

// After co-organizer performs action
await logCoOrganizerActivity(
  coOrganizerId,
  eventId,
  'hired_worker',
  { workerId, jobId }
);
```

## Component Props Reference

### CoOrganizerManager
```jsx
<CoOrganizerManager 
  eventId={string}  // Required: Event ID
/>
```

### GroupHierarchy
```jsx
<GroupHierarchy 
  eventId={string}  // Required: Event ID
/>
```

### ProfileImageLink
```jsx
<ProfileImageLink 
  userId={string}        // Required: User ID
  profilePhoto={string}  // Optional: Photo URL
  name={string}          // Required: User name
  size={'sm'|'md'|'lg'|'xl'}  // Optional: Default 'md'
/>
```

### BulkHireModal
```jsx
<BulkHireModal 
  eventId={string}       // Required: Event ID
  onClose={function}     // Required: Close handler
  onSuccess={function}   // Required: Success callback
/>
```

### ActivityLog
```jsx
<ActivityLog 
  coOrganizerId={string}  // Required: Co-organizer ID
/>
```

### CoOrganizerAnalytics
```jsx
<CoOrganizerAnalytics 
  eventId={string}  // Required: Event ID
/>
```

## Enhanced Profile Edit

### Using EnhancedProfileEdit
```jsx
import EnhancedProfileEdit from '../components/profile/EnhancedProfileEdit';

// In profile edit page:
<EnhancedProfileEdit />
```

### Profile Fields Available
- Name
- Bio (500 char limit)
- Location (city, state, country)
- Social Links (LinkedIn, Twitter, Portfolio)

## Enhanced Event Edit

### Using EnhancedEventEdit
```jsx
import EnhancedEventEdit from '../components/events/EnhancedEventEdit';

// In event edit route:
<Route path="/events/:eventId/edit" element={<EnhancedEventEdit />} />
```

## Socket.IO Events

### Listen for Co-Organizer Events
```javascript
import socketService from '../services/socket';

socketService.on('notification', (data) => {
  if (data.type === 'coorganizer') {
    // Handle co-organizer notification
    toast.info(data.message);
  }
});
```

## Permission Templates

### Available Templates
```javascript
const templates = {
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
```

## Common Integration Patterns

### Event Management Page
```jsx
function EventManagement({ eventId }) {
  return (
    <div className="space-y-6">
      <CoOrganizerManager eventId={eventId} />
      <CoOrganizerAnalytics eventId={eventId} />
      <GroupHierarchy eventId={eventId} />
    </div>
  );
}
```

### Worker List with Profile Links
```jsx
function WorkerList({ workers }) {
  return (
    <div className="space-y-2">
      {workers.map(worker => (
        <div key={worker._id} className="flex items-center gap-3">
          <ProfileImageLink 
            userId={worker._id}
            profilePhoto={worker.profilePhoto}
            name={worker.name}
            size="md"
          />
          <span>{worker.name}</span>
        </div>
      ))}
    </div>
  );
}
```

### Conditional Rendering Based on Permissions
```jsx
function EventActions({ eventId, permissions }) {
  return (
    <div className="flex gap-2">
      {permissions.canHireWorkers && (
        <button onClick={handleHire}>Hire Worker</button>
      )}
      {permissions.canEditEvent && (
        <button onClick={handleEdit}>Edit Event</button>
      )}
      {permissions.canManageGroups && (
        <button onClick={handleCreateGroup}>Create Group</button>
      )}
    </div>
  );
}
```

## Troubleshooting

### Issue: Auth middleware not found
**Solution**: Ensure you're importing `{ authenticate }` not `{ auth }`

### Issue: Notifications not appearing
**Solution**: Check socket connection and ensure user is in correct room

### Issue: Tailwind classes not applying
**Solution**: Use static classes, not dynamic template literals

### Issue: useEffect running with null values
**Solution**: Add null checks before API calls

### Issue: Profile images not linking
**Solution**: Ensure userId is not null/undefined

## Best Practices

1. **Always check permissions** before showing UI elements
2. **Use permission templates** for consistency
3. **Log all co-organizer actions** for audit trail
4. **Emit socket events** for real-time updates
5. **Validate eventId** before API calls
6. **Use ProfileImageLink** for all profile images
7. **Check null values** in all components
8. **Add ESLint comments** for known dependency issues

## Performance Tips

1. **Cache co-organizer list** to reduce API calls
2. **Use lean queries** in backend for better performance
3. **Implement pagination** for large activity logs
4. **Debounce bulk operations** to prevent spam
5. **Use indexes** on frequently queried fields

## Security Considerations

1. **Always verify permissions** on backend
2. **Main organizer override** for all operations
3. **Validate user IDs** before operations
4. **Check event ownership** before modifications
5. **Sanitize user inputs** in bulk operations

---

**Status**: Ready for Production ✅
**Last Updated**: 2024
**Version**: 1.0.0
