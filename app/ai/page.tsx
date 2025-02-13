"use client";

import { useState, useEffect, Suspense } from "react";
import { Bot, Users, Sparkles, ArrowRight, Search, Plus, X, Loader2, AlertCircle, Clock, Code } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { SearchInput } from "@/components/search-input";
import { RatingFilter } from "@/components/rating-filter";
import { calculateOverallRating } from "@/lib/utils";
import { RateLimiter } from "@/components/rate-limiter";
import { estimateTokens } from "@/lib/token-counter";
import { JsonViewer } from "@/components/json-viewer";

type Player = Database["public"]["Tables"]["players"]["Row"];

interface TeamAssignment {
  player_name: string;
  team: 1 | 2;
  overall_rating: number;
  role: "Handler" | "Receiver" | "Utility";
}

interface TeamCreationPlayer {
  players: {
    name: string;
  };
  speed: number;
  throwing: number;
  awareness: number;
  catching: number;
  defense: number;
  endurance: number;
  spirit: number;
}

// Update rate limits for GPT-4-mini
const RATE_LIMITS = {
  REQUESTS_PER_MINUTE: 3,
  REQUESTS_PER_DAY: 200,
  TOKENS_PER_MINUTE: 60000,
  TOKENS_PER_DAY: 200000,
  RESET_INTERVAL: 60000, // 1 minute in milliseconds
};

function AIPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [teamAssignments, setTeamAssignments] = useState<TeamAssignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requestCount, setRequestCount] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(Date.now());
  const [inputTokens, setInputTokens] = useState(0);
  const [outputTokens, setOutputTokens] = useState(0);
  const [currentTokenCount, setCurrentTokenCount] = useState(0);
  const [promptString, setPromptString] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const supabase = createClientComponentClient<Database>();

  // Add daily tracking
  const [dailyRequestCount, setDailyRequestCount] = useState(0);
  const [dailyTokenCount, setDailyTokenCount] = useState(0);

  // Fetch all players
  useEffect(() => {
    const fetchPlayers = async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching players:', error);
        return;
      }

      setPlayers(data);
      setIsLoading(false);
    };

    fetchPlayers();
  }, [supabase]);

  // Filter players based on search and rating
  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (ratingFilter) {
      const [min, max] = ratingFilter.split('-').map(Number);
      const rating = calculateOverallRating(player);
      return rating >= min && rating <= max;
    }

    return true;
  });

  // Add this function to estimate tokens for a player
  const estimatePlayerTokens = (player: TeamCreationPlayer) => {
    const playerString = `${player.players.name}:
     Speed: ${player.speed}
     Throwing: ${player.throwing}
     Awareness: ${player.awareness}
     Catching: ${player.catching}
     Defense: ${player.defense}
     Endurance: ${player.endurance}
     Spirit: ${player.spirit}`;
    
    return estimateTokens(playerString);
  };

  // Update addPlayer function
  const addPlayer = async (player: Player) => {
    if (selectedPlayers.length >= 30) {
      alert("Maximum 30 players allowed");
      return;
    }

    if (selectedPlayers.find(p => p.id === player.id)) {
      return;
    }

    // Build player string
    const playerString = `${player.name}
    Speed: ${player.speed}
    Throwing: ${player.throwing}
    Awareness: ${player.awareness}
    Catching: ${player.catching}
    Defense: ${player.defense}
    Endurance: ${player.endurance}
    Spirit: ${player.spirit}
    Overall: ${Math.round((player.speed + player.throwing + player.awareness + 
              player.catching + player.defense + player.endurance) / 6 + player.spirit)}`;

    // Check token limit
    const newTokenCount = estimateTokens(promptString + playerString);
    if (newTokenCount > RATE_LIMITS.TOKENS_PER_MINUTE) {
      setError('Adding this player would exceed the token limit');
      return;
    }

    setSelectedPlayers([...selectedPlayers, player]);
    setPromptString(prev => prev + (prev ? '\n\n' : '') + playerString);
    setCurrentTokenCount(newTokenCount);
  };

  // Update removePlayer function
  const removePlayer = async (playerId: string) => {
    const player = selectedPlayers.find(p => p.id === playerId);
    if (!player) return;

    // Rebuild prompt string without this player
    const updatedPlayers = selectedPlayers.filter(p => p.id !== playerId);
    const newPromptString = updatedPlayers.map(p => 
      `${p.name}
    Speed: ${p.speed}
    Throwing: ${p.throwing}
    Awareness: ${p.awareness}
    Catching: ${p.catching}
    Defense: ${p.defense}
    Endurance: ${p.endurance}
    Spirit: ${p.spirit}
    Overall: ${Math.round((p.speed + p.throwing + p.awareness + 
              p.catching + p.defense + p.endurance) / 6 + p.spirit)}`
    ).join('\n\n');

    setSelectedPlayers(updatedPlayers);
    setPromptString(newPromptString);
    setCurrentTokenCount(estimateTokens(newPromptString));
  };

  // Update clearAllPlayers
  const clearAllPlayers = () => {
    setSelectedPlayers([]);
    setPromptString('');
    setCurrentTokenCount(0);
    setAiResponse('');
  };

  // Add to useEffect for daily reset
  useEffect(() => {
    const resetDaily = () => {
      const now = new Date();
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        setDailyRequestCount(0);
        setDailyTokenCount(0);
      }
    };

    const interval = setInterval(resetDaily, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Update checkRateLimit
  const checkRateLimit = () => {
    const now = Date.now();
    if (now - lastRequestTime >= RATE_LIMITS.RESET_INTERVAL) {
      setRequestCount(0);
      setInputTokens(0);
      setOutputTokens(0);
    }

    if (requestCount >= RATE_LIMITS.REQUESTS_PER_MINUTE) {
      throw new Error('Rate limit reached. Please wait a minute before trying again.');
    }
    if (dailyRequestCount >= RATE_LIMITS.REQUESTS_PER_DAY) {
      throw new Error('Daily request limit reached. Please try again tomorrow.');
    }
    if (currentTokenCount > RATE_LIMITS.TOKENS_PER_MINUTE) {
      throw new Error('Token limit reached. Please wait a minute.');
    }
    if (dailyTokenCount >= RATE_LIMITS.TOKENS_PER_DAY) {
      throw new Error('Daily token limit reached. Please try again tomorrow.');
    }
  };

  const generateTeams = async () => {
    try {
      checkRateLimit();
      setIsGenerating(true);
      setError(null);
      setAiResponse('');

      // Add instructions to the prompt
      const fullPrompt = `Create two balanced teams from these players:\n\n${promptString}\n\nEnsure teams have similar total ratings.`;

      const response = await fetch('/api/generate-teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptString: fullPrompt })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate teams');
      }

      // Store and display the response
      setAiResponse(JSON.stringify(data, null, 2));
      if (data.teams) {
        setTeamAssignments(data.teams);
      }

      // Update rate limiting
      setRequestCount(prev => prev + 1);
      setDailyRequestCount(prev => prev + 1);
      setLastRequestTime(Date.now());

    } catch (err) {
      console.error('Error generating teams:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate teams');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-6 sm:mb-8 px-4">
          <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 
                          rounded-2xl bg-[#fbbc04]/10 mb-4 sm:mb-6 rotate-6 hover:rotate-0 
                          transition-all duration-300">
            <Bot className="w-6 sm:w-8 h-6 sm:h-8 text-[#fbbc04]" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium text-foreground mb-3 sm:mb-4">
            FullSend.AI
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-foreground/60 
                        max-w-2xl mx-auto px-4">
            Create balanced Ultimate teams using AI-powered matchmaking.
          </p>
        </div>

        {/* Features Grid - Updated to be more subtle */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 sm:mb-8 px-4">
          {[
            {
              title: "Smart Balancing",
              desc: "AI-powered even matchmaking",
              icon: <Sparkles className="w-4 h-4" />,
              color: "#1a73e8"
            },
            {
              title: "Team Chemistry",
              desc: "Considers player synergies",
              icon: <Users className="w-4 h-4" />,
              color: "#34a853"
            },
            {
              title: "Quick Setup",
              desc: "Generate teams in seconds",
              icon: <ArrowRight className="w-4 h-4" />,
              color: "#fbbc04"
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className="group relative overflow-hidden rounded-lg bg-white border border-[#dadce0]/30
                       hover:border-[#1a73e8]/20 transition-all duration-300"
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-7 h-7 rounded-md flex items-center justify-center
                             group-hover:scale-110 transition-transform duration-300"
                    style={{ 
                      backgroundColor: `${feature.color}10`,
                      color: feature.color
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-medium" style={{ color: feature.color }}>
                    {feature.title}
                  </h3>
                </div>
                <p className="text-xs text-foreground/50">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Player Selection */}
        <div className="card-base p-3 sm:p-4 mx-4">
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <h2 className="text-lg font-medium mb-1">Select Players</h2>
              <p className="text-xs sm:text-sm text-[#34a853]">
                Select players in attendance
              </p>
            </div>
            <div className="w-full">
              <SearchInput 
                value={searchTerm} 
                onChange={(value) => setSearchTerm(value)} 
              />
            </div>
          </div>

          {/* Selected Players Counter and Clear All */}
          {selectedPlayers.length > 0 && (
            <div className="mb-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center 
                            justify-between gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Player counter */}
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-full sm:w-32 md:w-48 rounded-full bg-primary/10">
                      <div 
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(selectedPlayers.length / 30) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-primary whitespace-nowrap">
                      {selectedPlayers.length}/30
                    </span>
                  </div>
                  
                  {/* Token counter */}
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-full sm:w-32 md:w-48 rounded-full bg-yellow-100">
                      <div 
                        className="h-full rounded-full bg-yellow-400 transition-all"
                        style={{ 
                          width: `${(currentTokenCount / RATE_LIMITS.TOKENS_PER_MINUTE) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-yellow-600 whitespace-nowrap">
                      {currentTokenCount.toLocaleString()} tokens
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={clearAllPlayers}
                  className="text-xs font-medium text-red-500 hover:text-red-600 
                           px-3 py-1.5 rounded-lg hover:bg-red-50 
                           transition-colors duration-200 whitespace-nowrap"
                >
                  Clear All
                </button>
              </div>

              {/* Selected Players Pills */}
              <div className="flex flex-wrap gap-1.5">
                {selectedPlayers.map(player => (
                  <div 
                    key={player.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full 
                             bg-primary/[0.04] border border-primary/10 text-xs"
                  >
                    <span className="truncate max-w-[150px]">{player.name}</span>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="text-foreground/40 hover:text-foreground/60 p-0.5 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Player List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredPlayers.map(player => {
              const isSelected = selectedPlayers.some(p => p.id === player.id);
              const rating = calculateOverallRating(player);
              
              return (
                <button
                  key={player.id}
                  onClick={() => !isSelected && addPlayer(player)}
                  disabled={isSelected}
                  className={`group flex items-center gap-3 p-3 rounded-lg text-left transition-all
                            ${isSelected 
                              ? 'bg-primary/[0.04] border border-primary/10' 
                              : 'hover:bg-secondary/40 border border-transparent'}`}
                >
                  {/* Rating Circle */}
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                              ${isSelected 
                                ? 'bg-primary/10 text-primary' 
                                : 'bg-secondary text-foreground/60'}`}
                  >
                    {rating}
                  </div>

                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1 truncate">
                      {player.name}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { label: 'S', value: player.speed },
                        { label: 'T', value: player.throwing },
                        { label: 'A', value: player.awareness },
                        { label: 'C', value: player.catching },
                        { label: 'D', value: player.defense },
                        { label: 'E', value: player.endurance },
                      ].map((stat, i) => (
                        <div 
                          key={i}
                          className="text-[10px] px-1 rounded 
                                   bg-secondary/40 text-foreground/60"
                        >
                          {stat.label}{stat.value}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add/Selected Indicator */}
                  {!isSelected ? (
                    <Plus className="w-4 h-4 text-primary/40 group-hover:text-primary/60" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Generate Teams Button */}
          {selectedPlayers.length >= 4 && (
            <div className="mt-8 text-center">
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  setError(null);
                  generateTeams();
                }}
                disabled={
                  isGenerating || 
                  requestCount >= RATE_LIMITS.REQUESTS_PER_MINUTE ||
                  dailyRequestCount >= RATE_LIMITS.REQUESTS_PER_DAY ||
                  currentTokenCount > RATE_LIMITS.TOKENS_PER_MINUTE
                }
                className="button-primary px-8 py-3 text-base disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Generating Teams...
                  </>
                ) : (
                  <>
                    Generate Teams
                    <span className="ml-2 text-sm opacity-80">
                      ({selectedPlayers.length} players)
                    </span>
                  </>
                )}
              </button>
              <RateLimiter 
                isGenerating={isGenerating}
                requestCount={requestCount}
                dailyRequestCount={dailyRequestCount}
                currentTokenCount={currentTokenCount}
                dailyTokenCount={dailyTokenCount}
              />
              <div className="mt-2 text-xs text-foreground/60">
                Teams will be balanced based on player ratings and chemistry
              </div>
            </div>
          )}

          {selectedPlayers.length > 0 && selectedPlayers.length < 4 && (
            <div className="mt-8 text-center text-sm text-yellow-600">
              Please select at least 4 players to generate teams
            </div>
          )}
        </div>

        {/* Response Section */}
        <div className="mt-8 space-y-6">
          {/* Prompt Preview */}
          {promptString && (
            <div className="mx-4 p-4 sm:p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-gray-500" />
                  <h3 className="text-sm font-medium text-gray-700">Prompt Preview</h3>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                  {currentTokenCount} tokens
                </span>
              </div>
              <div className="relative">
                <pre className="text-xs sm:text-sm text-gray-600 overflow-auto max-h-48 p-3 bg-gray-50 rounded-lg">
                  {promptString}
                </pre>
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              </div>
            </div>
          )}

          {/* AI Response */}
          {aiResponse && (
            <div className="mx-4 space-y-4">
              {/* Teams Display */}
              <div className="p-4 sm:p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-green-500" />
                  <h3 className="text-sm font-medium text-gray-700">Generated Teams</h3>
                </div>
                <JsonViewer 
                  data={typeof aiResponse === 'string' ? JSON.parse(aiResponse) : { teams: [] }} 
                />
              </div>

              {/* Raw JSON */}
              <div className="p-4 sm:p-6 rounded-xl bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-medium text-gray-700">Raw JSON Response</h3>
                  </div>
                </div>
                <div className="relative">
                  <pre className="text-xs sm:text-sm text-gray-600 overflow-auto max-h-48 p-3 bg-gray-50 rounded-lg">
                    {aiResponse}
                  </pre>
                  <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AIPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-10 w-full bg-gray-200 rounded mb-6"></div>
            {/* Add more loading skeleton elements as needed */}
          </div>
        </div>
      </div>
    }>
      <AIPageContent />
    </Suspense>
  );
} 