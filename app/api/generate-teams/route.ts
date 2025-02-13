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

    if (!promptString) {
      throw new Error('No players provided');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a team formation expert. Analyze the provided players and their attributes to create balanced teams.
Rules:
- Only use players from the input list (no duplicates or new players)
- When total player count is even, create teams with equal numbers
- When total player count is odd, one team can have an extra player
- Balance throwing and catching abilities across teams
- Consider overall player ratings for final team balance
- Ensure similar total team ratings (within 10% difference)

Return a JSON response with this structure:
{
  "teams": [
    {
      "player_name": string,
      "team": 1 or 2,
      "overall_rating": number
    }
  ]
}`
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

    // Parse response
    const teams = JSON.parse(content);
    const warnings = [];

    // Validate and collect warnings
    const playerNames = teams.teams.map((p: any) => p.player_name);
    if (new Set(playerNames).size !== playerNames.length) {
      warnings.push('Warning: Response contains duplicate players');
    }

    const team1 = teams.teams.filter((p: any) => p.team === 1);
    const team2 = teams.teams.filter((p: any) => p.team === 2);
    const totalPlayers = team1.length + team2.length;

    if (totalPlayers % 2 === 0 && team1.length !== team2.length) {
      warnings.push('Warning: Teams should have equal numbers when player count is even');
    }

    const team1Rating = team1.reduce((sum: number, p: any) => sum + p.overall_rating, 0) / team1.length;
    const team2Rating = team2.reduce((sum: number, p: any) => sum + p.overall_rating, 0) / team2.length;
    const ratingDiff = Math.abs(team1Rating - team2Rating);

    if (ratingDiff > team1Rating * 0.1) {
      warnings.push('Warning: Team ratings differ by more than 10%');
    }

    // Return response with warnings
    return NextResponse.json({
      teams: teams.teams,
      warnings,
      stats: {
        team1: {
          players: team1.length,
          avgRating: Math.round(team1Rating * 10) / 10
        },
        team2: {
          players: team2.length,
          avgRating: Math.round(team2Rating * 10) / 10
        }
      }
    });

  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate teams'
    }, { 
      status: error.status || 500 
    });
  }
} 