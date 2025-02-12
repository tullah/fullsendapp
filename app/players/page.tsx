"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { Database } from "@/types/supabase";
import { PlayerCard } from "@/components/player-card";
import { SearchBar } from "@/components/search-bar";
import { getRatingStyles } from "@/lib/ratings";
import { calculateOverallRating } from "@/lib/utils";
import { Plus } from "lucide-react";
import { AddPlayerDialog } from "@/components/add-player-dialog";

export default function PlayersPage() {
  const [players, setPlayers] = useState<Database["public"]["Tables"]["players"]["Row"][]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState(players);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .order('name');
      
      if (data) {
        setPlayers(data);
        setFilteredPlayers(data);
      }
    };

    fetchPlayers();
  }, [supabase]);

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredPlayers(players);
      return;
    }

    const filtered = players.filter(player => 
      player.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPlayers(filtered);
  };

  const refreshPlayers = async () => {
    console.log('Refreshing players list...');
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error refreshing players:', error);
      return;
    }
    
    if (data) {
      setPlayers(data);
      setFilteredPlayers(data);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-4 sm:p-6">
        {/* Centered Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-medium text-foreground mb-2">
            Player Rankings
          </h1>
          <p className="text-base text-foreground/60 max-w-2xl mx-auto">
            Browse and compare player statistics across different skills and attributes.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-10">
          <SearchBar 
            onSearch={handleSearch}
            onPlayerAdded={refreshPlayers}
          />
        </div>

        {/* Players Grid */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPlayers.map((player) => (
            <PlayerCard 
              key={player.id} 
              player={player}
              onPlayerDeleted={refreshPlayers}
            />
          ))}
        </div>

        {/* Empty State - Centered */}
        {!filteredPlayers.length && (
          <div className="text-center py-12">
            <div className="text-foreground/40 mb-4">👥</div>
            <h3 className="text-lg font-medium text-foreground mb-2">No players found</h3>
            <p className="text-sm text-foreground/60 max-w-md mx-auto">
              Try adjusting your search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 