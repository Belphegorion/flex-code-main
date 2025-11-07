# Quick Start Guide: Event-Based Job System

## 🚀 For Organizers

### Create Your First Event

1. **Go to Dashboard**
   ```
   Navigate to: /organizer
   ```

2. **Click "Create Event"**
   ```
   Navigate to: /events/create
   Fill in:
   - Event title: "Summer Music Festival"
   - Description: "Annual outdoor concert"
   - Dates: June 15-16, 2024
   - Location: "Central Park, NYC"
   - Tickets: 500 @ $50 each
   ```

3. **View Your Event**
   ```
   Dashboard shows: "Summer Music Festival"
   Status: Upcoming
   Click on it → Opens event details
   ```

4. **Add Jobs to Event**
   ```
   On event details page, click "Add Job"
   
   Job 1:
   - Title: "Hand Worker"
   - Description: "General event assistance"
   - Pay: $15/hour
   - Positions: 24
   - Skills: ["Physical Labor", "Teamwork"]
   
   Job 2:
   - Title: "Event Organizer"
   - Description: "Coordinate event activities"
   - Pay: $25/hour
   - Positions: 3
   - Skills: ["Leadership", "Communication"]
   
   Job 3:
   - Title: "Security Staff"
   - Description: "Ensure safety and security"
   - Pay: $20/hour
   - Positions: 5
   - Skills: ["Security", "First Aid"]
   ```

5. **Monitor Progress**
   ```
   Event Details Page shows:
   
   Overall Progress: 0 / 32 workers (0%)
   
   Jobs:
   - Hand Worker: 0 / 24 (0%) [View Applicants]
   - Event Organizer: 0 / 3 (0%) [View Applicants]
   - Security Staff: 0 / 5 (0%) [View Applicants]
   ```

6. **Review Applications**
   ```
   Click "View Applicants" on any job
   Accept/Decline workers
   Progress updates automatically
   ```

7. **Track Hiring Progress**
   ```
   As you accept workers:
   
   Hand Worker: 5 / 24 (21%) 🔵
   Event Organizer: 3 / 3 (100%) ✅
   Security Staff: 2 / 5 (40%) 🔵
   
   Overall: 10 / 32 (31%) 🔵
   ```

---

## 👷 For Workers

### Find and Apply to Jobs

1. **Discover Jobs**
   ```
   Navigate to: /jobs/discover
   See: "Hand Worker" for "Summer Music Festival"
   ```

2. **View Job Details**
   ```
   Click on job
   See:
   - Job description
   - Event: "Summer Music Festival"
   - Dates: June 15-16, 2024
   - Location: Central Park
   - Pay: $15/hour
   - Positions: 19 remaining
   ```

3. **Apply**
   ```
   Click "Apply Now"
   Optional: Add cover letter
   Submit application
   ```

4. **Get Accepted**
   ```
   Notification: "You've been accepted for Hand Worker"
   Automatically added to event group chat
   ```

5. **Join Event Team**
   ```
   Navigate to: /groups
   See: "Summer Music Festival Team"
   Chat with organizer and other workers
   ```

---

## 📊 Progress Bar Colors

- **Red/Orange:** < 50% filled (needs attention)
- **Blue:** 50-99% filled (in progress)
- **Green:** 100% filled (complete) ✅

---

## 🔗 Quick Links

### Organizer
- Dashboard: `/organizer`
- Create Event: `/events/create`
- Event Details: `/events/:eventId`
- Add Job: `/events/:eventId/jobs/create`
- View Applicants: `/jobs/:jobId/applicants`

### Worker
- Discover Jobs: `/jobs/discover`
- Job Details: `/jobs/:jobId`
- My Groups: `/groups`
- Group Chat: `/groups/:groupId`

---

## 🎯 Key Concepts

### Event
- Container for the entire occasion
- Has dates, location, description
- Can have multiple jobs

### Job
- Specific worker role within an event
- Has positions, pay rate, skills
- Workers apply to jobs, not events

### Progress
- **Job Progress:** Filled / Total positions for that job
- **Event Progress:** Sum of all jobs' filled / total

### Group Chat
- One group per event
- Includes ALL workers from ALL jobs
- Event-wide communication

---

## ⚡ Common Tasks

### Add More Jobs to Event
```
1. Go to event details
2. Click "Add Job"
3. Fill form
4. Submit
```

### Edit Job Details
```
1. Go to event details
2. Click "Edit" on job
3. Modify details
4. Save
```

### Delete Job
```
1. Go to event details
2. Click "Delete" on job
3. Confirm (only works if no workers hired)
```

### Accept Multiple Workers
```
1. Go to job applicants page
2. Review each applicant
3. Click "Accept" for qualified workers
4. Progress updates automatically
```

### Create Event Group Chat
```
1. Go to event details
2. Click "Create Group Chat"
3. All hired workers automatically included
4. Start messaging
```

---

## 🐛 Troubleshooting

### Can't delete job
- **Reason:** Job has workers hired
- **Solution:** Remove workers first or keep job

### Progress not updating
- **Reason:** Page not refreshed
- **Solution:** Refresh page or navigate away and back

### Worker not in group chat
- **Reason:** Not accepted yet or group not created
- **Solution:** Accept worker first, then create/add to group

### Job not showing in discover
- **Reason:** Job status not "open"
- **Solution:** Check job status in event details

---

## 📞 Need Help?

1. Check `EVENT_JOB_WORKFLOW.md` for detailed workflow
2. Review `IMPLEMENTATION_SUMMARY.md` for technical details
3. Test with sample data first
4. Verify all routes are configured

---

**Happy Event Planning! 🎉**
