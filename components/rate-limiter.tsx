import { useState, useEffect } from 'react';
import { AlertCircle, Clock, Gauge } from 'lucide-react';
import { formatTokenCount } from '@/lib/token-counter';

interface RateLimiterProps {
  isGenerating: boolean;
  requestCount: number;
  dailyRequestCount: number;
  currentTokenCount: number;
  dailyTokenCount: number;
}

export function RateLimiter({
  isGenerating,
  requestCount,
  dailyRequestCount,
  currentTokenCount,
  dailyTokenCount
}: RateLimiterProps) {
  const [timeUntilReset, setTimeUntilReset] = useState(0);
  const MAX_REQUESTS = 5;
  const MAX_INPUT_TOKENS = 20000;
  const MAX_OUTPUT_TOKENS = 4000;
  const RESET_INTERVAL = 60; // seconds

  useEffect(() => {
    if (requestCount >= MAX_REQUESTS) {
      const interval = setInterval(() => {
        setTimeUntilReset(prev => Math.max(0, prev - 1));
      }, 1000);

      setTimeUntilReset(RESET_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [requestCount]);

  if (requestCount < MAX_REQUESTS && !isGenerating) return null;

  return (
    <div className="mt-4 space-y-2 text-sm">
      <div className="flex items-center gap-4">
        {/* Per Minute Limits */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>
            {`${MAX_REQUESTS - requestCount}/${MAX_REQUESTS} requests/min`}
          </span>
        </div>
        
        {/* Daily Limits */}
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>
            {`${MAX_REQUESTS - dailyRequestCount}/${MAX_REQUESTS} requests today`}
          </span>
        </div>
      </div>

      {/* Token Usage */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4" />
          <span>
            {`${formatTokenCount(currentTokenCount)}/${formatTokenCount(MAX_INPUT_TOKENS)} tokens/min`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4" />
          <span>
            {`${formatTokenCount(dailyTokenCount)}/${formatTokenCount(MAX_OUTPUT_TOKENS)} tokens today`}
          </span>
        </div>
      </div>
    </div>
  );
} 