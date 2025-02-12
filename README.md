# Ultimate Frisbee Player Rankings (MVP)

A responsive web application for managing Ultimate Frisbee player rankings.

## Core Features (MVP)

### Player Management
- View player list
- Search players
- View player stats

### Rating System
- Speed (1-99)
- Throwing (1-99)
- Awareness (1-99)
- Catching (1-99)
- Defense (1-99)
- Endurance (1-99)
- Spirit of the Game (0-4)

### Contest System
- View pending contests
- Admin review interface
- Approve/Reject contests
- Contest status tracking

### Rating Labels
- 1-20: Beginner
- 21-40: Novice
- 41-60: Intermediate
- 61-80: Expert
- 81-99: Elite

### Spirit Rating Labels
0. Contentious – Frequently argues calls, lacks sportsmanship, and does not uphold the Spirit of the Game.
1. Respectful – Acknowledges opponents, plays fair, but may still have minor disputes.
2. Honorable – Competes with integrity, maintains fairness, and resolves conflicts amicably.
3. Supportive – Encourages fair play, mediates conflicts, and uplifts teammates and opponents.
4. Inspiring – Embodies the highest spirit; fosters a fun, respectful, and positive game environment.

## Technical Stack (MVP)

### Core
- Next.js 15.1.7
- TypeScript
- App Router

### UI
- Tailwind CSS
- Shadcn/ui
- Next-themes (dark mode)

### Backend
- Supabase
  - Authentication
  - Database
  - Row Level Security
  - Real-time subscriptions

## Responsive Design

### Mobile
- Single column layout
- Hamburger menu
- Full-width cards
- Touch-friendly inputs

### Tablet/Desktop
- Multi-column layout
- Horizontal navigation
- Grid layouts
- Keyboard-optimized inputs

## Database Schema (MVP)

### Players
- id (primary key)
- name
- speed (1-99)
- throwing (1-99)
- awareness (1-99)
- catching (1-99)
- defense (1-99)
- endurance (1-99)
- spirit (0-4)
- created_at

### Contests
- id (primary key)
- player_id (foreign key)
- proposed_stats (json)
- contest_notes
- contest_status (pending/approved/rejected)
- submitted_at

## MVP Pages

### 1. Player List Page (/players)
- Server-side rendered list/grid view
- Client-side search
- Player cards with stats
- Responsive grid layout

### 2. Contest Review Page (/admin/contests)
- Protected route (Supabase Auth)
- Server-side rendered contest list
- Approve/Reject actions
- Real-time updates
- Basic stat comparison

### 3. Player Detail Page (/players/[id])
- Individual player stats
- Contest history
- Stat visualization

## Future Enhancements
- Add/Edit players
- Contest submission
- Advanced filtering
- User profiles
- Contest history
- Analytics dashboard
- API endpoints for external integrations