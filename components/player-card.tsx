"use client";

import { useState, useEffect } from "react";
import { Database } from "@/types/supabase";
import { getSpiritLabel } from "@/lib/utils";
import { getRatingStyles } from '@/lib/ratings';
import { Trash2, AlertCircle, X, Clock } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { DisputeFormDialog } from "./dispute-form-dialog";
import { calculateOverallRating } from "@/lib/utils";

type Player = Database["public"]["Tables"]["players"]["Row"];

interface PlayerCardProps {
  player: Player;
  onPlayerDeleted?: () => void;
}

interface DisputeFormData {
  name: string;
  speed: number;
  throwing: number;
  awareness: number;
  catching: number;
  defense: number;
  endurance: number;
  spirit: number;
  reason: string;
}

export function PlayerCard({ player, onPlayerDeleted }: PlayerCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disputeError, setDisputeError] = useState<string | null>(null);
  const [hasPendingDispute, setHasPendingDispute] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [disputeFormData, setDisputeFormData] = useState<DisputeFormData>({
    name: player.name,
    speed: player.speed,
    throwing: player.throwing,
    awareness: player.awareness,
    catching: player.catching,
    defense: player.defense,
    endurance: player.endurance,
    spirit: player.spirit,
    reason: '',
  });
  
  const overallRating = calculateOverallRating(player);
  const ratingStyle = getRatingStyles(overallRating);
  const supabase = createClientComponentClient<Database>();

  // Check for pending disputes
  useEffect(() => {
    async function checkPendingDisputes() {
      try {
        const { data, error } = await supabase
          .from('player_disputes')
          .select('id')
          .eq('player_id', player.id)
          .eq('status', 'pending');

        if (error) {
          console.error('Error checking disputes:', error);
          return;
        }

        // Check if there are any pending disputes
        setHasPendingDispute(data && data.length > 0);
      } catch (err) {
        console.error('Error checking disputes:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkPendingDisputes();
  }, [player.id, supabase]);

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== 'abc123') {
      setError('Incorrect password');
      return;
    }

    setIsDeleting(true);
    try {
      console.log('Attempting to delete player:', player.id);
      
      // Remove .single() and simplify the delete query
      const { error: deleteError } = await supabase
        .from('players')
        .delete()
        .match({ id: player.id }); // Use match instead of eq

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error(deleteError.message);
      }

      setShowDeleteDialog(false);
      onPlayerDeleted?.();
    } catch (err) {
      console.error('Error deleting player:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete player');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDisputeError(null);
    setIsSubmitting(true);

    try {
      const { error: supabaseError } = await supabase
        .from('rating_disputes')
        .insert([{
          player_id: player.id,
          current_rating: calculateOverallRating(player),
          proposed_speed: disputeFormData.speed,
          proposed_throwing: disputeFormData.throwing,
          proposed_awareness: disputeFormData.awareness,
          proposed_catching: disputeFormData.catching,
          proposed_defense: disputeFormData.defense,
          proposed_endurance: disputeFormData.endurance,
          proposed_spirit: disputeFormData.spirit,
          reason: disputeFormData.reason,
          status: 'pending',
          created_at: new Date().toISOString(),
        }]);

      if (supabaseError) throw new Error(supabaseError.message);

      setIsDisputeOpen(false);
      setHasPendingDispute(true);
    } catch (err) {
      console.error('Error submitting dispute:', err);
      setDisputeError(err instanceof Error ? err.message : 'Failed to submit dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white to-gray-50/50 
                    border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
        {/* Top Section with Rating */}
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-start mb-5 sm:mb-6">
            {/* Name and Rating */}
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-1.5 sm:mb-2 truncate pr-4">
                {player.name}
              </h3>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="text-2xl sm:text-3xl font-bold text-primary leading-none tracking-tight">
                  {overallRating}
                </div>
                <div 
                  className="text-[11px] sm:text-xs font-medium px-2.5 py-0.5 rounded-full tracking-wide"
                  style={{ 
                    backgroundColor: `${ratingStyle.color}12`,
                    color: ratingStyle.color 
                  }}
                >
                  {ratingStyle.label}
                </div>
              </div>
            </div>

            {/* Spirit Score - Updated to show frisbee icons */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-primary">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i}
                    className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center
                               ${i < player.spirit ? 'opacity-100' : 'opacity-20'}`}
                  >
                    🥏
                  </div>
                ))}
              </div>
              <span className="mt-1 text-[11px] sm:text-xs text-gray-500 whitespace-nowrap font-medium">
                {getSpiritLabel(player.spirit)}
              </span>
            </div>
          </div>

          {/* Stats Grid - Updated label */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
            <Stat icon="🏃" label="Speed" value={player.speed} />
            <Stat icon="🎯" label="Throwing" value={player.throwing} />
            <Stat icon="👁️" label="Field Vision" value={player.awareness} />
            <Stat icon="🤲" label="Catching" value={player.catching} />
          </div>

          {/* Secondary Stats */}
          <div className="mt-2.5 sm:mt-4 grid grid-cols-2 gap-2.5 sm:gap-4">
            <Stat icon="🛡️" label="Defense" value={player.defense} />
            <Stat icon="⚡" label="Endurance" value={player.endurance} />
          </div>
        </div>

        {/* Actions Section */}
        <div className="mt-3 border-t border-gray-100">
          {/* Dispute Section */}
          {hasPendingDispute ? (
            <div className="p-3.5 sm:p-5 bg-[#FEF7E0] flex items-center gap-3 sm:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#FEEFC3] flex items-center justify-center text-[#F29900]
                           shrink-0 shadow-sm">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[#B06000] text-sm sm:text-base truncate tracking-tight">
                  Rating Dispute Pending
                </div>
                <div className="text-xs sm:text-sm text-[#B06000]/70 truncate font-medium">
                  This player's rating is under review
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsDisputeOpen(true)}
              className="w-full p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#EA4335]/10 flex items-center justify-center text-[#EA4335]
                           group-hover:scale-110 transition-transform shrink-0 shadow-sm">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm sm:text-base truncate tracking-tight">
                  Rating Looks Wrong?
                </div>
                <div className="text-xs sm:text-sm text-gray-500 truncate font-medium">
                  Submit a rating dispute
                </div>
              </div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0
                           shadow-sm">
                <span className="text-primary group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </button>
          )}
        </div>

        {/* Admin Delete Button */}
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full opacity-0 group-hover:opacity-100
                   hover:bg-red-50 text-red-400 hover:text-red-500
                   transition-all duration-200 shadow-sm"
          aria-label="Delete player"
        >
          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <form onSubmit={handleDelete} className="p-6">
              <h3 className="text-lg font-medium mb-2">Delete Player</h3>
              <p className="text-sm text-foreground/60 mb-4">
                Are you sure you want to delete {player.name}? This action cannot be undone.
              </p>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground/60 mb-2">
                  Enter password to confirm
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border bg-white
                           focus:outline-none focus:ring-2 focus:ring-primary/30
                           transition-all"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 rounded-lg text-foreground/60 
                           hover:bg-black/[0.04] transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white
                           hover:bg-red-600 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Dialog */}
      {isDisputeOpen && !hasPendingDispute && (
        <DisputeFormDialog
          player={player}
          onClose={() => setIsDisputeOpen(false)}
          onDisputeSubmitted={() => {
            setIsDisputeOpen(false);
            setHasPendingDispute(true);
          }}
          isOpen={isDisputeOpen}
        />
      )}
    </>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: number }) {
  const ratingStyle = getRatingStyles(value);
  
  return (
    <div className="p-3 sm:p-4 rounded-lg bg-white border border-gray-100 hover:border-primary/20 
                  hover:shadow-sm transition-all group">
      <div className="flex items-start gap-2 mb-2 sm:mb-3">
        <span className="text-base sm:text-lg mt-0.5">{icon}</span>
        <div className="text-xs sm:text-sm font-medium text-gray-600 leading-tight tracking-wide">
          {label}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-lg sm:text-xl font-bold text-gray-900 leading-none tracking-tight">
          {value}
        </div>
        <div 
          className="text-[10px] sm:text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap tracking-wide"
          style={{ 
            backgroundColor: `${ratingStyle.color}12`,
            color: ratingStyle.color 
          }}
        >
          {ratingStyle.label}
        </div>
      </div>
    </div>
  );
}

function getRatingColor(value: number): string {
  if (value >= 81) return 'bg-green-100 text-green-800';
  if (value >= 61) return 'bg-blue-100 text-blue-800';
  if (value >= 41) return 'bg-yellow-100 text-yellow-800';
  if (value >= 21) return 'bg-orange-100 text-orange-800';
  return 'bg-red-100 text-red-800';
} 