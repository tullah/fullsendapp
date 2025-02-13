"use client";

import { useState, useEffect, Suspense } from "react";
import { Bot, Users, Sparkles, ArrowRight, Search, Plus, X } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { SearchInput } from "@/components/search-input";
import { RatingFilter } from "@/components/rating-filter";
import { calculateOverallRating } from "@/lib/utils";

type Player = Database["public"]["Tables"]["players"]["Row"];

function AIPageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
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

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
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

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          {[
            {
              title: "Smart Balancing",
              desc: "AI analyzes player stats to create evenly matched teams",
              icon: <Sparkles className="w-5 h-5" />,
              color: "#1a73e8"
            },
            {
              title: "Team Chemistry",
              desc: "Considers player synergies and complementary skills",
              icon: <Users className="w-5 h-5" />,
              color: "#34a853"
            },
            {
              title: "Quick Setup",
              desc: "Generate balanced teams in seconds for any player pool",
              icon: <ArrowRight className="w-5 h-5" />,
              color: "#fbbc04"
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className="group relative overflow-hidden rounded-xl bg-white border border-[#dadce0]/50
                       hover:border-[#1a73e8]/20 hover:shadow-lg transition-all duration-300"
            >
              <div className="p-6">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4
                           group-hover:scale-110 transition-transform duration-300"
                  style={{ 
                    backgroundColor: `${feature.color}10`,
                    color: feature.color
                  }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-foreground/60">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Player Selection */}
        <div className="card-base p-3 sm:p-4">
          {/* Header */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-medium mb-1">Select Players</h2>
                <p className="text-xs sm:text-sm text-[#34a853]">
                  Select players in attendance for AI team generation
                </p>
              </div>
              {selectedPlayers.length > 0 && (
                <button
                  onClick={clearAllPlayers}
                  className="text-xs sm:text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
            <SearchInput 
              value={searchTerm} 
              onChange={(value) => setSearchTerm(value)} 
            />
          </div>

          {/* Selected Players Counter */}
          {selectedPlayers.length > 0 && (
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="h-1.5 rounded-full bg-primary/10 flex-1">
                <div 
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(selectedPlayers.length / 30) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-primary">
                {selectedPlayers.length}/30
              </span>
            </div>
          )}

          {/* Selected Players Pills */}
          {selectedPlayers.length > 0 && (
            <div className="mb-6">
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
              <button
                onClick={() => {/* Add team generation logic */}}
                className="button-primary px-8 py-3 text-base"
              >
                Generate Teams
                <span className="ml-2 text-sm opacity-80">
                  ({selectedPlayers.length} players)
                </span>
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