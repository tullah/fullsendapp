"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, Check, XCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { getRatingStyles } from "@/lib/ratings";
import { calculateOverallRating, getSpiritLabel } from "@/lib/utils";

interface DisputeReviewDialogProps {
  dispute: Database["public"]["Tables"]["player_disputes"]["Row"];
  player: Database["public"]["Tables"]["players"]["Row"];
  onClose: () => void;
  onDisputeResolved: () => void;
  isOpen: boolean;
}

export function DisputeReviewDialog({ 
  dispute, 
  player, 
  onClose, 
  onDisputeResolved, 
  isOpen 
}: DisputeReviewDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");
  const supabase = createClientComponentClient<Database>();

  const handleResolve = async (approved: boolean) => {
    setError(null);
    setIsSubmitting(true);

    try {
      // Only need to update the dispute status now
      const { error: disputeError } = await supabase
        .from('player_disputes')
        .update({
          status: approved ? 'approved' : 'rejected',
          resolved_at: new Date().toISOString(),
          resolution_notes: resolutionNotes || (approved ? 'Approved' : 'Rejected')
        })
        .eq('id', dispute.id);

      if (disputeError) {
        console.error('Dispute update error:', disputeError);
        throw new Error('Failed to update dispute status');
      }

      // Success - notify parent and close
      onDisputeResolved();
      onClose();
    } catch (err) {
      console.error('Error resolving dispute:', err);
      setError(err instanceof Error ? err.message : 'Failed to resolve dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StatComparison = ({ label, icon, current, proposed }: { label: string; icon: string; current: number; proposed: number }) => (
    <div className="p-3 rounded-lg bg-white border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{icon}</span>
        <div className="text-xs sm:text-sm font-medium text-gray-600">{label}</div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Current</div>
          <div className="flex items-center gap-1.5">
            <div className="text-base sm:text-lg font-bold text-gray-900">{current}</div>
            <div 
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={getRatingPreview(current)}
            >
              {getRatingStyles(current).label}
            </div>
          </div>
        </div>
        <div className="text-gray-300">→</div>
        <div className="flex-1">
          <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Proposed</div>
          <div className="flex items-center gap-1.5">
            <div className="text-base sm:text-lg font-bold text-gray-900">{proposed}</div>
            <div 
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={getRatingPreview(proposed)}
            >
              {getRatingStyles(proposed).label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getRatingPreview = (value: number) => {
    const style = getRatingStyles(value);
    return {
      background: `${style.color}12`,
      color: style.color,
    };
  };

  useEffect(() => {
    return () => {
      setIsSubmitting(false);
      setError(null);
      setResolutionNotes("");
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:w-auto sm:max-w-2xl h-full sm:h-auto sm:max-h-[calc(100vh-2rem)] 
                    flex flex-col sm:rounded-xl">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-3 sm:p-4 border-b">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Review Rating Dispute</h2>
            <p className="text-xs sm:text-sm text-gray-500">{player.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 space-y-4">
            {error && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>{error}</div>
              </div>
            )}

            {/* Dispute Reason */}
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="text-xs sm:text-sm font-medium text-gray-900 mb-1">Reason for Dispute</div>
              <p className="text-xs sm:text-sm text-gray-600 whitespace-pre-wrap">{dispute.reason}</p>
            </div>

            {/* Stats Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <StatComparison label="Speed" icon="🏃" current={player.speed} proposed={dispute.proposed_speed} />
              <StatComparison label="Throwing" icon="🎯" current={player.throwing} proposed={dispute.proposed_throwing} />
              <StatComparison label="Field Vision" icon="👁️" current={player.awareness} proposed={dispute.proposed_awareness} />
              <StatComparison label="Catching" icon="🤲" current={player.catching} proposed={dispute.proposed_catching} />
              <StatComparison label="Defense" icon="🛡️" current={player.defense} proposed={dispute.proposed_defense} />
              <StatComparison label="Endurance" icon="⚡" current={player.endurance} proposed={dispute.proposed_endurance} />
            </div>

            {/* Spirit Rating */}
            <div className="p-3 rounded-lg bg-[#34a853]/[0.03] border border-[#34a853]/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🥏</span>
                  <div className="text-xs sm:text-sm font-medium text-[#34a853]">Spirit Rating</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Current</div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i}
                          className={`w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center
                                   ${i < player.spirit ? 'text-[#34a853]' : 'text-[#34a853]/20'}`}
                        >
                          🥏
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({getSpiritLabel(player.spirit)})
                    </span>
                  </div>
                </div>
                <div className="text-gray-300 mx-4">→</div>
                <div className="flex-1">
                  <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Proposed</div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i}
                          className={`w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center
                                   ${i < dispute.proposed_spirit ? 'text-[#34a853]' : 'text-[#34a853]/20'}`}
                        >
                          🥏
                        </div>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({getSpiritLabel(dispute.proposed_spirit)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Rating Change */}
            <div className="p-3 rounded-lg bg-primary/[0.03] border border-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-medium text-primary">Overall Rating Change</div>
                  <p className="text-[10px] sm:text-xs text-gray-500">Including spirit bonus</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-primary">
                      {calculateOverallRating(player)}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Current</div>
                  </div>
                  <div className="text-gray-300">→</div>
                  <div className="text-center">
                    <div className="text-lg sm:text-xl font-bold text-primary">
                      {calculateOverallRating({
                        ...player,
                        speed: dispute.proposed_speed,
                        throwing: dispute.proposed_throwing,
                        awareness: dispute.proposed_awareness,
                        catching: dispute.proposed_catching,
                        defense: dispute.proposed_defense,
                        endurance: dispute.proposed_endurance,
                        spirit: dispute.proposed_spirit,
                      })}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-500">Proposed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resolution Notes */}
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1.5">
                Resolution Notes
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-white text-xs sm:text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30
                         transition-all resize-none"
                rows={2}
                placeholder="Add any notes about your decision..."
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex justify-end gap-2 p-3 sm:p-4 border-t bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs sm:text-sm text-gray-600 
                     hover:bg-gray-100 transition-colors font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={() => handleResolve(false)}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded-lg text-xs sm:text-sm bg-red-500 text-white
                     hover:bg-red-600 transition-colors font-medium flex items-center gap-1.5"
          >
            <XCircle className="w-4 h-4" />
            Reject
          </button>
          <button
            onClick={() => handleResolve(true)}
            disabled={isSubmitting}
            className="px-3 py-1.5 rounded-lg text-xs sm:text-sm bg-green-500 text-white
                     hover:bg-green-600 transition-colors font-medium flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Approve
          </button>
        </div>
      </div>
    </div>
  );
} 