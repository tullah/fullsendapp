import { ratingConfig } from '@/lib/ratings';

export function RatingSystem() {
  const ratingLevels = Object.values(ratingConfig);

  const ratingColors = {
    beginner: ratingLevels[0].color,
    intermediate: ratingLevels[1].color,
    advanced: ratingLevels[2].color,
    expert: ratingLevels[3].color,
    elite: ratingLevels[4].color,
  } as const;

  return (
    <div className="card-base p-5 sm:p-6">
      {/* Centered Rating System Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-medium text-foreground mb-2">Rating System</h2>
        <p className="text-sm sm:text-base text-foreground/60 max-w-2xl mx-auto">
          Our comprehensive player rating system evaluates multiple skills and rewards good sportsmanship.
        </p>
      </div>

      {/* Player Stats and Spirit - Single Column */}
      <div className="space-y-10">
        {/* Player Stats */}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-5 text-center">Player Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {[
              { 
                label: 'Speed',
                desc: 'Quick acceleration and sharp direction changes',
                shortDesc: 'Speed and agility in game',
                icon: '🏃',
                color: ratingColors.beginner,
                level: 'Beginner',
                progress: 1,
                range: '1-20'
              },
              { 
                label: 'Throwing Accuracy',
                desc: 'Consistent throws at all distances under pressure',
                shortDesc: 'Throw control and accuracy',
                icon: '🎯',
                color: ratingColors.intermediate,
                level: 'Intermediate',
                progress: 2,
                range: '21-40'
              },
              { 
                label: 'Field Awareness',
                desc: 'Smart cuts and play anticipation',
                shortDesc: 'Game IQ and positioning',
                icon: '👁️',
                color: ratingColors.advanced,
                level: 'Advanced',
                progress: 3,
                range: '41-60'
              },
              { 
                label: 'Catching Ability',
                desc: 'Reliable catches in contested situations',
                shortDesc: 'Catch success rate',
                icon: '🤲',
                color: ratingColors.expert,
                level: 'Expert',
                progress: 4,
                range: '61-80'
              },
              { 
                label: 'Defense Skills',
                desc: 'Strong marking and defensive pressure',
                shortDesc: 'Defensive effectiveness',
                icon: '🛡️',
                color: ratingColors.elite,
                level: 'Elite',
                progress: 5,
                range: '81-99'
              },
              { 
                label: 'Endurance',
                desc: 'Consistent performance throughout games',
                shortDesc: 'Stamina and recovery',
                icon: '⚡',
                color: ratingColors.advanced,
                level: 'Advanced',
                progress: 3,
                range: '41-60'
              },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="group relative overflow-hidden rounded-xl border border-transparent 
                         hover:border-[#1a73e8]/10 hover:shadow-sm transition-all duration-300"
                style={{ backgroundColor: `${stat.color}05` }}
              >
                {/* Card Header */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-base sm:text-lg
                               group-hover:scale-110 transition-transform duration-300"
                      style={{ 
                        backgroundColor: `${stat.color}15`,
                        color: stat.color 
                      }}
                    >
                      {stat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{stat.label}</div>
                      <div className="text-xs text-foreground/60 truncate">{stat.shortDesc}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spirit System */}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-5 text-center">Spirit System</h3>
          <p className="text-sm text-center text-foreground/60 mb-6 max-w-2xl mx-auto">
            Players earn spirit points through good sportsmanship and fair play, directly boosting their overall rating.
          </p>

          {/* Spirit Levels Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { level: 'Inspiring', score: 4, desc: 'Embodies the highest spirit; fosters a fun, respectful environment' },
              { level: 'Supportive', score: 3, desc: 'Encourages fair play, mediates conflicts positively' },
              { level: 'Honorable', score: 2, desc: 'Competes with integrity, maintains fairness' },
              { level: 'Respectful', score: 1, desc: 'Acknowledges opponents, plays fair' },
              { level: 'Contentious', score: 0, desc: 'Frequently argues calls, lacks sportsmanship' },
            ].map((spirit, i) => (
              <div 
                key={i} 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                    ${i === 0 ? 'bg-[#34a853]/[0.1] text-[#34a853]' :
                      i === 1 ? 'bg-[#1a73e8]/[0.1] text-[#1a73e8]' :
                      i === 2 ? 'bg-[#fbbc04]/[0.1] text-[#fbbc04]' :
                      i === 3 ? 'bg-[#ea4335]/[0.1] text-[#ea4335]' :
                      'bg-[#9334e6]/[0.1] text-[#9334e6]'}`}
                  >
                    {spirit.score}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-sm text-foreground mb-0.5">{spirit.level}</div>
                  <div className="text-xs text-foreground/60 leading-relaxed">{spirit.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 