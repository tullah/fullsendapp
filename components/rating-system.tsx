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
    <div className="card-base p-4 sm:p-6">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-medium text-foreground mb-2">Rating System</h2>
        <p className="text-sm sm:text-base text-foreground/60 max-w-2xl mx-auto">
          A skill-based rating system that rewards both performance and sportsmanship.
        </p>
      </div>

      <div className="space-y-8 sm:space-y-10">
        {/* Player Stats */}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4 sm:mb-5 text-center">Player Stats</h3>
          
          {/* Rating Scale */}
          <div className="mb-6 px-2 sm:px-4">
            {/* Numbers - Now in a grid to match the sections below */}
            <div className="grid grid-cols-5 text-center gap-1 mb-2">
              <div className="text-[10px] sm:text-xs text-foreground/60">1-20</div>
              <div className="text-[10px] sm:text-xs text-foreground/60">21-40</div>
              <div className="text-[10px] sm:text-xs text-foreground/60">41-60</div>
              <div className="text-[10px] sm:text-xs text-foreground/60">61-80</div>
              <div className="text-[10px] sm:text-xs text-foreground/60">81-99</div>
            </div>
            {/* Scale Bar */}
            <div className="h-2 rounded-full bg-gray-100 flex">
              <div className="w-1/5 h-full rounded-l-full" style={{ backgroundColor: ratingConfig.beginner.color }}></div>
              <div className="w-1/5 h-full" style={{ backgroundColor: ratingConfig.developing.color }}></div>
              <div className="w-1/5 h-full" style={{ backgroundColor: ratingConfig.competitive.color }}></div>
              <div className="w-1/5 h-full" style={{ backgroundColor: ratingConfig.expert.color }}></div>
              <div className="w-1/5 h-full rounded-r-full" style={{ backgroundColor: ratingConfig.worldClass.color }}></div>
            </div>
            {/* Labels */}
            <div className="grid grid-cols-5 text-center gap-1 mt-2">
              <span className="text-[10px] sm:text-xs font-medium truncate" style={{ color: ratingConfig.beginner.color }}>Beginner</span>
              <span className="text-[10px] sm:text-xs font-medium truncate" style={{ color: ratingConfig.developing.color }}>Developing</span>
              <span className="text-[10px] sm:text-xs font-medium truncate" style={{ color: ratingConfig.competitive.color }}>Competitive</span>
              <span className="text-[10px] sm:text-xs font-medium truncate" style={{ color: ratingConfig.expert.color }}>Expert</span>
              <span className="text-[10px] sm:text-xs font-medium truncate" style={{ color: ratingConfig.worldClass.color }}>World Class</span>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {[
              { 
                label: 'Speed',
                desc: 'Quick acceleration and sharp direction changes',
                shortDesc: 'Speed and agility in game',
                icon: '🏃',
                color: ratingColors.beginner,
              },
              { 
                label: 'Throwing Accuracy',
                desc: 'Consistent throws at all distances under pressure',
                shortDesc: 'Throw control and accuracy',
                icon: '🎯',
                color: ratingColors.intermediate,
              },
              { 
                label: 'Field Awareness',
                desc: 'Smart cuts and play anticipation',
                shortDesc: 'Game IQ and positioning',
                icon: '👁️',
                color: ratingColors.advanced,
              },
              { 
                label: 'Catching Ability',
                desc: 'Reliable catches in contested situations',
                shortDesc: 'Catch success rate',
                icon: '🤲',
                color: ratingColors.expert,
              },
              { 
                label: 'Defense Skills',
                desc: 'Strong marking and defensive pressure',
                shortDesc: 'Defensive effectiveness',
                icon: '🛡️',
                color: ratingColors.elite,
              },
              { 
                label: 'Endurance',
                desc: 'Consistent performance throughout games',
                shortDesc: 'Stamina and recovery',
                icon: '⚡',
                color: ratingColors.advanced,
              },
            ].map((stat, i) => (
              <div 
                key={i} 
                className="group relative overflow-hidden rounded-xl border border-transparent 
                         hover:border-[#1a73e8]/10 hover:shadow-sm transition-all duration-300"
                style={{ backgroundColor: `${stat.color}05` }}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg
                               group-hover:scale-110 transition-transform duration-300"
                      style={{ 
                        backgroundColor: `${stat.color}15`,
                        color: stat.color 
                      }}
                    >
                      {stat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">{stat.label}</div>
                      <div className="text-xs text-foreground/60 mt-0.5">{stat.shortDesc}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spirit System */}
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4 sm:mb-5 text-center">Spirit System</h3>
          <p className="text-sm text-center text-foreground/60 mb-5 max-w-2xl mx-auto">
            Players earn spirit points through good sportsmanship and fair play, directly boosting their overall rating.
          </p>

          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { level: 'Inspiring', score: 4, desc: 'Embodies the highest spirit; fosters a fun, respectful environment' },
              { level: 'Supportive', score: 3, desc: 'Encourages fair play, mediates conflicts positively' },
              { level: 'Honorable', score: 2, desc: 'Competes with integrity, maintains fairness' },
              { level: 'Respectful', score: 1, desc: 'Acknowledges opponents, plays fair' },
              { level: 'Contentious', score: 0, desc: 'Frequently argues calls, lacks sportsmanship' },
            ].map((spirit, i) => (
              <div 
                key={i} 
                className="flex items-start gap-3 p-4 rounded-lg hover:bg-secondary/20 transition-colors"
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
                  <div className="font-medium text-sm text-foreground mb-1">{spirit.level}</div>
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