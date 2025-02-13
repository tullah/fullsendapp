"use client";

import { useState, useEffect, Suspense } from "react";
import { Bot, Users, Sparkles, ArrowRight, Search, Plus, X, Loader2, AlertCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { SearchInput } from "@/components/search-input";
import { RatingFilter } from "@/components/rating-filter";
import { calculateOverallRating } from "@/lib/utils";

type Player = Database["public"]["Tables"]["players"]["Row"];

interface TeamAssignment {
  player_name: string;
  team: 1 | 2;
  overall_rating: number;
  role: "Handler" | "Receiver" | "Utility";
}

interface TeamCreationWithPlayer {
  player_id: string;
  speed: number;
  throwing: number;
  awareness: number;
  catching: number;
  defense: number;
  endurance: number;
  spirit: number;
  players: {
    name: string;
  };
}

function AIPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [teamAssignments, setTeamAssignments] = useState<TeamAssignment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

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

  const addPlayer = async (player: Player) => {
    if (selectedPlayers.length >= 30) {
      alert("Maximum 30 players allowed");
      return;
    }

    if (selectedPlayers.find(p => p.id === player.id)) {
      return;
    }

    // Add to team_creation table
    const { error } = await supabase
      .from('team_creation')
      .insert([{
        player_id: player.id,
        speed: player.speed,
        throwing: player.throwing,
        awareness: player.awareness,
        catching: player.catching,
        defense: player.defense,
        endurance: player.endurance,
        spirit: player.spirit,
      }]);

    if (error) {
      console.error('Error adding player:', error);
      return;
    }

    setSelectedPlayers([...selectedPlayers, player]);
  };

  const removePlayer = async (playerId: string) => {
    const { error } = await supabase
      .from('team_creation')
      .delete()
      .eq('player_id', playerId);

    if (error) {
      console.error('Error removing player:', error);
      return;
    }

    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const clearAllPlayers = async () => {
    // Clear from team_creation table
    const { error } = await supabase
      .from('team_creation')
      .delete()
      .in('player_id', selectedPlayers.map(p => p.id));

    if (error) {
      console.error('Error clearing players:', error);
      return;
    }

    setSelectedPlayers([]);
  };

  const generateTeams = async () => {
    setIsGenerating(true);
    try {
      // 1. Fetch current team_creation data with only necessary fields
      const { data: teamData, error: fetchError } = await supabase
        .from('team_creation')
        .select(`
          player_id,
          speed,
          throwing,
          awareness,
          catching,
          defense,
          endurance,
          spirit,
          players:players (
            name
          )
        `) as { data: TeamCreationWithPlayer[] | null; error: any };

      if (fetchError) throw fetchError;
      
      if (!teamData || teamData.length === 0) {
        throw new Error('No players selected');
      }

      // 2. Format the data for OpenAI
      const formattedPlayers = teamData.map(player => ({
        name: player.players?.name || '',
        stats: {
          speed: player.speed,
          throwing: player.throwing,
          awareness: player.awareness,
          catching: player.catching,
          defense: player.defense,
          endurance: player.endurance,
          spirit: player.spirit,
          overall: Math.round(
            (player.speed + player.throwing + player.awareness + 
             player.catching + player.defense + player.endurance) / 6 + 
            player.spirit
          )
        }
      }));

      // 3. Call our API endpoint with formatted data
      const response = await fetch('/api/generate-teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ players: formattedPlayers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (response.status === 503) {
          throw new Error('AI service is temporarily unavailable. Please try again later.');
        }
        
        throw new Error(errorData.error || 'Failed to generate teams');
      }

      const assignments = await response.json();
      setTeamAssignments(assignments);
    } catch (err) {
      console.error('Error generating teams:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate teams');
    } finally {
      setIsGenerating(false);
    }
  };

  // Clear team_creation table on mount
  useEffect(() => {
    const clearTeamCreation = async () => {
      const { error } = await supabase
        .from('team_creation')
        .delete()
        .not('player_id', 'is', null); // Delete all non-null entries

      if (error) {
        console.error('Error clearing team_creation table:', error);
      }
    };

    clearTeamCreation();
    
    // Also clear on unmount
    return () => {
      clearTeamCreation();
    };
  }, [supabase]); // Add supabase to dependencies

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#fbbc04]/10 mb-6 rotate-6 hover:rotate-0 transition-all duration-300">
            <Bot className="w-8 h-8 text-[#fbbc04]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-medium text-foreground mb-4">
            FullSend.AI
          </h1>
          <p className="text-base sm:text-lg text-foreground/60 max-w-2xl mx-auto">
            Create balanced Ultimate teams using AI-powered matchmaking that considers player ratings and chemistry.
          </p>
        </div>

        {/* Features Grid - Updated to be more subtle */}
        <div className="grid grid-cols-3 gap-3 mb-8 px-1">
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
        <div className="card-base p-3 sm:p-4">
          {/* Header with Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6">
            <div>
              <h2 className="text-lg font-medium mb-1">Select Players</h2>
              <p className="text-xs sm:text-sm text-[#34a853]">
                Select players in attendance for AI team generation
              </p>
            </div>
            <div className="w-full sm:w-80">
              <SearchInput 
                value={searchTerm} 
                onChange={(value) => setSearchTerm(value)} 
              />
            </div>
          </div>

          {/* Selected Players Counter and Clear All */}
          {selectedPlayers.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-32 sm:w-48 rounded-full bg-primary/10">
                    <div 
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${(selectedPlayers.length / 30) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-primary">
                    {selectedPlayers.length}/30
                  </span>
                </div>
                <button
                  onClick={clearAllPlayers}
                  className="text-xs font-medium text-red-500 hover:text-red-600 
                           px-3 py-1.5 rounded-lg hover:bg-red-50 
                           transition-colors duration-200"
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
                    <span>{player.name}</span>
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="text-foreground/40 hover:text-foreground/60 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Player List */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
                  setError(null); // Clear any previous errors
                  generateTeams();
                }}
                disabled={isGenerating}
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

        {/* Team Assignments Display */}
        {teamAssignments.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {/* Team 1 */}
            <div className="card-base p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-blue-500">Team 1</h3>
                  <div className="text-xs text-foreground/60">
                    Average Rating: {
                      Math.round(
                        teamAssignments
                          .filter(p => p.team === 1)
                          .reduce((sum, p) => sum + p.overall_rating, 0) /
                        teamAssignments.filter(p => p.team === 1).length
                      )
                    }
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {teamAssignments
                  .filter(p => p.team === 1)
                  .map(player => (
                    <div 
                      key={player.player_name}
                      className="flex items-center justify-between p-2 rounded-lg bg-secondary/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">{player.player_name}</div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500">
                          {player.role}
                        </span>
                      </div>
                      <div className="text-sm font-medium">{player.overall_rating}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Team 2 */}
            <div className="card-base p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium text-green-500">Team 2</h3>
                  <div className="text-xs text-foreground/60">
                    Average Rating: {
                      Math.round(
                        teamAssignments
                          .filter(p => p.team === 2)
                          .reduce((sum, p) => sum + p.overall_rating, 0) /
                        teamAssignments.filter(p => p.team === 2).length
                      )
                    }
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {teamAssignments
                  .filter(p => p.team === 2)
                  .map(player => (
                    <div 
                      key={player.player_name}
                      className="flex items-center justify-between p-2 rounded-lg bg-secondary/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium">{player.player_name}</div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                          {player.role}
                        </span>
                      </div>
                      <div className="text-sm font-medium">{player.overall_rating}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
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