# Ultimate Frisbee Player Rankings

A comprehensive web application for managing and tracking Ultimate Frisbee player rankings, stats, and disputes. This platform enables the Ultimate Frisbee community to maintain transparent player ratings while upholding the Spirit of the Game.

## Features

### Player Management
- View comprehensive player list with search and filtering
- Detailed player profiles with stat breakdowns
- Add new players with initial ratings
- Real-time search functionality with URL persistence
- Mobile-responsive player cards with rating visualizations

### Rating System
Each player is rated across seven key attributes:
- Speed (1-99): Acceleration, sprint speed, and field coverage
- Throwing (1-99): Accuracy, distance, and variety of throws
- Awareness (1-99): Field sense, strategic positioning, and decision-making
- Catching (1-99): Reliability, range, and aerial ability
- Defense (1-99): Marking, positioning, and defensive reads
- Endurance (1-99): Stamina and sustained performance
- Spirit of the Game (0-4): Sportsmanship and fair play rating

### Dispute System
- Submit rating disputes with detailed justification
- Propose new ratings for any player attribute
- Admin review interface for dispute management
- Dispute status tracking (Pending/Approved/Rejected)
- Historical dispute records

### Rating Classifications
**Skill Ratings (1-99)**
- 1-20: Beginner - New to the sport
- 21-40: Novice - Basic understanding and execution
- 41-60: Intermediate - Consistent performance
- 61-80: Expert - Advanced techniques and strategy
- 81-99: Elite - Exceptional skill and mastery

**Spirit Ratings (0-4)**
0. Contentious: Poor sportsmanship, frequent disputes
1. Respectful: Basic sportsmanship with occasional issues
2. Honorable: Consistent fair play and conflict resolution
3. Supportive: Promotes positive game environment
4. Inspiring: Exemplary spirit and leadership

## Technical Implementation

### Frontend
- Next.js 14 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- Custom UI components with Google Material Design influence
- Responsive design with mobile-first approach
- Client-side form validation
- Error boundary implementation
- Loading states and optimistic updates

### Backend & Database
- Supabase for backend services
  - PostgreSQL database
  - Row Level Security (RLS)
  - Real-time subscriptions
  - Authentication and authorization
  - Secure API endpoints

### Database Schema

#### Players Table
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  speed INTEGER CHECK (speed BETWEEN 1 AND 99),
  throwing INTEGER CHECK (throwing BETWEEN 1 AND 99),
  awareness INTEGER CHECK (awareness BETWEEN 1 AND 99),
  catching INTEGER CHECK (catching BETWEEN 1 AND 99),
  defense INTEGER CHECK (defense BETWEEN 1 AND 99),
  endurance INTEGER CHECK (endurance BETWEEN 1 AND 99),
  spirit INTEGER CHECK (spirit BETWEEN 0 AND 4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Disputes Table
```sql
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID REFERENCES players(id),
  status VARCHAR(20) CHECK (status IN ('pending', 'approved', 'rejected')),
  reason TEXT NOT NULL,
  current_rating JSONB,
  proposed_speed INTEGER CHECK (proposed_speed BETWEEN 1 AND 99),
  proposed_throwing INTEGER CHECK (proposed_throwing BETWEEN 1 AND 99),
  proposed_awareness INTEGER CHECK (proposed_awareness BETWEEN 1 AND 99),
  proposed_catching INTEGER CHECK (proposed_catching BETWEEN 1 AND 99),
  proposed_defense INTEGER CHECK (proposed_defense BETWEEN 1 AND 99),
  proposed_endurance INTEGER CHECK (proposed_endurance BETWEEN 1 AND 99),
  proposed_spirit INTEGER CHECK (proposed_spirit BETWEEN 0 AND 4),
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

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

## Development Practices
- Type-safe development with TypeScript
- Component-based architecture
- CSS-in-JS with Tailwind
- Version control with Git
- Continuous deployment
- Error boundary implementation
- Performance optimization

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase environment variables
4. Run development server: `npm run dev`
5. Access the application at `localhost:3000`

## Contributing
Contributions are welcome! Please read our contributing guidelines and submit pull requests for any enhancements.

## License
This project is licensed under the MIT License - see the LICENSE file for details.