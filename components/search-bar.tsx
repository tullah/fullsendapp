"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { AddPlayerDialog } from "./add-player-dialog";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onPlayerAdded: () => void;
}

export function SearchBar({ onSearch, onPlayerAdded }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="relative group">
          {/* Background with enhanced visibility */}
          <div className="absolute inset-0 bg-white rounded-full border border-border
                        shadow-[0_2px_8px_-3px_rgba(0,0,0,0.08)] 
                        group-hover:shadow-[0_3px_12px_-3px_rgba(26,115,232,0.16)]
                        group-focus-within:border-primary/30
                        group-focus-within:shadow-[0_3px_12px_-3px_rgba(26,115,232,0.16)]
                        transition-all duration-200" 
          />
          
          <div className="relative flex items-center h-11">
            <Search className="absolute left-4 w-5 h-5 text-primary/60 transition-colors
                             group-hover:text-primary/80" />
            
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder="Search players..."
              className="w-full h-full pl-12 pr-24 text-base bg-transparent
                       rounded-full outline-none 
                       placeholder:text-foreground/50
                       transition-all duration-200"
            />

            <div className="absolute right-1.5 h-8">
              <button
                type="button"
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-1.5 px-3 h-full rounded-full
                         bg-primary/[0.08] text-primary hover:bg-primary/[0.12]
                         transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add</span>
              </button>
            </div>
          </div>
        </form>

        <div className="mt-1.5 text-xs text-foreground/40 px-4">
          Search by player name • More search options coming soon
        </div>
      </div>

      {showAddDialog && (
        <AddPlayerDialog 
          onPlayerAdded={() => {
            onPlayerAdded();
            setShowAddDialog(false);
          }}
          onClose={() => setShowAddDialog(false)}
          isOpen={showAddDialog}
        />
      )}
    </>
  );
} 