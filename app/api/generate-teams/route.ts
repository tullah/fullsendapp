import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Define types for player data
interface PlayerData {
  players: {
    name: string;
  };
  speed: number;
  throwing: number;
  awareness: number;
  catching: number;
  defense: number;
  endurance: number;
  spirit: number;
}

interface FormattedPlayer {
  name: string;
  speed: number;
  throwing: number;
  awareness: number;
  catching: number;
  defense: number;
  endurance: number;
  spirit: number;
  overall: number;
}

interface PlayerStats {
  name: string;
  stats: {
    speed: number;
    throwing: number;
    awareness: number;
    catching: number;
    defense: number;
    endurance: number;
    spirit: number;
    overall: number;
  }
}

interface PlayerInput {
  name: string;
  speed: number;
  throwing: number;
  awareness: number;
  catching: number;
  defense: number;
  endurance: number;
  spirit: number;
}

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { promptString } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a team formation expert. Create two balanced Ultimate Frisbee teams following these rules:
1. Only use players from the provided list
2. Each player can only be assigned to one team
3. Teams must have equal numbers of players when possible
4. Balance throwing skills across teams (players with high throwing ratings)
5. Balance catching skills across teams (players with high catching ratings)
6. Consider overall player ratings for final team balance
7. Return a JSON response with teams array containing player_name, team (1 or 2), and overall_rating`
        },
        {
          role: "user",
          content: promptString
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse and validate response
    const teams = JSON.parse(content);
    const playerNames = teams.teams.map((p: any) => p.player_name);
    
    // Check for duplicates
    if (new Set(playerNames).size !== playerNames.length) {
      throw new Error('Response contains duplicate players');
    }

    // Validate team sizes
    const team1Count = teams.teams.filter((p: any) => p.team === 1).length;
    const team2Count = teams.teams.filter((p: any) => p.team === 2).length;
    if (Math.abs(team1Count - team2Count) > 1) {
      throw new Error('Teams are not properly balanced');
    }

    return NextResponse.json(teams);

  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate teams'
    }, { 
      status: error.status || 500 
    });
  }
} 