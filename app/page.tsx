import Link from 'next/link';
import { RatingSystem } from '@/components/rating-system';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col p-4 sm:p-6">
      <div className="max-w-5xl mx-auto w-full">
        {/* Centered Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-medium text-foreground mb-3">
            FullSend Rankings
          </h1>
          <p className="text-base sm:text-lg text-foreground/60 max-w-2xl mx-auto">
            Track and analyze Ultimate Frisbee player performance with comprehensive statistics and ratings.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 mb-10">
          <Link 
            href="/players" 
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1a73e8]/5 via-[#4285f4]/5 to-[#34a853]/5 
                     hover:shadow-lg transition-all duration-300 p-1"
          >
            <div className="relative p-5 sm:p-6 rounded-lg bg-white/80 backdrop-blur-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#1a73e8]/10 flex items-center justify-center text-xl
                             group-hover:scale-110 transition-transform duration-300">
                  🏆
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-medium text-[#1a73e8] mb-2">Player Rankings</h2>
                  <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
                    Explore comprehensive player statistics, performance metrics, and detailed rankings.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#1a73e8]/80">
                <span className="font-medium">View Rankings</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>

          <Link 
            href="/admin/disputes" 
            className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-[#34a853]/5 via-[#fbbc04]/5 to-[#ea4335]/5 
                     hover:shadow-lg transition-all duration-300 p-1"
          >
            <div className="relative p-5 sm:p-6 rounded-lg bg-white/80 backdrop-blur-sm">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#34a853]/10 flex items-center justify-center text-xl
                             group-hover:scale-110 transition-transform duration-300">
                  ⚖️
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-medium text-[#34a853] mb-2">Review Rating Disputes</h2>
                  <p className="text-sm sm:text-base text-foreground/60 leading-relaxed">
                    Evaluate player rating disputes with our transparent, community-driven review process.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#34a853]/80">
                <span className="font-medium">Review Disputes</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Rating System Component */}
        <RatingSystem />

        {/* Rating Review System - Google Style */}
        <div className="card-base p-3 sm:p-5 md:p-6 mt-4 sm:mt-6">
          <div className="text-center mb-6 sm:mb-10">
            <div className="inline-flex items-center justify-center w-12 sm:w-14 h-12 sm:h-14 rounded-2xl bg-[#1a73e8]/10 mb-3 sm:mb-4 rotate-12 hover:rotate-0 transition-all duration-300">
              <span className="text-2xl sm:text-3xl">⚖️</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-medium text-[#1a73e8] mb-2">Want to Dispute Your Rating?</h2>
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-xs sm:text-sm md:text-base text-foreground/60 max-w-2xl mx-auto px-1">
                Think your rating doesn't reflect your true skills? We've made it easy to request a review.
              </p>
              <p className="text-xs sm:text-sm text-[#34a853] font-medium">
                Our community-driven process ensures fair and transparent evaluations
              </p>
            </div>
          </div>

          {/* Process Cards - More compact on mobile */}
          <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-3 mb-6 sm:mb-10">
            {[
              {
                title: "Share Your Story",
                desc: "Tell us about your ultimate journey",
                icon: "📝",
                color: "#1a73e8"
              },
              {
                title: "Community Review",
                desc: "Get feedback from fellow players",
                icon: "🤝",
                color: "#34a853"
              },
              {
                title: "Rating Update",
                desc: "See your rating reflect your growth",
                icon: "🌟",
                color: "#fbbc04"
              }
            ].map((step, i) => (
              <div 
                key={i} 
                className="group p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-300 hover:shadow-lg"
                style={{ backgroundColor: `${step.color}08` }}
              >
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center text-xl sm:text-2xl mb-3 sm:mb-4 transition-transform group-hover:scale-110 duration-300"
                  style={{ backgroundColor: `${step.color}15`, color: step.color }}
                >
                  {step.icon}
                </div>
                <h3 className="text-sm sm:text-base font-medium mb-1 sm:mb-2" style={{ color: step.color }}>
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-foreground/60">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Requirements - More compact on mobile */}
          <div className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-2 mb-6 sm:mb-10">
            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#34a853]/[0.03] border border-[#34a853]/10">
              <h3 className="text-sm sm:text-base font-medium text-[#34a853] mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-lg sm:text-xl">🎮</span> Ways to Show Your Skills
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  "Share game highlights or clips",
                  "Recent tournament results",
                  "Team captain or peer feedback",
                  "Any relevant game experience",
                ].map((item, i) => (
                  <li className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#34a853]/10 flex items-center justify-center text-[#34a853]">
                      ✓
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-[#fbbc04]/[0.03] border border-[#fbbc04]/10">
              <h3 className="text-sm sm:text-base font-medium text-[#fbbc04] mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-lg sm:text-xl">🎯</span> Review Guidelines
              </h3>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  "30-day cool-down between reviews",
                  "Up to ±25 rating adjustment",
                  "Spirit bonus can be earned",
                  "All game levels considered",
                ].map((item, i) => (
                  <li className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#fbbc04]/10 flex items-center justify-center text-[#fbbc04]">
                      ✓
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Coming Soon - More compact on mobile */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-[#1a73e8]/5 via-[#34a853]/5 to-[#fbbc04]/5">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-medium text-[#1a73e8]">Community Review Program</h3>
              <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-[#1a73e8]/10 text-[#1a73e8] text-[10px] sm:text-xs font-medium whitespace-nowrap ml-2">
                Coming Soon
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-foreground/60 mb-6 sm:mb-8">
              Join our community of reviewers! Help others grow while earning rewards and recognition.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
              {[
                { label: "Review Games", icon: "🎯", color: "#1a73e8" },
                { label: "Earn Points", icon: "⭐", color: "#34a853" },
                { label: "Give Feedback", icon: "💭", color: "#fbbc04" },
                { label: "Get Rewards", icon: "🎁", color: "#ea4335" },
              ].map((feature, i) => (
                <div 
                  key={i} 
                  className="text-center p-3 sm:p-4 rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-md"
                  style={{ backgroundColor: `${feature.color}08` }}
                >
                  <div className="text-xl sm:text-2xl mb-1.5 sm:mb-2">{feature.icon}</div>
                  <div className="text-[10px] sm:text-xs font-medium" style={{ color: feature.color }}>
                    {feature.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}