"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { getRatingStyles } from "@/lib/ratings";
import { Tooltip } from "./tooltip";
import { SpiritRating } from "./spirit-rating";

interface AddPlayerDialogProps {
  onPlayerAdded: () => void;
  onClose: () => void;
  isOpen: boolean;
}

type FormErrors = {
  name?: string;
  skills?: string;
  spirit?: string;
};

type PlayerFormData = {
  name: string;
  speed: number;
  throwing: number;
  awareness: number;
  catching: number;
  defense: number;
  endurance: number;
  spirit: number;
};

const skillDescriptions = {
  speed: {
    desc: "How fast a player moves on the field",
    scale: [
      "1-20: Walks to position",
      "21-40: Jogs effectively",
      "41-60: Fast runner",
      "61-80: Very explosive",
      "81-99: Lightning fast"
    ]
  },
  throwing: {
    desc: "Control and power of throws",
    scale: [
      "1-20: Can throw backhand",
      "21-40: Basic throws only",
      "41-60: All throw types",
      "61-80: Power & accuracy",
      "81-99: Perfect throws"
    ]
  },
  awareness: {
    desc: "Field sense and game IQ",
    scale: [
      "1-20: Basic rules only",
      "21-40: Sees open space",
      "41-60: Reads defense",
      "61-80: Anticipates play",
      "81-99: Controls game"
    ]
  },
  catching: {
    desc: "Ability to secure the disc",
    scale: [
      "1-20: Drops easy passes",
      "21-40: Catches when open",
      "41-60: Reliable hands",
      "61-80: Makes hard catches",
      "81-99: Catches everything"
    ]
  },
  defense: {
    desc: "Ability to stop opponents",
    scale: [
      "1-20: Basic marking",
      "21-40: Stays with mark",
      "41-60: Forces bad throws",
      "61-80: Gets blocks",
      "81-99: Shuts down stars"
    ]
  },
  endurance: {
    desc: "Energy and stamina level",
    scale: [
      "1-20: Few points only",
      "21-40: Half game pace",
      "41-60: Full game ready",
      "61-80: Never tires",
      "81-99: Marathon player"
    ]
  }
};

const calculateOverallRating = (formData: PlayerFormData): number => {
  const skills = [
    formData.speed,
    formData.throwing,
    formData.awareness,
    formData.catching,
    formData.defense,
    formData.endurance
  ];
  
  const skillAverage = Math.round(
    skills.reduce((sum, val) => sum + val, 0) / skills.length
  );
  
  // Add spirit bonus
  return Math.min(99, skillAverage + formData.spirit);
};

export function AddPlayerDialog({ onPlayerAdded, onClose, isOpen }: AddPlayerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    name: "",
    speed: 50,
    throwing: 50,
    awareness: 50,
    catching: 50,
    defense: 50,
    endurance: 50,
    spirit: 2,
  });

  const supabase = createClientComponentClient<Database>();

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Validate name
    if (!formData.name.trim()) {
      errors.name = "Player name is required";
      isValid = false;
    } else if (formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
      isValid = false;
    }

    // Validate skills (ensure they're within range)
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

    // Validate spirit
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
        .from('players')
        .insert([{
          ...formData,
          created_at: new Date().toISOString(),
        }]);

      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(supabaseError.message);
      }

      // Reset form and close dialog
      setFormData({
        name: "",
        speed: 50,
        throwing: 50,
        awareness: 50,
        catching: 50,
        defense: 50,
        endurance: 50,
        spirit: 2,
      });
      onClose();
      onPlayerAdded();
    } catch (err) {
      console.error('Error adding player:', err);
      setError(err instanceof Error ? err.message : 'Failed to add player');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get rating style for preview
  const getRatingPreview = (value: number) => {
    const style = getRatingStyles(value);
    return {
      background: `${style.color}1A`,
      color: style.color,
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-1 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md h-[calc(100vh-2rem)] sm:h-auto sm:max-h-[calc(100vh-2rem)] 
                    flex flex-col">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 sm:px-5 sm:py-4 border-b">
          <h2 className="text-sm sm:text-lg font-semibold text-foreground">Add Player</h2>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-full hover:bg-black/[0.04]"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-foreground/60" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-3 sm:p-5 space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="text-red-500">{error}</div>
                </div>
              )}

              {/* Compact name input */}
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg border bg-white text-sm sm:text-base
                           focus:outline-none focus:ring-2 focus:ring-primary/30
                           transition-all"
                  required
                  minLength={2}
                  placeholder="Enter player name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Compact skills grid */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-medium">Skills</h3>
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
                    <div key={key} className="min-w-0">
                      <div className="flex justify-between mb-1">
                        <Tooltip 
                          title={label}
                          content={[
                            skillDescriptions[key as keyof typeof skillDescriptions].desc,
                            ...skillDescriptions[key as keyof typeof skillDescriptions].scale
                          ]}
                        >
                          <label className="text-xs sm:text-sm font-medium flex items-center gap-1 cursor-help truncate">
                            <span className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded shrink-0"
                                  style={getRatingPreview(formData[key as keyof typeof formData] as number)}>
                              {icon}
                            </span>
                            <span className="truncate">{label}</span>
                          </label>
                        </Tooltip>
                        <span className="text-xs sm:text-sm font-medium px-1 rounded shrink-0"
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
                  <p className="text-sm text-red-500 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.skills}
                  </p>
                )}
              </div>

              {/* Compact spirit section */}
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
                        {formData.spirit === 4 && "Inspiring"}
                        {formData.spirit === 3 && "Supportive"}
                        {formData.spirit === 2 && "Honorable"}
                        {formData.spirit === 1 && "Respectful"}
                        {formData.spirit === 0 && "Contentious"}
                      </span>
                      <span className="text-primary/60 font-normal whitespace-nowrap">
                        (+{formData.spirit})
                      </span>
                    </div>
                    <p className="text-sm text-foreground/60 truncate">
                      {formData.spirit === 4 && "Exemplifies spirit, leads by example"}
                      {formData.spirit === 3 && "Promotes fair play and positive atmosphere"}
                      {formData.spirit === 2 && "Shows good sportsmanship consistently"}
                      {formData.spirit === 1 && "Follows rules and respects opponents"}
                      {formData.spirit === 0 && "Room for improvement in sportsmanship"}
                    </p>
                  </div>

                  {/* Add this new section */}
                  <div className="mt-4 pt-4 border-t border-primary/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-primary">Overall Rating</div>
                        <p className="text-xs text-foreground/60">
                          Average of skills + spirit bonus
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-semibold text-primary">
                          {calculateOverallRating(formData)}
                        </div>
                        <div 
                          className="text-xs font-medium px-3 py-1 rounded-full"
                          style={getRatingPreview(calculateOverallRating(formData))}
                        >
                          {getRatingStyles(calculateOverallRating(formData)).label}
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
                  <p className="mt-3 text-sm text-red-500 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" />
                    {formErrors.spirit}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex-shrink-0 flex justify-end gap-2 px-3 py-2 sm:px-5 sm:py-4 border-t bg-white 
                       shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
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
                  Adding...
                </>
              ) : (
                'Add Player'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 