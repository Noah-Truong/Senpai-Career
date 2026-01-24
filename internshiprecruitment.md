# Feature: Internship Recruitment Management (Company Profile)

## 7.1 Recruitment Creation & Editing

- [ ] Allow recruitment creation within **Company Profile**
- [ ] Allow recruitment editing within **Company Profile**
- [ ] Recruitment is owned by:
  - [ ] Company
  - [ ] Specific company account (department / internship unit)

---

## 7.2 Job Status Management

- [ ] Implement job status enum:
  - [ ] Public
  - [ ] Stopped

### Status Behavior
- [ ] Public:
  - [ ] Visible to students
  - [ ] Appears in search / listing
- [ ] Stopped:
  - [ ] Hidden from students
  - [ ] Data is retained
  - [ ] Still visible to company internally
- [ ] Purpose:
  - [ ] Maintain list thickness
  - [ ] Allow future reactivation

---

## 7.3 MVP Structural Premises

- [ ] Allow **multiple company accounts under one company**
  - [ ] Accounts may represent:
    - [ ] Departments
    - [ ] Internship programs
- [ ] Each account can:
  - [ ] Create its own recruitment posts
- [ ] No hard limitation on account count (MVP)

---

## 7.4 Post-Application Communication

- [ ] All post-application communication is **chat-based**
- [ ] Chat is shared between:
  - [ ] International student
  - [ ] Company account
- [ ] Selection status management:
  - [ ] Explicitly omitted in MVP
  - [ ] No pass/fail/status pipeline required

---

## Completion Criteria (Recruitment)

- [ ] Recruitment CRUD works per company account
- [ ] Public/Stopped status is enforced server-side
- [ ] Students cannot access stopped recruitments
- [ ] Chat is the only post-application interaction surface

---