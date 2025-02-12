import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Database } from "@/types/supabase";

type Player = Database["public"]["Tables"]["players"]["Row"];

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRatingLabel(rating: number): string {
  if (rating >= 81) return 'Elite';
  if (rating >= 61) return 'Expert';
  if (rating >= 41) return 'Intermediate';
  if (rating >= 21) return 'Novice';
  return 'Beginner';
}

export const getSpiritLabel = (spirit: number): string => {
  if (spirit < 0 || spirit > 4) {
    return "Unknown";
  }
  switch (spirit) {
    case 4:
      return "Inspiring";
    case 3:
      return "Supportive";
    case 2:
      return "Honorable";
    case 1:
      return "Respectful";
    case 0:
      return "Contentious";
    default:
      return "Unknown";
  }
};

export function getSpiritDescription(spirit: number): string {
  const descriptions = [
    'Frequently argues calls, lacks sportsmanship',
    'Acknowledges opponents, plays fair, may have minor disputes',
    'Competes with integrity, maintains fairness',
    'Encourages fair play, mediates conflicts',
    'Embodies the highest spirit, fosters positive environment'
  ];
  return descriptions[spirit] || '';
}

export function calculateOverallRating(player: Player): number {
  // Calculate average of all attributes
  const attributes = [
    player.speed,
    player.throwing,
    player.awareness,
    player.catching,
    player.defense,
    player.endurance
  ];
  
  const attributeAverage = Math.round(
    attributes.reduce((sum, val) => sum + val, 0) / attributes.length
  );
  
  // Add spirit bonus (+1 for each spirit point)
  return Math.min(99, attributeAverage + player.spirit);
} 