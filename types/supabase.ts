export interface Database {
  public: {
    Tables: {
      players: {
        Row: {
          id: string;
          name: string;
          speed: number;
          throwing: number;
          awareness: number;
          catching: number;
          defense: number;
          endurance: number;
          spirit: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          speed: number;
          throwing: number;
          awareness: number;
          catching: number;
          defense: number;
          endurance: number;
          spirit: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          speed?: number;
          throwing?: number;
          awareness?: number;
          catching?: number;
          defense?: number;
          endurance?: number;
          spirit?: number;
          created_at?: string;
        };
      };
      contests: {
        Row: {
          id: string;
          player_id: string;
          proposed_stats: {
            speed?: number;
            throwing?: number;
            awareness?: number;
            catching?: number;
            defense?: number;
            endurance?: number;
            spirit?: number;
          };
          contest_notes: string | null;
          contest_status: 'pending' | 'approved' | 'rejected';
          submitted_at: string;
        };
        Insert: {
          id?: string;
          player_id: string;
          proposed_stats: {
            speed?: number;
            throwing?: number;
            awareness?: number;
            catching?: number;
            defense?: number;
            endurance?: number;
            spirit?: number;
          };
          contest_notes?: string | null;
          contest_status?: 'pending' | 'approved' | 'rejected';
          submitted_at?: string;
        };
        Update: {
          id?: string;
          player_id?: string;
          proposed_stats?: {
            speed?: number;
            throwing?: number;
            awareness?: number;
            catching?: number;
            defense?: number;
            endurance?: number;
            spirit?: number;
          };
          contest_notes?: string | null;
          contest_status?: 'pending' | 'approved' | 'rejected';
          submitted_at?: string;
        };
      };
      player_disputes: {
        Row: {
          id: string;
          status: string;
          reason: string;
          current_rating: number;
          proposed_speed: number;
          proposed_throwing: number;
          proposed_awareness: number;
          proposed_catching: number;
          proposed_defense: number;
          proposed_endurance: number;
          proposed_spirit: number;
          resolution_notes?: string;
          created_at: string;
          player_id: string;
        };
        Insert: {
          // Add if needed
        };
        Update: {
          // Add if needed
        };
      };
      team_creation: {
        Row: {
          id: string;
          player_id: string;
          team_number: number | null;
          created_at: string;
          speed: number;
          throwing: number;
          awareness: number;
          catching: number;
          defense: number;
          endurance: number;
          spirit: number;
        };
        Insert: {
          id?: string;
          player_id: string;
          team_number?: number | null;
          created_at?: string;
          speed: number;
          throwing: number;
          awareness: number;
          catching: number;
          defense: number;
          endurance: number;
          spirit: number;
        };
        Update: {
          team_number?: number | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for common use cases
export type Player = Database['public']['Tables']['players']['Row'];
export type Contest = Database['public']['Tables']['contests']['Row'];
export type NewPlayer = Database['public']['Tables']['players']['Insert'];
export type NewContest = Database['public']['Tables']['contests']['Insert'];
export type UpdatePlayer = Database['public']['Tables']['players']['Update'];
export type UpdateContest = Database['public']['Tables']['contests']['Update']; 