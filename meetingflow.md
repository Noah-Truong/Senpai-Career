# Feature: Meeting Flow (OB Visit)

## 5.1 Basic Design

- [ ] Do NOT create a new page for OB meetings
- [ ] Implement a single **"Meeting Status (System Block)"** inside the chat UI
  - [ ] Render as a system message
  - [ ] Place operation buttons on the **left side of the message input box**
- [ ] Ensure all scheduling communication happens via chat messages
- [ ] Meeting Status Block must update in-place (no duplicate blocks)

---

## 5.2 Meeting Status Items

- [ ] Add editable fields inside Meeting Status Block:
  - [ ] Date / Time (text input)
  - [ ] Meeting URL (string, no validation beyond URL format)
- [ ] Add meeting status enum:
  - [ ] Unconfirmed (default)
  - [ ] Confirmed
  - [ ] Completed
  - [ ] Cancelled
  - [ ] No-Show
- [ ] Status changes must be logged with:
  - [ ] User ID
  - [ ] Timestamp
  - [ ] Operation type

---

## 5.3 Terms Agreement (Required Before Confirmation)

### Display Rules
- [ ] Block "Confirm Meeting" action until terms are accepted
- [ ] Display terms to **both International Student and OB/OG**
- [ ] Require:
  - [ ] Checkbox: "I agree"
  - [ ] Submit button
- [ ] Confirmation is impossible without submission

### Common Terms (Both Parties)
- [ ] Prohibit non-career/job-hunting usage
- [ ] Prohibit exchange of contact information (default)
- [ ] Prohibit meetings after 10 PM
- [ ] Prohibit meetings involving alcohol
- [ ] Prohibit private rooms outside offices
- [ ] Recommend open cafes / office meeting rooms
- [ ] Prohibit recording / screenshots / SNS posting
- [ ] Prohibit religious / business solicitation

### Additional Terms – International Students
- [ ] Warn that professionals are busy
- [ ] Explicitly prohibit no-shows without notice

### Additional Terms – OB/OG
- [ ] Prohibit poaching
- [ ] Prohibit off-platform recruitment
- [ ] State penalty:
  - [ ] ¥400,000 billed to company + HR if violation is discovered
- [ ] Instruct to contact platform company for hiring interest

---

## 5.4 Meeting Confirmation & Post-Processing Rules

### Pre-Confirmation
- [ ] "Meeting scheduled (pre-confirmation)" is considered agreed by both parties
- [ ] Both parties may operate status changes

### Post-Meeting Operations
- [ ] Either party can independently mark:
  - [ ] Completed
  - [ ] No-Show

### Resolution Logic
- [ ] If A = Complete AND B = Complete → Status = Completed
- [ ] If A = Complete AND B = No Operation → Status = Completed
  - [ ] Allow B to rate/report later
- [ ] If B = No-Show AND A = Report → Flag for operator review
- [ ] If both parties perform no operation:
  - [ ] Show system notification:
    - "Did the meeting take place? Currently no operation"

---

## 5.5 Evaluation Form

- [ ] Trigger evaluation form immediately when user clicks "Complete"
- [ ] Evaluation form requirements:
  - [ ] Rating (1–5)
  - [ ] Report link
- [ ] Form submission is mandatory (cannot skip)
- [ ] Reports:
  - [ ] Are NOT automatically notified to the other party
  - [ ] Only operator actions/warnings are notified

---

## 5.6 Additional Question (International Students Only)

### Trigger Condition
- [ ] Show only after meeting is marked "Complete"
- [ ] Show only for International Student role

### Question
- [ ] "During the meeting, were you offered to apply, interview, exchange contact info, or scouted outside the platform?"
- [ ] Answer options:
  - [ ] Yes
  - [ ] No

### If Answer = Yes
- [ ] Show multi-select options:
  - [ ] Offered to exchange contact information
  - [ ] Guided to internship / new grad position
  - [ ] Guided to external channels (company site / LINE / WeChat)
  - [ ] Other (free text)
- [ ] Evidence input:
  - [ ] Optional screenshot upload
  - [ ] Optional text description

### After Submission
- [ ] Do NOT notify the other party
- [ ] Flag record as:
  - [ ] "Requires Review"
- [ ] Display flagged records only in admin/operator panel

---

## Completion Criteria

- [ ] All meeting lifecycle actions are logged
- [ ] All rule enforcement is server-side validated
- [ ] No confirmation possible without accepted terms
- [ ] Admin panel reflects flagged reports correctly
