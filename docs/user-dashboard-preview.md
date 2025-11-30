# User Dashboard Preview

## URL: `/dashboard` (when logged in as regular user)

## ASCII Layout

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                    NAVIGATION                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                              PAGE HEADER                                        │
│                                                                                 │
│                           Your Projects                                         │
│                             (h1, bold)                                          │
│                                                                                 │
│          Here's where things stand. Click any project for details.              │
│                            (gray text)                                          │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                           PROJECT CARDS (2-col grid)                            │
│                                                                                 │
│  ┌───────────────────────────────────┐  ┌───────────────────────────────────┐  │
│  │  ┌──────────┐                     │  │  ┌──────────┐                     │  │
│  │  │In Review │  Website Redesign   │  │  │Completed │  Logo Design        │  │
│  │  │  (blue)  │                     │  │  │ (green)  │                     │  │
│  │  └──────────┘                     │  │  └──────────┘                     │  │
│  │                                   │  │                                   │  │
│  │  Standard Task                    │  │  Quick Task                       │  │
│  │  Submitted Dec 15, 2024           │  │  Submitted Nov 28, 2024           │  │
│  │                                   │  │                                   │  │
│  │  "Looking to refresh our company  │  │  "Need a modern logo for my..."   │  │
│  │   website with a modern..."       │  │                                   │  │
│  │                                   │  │  💬 3 comments                    │  │
│  │  💬 2 comments  📎 1 file         │  │                                   │  │
│  │                                   │  │                                   │  │
│  │  border-l: blue-500               │  │  border-l: green-500              │  │
│  │  hover: lift + border glow        │  │  hover: lift + border glow        │  │
│  └───────────────────────────────────┘  └───────────────────────────────────┘  │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                           EMPTY STATE (when no projects)                        │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                           │  │
│  │                              📋                                           │  │
│  │                                                                           │  │
│  │                      Nothing here yet                                     │  │
│  │                        (h2, bold)                                         │  │
│  │                                                                           │  │
│  │       When you're ready to get something done, we'll be here.             │  │
│  │                         (gray text)                                       │  │
│  │                                                                           │  │
│  │       Your projects will show up right here so you can                    │  │
│  │              track progress and stay in the loop.                         │  │
│  │                      (gray-500, smaller)                                  │  │
│  │                                                                           │  │
│  │                    ┌─────────────────────┐                                │  │
│  │                    │  Start a Project    │                                │  │
│  │                    │     (purple)        │                                │  │
│  │                    └─────────────────────┘                                │  │
│  │                                                                           │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│                           BOTTOM CTA (when has projects)                        │
│                                                                                 │
│                    Have another project in mind?                                │
│                          (gray text)                                            │
│                                                                                 │
│                    ┌─────────────────────┐                                      │
│                    │  Start a New One    │                                      │
│                    │      (blue)         │                                      │
│                    └─────────────────────┘                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

| Section | Component | Notes |
|---------|-----------|-------|
| Header | Native elements | h1 + p description |
| Project Cards | ProjectCard | 2-column grid on desktop, 1-column mobile |
| Empty State | Native elements | Centered card with icon, message, CTA |
| Bottom CTA | Button | Only shows when user has projects |

---

## Copy (inviting, supportive tone)

| Element | Text |
|---------|------|
| Header | "Your Projects" |
| Subhead | "Here's where things stand. Click any project for details." |
| Empty Title | "Nothing here yet" |
| Empty Body | "When you're ready to get something done, we'll be here." |
| Empty Secondary | "Your projects will show up right here so you can track progress and stay in the loop." |
| Empty CTA | "Start a Project" |
| Bottom Prompt | "Have another project in mind?" |
| Bottom CTA | "Start a New One" |

---

## Status Messages (shown in project detail modal)

| Status | Message |
|--------|---------|
| Submitted | "We've got it! We'll review this soon and be in touch." |
| In Review | "We're looking this over and figuring out the best approach." |
| Scheduled | "This one's on the calendar. We'll get started soon." |
| In Progress | "We're on it! Check back here for updates." |
| Completed | "All done! Let us know if you need anything else." |

---

## Files Involved

- `app/components/UserDashboard.tsx` - Main dashboard component
- `app/components/ProjectCard.tsx` - Individual project cards
- `app/components/ProjectDetailModal.tsx` - Project detail view
- `app/components/Button.tsx` - CTA buttons

---

## Accessibility

- All interactive elements have focus states
- Color contrast meets 5:1 ratio
- Status badges use both color AND text
- Screen reader friendly structure
