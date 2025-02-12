"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { getRatingStyles } from "@/lib/ratings";
import { SpiritRating } from "./spirit-rating";
import { calculateOverallRating, getSpiritLabel } from "@/lib/utils";

interface DisputeFormDialogProps {
  player: Database["public"]["Tables"]["players"]["Row"];
  onClose: () => void;
  onDisputeSubmitted: () => void;
  isOpen: boolean;
}

type FormErrors = {
  reason?: string;
  skills?: string;
  spirit?: string;
};

export function DisputeFormDialog({ player, onClose, onDisputeSubmitted, isOpen }: DisputeFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    reason: "",
    speed: player.speed,
    throwing: player.throwing,
    awareness: player.awareness,
    catching: player.catching,
    defense: player.defense,
    endurance: player.endurance,
    spirit: player.spirit,
  });

  const supabase = createClientComponentClient<Database>();

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.reason.trim()) {
      errors.reason = "Please provide a reason for the dispute";
      isValid = false;
    }

    if (formData.reason.trim().length < 10) {
      errors.reason = "Please provide a more detailed reason (minimum 10 characters)";
      isValid = false;
    }

    const skills = [
      formData.speed,
      formData.throwing,
      formData.awareness,
      formData.catching,
      formData.defense,
      formData.endurance,
    ];

    if (skills.some(skill => skill < 1 || skill > 99)) {
      errors.skills = "All skills must be between 1 and 99";
      isValid = false;
    }

    if (formData.spirit < 0 || formData.spirit > 4) {
      errors.spirit = "Spirit must be between 0 and 4";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFormErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: supabaseError } = await supabase
        .from('player_disputes')
        .insert([{
          player_id: player.id,
          current_rating: calculateOverallRating(player),
          proposed_speed: formData.speed,
          proposed_throwing: formData.throwing,
          proposed_awareness: formData.awareness,
          proposed_catching: formData.catching,
          proposed_defense: formData.defense,
          proposed_endurance: formData.endurance,
          proposed_spirit: formData.spirit,
          reason: formData.reason.trim(),
          status: 'pending'
        }]);

      if (supabaseError) throw new Error(supabaseError.message);

      onDisputeSubmitted();
      onClose();
    } catch (err) {
      console.error('Error submitting dispute:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit dispute');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingPreview = (value: number) => {
    const style = getRatingStyles(value);
    return {
      background: `${style.color}1A`,
      color: style.color,
    };
  };

  const calculateFormRating = (data: typeof formData): number => {
    const skillsAverage = Math.round(
      [data.speed, data.throwing, data.awareness, data.catching, data.defense, data.endurance]
      .reduce((sum, val) => sum + val, 0) / 6
    );
    return skillsAverage + data.spirit;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-1 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 sm:px-5 sm:py-4 border-b">
          <h2 className="text-sm sm:text-lg font-semibold text-foreground">
            Rating Dispute for {player.name}
          </h2>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-full hover:bg-black/[0.04]"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[calc(90vh-8rem)] overflow-y-auto">
            <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm">
                  <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                  <div className="text-red-500">{error}</div>
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Reason for Dispute <span className="text-red-500">*</span>
                </label>
                <div className="text-[10px] sm:text-xs text-foreground/60 mb-2">
                  Briefly explain why you believe these ratings better reflect the player's abilities
                </div>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border bg-white text-xs sm:text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/30
                           transition-all resize-none"
                  rows={3}
                  maxLength={500}
                  required
                  placeholder="Provide specific examples from recent games or tournaments..."
                />
                <div className="mt-1 flex justify-end text-[10px] text-foreground/40">
                  {formData.reason.length}/500 characters
                </div>
                {formErrors.reason && (
                  <p className="mt-1 text-xs sm:text-sm text-red-500 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    {formErrors.reason}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-medium">Proposed Skills</h3>
                  <div className="text-[10px] sm:text-xs text-foreground/40">1-99</div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { key: 'speed', label: 'Speed', icon: '🏃' },
                    { key: 'throwing', label: 'Throwing', icon: '🎯' },
                    { key: 'awareness', label: 'Awareness', icon: '👁️' },
                    { key: 'catching', label: 'Catching', icon: '🤲' },
                    { key: 'defense', label: 'Defense', icon: '🛡️' },
                    { key: 'endurance', label: 'Endurance', icon: '⚡' },
                  ].map(({ key, label, icon }) => (
                    <div key={key}>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-sm font-medium flex items-center gap-1.5">
                          <span className="w-5 h-5 flex items-center justify-center rounded"
                                style={getRatingPreview(formData[key as keyof typeof formData] as number)}>
                            {icon}
                          </span>
                          {label}
                        </label>
                        <span className="text-sm font-medium px-1.5 rounded"
                              style={getRatingPreview(formData[key as keyof typeof formData] as number)}>
                          {formData[key as keyof typeof formData]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="99"
                        value={formData[key as keyof typeof formData]}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          [key]: parseInt(e.target.value) 
                        }))}
                        className="w-full accent-primary"
                        required
                      />
                    </div>
                  ))}
                </div>
                {formErrors.skills && (
                  <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    {formErrors.skills}
                  </p>
                )}
              </div>

              {/* Spirit Rating Section - Styled like add player dialog */}
              <div className="rounded-lg bg-primary/[0.03] border border-primary/10 p-2 sm:p-4">
                <div className="flex items-start gap-2 mb-2 sm:mb-3">
                  <div className="p-1 sm:p-2 rounded-full bg-primary/10 shrink-0">
                    <svg 
                      viewBox="0 0 24 24" 
                      className="w-4 h-4 sm:w-5 sm:h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <label className="block text-xs sm:text-sm font-medium">
                      Spirit <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[10px] sm:text-sm text-foreground/60 truncate">
                      +1 rating per spirit point
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <SpiritRating
                    value={formData.spirit}
                    onChange={(value) => setFormData(prev => ({ ...prev, spirit: value }))}
                  />

                  {/* Spirit Level Description */}
                  <div className="p-3 rounded-md bg-primary/[0.05] border border-primary/10">
                    <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
                      <span className="whitespace-nowrap">Level:</span>
                      <span className="whitespace-nowrap">
                        {getSpiritLabel(formData.spirit)}
                      </span>
                      <span className="text-primary/60 font-normal whitespace-nowrap">
                        (+{formData.spirit})
                      </span>
                    </div>
                    <p className="text-sm text-foreground/60 truncate">
                      {getSpiritLabel(formData.spirit) === "Inspiring" && "Exemplifies spirit, leads by example"}
                      {getSpiritLabel(formData.spirit) === "Supportive" && "Promotes fair play and positive atmosphere"}
                      {getSpiritLabel(formData.spirit) === "Honorable" && "Shows good sportsmanship consistently"}
                      {getSpiritLabel(formData.spirit) === "Respectful" && "Follows rules and respects opponents"}
                      {getSpiritLabel(formData.spirit) === "Contentious" && "Room for improvement in sportsmanship"}
                    </p>
                  </div>

                  {/* Overall Rating Preview */}
                  <div className="mt-4 pt-4 border-t border-primary/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-primary">Proposed Rating</div>
                        <p className="text-xs text-foreground/60">
                          Average of skills + spirit bonus
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-semibold text-primary">
                          {calculateFormRating(formData)}
                        </div>
                        <div 
                          className="text-xs font-medium px-3 py-1 rounded-full"
                          style={getRatingPreview(calculateFormRating(formData))}
                        >
                          {getRatingStyles(calculateFormRating(formData)).label}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-foreground/60">
                      <span>Calculation:</span>
                      <span className="font-medium text-foreground/80">
                        {Math.round(
                          [formData.speed, formData.throwing, formData.awareness,
                           formData.catching, formData.defense, formData.endurance]
                          .reduce((sum, val) => sum + val, 0) / 6
                        )}
                      </span>
                      <span>base +</span>
                      <span className="font-medium text-foreground/80">{formData.spirit}</span>
                      <span>spirit bonus</span>
                    </div>
                  </div>
                </div>

                {formErrors.spirit && (
                  <p className="mt-3 text-xs sm:text-sm text-red-500 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    {formErrors.spirit}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-3 py-2 sm:px-5 sm:py-4 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm text-foreground/60 
                       hover:bg-black/[0.04] transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 sm:px-6 sm:py-2 rounded-lg text-xs sm:text-sm bg-primary text-white
                       hover:bg-primary/90 transition-colors font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2 min-w-[80px] sm:min-w-[100px] justify-center"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Dispute'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 