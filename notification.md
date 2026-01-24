# Feature: Notification (Email) Design + Settings Screen

## 6.1 Basic Policy

- [ ] Limit email notifications to **transactional notifications only**
- [ ] Allowed email categories:
  - [ ] Transaction notifications (applications, messages, meeting status changes)
  - [ ] New internship posting / update notifications
    - [ ] Only for internships matching user’s desired industry
- [ ] Do NOT send marketing or announcement emails:
  - [ ] Recommendations
  - [ ] Job summaries
  - [ ] Platform news
- [ ] Reports:
  - [ ] Are NOT automatically notified to the other party
  - [ ] Only operator warnings / enforcement actions trigger notifications

---

## 6.2 Notification Targets (By Role)

### Common Rules
- [ ] All notifications support:
  - [ ] Site notification (in-app)
  - [ ] Email notification
- [ ] Email sending must respect user notification settings

---

### Students (International Students)

- [ ] Internship-related notifications:
  - [ ] Application status changes
  - [ ] Messages related to applications
- [ ] OB visit-related notifications:
  - [ ] Request
  - [ ] Confirm
  - [ ] Cancel
  - [ ] No-Show
  - [ ] Complete
- [ ] Internship posting notifications:
  - [ ] New posting
  - [ ] Posting updates
  - [ ] Only if industry matches student’s desired industry

---

### OB / OG

- [ ] OB visit-related notifications:
  - [ ] Request
  - [ ] Confirm
  - [ ] Cancel
  - [ ] No-Show
  - [ ] Complete

---

### Company

- [ ] Application notification from international students
- [ ] Message notification from international students
- [ ] Notification target condition:
  - [ ] Company status must be "Recruiting"

---

## 6.3 Notification Settings (OB / International Student Common)

### Access
- [ ] Settings location:
  - [ ] Profile → Settings → Notifications

---

### Notification Frequency

- [ ] Provide selectable notification frequency:
  - [ ] Immediate
  - [ ] Weekly summary
  - [ ] Off
- [ ] Weekly summary:
  - [ ] Aggregate eligible notifications
  - [ ] Send once per week (server-controlled timing)

---

### Email Settings

- [ ] Email address input field:
  - [ ] Editable by user
  - [ ] Used as notification destination
- [ ] Email sending toggle:
  - [ ] On / Off
  - [ ] UI may be compact (MVP)
- [ ] If Email = Off:
  - [ ] Still allow site notifications

---

### Late-Night Control (MVP)

- [ ] Implement simple late-night restriction:
  - [ ] Block or delay email sending during late-night hours
  - [ ] No per-user fine-grained schedule required (MVP)
- [ ] Delayed emails:
  - [ ] Sent next allowed time window

---

## Notification Processing Rules

- [ ] All notification events must:
  - [ ] Be role-aware
  - [ ] Respect frequency setting
  - [ ] Respect email on/off toggle
- [ ] Email delivery failures:
  - [ ] Must not block core system operations
  - [ ] Should be logged for operators

---

## Completion Criteria

- [ ] No marketing emails are sent
- [ ] Notification scope matches role definitions
- [ ] User notification preferences are enforced server-side
- [ ] Weekly summary works independently from immediate notifications
- [ ] Admin/operator logs reflect notification dispatch status
